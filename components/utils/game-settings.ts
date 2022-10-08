import { ProfitShareType } from "@cubist-collective/cubist-games-lib";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { ProfitShareInputType } from "../../pages/types/game-settings";

export function addProfitShare(
  profitSharing: ProfitShareInputType[],
  func: Function
) {
  let remaining =
    100 - profitSharing.reduce((prev, curr) => prev + curr.share, 0);
  if (remaining) {
    profitSharing.push({
      treasury: "",
      share: parseFloat(remaining.toFixed(2)),
    });
    func("profitSharing", profitSharing);
  }
}

export function profitSharingCompleted(profitSharing: ProfitShareInputType[]) {
  if (profitSharing.length >= 10) {
    return true;
  }
  return profitSharing.reduce((prev, curr) => prev + curr.share, 0) == 100;
}

export function feeTrans(
  value: number,
  _decimals: number,
  toRust: boolean = true
) {
  return toRust ? value * 100 : value / 100;
}
export function fireThresholdTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return toRust
    ? new BN(Math.pow(10, decimals) * (value as number))
    : (value as BN).toNumber() / Math.pow(10, decimals);
}

export function minStakeTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return toRust
    ? new BN(Math.pow(10, decimals) * (value as number))
    : (value as BN).toNumber() / Math.pow(10, decimals);
}

export function minStepTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return toRust
    ? new BN(Math.pow(10, decimals) * (value as number))
    : (value as BN).toNumber() / Math.pow(10, decimals);
}

export function stakeButtonsTrans(
  values: number[] | BN[],
  decimals: number,
  toRust: boolean = true
) {
  return toRust
    ? (values as number[]).map(
        (n: number) => new BN(Math.pow(10, decimals) * (n as number))
      )
    : (values as BN[]).map((n: BN) => n.toNumber() / Math.pow(10, decimals));
}

export function profitSharingTrans(
  values: ProfitShareInputType[] | ProfitShareType[],
  _decimals: number,
  toRust: boolean = true
) {
  return toRust
    ? (values as ProfitShareInputType[]).map((p: ProfitShareInputType) => {
        return { treasury: new PublicKey(p.treasury), share: p.share * 100 };
      })
    : (values as ProfitShareType[]).map((p: ProfitShareType) => {
        return { treasury: p.treasury.toBase58(), share: p.share / 100 };
      });
}

export const TRANSFORM_SETTINGS: { [key: string]: Function } = {
  feeTrans,
  fireThresholdTrans,
  minStakeTrans,
  minStepTrans,
  stakeButtonsTrans,
  profitSharingTrans,
};

export function inputsToRustSettings(
  inputsSettings: any,
  decimals: number
): any {
  //Transforms readable configuration into Rust compatible values
  let rustSettings: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(inputsSettings)) {
    rustSettings[key] =
      `${key}Trans` in TRANSFORM_SETTINGS
        ? TRANSFORM_SETTINGS[`${key}Trans`](value, decimals)
        : value;
  }
  return rustSettings;
}

export function rustToInputsSettings(rustSettings: any, decimals: number): any {
  //Transforms the Rust values values into readable configuration
  let inputsSettings: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(rustSettings)) {
    inputsSettings[key] =
      `${key}Trans` in TRANSFORM_SETTINGS
        ? TRANSFORM_SETTINGS[`${key}Trans`](value, decimals, false)
        : value;
  }
  return inputsSettings;
}
