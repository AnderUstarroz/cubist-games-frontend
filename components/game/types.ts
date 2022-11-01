import {
  CustomStakeType,
  GameTermsType,
  GameType,
  PrevGameType,
} from "../../pages/types/game";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { PDAType } from "../../pages/types/game-settings";
import { MyBetType } from "../utils/bet";

export interface GamePropsType {
  template: string | null;
  solanaProgram: SolanaProgramType;
  connection: Connection;
  systemConfig: SystemConfigType;
  game: GameType;
  pdas: PDAType[];
  prevGame: PrevGameType;
  modals: { [key: string]: boolean };
  setModals: Function;
  customStake: CustomStakeType;
  setCustomStake: Function;
  setWalletVisible: Function;
  sendTransaction: Function;
  terms: GameTermsType;
  setTerms: Function;
  setMainModal: Function;
  publickey: PublicKey | null;
  myBets: MyBetType[];
}

export interface DefaultGamePropsType extends GamePropsType {}
