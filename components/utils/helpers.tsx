import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useRef } from "react";

const Notification = dynamic(() => import("../notification"));

export const flashError = async (
  func: Function,
  ...params: any
): Promise<any> => {
  try {
    return await func(...params);
  } catch (error) {
    flashMsg((error as Error).message, "error");
  }
};

export function flashMsg(
  msg: string | ReactNode,
  variant: "error" | "info" | "success" = "error",
  duration: number = 5000
) {
  toast.custom(<Notification message={msg} variant={variant} />, {
    duration: duration,
  });
}

export const is_authorized = (publicKey: PublicKey | null): boolean => {
  return (
    publicKey?.toBase58() === (process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
};

export function useInterval(callback: any, delay: number) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      // @ts-ignore
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
