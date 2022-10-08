import { MouseEventHandler } from "react";

export interface ButtonType {
  cType: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children?: string;
  disabled?: boolean;
}

export interface ButtonTypes {
  [key: string]: any;
}
