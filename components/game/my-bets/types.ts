import { MyBetType } from "../../utils/bet";

export interface DefaultMyBetsPropsType {
  myBets: MyBetType[];
}

export interface MyBetsPropsType extends DefaultMyBetsPropsType {
  template: string | null;
}
