import { isRejected, var_to_str } from "@cubist-collective/cubist-games-lib";
import { flashMsg } from "./helpers";

export type MultiRequestType = [Function, any[]];
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const new_domain = (domain: string) => {
  return typeof window !== "undefined" && domain !== window.location.host;
};

export const multi_request = async (
  requests: MultiRequestType[]
): Promise<any[]> => {
  const data = await Promise.allSettled(
    requests.map((params: MultiRequestType) => params[0](...params[1]))
  );
  if (data.find(isRejected)) {
    const errorMsg = `Failed to fetch all requests`;
    flashMsg(errorMsg, "error");
    console.error(errorMsg, data);
    throw new Error(errorMsg);
  }
  return data.map((result: any) => result.value);
};
