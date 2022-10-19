import { FileType } from "@cubist-collective/cubist-games-lib";
import { MouseEventHandler, ChangeEventHandler } from "react";

export interface ImageInputType {
  onClick?: MouseEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  name?: string;
  accept?: string;
  file: FileType | null;
}
