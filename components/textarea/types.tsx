import { MouseEventHandler } from "react";

export interface TextareaType {
  cType: string;
  onClick?: MouseEventHandler<HTMLTextAreaElement>;
  className?: string;
}

export interface TextareaTypes {
  [key: string]: any;
}
