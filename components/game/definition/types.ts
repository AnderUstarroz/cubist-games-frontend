import { SystemConfigType } from "@cubist-collective/cubist-games-lib";
import { GameTermsType, GameType } from "../../../pages/types/game";

export interface DefaultDefinitionPropsType {
  game: GameType;
  terms: GameTermsType;
  setTerms: Function;
  setMainModal: Function;
  systemConfig: SystemConfigType;
}

export interface DefinitionPropsType extends DefaultDefinitionPropsType {
  template: string | null;
}
