import { SystemConfigType } from "@cubist-collective/cubist-games-lib";
import { ProfitShareInputType } from "../../../types/game-settings";

export interface ProfitsPropsType {
  systemConfig: SystemConfigType | null;
  settings: {
    fee: number;
    profitSharing: ProfitShareInputType[];
    [key: string]: any;
  };
  errors: { [key: string]: string };
  handleUpdateSettings: Function;
  handleValidateSettings: Function;
  showModal: Function;
  setModals: Function;
  modals: { [key: string]: boolean };
}
