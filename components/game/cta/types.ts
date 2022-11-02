import { MyBetType } from "../../utils/bet";
import { CubistGames } from "@cubist-collective/cubist-games-lib";
import { IdlAccounts } from "@project-serum/anchor";

export interface CTAPropsType {
  template: string | null;
  myBets: MyBetType[];
  playerBets: IdlAccounts<CubistGames>["playerBets"] | null;
}
