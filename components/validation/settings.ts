import {
  ConfigInputType,
  GameSettingsInputType,
  ProfitShareInputType,
  TermsInputsType,
} from "../../pages/types/game-settings";
import { SettingsError } from "./errors";
import {
  isBase58,
  SystemConfigType,
  TermsType,
} from "@cubist-collective/cubist-games-lib";
import { is_ascii_alphanumeric } from "./string";
import { ordinal } from "../utils/number";
import { ProfitSharingType } from "../settings/profit-sharing/types";

export interface AllSettingsType {
  SystemConfig: SystemConfigType;
  Settings: ConfigInputType | GameSettingsInputType;
  Terms?: TermsInputsType;
  Config?: ConfigInputType;
}

export function feeValidator(fee: number) {
  if (fee < 0 || fee > 100) {
    throw new SettingsError("fee", "Fee must be between 0% and 100%");
  }
}

export function fireThresholdValidator(value: number) {
  if (value < 0 || value > 100_000) {
    throw new SettingsError(
      "fireThreshold",
      "Fire threshold must be between 0 and 100,000"
    );
  }
}

export function minStakeValidator(value: number) {
  if (value < 0 || value > 100_000) {
    throw new SettingsError(
      "minStake",
      "Minimum stake must be between 0 and 100"
    );
  }
}

export function minStepValidator(value: number) {
  if (value < 0 || value > 100_000) {
    throw new SettingsError(
      "minStep",
      "Minimum stake step must be between 0 and 100"
    );
  }
}

export function domainValidator(value: string) {
  if (value.length < 5 || value.length > 32) {
    throw new SettingsError("domain", "Invalid domain (max 32 char)");
  }
}

export function ProfitSharingValidator(
  systemConfig: SystemConfigType,
  fee: number,
  profitSharing: ProfitShareInputType[]
) {
  let totalShares = 0;
  if (!profitSharing.length) {
    throw new SettingsError("profitSharing", "Profit sharing cannot be empty!");
  }
  if (profitSharing.length > 10) {
    throw new SettingsError(
      "profitSharing",
      "Profit sharing is limited to a maximum of 10 Public keys"
    );
  }
  let keys: string[] = [];
  profitSharing.map((item: ProfitShareInputType) => {
    if (keys.includes(item.treasury)) {
      throw new SettingsError(
        "profitSharing",
        "Treasury public keys are duplicated"
      );
    }
    if (!item.treasury) {
      throw new SettingsError(
        "profitSharing",
        "Treasury Public keys cannot be empty!"
      );
    }
    if (item.treasury.length < 43 || item.treasury.length > 44) {
      throw new SettingsError(
        "profitSharing",
        "Treasury Public keys must have between 43 and 44 characters"
      );
    }
    if (!isBase58(item.treasury)) {
      throw new SettingsError(
        "profitSharing",
        "Treasury Public keys cannot contain non-alphanumeric characters or the characters: 'I', 'O', 'l', '0'"
      );
    }
    totalShares += item.share;
    keys.push(item.treasury);
  });
  if (totalShares != 100) {
    throw new SettingsError(
      "profitSharing",
      "The sum of all shares must be exactly 100%"
    );
  }

  // Validate treasury fee only when Game and Profit Fees are defined.
  if (fee == 0 || systemConfig.profitFee == 0) return;
  const profitFee = systemConfig.profitFee / 100;
  // Fee cannot be smaller than profit_fee
  if (fee < profitFee) {
    throw new SettingsError(
      "profitSharing",
      `Game fee (${fee}%) cannot be smaller than the Program fee (${profitFee}%)`
    );
  }
  // Program Treasury must be within the list of treasuries
  if (
    !profitSharing.filter(
      (item: ProfitShareInputType) =>
        item.treasury === systemConfig.treasury.toBase58()
    ).length
  ) {
    throw new SettingsError(
      "profitSharing",
      `Program treasury "${systemConfig.treasury.toBase58()} -> ${
        (profitFee * 100) / fee
      }%" must be within the list of profit shares`
    );
  }
  // Program's profit fee must be at least the percentage defined on system_config -> profit_fee
  profitSharing.map((item: ProfitShareInputType) => {
    if (
      item.treasury == systemConfig.treasury.toBase58() &&
      (item.share * fee) / 100 < profitFee
    ) {
      throw new SettingsError(
        "profitSharing",
        `The program share for ${systemConfig.treasury
          .toBase58()
          .slice(0, 4)}..${systemConfig.treasury
          .toBase58()
          .slice(-4)} must be at least ${((profitFee * 100) / fee).toFixed(2)}%`
      );
    }
  });
}

export function idTermsValidator(value: string) {
  if (!value || value.length > 4) {
    let error = !value ? "empty" : "longer than 4 characters";
    throw new SettingsError("id", `Terms ID cannot be ${error}`);
  }
  if (!is_ascii_alphanumeric(value)) {
    throw new SettingsError(
      "id",
      "Terms ID can only contain up to 4 alphanumeric Ascii characters: a-z, A-Z, 0-9"
    );
  }
}
export function titleTermsValidator(value: string) {
  if (!value || value.length > 64) {
    let error = !value ? "empty" : "longer than 64 characters";
    throw new SettingsError("title", `Terms title cannot be ${error}`);
  }
}
export function descriptionTermsValidator(value: string) {
  if (!value || value.length > 1000) {
    let error = !value ? "empty" : "longer than 1000 characters";
    throw new SettingsError(
      "description",
      `Terms description cannot be ${error}`
    );
  }
}

export function feeAndProfitSharing(allSettings: AllSettingsType) {
  feeValidator(allSettings.Settings.fee);
  ProfitSharingValidator(
    allSettings.SystemConfig,
    allSettings.Settings.fee,
    allSettings.Settings.profitSharing
  );
}

export function validTermsId(allSettings: AllSettingsType) {
  // When updating, verify that the ID exists
  if (allSettings.Terms?.bump) {
    for (const t of (allSettings.Settings as ConfigInputType).terms) {
      if (t.id === allSettings.Terms.id) {
        return;
      }
      throw new SettingsError("id", "Terms ID not found!");
    }
  }
  // When creating new terms, verify that the ID doesn't exist already
  for (const t of (allSettings.Settings as ConfigInputType).terms) {
    if (t.id === allSettings.Terms?.id) {
      throw new SettingsError(
        "id",
        "Duplicated Terms ID! Please use a different one"
      );
    }
  }
}

export function stakeButtonsValidator(
  btns: number[],
  minStake: number,
  minStep: number
) {
  if (btns.length > 10) {
    throw new SettingsError(
      "stakeButtons",
      "Too many stake buttons! Cannot create more than 10"
    );
  }
  btns.map((stake: number, k: number) => {
    if (stake < minStake) {
      throw new SettingsError(
        "stakeButtons",
        `The amount of the ${ordinal(
          k + 1
        )} stake button cannot be smaller than the minimum allowed stake`
      );
    }

    if ((Math.pow(10, 9) * stake) % (Math.pow(10, 9) * minStep) !== 0) {
      throw new SettingsError(
        "stakeButtons",
        `The amount of the ${ordinal(
          k + 1
        )} stake button should be divisible by the min-step amount`
      );
    }
  });
}
export function validateStakes(allSettings: AllSettingsType) {
  minStakeValidator(allSettings["Settings"].minStake);
  minStepValidator(allSettings["Settings"].minStep);
  stakeButtonsValidator(
    allSettings["Settings"].stakeButtons,
    allSettings["Settings"].minStake,
    allSettings["Settings"].minStep
  );
}
export function validateTermsId(allSettings: AllSettingsType) {
  if (
    !allSettings.Config?.terms.filter(
      (k: TermsType) =>
        k.id === (allSettings.Settings as GameSettingsInputType).termsId
    ).length
  ) {
    throw new SettingsError("termsId", `Invalid Terms & Conditions`);
  }
}

export const VALIDATORS: { [key: string]: any } = {
  fireThresholdValidator,
  idTermsValidator,
  titleTermsValidator,
  descriptionTermsValidator,
};

export const COMBINED_VALIDATORS: { [key: string]: any } = {
  fee: feeAndProfitSharing,
  profitSharing: feeAndProfitSharing,
  idTerms: validTermsId,
  minStake: validateStakes,
  minStep: validateStakes,
  stakeButtons: validateStakes,
  termsId: validateTermsId,
};

// Combined fields is used to know which fields are related at the time of cleaning up form errors.
export const COMBINED_INPUTS: { [key: string]: string[] } = {
  fee: ["profitSharing"],
  profitSharing: ["fee"],
};

export function validateInput(key: string, value: any, nameSpace: string = "") {
  if (`${key}${nameSpace}Validator` in VALIDATORS) {
    VALIDATORS[`${key}${nameSpace}Validator`](value);
  }
}

export function validateCombinedInput(
  key: string,
  allSettings: AllSettingsType,
  nameSpace: string = ""
) {
  if (`${key}${nameSpace}` in COMBINED_VALIDATORS) {
    COMBINED_VALIDATORS[`${key}${nameSpace}`](allSettings);
  }
}
