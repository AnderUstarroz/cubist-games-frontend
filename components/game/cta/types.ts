import { MyBetType } from "../../utils/bet";
import { PlayerBetsType } from "@cubist-collective/cubist-games-lib";
import { GameType, PrevGameType } from "../../../types/game";
import { PublicKey } from "@solana/web3.js";

export interface CTAPropsType {
  publickey: PublicKey | null;
  template: string | null;
  game: GameType;
  myBets: MyBetType[];
  playerBets: PlayerBetsType | null;
  handleClaim: Function;
  modals: { [key: string]: boolean };
  setModals: Function;
  termsAgreed: boolean;
}

export enum ShowCTA {
  Wallet,
  Bet,
  Pay,
  Refund,
  None,
}
