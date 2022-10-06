import {
  Bundlr,
  BundlrError,
  ENVIRONMENT,
} from "@cubist-collective/cubist-games-lib";
import { Connection } from "@solana/web3.js";
import type { Adapter } from "@solana/wallet-adapter-base";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const Notification = dynamic(() => import("../notification"));

export async function BundlrWrapper(
  connection: Connection,
  adapter: Adapter
): Promise<Bundlr | undefined> {
  try {
    return new Proxy(
      await new Bundlr(
        process.env.NEXT_PUBLIC_ENV as unknown as ENVIRONMENT,
        connection,
        adapter
      ),
      {
        get: function (target: any, prop, receiver) {
          if (prop in target && typeof target[prop] === "function") {
            return (...args: any) => {
              return Reflect.get(target, prop, receiver)
                .apply(target, args)
                .catch((e: any) => {
                  if (e instanceof BundlrError) {
                    console.log("entra!");
                    toast.custom(
                      <Notification message={e.message} variant="error" />,
                      {
                        duration: 10000,
                      }
                    );
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
      toast.custom(<Notification message={e.message} variant="error" />, {
        duration: 10000,
      });
    } else {
      throw e;
    }
  }
}
