import { GameTermsType } from "../../../pages/types/game";

export interface TermsPropsType {
  display: boolean;
  terms: GameTermsType;
  setTerms: Function;
  setMainModal: Function;
}
