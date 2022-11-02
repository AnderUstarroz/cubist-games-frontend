import {
  CustomStakeType,
  GameTermsType,
  GameType,
  PrevGameType,
} from "../../pages/types/game";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  PDATypes,
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { MyBetType } from "../utils/bet";
import { CubistGames } from "@cubist-collective/cubist-games-lib";
import { IdlAccounts } from "@project-serum/anchor";

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
  playerBets: IdlAccounts<CubistGames>["playerBets"] | null;
}

export interface DefaultGamePropsType extends GamePropsType {}
