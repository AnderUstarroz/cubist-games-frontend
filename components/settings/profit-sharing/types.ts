import { SystemConfigType } from "@cubist-collective/cubist-games-lib";
import { ProfitShareInputType } from "../../../pages/types/game-settings";

export interface ProfitSharingType {
  systemConfig: SystemConfigType;
  settings: {
    fee: number;
    profitSharing: ProfitShareInputType[];
    [key: string]: any;
  };
  errors: { [key: string]: string };
  handleUpdateSettings: Function;
  showModal: Function;
  setModals: Function;
  modals: { [key: string]: boolean };
}
