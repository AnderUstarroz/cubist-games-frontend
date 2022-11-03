import { CustomStakeType, GameType } from "../../../pages/types/game";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  PDATypes,
  PlayerBetsType,
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";

export interface DefaultStakeButtonsPropsType {
  solanaProgram: SolanaProgramType;
  connection: Connection;
  systemConfig: SystemConfigType;
  game: GameType;
  pdas: PDATypes;
  modals: { [key: string]: boolean };
  setModals: Function;
  setWalletVisible: Function;
  sendTransaction: Function;
  customStake: CustomStakeType;
  setCustomStake: Function;
  termsAgreed: boolean;
  publickey: PublicKey | null;
  playerBets: PlayerBetsType | null;
}

export interface StakeButtonsPropsType extends DefaultStakeButtonsPropsType {
  template: string | null;
}
