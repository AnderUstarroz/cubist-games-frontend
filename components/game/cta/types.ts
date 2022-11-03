import { MyBetType } from "../../utils/bet";
import { PlayerBetsType } from "@cubist-collective/cubist-games-lib";
import { GameType, PrevGameType } from "../../../pages/types/game";

export interface CTAPropsType {
  template: string | null;
  game: GameType;
  prevGame: PrevGameType;
  myBets: MyBetType[];
  playerBets: PlayerBetsType | null;
  handleClaim: Function;
}

export enum ShowCTA {
  Bet,
  Pay,
  Refund,
  None,
}
