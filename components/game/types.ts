import {
  CustomStakeType,
  GameTermsType,
  GameType,
  PrevGameType,
} from "../../types/game";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  PDATypes,
  PlayerBetsType,
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { MyBetType } from "../utils/bet";

export interface GamePropsType {
  template: string | null;
  solanaProgram: SolanaProgramType;
  connection: Connection;
  systemConfig: SystemConfigType;
  game: GameType;
  pdas: PDATypes;
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
  playerBets: PlayerBetsType | null;
  handleClaim: Function;
  solFiatPrice: number | null;
}

export interface DefaultGamePropsType extends GamePropsType {}
