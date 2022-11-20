import {
  isRejected,
  OptionType,
  PDATypes,
  ProfitShareType,
  SolanaProgramType,
  SystemConfigType,
} from "@cubist-collective/cubist-games-lib";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import GameSettings from "../../pages/admin/global-settings";
import {
  ConfigInputType,
  GameStateType,
  OptionInputType,
  ProfitShareInputType,
} from "../../pages/types/game-settings";
import { multi_request } from "./requests";

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
      cashed: false,
    });
    func("profitSharing", profitSharing);
  }
}

export function profitSharingCompleted(profitSharing: ProfitShareInputType[]) {
  if (profitSharing.length >= 10) {
    return true;
  }
  return profitSharing.reduce((prev, curr) => prev + curr.share, 0) >= 100;
}

export function feeTrans(
  value: number,
  _decimals: number,
  toRust: boolean = true
) {
  return toRust ? value * 100 : value / 100;
}

export function transform_num_with_decimals(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  if (value == null) {
    return null;
  }
  return toRust
    ? new BN(Math.pow(10, decimals) * (value as number))
    : (value as BN).toNumber() / Math.pow(10, decimals);
}

export function transform_num(value: number | BN, toRust: boolean = true) {
  return toRust ? new BN(value as number) : (value as BN).toNumber();
}
export function fireThresholdTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return transform_num_with_decimals(value, decimals, toRust);
}

export function minStakeTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return transform_num_with_decimals(value, decimals, toRust);
}

export function minStepTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return transform_num_with_decimals(value, decimals, toRust);
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
        return {
          treasury: new PublicKey(p.treasury),
          share: p.share * 100,
          cashed: p.cashed,
        };
      })
    : (values as ProfitShareType[]).map((p: ProfitShareType) => {
        return {
          treasury: p.treasury.toBase58(),
          share: p.share / 100,
          cashed: p.cashed,
        };
      });
}

export function gameIdTrans(
  value: number | BN,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_num(value, toRust);
}

export function transform_date(value: number | Date | null, toRust: boolean) {
  if (!value) return null;
  return toRust
    ? new BN(Math.floor((value as Date).getTime() / 1000))
    : new Date((value as number) * 1000);
}

export function openTimeTrans(
  value: Date | number,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}

export function closeTimeTrans(
  value: Date | number,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}
export function settleTimeTrans(
  value: Date | number,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}
export function createdAtTrans(
  value: Date | number | null,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}
export function updatedAtTrans(
  value: Date | number | null,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}

export function cashedAtTrans(
  value: Date | number | null,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}
export function settledAtTrans(
  value: Date | number | null,
  _decimals: number,
  toRust: boolean = true
) {
  return transform_date(value, toRust);
}

export function solProfitsTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return transform_num_with_decimals(value, decimals, toRust);
}

export function tokenProfitsTrans(
  value: number | BN,
  decimals: number,
  toRust: boolean = true
) {
  return transform_num_with_decimals(value, decimals, toRust);
}

export function optionsTrans(
  values: OptionInputType[] | OptionType[],
  decimals: number,
  toRust: boolean = true
) {
  return toRust
    ? (values as OptionInputType[]).map((k: OptionInputType) => {
        return {
          ...k,
          totalStake: new BN(Math.pow(10, decimals) * k.totalStake),
        };
      })
    : (values as OptionType[]).map((k: OptionType) => {
        return {
          ...k,
          totalStake: k.totalStake.toNumber() / Math.pow(10, decimals),
        };
      });
}

export const TRANSFORM_SETTINGS: { [key: string]: Function } = {
  feeTrans,
  fireThresholdTrans,
  minStakeTrans,
  minStepTrans,
  stakeButtonsTrans,
  profitSharingTrans,
  gameIdTrans,
  openTimeTrans,
  closeTimeTrans,
  settleTimeTrans,
  createdAtTrans,
  updatedAtTrans,
  settledAtTrans,
  cashedAtTrans,
  solProfitsTrans,
  tokenProfitsTrans,
  optionsTrans,
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

export function default_profit_sharing(
  fee: number,
  systemConfig: SystemConfigType
): ProfitShareInputType[] {
  let treasuryShare = Math.ceil((systemConfig.profitFee / fee) * 100) / 100;
  return [
    {
      treasury: process.env.NEXT_PUBLIC_AUTHORITY as string,
      share: 100 - treasuryShare,
      cashed: false,
    },
    {
      treasury: systemConfig.treasury.toBase58(),
      share: treasuryShare,
      cashed: false,
    },
  ];
}

export async function fetch_configs(
  config: ConfigInputType,
  solanaProgram: SolanaProgramType,
  pdas: PDATypes,
  setSystemConfig: Function,
  setConfig: Function,
  setStats: Function,
  maxDecimals: number
): Promise<boolean> {
  const result = await Promise.allSettled([
    solanaProgram.account.systemConfig.fetch(pdas.systemConfig.pda),
    solanaProgram.account.config.fetch(pdas.config.pda),
    solanaProgram.account.stats.fetch(pdas.stats.pda),
  ]);
  const [systemConfigData, configData, statsData] = result.map((k: any) =>
    k.status === "fulfilled" ? k.value : null
  );
  // console.log("SystemConfig:", systemConfigData);
  // console.log("configData:", configData);
  // console.log("config:", config);
  // console.log("startsData:", statsData);
  setSystemConfig(systemConfigData);
  if (!configData) {
    // Define the default profit sharing
    if (config?.profitSharing.length <= 1 && systemConfigData.profitFee) {
      setConfig({
        ...config,
        profitSharing: default_profit_sharing(config.fee, systemConfigData),
      });
    }
    return false;
  }
  setConfig(rustToInputsSettings(configData, maxDecimals));
  setStats(statsData);
  return true;
}
