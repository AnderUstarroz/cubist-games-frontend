import { GameType, PrevGameType } from "../../../types/game";

export interface DefaultStatsPropsType {
  game: GameType;
  prevGame: PrevGameType;
  setMainModal: Function;
}

export interface StatsPropsType extends DefaultStatsPropsType {
  template: string | null;
}

export interface StakesType {
  [key: number]: string;
}
