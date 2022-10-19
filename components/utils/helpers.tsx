import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

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
