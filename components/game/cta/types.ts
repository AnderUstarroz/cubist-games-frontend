import { MyBetType } from "../../utils/bet";
import { PlayerBetsType } from "@cubist-collective/cubist-games-lib";
import { GameType, PrevGameType } from "../../../types/game";
import { PublicKey } from "@solana/web3.js";

export interface CTAPropsType {
  publickey: PublicKey | null;
  template: string | null;
  game: GameType;
  prevGame: PrevGameType;
  myBets: MyBetType[];
  playerBets: PlayerBetsType | null;
  handleClaim: Function;
  solFiatPrice: number | null;
  modals: { [key: string]: boolean };
  setModals: Function;
}

export enum ShowCTA {
  Wallet,
  Bet,
  Pay,
  Refund,
  None,
}
