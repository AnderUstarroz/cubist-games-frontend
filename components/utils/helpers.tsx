import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useRef } from "react";
import PACKAGE from "../../package.json";

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
  toast.custom(
    (t) => <Notification visible={t.visible} message={msg} variant={variant} />,
    {
      duration: duration,
    }
  );
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

export const update_available = async () => {
  const result = await fetch(
    "https://raw.githubusercontent.com/AnderUstarroz/cubist-games-frontend/main/package.json"
  );
  const data = await result.json();
  if (PACKAGE.version !== data.version) {
    flashMsg(
      <div>
        <p>
          Your DAPP version is <strong>{PACKAGE.version}</strong>, but the
          latest version is <strong>{data.version}</strong>. To update your DAPP
          follow these steps:
        </p>
        <ol>
          <li>
            Go to the{" "}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              GitHub website
            </a>
            .
          </li>
          <li>
            Click on your profile picture in the top right corner and select
            &quot;Your repositories&quot; from the drop-down menu.
          </li>
          <li>Click on your &quot;cubist-games-frontend&quot; repository.</li>
          <li>Click on &quot;Sync fork&quot;.</li>
        </ol>
      </div>,
      "error",
      2500000
    );
    return undefined;
  }
  return 1;
};
