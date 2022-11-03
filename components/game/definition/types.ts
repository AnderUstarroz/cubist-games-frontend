import { GameTermsType, GameType } from "../../../pages/types/game";

export interface DefaultDefinitionPropsType {
  game: GameType;
  terms: GameTermsType;
  setTerms: Function;
  setMainModal: Function;
}

export interface DefinitionPropsType extends DefaultDefinitionPropsType {
  template: string | null;
}
