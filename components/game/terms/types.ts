import { GameTermsType } from "../../../types/game";

export interface TermsPropsType {
  display: boolean;
  terms: GameTermsType;
  setTerms: Function;
  setMainModal: Function;
}
