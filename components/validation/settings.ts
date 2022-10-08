import {
  DefaultSettingsInputType,
  ProfitShareInputType,
  TermsInputsType,
} from "../../pages/types/game-settings";
import { SettingsError } from "./errors";
import { isBase58 } from "@cubist-collective/cubist-games-lib";
import { is_ascii_alphanumeric } from "./string";

export interface AllSettingsType {
  Settings: DefaultSettingsInputType;
  Terms: TermsInputsType;
}

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

export function domainValidator(value: string) {
  if (value.length < 5 || value.length > 32) {
    throw new SettingsError("domain", "Invalid domain (max 32 char)");
  }
}

export function ProfitSharingValidator(settings: DefaultSettingsInputType) {
  // Validate profitsharing only when Fee is defined, otherwise there is no point.
  if (!settings.fee) {
    return;
  }
  let totalShares = 0;
  if (!settings.profitSharing.length) {
    throw new SettingsError("profitSharing", "Profit sharing cannot be empty!");
  }
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
  feeValidator(allSettings["Settings"]);
  ProfitSharingValidator(allSettings["Settings"]);
}

export function validTermsId(allSettings: AllSettingsType) {
  // When updating, verify that the ID exists
  if (allSettings.Terms.bump) {
    for (const t of allSettings.Settings.terms) {
      if (t.id === allSettings.Terms.id) {
        return;
      }
      throw new SettingsError("id", "Terms ID not found!");
    }
  }
  // When creating new terms, verify that the ID doesn't exist already
  for (const t of allSettings.Settings.terms) {
    if (t.id === allSettings.Terms.id) {
      throw new SettingsError(
        "id",
        "Duplicated Terms ID! Please use a different one"
      );
    }
  }
}

export const VALIDATORS: { [key: string]: any } = {
  fireThresholdValidator,
  minStakeValidator,
  minStepValidator,
  idTermsValidator,
  titleTermsValidator,
  descriptionTermsValidator,
};

export const COMBINED_VALIDATORS: { [key: string]: any } = {
  fee: feeAndProfitSharing,
  profitSharing: feeAndProfitSharing,
  idTerms: validTermsId,
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
