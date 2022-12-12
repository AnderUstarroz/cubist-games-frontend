import {
  bet_tx,
  ClaimSolBetType,
  lamports_to_sol,
  MAX_BETS_LIMIT,
  PDATypes,
  PlayerBetsType,
  RefundSolBetType,
  SolanaProgramType,
  sol_to_lamports,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { GameType } from "../../types/game";
import { flashMsg } from "./helpers";
import {
  PublicKey,
  Connection,
  SignaturesForAddressOptions,
} from "@solana/web3.js";
import { human_number } from "./number";
import { OptionInputType } from "../../types/game-settings";

export const place_bet = async (
  solanaProgram: SolanaProgramType,
  connection: Connection,
  systemConfig: SystemConfigType,
  game: GameType,
  pdas: PDATypes,
  optionId: number,
  lamports: number,
  agreedTerms: Boolean,
  publickey: PublicKey | null,
  modals: { [k: string]: boolean },
  setModals: Function,
  setWalletVisible: Function,
  sendTransaction: Function,
  playerBets: PlayerBetsType | null
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

  const [tx, msg] = await bet_tx(
    solanaProgram,
    connection,
    lamports,
    optionId,
    pdas.playerBets.pda,
    playerBets,
    publickey,
    pdas.game.pda,
    pdas.systemConfig.pda,
    systemConfig.treasury,
    game.data.gameId
  );
  if (playerBets && (playerBets.bets as []).length >= MAX_BETS_LIMIT) {
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
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
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
  if (modals.bet) {
    setModals({ ...modals, bet: false });
  }
};

export interface MyBetType {
  date: Date;
  gameId: number;
  optionId: number;
  stake: number;
  title: string;
  referral: string;
  signature: string;
  payment: number | null;
  paySignature: string | null;
}

export const fetch_my_bets = async (
  connection: Connection,
  wallet: PublicKey,
  game: GameType
): Promise<MyBetType[]> => {
  if (!game.cached?.definition?.options) return [];
  const optionMap: { [key: number]: { title: string } } =
    game.cached.definition.options.reduce((newObj, option, k: number) => {
      return { ...newObj, [k]: { title: option.title } };
    }, {});
  let bets: MyBetType[] = [];
  let completed = false;
  let lastTx = null;
  const limit = 1000;
  const currentGame = `"siteId":"${(
    process.env.NEXT_PUBLIC_AUTHORITY as string
  ).slice(0, 7)}","gameId":${game.data.gameId}`;
  let paidBets: { [key: number]: { payment: number; paySignature: string } } =
    {};
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
      if (signatures[i].memo && !signatures[i].err) {
        if (signatures[i].memo?.indexOf(currentGame) != -1) {
          try {
            let data: any = JSON.parse(
              (signatures[i].memo as string).split(" ")[1]
            );
            if (data.type === "Bet") {
              bets.push({
                gameId: data.gameId,
                date: txTime,
                referral: data.referral,
                optionId: data.optionId,
                stake: data.stake,
                title: optionMap[data.optionId].title,
                signature: signatures[i].signature,
                payment: paidBets.hasOwnProperty(data.betId)
                  ? paidBets[data.betId].payment
                  : null,
                paySignature: paidBets.hasOwnProperty(data.betId)
                  ? paidBets[data.betId].paySignature
                  : null,
              });
            } else if ("Payment" === data.type || "Refund" === data.type) {
              // Populate paid bets
              data.bets.map((b: RefundSolBetType | ClaimSolBetType) => {
                paidBets[b[0]] = {
                  payment: b[b.length - 1],
                  paySignature: signatures[i].signature,
                };
              });
            }
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

export const calculate_stakes = (
  result: number,
  options: OptionInputType[]
) => {
  let winnerStake = 0; // Amount in SOL
  let totalStake = 0; // Amount in SOL
  options.map((option: OptionInputType) => {
    if (option.id == result) {
      winnerStake += option.totalStake;
    }
    totalStake += option.totalStake;
  });
  return [sol_to_lamports(totalStake), sol_to_lamports(winnerStake)];
};
