export interface GeneralSettingsType {
  settings: {
    fee: number;
    showPot: boolean;
    allowReferral: boolean;
    fireThreshold: number;
    openTime?: Date;
    closeTime?: Date;
    settleTime?: Date;
    [key: string]: any;
  };
  errors: { [key: string]: string };
  handleUpdateSettings: Function;
  showModal: Function;
}
