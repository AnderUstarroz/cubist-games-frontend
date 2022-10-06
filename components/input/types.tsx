import { MouseEventHandler, ChangeEventHandler } from "react";

export interface InputType {
  cType: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  name?: string;
  accept?: string;
}

export interface InputTypes {
  [key: string]: any;
}
