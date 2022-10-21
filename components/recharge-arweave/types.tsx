import { MouseEventHandler } from "react";

export interface RechargeArweaveType {
  display: boolean;
  value: number;
  requiredSol: number;
  solBalance: number;
  requiredUsd: number;
  recommendedSol: number;
  error: boolean;
  loading: boolean;
  decimals: number;
  closeModals: { [key: string]: boolean };
}
export interface RechargeArweavePropsType {
  display: boolean;
  value: number;
  handleUpdate: Function;
  handleRechargeArweave: Function;
  requiredSol: number;
  solBalance: number;
  requiredUsd: number;
  recommendedSol: number;
  error: boolean;
  loading: boolean;
  decimals: number;
  closeModals: { [key: string]: boolean };
}
