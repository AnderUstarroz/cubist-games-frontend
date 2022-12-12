import { GameType } from "../../../types/game";
import { MyBetType } from "../../utils/bet";
export interface DefaultResultsPropsType {
  game: GameType;
  myBets: MyBetType[];
}

export interface ResultsPropsType extends DefaultResultsPropsType {
  template: string | null;
}
