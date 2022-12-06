import { MouseEventHandler, ChangeEventHandler } from "react";

export interface CheckboxType {
  onClick?: MouseEventHandler<SVGSVGElement>;
  onChange?: ChangeEventHandler<SVGSVGElement>;
  className?: string;
  value: boolean;
  width?: number;
  height?: number;
  id?: string;
  name?: string;
  accept?: string;
}

export interface CheckboxesTypes {
  [key: string]: any;
}
