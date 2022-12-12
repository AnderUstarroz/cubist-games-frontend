import { GameType } from "../../../types/game";

export interface GamesListPropsType {
  games: GameType[];
  state: string;
  title?: string;
  showButton?: boolean;
  fetchMoreGames?: Function;
  termsIds: {
    [key: string]: number;
  };
}
