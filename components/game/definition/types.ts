import {
  GameTermsType,
  GameType,
  PrevGameType,
} from "../../../pages/types/game";

export interface DefaultDefinitionPropsType {
  game: GameType;
  prevGame: PrevGameType;
  terms: GameTermsType;
  setTerms: Function;
  setMainModal: Function;
}

export interface DefinitionPropsType extends DefaultDefinitionPropsType {
  template: string | null;
}
