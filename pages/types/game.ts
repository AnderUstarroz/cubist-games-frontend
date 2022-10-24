import { CubistGames } from "@cubist-collective/cubist-games-lib";
import { IdlAccounts } from "@project-serum/anchor";

export interface OptionType {
  title: string;
  description: string;
  color: string;
}
export interface DefinitionInputsType {
  loading: boolean;
  title: string;
  description: string;
  warning: string;
  options: OptionType[];
}

export interface GameDefinitionType {
  title: string;
  description: string;
  warning: string;
  options: OptionType[];
}
export interface CachedGameType {
  gameId: number;
  definitionHash: string | null;
  image1Hash: string | null;
  definition: GameDefinitionType | null;
  image1: Blob | null;
  thumb1: Blob | null;
  mimeType1: string | null;
}
export interface GameType {
  data: IdlAccounts<CubistGames>["game"];
  cached: CachedGameType;
}

export interface GamesType {
  [key: number]: GameType;
}
