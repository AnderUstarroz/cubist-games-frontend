import { GameType } from "../../../pages/types/game";

export interface DefaultStatsPropsType {
  game: GameType;
}

export interface StatsPropsType {
  template: string | null;
  game: GameType;
}
