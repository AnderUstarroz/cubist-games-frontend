import {
  Bundlr,
  BundlrError,
  lamports_to_sol,
  solana_to_usd,
} from "@cubist-collective/cubist-games-lib";
import { Connection } from "@solana/web3.js";
import type { Adapter } from "@solana/wallet-adapter-base";
import { flashMsg } from "./helpers";
import { BN } from "@project-serum/anchor";
import { RechargeArweaveType } from "../recharge-arweave/types";

export async function BundlrWrapper(
  connection: Connection,
  adapter: Adapter
): Promise<Bundlr> {
  try {
    return new Proxy(
      await new Bundlr(process.env.NEXT_PUBLIC_ENV as any, connection, adapter),
      {
        get: function (target: any, prop, receiver) {
          if (prop in target && typeof target[prop] === "function") {
            return (...args: any) => {
              return Reflect.get(target, prop, receiver)
                .apply(target, args)
                .catch((e: any) => {
                  if (e instanceof BundlrError) {
                    flashMsg(e.message, "error", 10000);
                  } else {
                    throw e;
                  }
                });
            };
          } else if (prop === "then") {
            return null;
          }
          return function () {
            console.error(
              `Property "${String(prop)}" does not exist in Bundlr!!!`
            );
          };
        },
      }
    );
  } catch (e: any) {
    if (e instanceof BundlrError) {
      flashMsg(e.message, "error", 10000);
    }
    throw e;
  }
}

export const displayRechargeArweave = (
  price: BN,
  balance: BN,
  rechargeArweave: RechargeArweaveType,
  setRechargeArweave: Function,
  solFiatPrice: number,
  maxDecimals: number
) => {
  // Reacharge Arweave when there is not enough balance
  if (price.gte(balance)) {
    const requiredLamports = price.toNumber() - balance.toNumber();
    setRechargeArweave({
      ...rechargeArweave,
      display: true,
      value: Math.max(
        ...[1 / (solFiatPrice as number), lamports_to_sol(requiredLamports)]
      ),
      requiredSol: lamports_to_sol(requiredLamports),
      solBalance: lamports_to_sol(balance.toNumber()),
      requiredUsd: solana_to_usd(
        lamports_to_sol(requiredLamports),
        solFiatPrice as number
      ),
      recommendedSol: 1 / (solFiatPrice as number),
      decimals: maxDecimals,
    });
    return true;
  }
  return false;
};
