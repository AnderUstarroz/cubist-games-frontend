import { CubistGames } from "@cubist-collective/cubist-games-lib";

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
