import { CustomStakeType, GameType } from "../../../types/game";
import { PublicKey } from "@solana/web3.js";
import {
  PDATypes,
  PlayerBetsType,
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";

export interface DefaultStakeButtonsPropsType {
  solanaProgram: SolanaProgramType;
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
