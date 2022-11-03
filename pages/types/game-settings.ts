import { PublicKey } from "@solana/web3.js";

export interface GeneralInputType {
  fee: number;
  showPot: boolean;
  useCategories: boolean;
  allowReferral: boolean;
  fireThreshold: number;
}
export interface GeneralConfigInputType extends GeneralInputType {
  https: boolean;
  domain: string;
}
export interface StakeButtonsInputType {
  minStake: number;
  minStep: number;
  customStakeButton: boolean;
  stakeButtons: number[];
}
export interface ProfitShareInputType {
  treasury: string;
  share: number;
  cashed: boolean;
}
export interface TermsType {
  id: string;
  bump: number;
}
export interface ConfigInputType
  extends GeneralConfigInputType,
    StakeButtonsInputType {
  designTemplatesHash: null | string;
  categoriesHash: null | string;
  profitSharing: ProfitShareInputType[];
  terms: TermsType[];
}

export interface TermsInputsType {
  bump: number | null;
  loading: boolean;
  id: string;
  title: string;
  description: string;
}

export enum GameStateType {
  Pending,
  Open,
  Closed,
  Voided,
  Settled,
}

export interface OptionInputType {
  id: number;
  totalStake: number;
  totalBets: number;
}
export interface GameSettingsInputType
  extends GeneralInputType,
    StakeButtonsInputType {
  gameId: number;
  state: GameStateType;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  settledAt: Date | null;
  cashedAt: Date | null;
  openTime: Date;
  closeTime: Date;
  settleTime: Date;
  solProfits: number | null; // Lamports (1 SOL = 1000000000 Lamports)
  tokenProfits: number | null; // Depends on Token's decimals
  profitSharing: ProfitShareInputType[];
  designTemplate: string | null;
  termsId: string;
  termsHash: string;
  definitionHash: string;
  category: string | null;
  useToken: boolean;
  image1Hash: string | null;
  hasBets: boolean;
  totalBetsClaimed: number;
  options: OptionInputType[];
  result: number | null;
}
