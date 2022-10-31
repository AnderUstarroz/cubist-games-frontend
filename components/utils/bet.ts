import {
  ActionType,
  BetMsgType,
  MEMO_PROGRAM_ID,
  player_bets_pda,
  SolanaProgramType,
  sol_to_lamports,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { GameType } from "../../pages/types/game";
import { flashMsg } from "./helpers";
import { PublicKey, Connection, Transaction } from "@solana/web3.js";
import { PDAType } from "../../pages/types/game-settings";
import { BN } from "@project-serum/anchor";

export const place_bet = async (
  solanaProgram: SolanaProgramType,
  connection: Connection,
  systemConfig: SystemConfigType,
  game: GameType,
  pdas: PDAType[],
  optionId: number,
  lamports: number,
  agreedTerms: Boolean,
  publicKey: PublicKey | null,
  modals: { [k: string]: boolean },
  setModals: Function,
  setWalletVisible: Function
) => {
  if (new Date() < game.data.openTime) {
    return flashMsg("Game is not open yet");
  }
  if (new Date() >= game.data.closeTime) {
    return flashMsg("Game is closed");
  }
  if (!publicKey) {
    setWalletVisible(true);
    return flashMsg("Wallet is not connected");
  }
  if (!agreedTerms) {
    return flashMsg("You must accept the Terms & Conditions");
  }

  const systemConfigPda = pdas[0][0];
  const gamePda = pdas[2][0];
  const [playerBetsPda, _] = await player_bets_pda(publicKey, gamePda);
  const [tx, msg] = await bet_tx(
    solanaProgram,
    lamports + systemConfig.betFee.toNumber(),
    optionId,
    playerBetsPda,
    publicKey,
    gamePda,
    systemConfigPda,
    systemConfig.treasury,
    game.data.gameId
  );
  console.log("MSG", msg);

  const balances = (
    await Promise.allSettled([
      connection.getBalance(publicKey),
      tx.getEstimatedFee(connection),
    ])
  ).map((r: any) => {
    if (r.status !== "fulfilled") {
      flashMsg("Failed to place bet! Couldn't get wallet's balance");
      console.error(r);
    }
    return r.value;
  });
  console.log("Balance", "Estimated FEE");
  console.log(balances);

  //Finish
  if (modals.customStake) {
    setModals({ ...modals, customStake: false });
  }
};

export async function bet_tx(
  solanaProgram: SolanaProgramType,
  lamports: number,
  optionId: number,
  playerBetsPDA: PublicKey,
  playerPublicKey: PublicKey,
  gamePDA: PublicKey,
  systemConfigPDA: PublicKey,
  systemTreasury: PublicKey,
  gameId: number
): Promise<[Transaction, BetMsgType]> {
  const msg = {
    siteId: (process.env.NEXT_PUBLIC_AUTHORITY as string).slice(0, 7),
    gameId: gameId,
    type: ActionType.Bet,
    optionId: optionId,
    stake: lamports,
    referral: null,
  };

  const transaction = new Transaction();
  // Initialize player's betting account if doesn't exist already
  try {
    await solanaProgram.account.playerBets.fetch(playerBetsPDA);
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
  return [transaction, msg] as [Transaction, BetMsgType];
}
