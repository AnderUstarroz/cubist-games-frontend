import {
  ActionType,
  BetMsgType,
  lamports_to_sol,
  MEMO_PROGRAM_ID,
  player_bets_pda,
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { GameType } from "../../pages/types/game";
import { flashMsg } from "./helpers";
import {
  PublicKey,
  Connection,
  Transaction,
  SignaturesForAddressOptions,
} from "@solana/web3.js";
import { PDAType } from "../../pages/types/game-settings";
import { BN } from "@project-serum/anchor";
import { human_number } from "./number";
import { CubistGames } from "@cubist-collective/cubist-games-lib";
import { IdlAccounts } from "@project-serum/anchor";

export const place_bet = async (
  solanaProgram: SolanaProgramType,
  connection: Connection,
  systemConfig: SystemConfigType,
  game: GameType,
  pdas: PDAType[],
  optionId: number,
  lamports: number,
  agreedTerms: Boolean,
  publickey: PublicKey | null,
  modals: { [k: string]: boolean },
  setModals: Function,
  setWalletVisible: Function,
  sendTransaction: Function
) => {
  if (new Date() < game.data.openTime) {
    return flashMsg("Game is not open yet");
  }
  if (new Date() >= game.data.closeTime) {
    return flashMsg("Game is closed");
  }
  if (!publickey) {
    setWalletVisible(true);
    return flashMsg("Wallet is not connected");
  }
  if (!agreedTerms) {
    return flashMsg("You must accept the Terms & Conditions");
  }

  const systemConfigPda = pdas[0][0];
  const gamePda = pdas[2][0];
  const [playerBetsPda, _] = await player_bets_pda(publickey, gamePda);
  const [tx, playerBets, msg] = await bet_tx(
    solanaProgram,
    connection,
    lamports + systemConfig.betFee.toNumber(),
    optionId,
    playerBetsPda,
    publickey,
    gamePda,
    systemConfigPda,
    systemConfig.treasury,
    game.data.gameId
  );
  if (playerBets && (playerBets.bets as []).length >= 10) {
    return flashMsg("Maximum 10 bets per game");
  }
  const [balance, accountCost, txFee] = (
    await Promise.allSettled([
      connection.getBalance(publickey),
      connection.getMinimumBalanceForRentExemption(200),
      tx.getEstimatedFee(connection),
    ])
  ).map((r: any) => (r.status !== "fulfilled" ? null : r.value));
  if (!balance || !accountCost || !txFee) {
    return flashMsg("Failed to read wallet's balance");
  }

  const totalCost =
    txFee +
    lamports +
    systemConfig.betFee.toNumber() +
    (!playerBets ? accountCost : 0);
  if (totalCost > balance) {
    return flashMsg(
      `Not enough balance! You need at least ${human_number(
        lamports_to_sol(totalCost),
        9
      )} SOL`
    );
  }
  // Set timer to notify Network congestion (after 30 secs will display a message)
  const timer = setTimeout(() => {
    flashMsg(
      "Transaction not confirmed in 30 seconds. It is unknown if it was confirmed or not"
    );
  }, 30000); // 30secs
  try {
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "processed");
    flashMsg("Bet placed", "success");
    clearTimeout(timer);
  } catch (error) {
    flashMsg("Failed to place bet");
    console.error(error);
    clearTimeout(timer);
    return;
  }
  console.log("BET:", msg);
  //Finish
  if (modals.customStake) {
    setModals({ ...modals, customStake: false });
  }
};

export async function bet_tx(
  solanaProgram: SolanaProgramType,
  connection: Connection,
  lamports: number,
  optionId: number,
  playerBetsPDA: PublicKey,
  playerPublicKey: PublicKey,
  gamePDA: PublicKey,
  systemConfigPDA: PublicKey,
  systemTreasury: PublicKey,
  gameId: number
): Promise<
  [Transaction, IdlAccounts<CubistGames>["playerBets"] | null, BetMsgType]
> {
  const msg = {
    siteId: (process.env.NEXT_PUBLIC_AUTHORITY as string).slice(0, 7),
    gameId: gameId,
    type: ActionType.Bet,
    optionId: optionId,
    stake: lamports,
    referral: null,
  };

  const transaction = new Transaction(await connection.getLatestBlockhash());
  transaction.feePayer = playerPublicKey;
  // Initialize player's betting account if doesn't exist already
  let playerBets = null;
  try {
    playerBets = await solanaProgram.account.playerBets.fetch(playerBetsPDA);
  } catch (_err) {
    transaction.add(
      await solanaProgram.methods
        .initializePlayerBets()
        .accounts({
          player: playerPublicKey,
          game: gamePDA,
          playerBets: playerBetsPDA,
        })
        .instruction()
    );
  }

  transaction.add(
    await solanaProgram.methods
      .placeSolBet(optionId, new BN(lamports))
      .accounts({
        player: playerPublicKey,
        game: gamePDA,
        playerBets: playerBetsPDA,
        systemTreasury: systemTreasury,
        systemConfig: systemConfigPDA,
      })
      .instruction()
  );
  transaction.add({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(JSON.stringify(msg), "utf8"),
  });
  return [transaction, playerBets, msg] as [
    Transaction,
    IdlAccounts<CubistGames>["playerBets"] | null,
    BetMsgType
  ];
}

export interface MyBetType {
  date: Date;
  gameId: number;
  optionId: number;
  stake: number;
  name: string;
  referral: string;
  signature: string;
}

export const fetch_my_bets = async (
  connection: Connection,
  wallet: PublicKey,
  game: GameType
): Promise<MyBetType[]> => {
  if (!game.cached?.definition?.options) return [];
  const optionMap: { [key: number]: string } =
    game.cached.definition.options.reduce((newObj, option, k: number) => {
      return { ...newObj, [k]: option.title };
    }, {});
  let bets: MyBetType[] = [];
  let completed = false;
  let lastTx = null;
  const limit = 1000;
  const currentGame = `"siteId":"${(
    process.env.NEXT_PUBLIC_AUTHORITY as string
  ).slice(0, 7)}","gameId":${game.data.gameId},"type":"Bet"`;
  while (!completed) {
    let params: SignaturesForAddressOptions = { limit: limit };
    if (lastTx) {
      params.before = lastTx;
    }
    let signatures = await connection.getSignaturesForAddress(wallet, params);
    if (signatures.length < limit) {
      completed = true;
    }
    for (var i = 0; i < signatures.length; i++) {
      lastTx = signatures[i].signature;
      let txTime = new Date((signatures[i].blockTime as number) * 1000);
      if (signatures[i].blockTime) {
        if (txTime < game.data.openTime) {
          completed = true;
          break;
        }
      }
      if (signatures[i].memo) {
        if (signatures[i].memo?.indexOf(currentGame) != -1) {
          try {
            let data: any = JSON.parse(
              (signatures[i].memo as string).split(" ")[1]
            );
            bets.push({
              gameId: data.gameId,
              date: txTime,
              referral: data.referral,
              optionId: data.optionId,
              stake: data.stake,
              name: optionMap[data.optionId],
              signature: signatures[i].signature,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  }
  return bets;
  // Verify valid bets
  // const batchSize = 10;
  // let verifiedBets: MyBetType[] = [];
  // for (let i = 0; i < Math.ceil(bets.length / batchSize); i++) {
  //   (
  //     await Promise.allSettled(
  //       bets.slice(i * batchSize, i * batchSize + batchSize).map(async (b) =>
  //         connection.getTransaction(b.signature, {
  //           commitment: "confirmed",
  //           maxSupportedTransactionVersion: 0,
  //         })
  //       )
  //     )
  //   ).map((r, k: number) => {
  //     if (
  //       r.status === "fulfilled" &&
  //       r.value?.transaction?.message
  //         .getAccountKeys()
  //         .staticAccountKeys[0].toBase58() == wallet.toBase58()
  //     ) {
  //       verifiedBets.push(bets[i * batchSize + k]);
  //     }
  //   });
  // }
  // return verifiedBets;
};
