import { CustomStakeType, GameType } from "../../../pages/types/game";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { PDAType } from "../../../pages/types/game-settings";

export interface DefaultStakeButtonsPropsType {
  solanaProgram: SolanaProgramType;
  connection: Connection;
  systemConfig: SystemConfigType;
  game: GameType;
  pdas: PDAType[];
  modals: { [key: string]: boolean };
  setModals: Function;
  setWalletVisible: Function;
  customStake: CustomStakeType;
  setCustomStake: Function;
  termsAgreed: boolean;
  publickey: PublicKey | null;
}

export interface StakeButtonsPropsType extends DefaultStakeButtonsPropsType {
  template: string | null;
}
