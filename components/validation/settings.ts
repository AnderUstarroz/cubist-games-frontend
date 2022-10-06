import {
  DefaultSettingsInputType,
  ProfitShareInputType,
} from "../../pages/types/game-settings";
import { SettingsError } from "./errors";
import { isBase58 } from "@cubist-collective/cubist-games-lib";

export function feeValidator(settings: DefaultSettingsInputType) {
  if (settings.fee < 0 || settings.fee > 100) {
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
  if (value < 0 || value > 100) {
    throw new SettingsError(
      "minStake",
      "Minimum stake must be between 0 and 100"
    );
  }
}

export function minStepValidator(value: number) {
  if (value < 0 || value > 100) {
    throw new SettingsError(
      "minStep",
      "Minimum stake step must be between 0 and 100"
    );
  }
}

export function ProfitSharingValidator(settings: DefaultSettingsInputType) {
  // Validate profitsharing only when Fee is defined, otherwise there is no point.
  if (!settings.fee) {
    return;
  }
  let totalShares = 0;
  if (settings.profitSharing.length > 10) {
    throw new SettingsError(
      "profitSharing",
      "Profit sharing is limited to a maximum of 10 Public keys"
    );
  }
  let keys: string[] = [];
  settings.profitSharing.map((item: ProfitShareInputType) => {
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
}

export function feeAndProfitSharing(settings: DefaultSettingsInputType) {
  feeValidator(settings);
  ProfitSharingValidator(settings);
}

export const VALIDATORS: { [key: string]: any } = {
  fireThresholdValidator,
  minStakeValidator,
  minStepValidator,
};

export const COMBINED_VALIDATORS: { [key: string]: any } = {
  fee: feeAndProfitSharing,
  profitSharing: feeAndProfitSharing,
};

export function validateInput(key: string, value: any) {
  if (`${key}Validator` in VALIDATORS) {
    VALIDATORS[`${key}Validator`](value);
  }
}

export function validateCombinedInput(
  key: string,
  settings: DefaultSettingsInputType
) {
  if (key in COMBINED_VALIDATORS) {
    COMBINED_VALIDATORS[key](settings);
  }
}
