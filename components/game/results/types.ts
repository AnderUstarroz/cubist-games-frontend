import { CubistGames } from "@cubist-collective/cubist-games-lib";
import { GameType } from "../../../pages/types/game";
import { IdlAccounts } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { MyBetType } from "../../utils/bet";
export interface DefaultResultsPropsType {
  game: GameType;
  publickey: PublicKey | null;
  myBets: MyBetType[];
  playerBets: IdlAccounts<CubistGames>["playerBets"] | null;
}

export interface ResultsPropsType extends DefaultResultsPropsType {
  template: string | null;
}
