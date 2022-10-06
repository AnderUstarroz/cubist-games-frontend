export interface GeneralConfigInputType {
  fee: number;
  showPot: boolean;
  useCategories: boolean;
  allowReferral: boolean;
  fireThreshold: number;
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
}
export interface DefaultSettingsInputType
  extends GeneralConfigInputType,
    StakeButtonsInputType {
  designTemplatesHash: null | string;
  categoriesHash: null | string;
  profitSharing: ProfitShareInputType[];
}
