import { GameType } from "../../../pages/types/game";

export interface DefaultResultsPropsType {
  game: GameType;
}

export interface ResultsPropsType {
  template: string | null;
  game: GameType;
}
