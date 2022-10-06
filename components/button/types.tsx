import { MouseEventHandler } from "react"

export interface ButtonType {
  cType: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  children?: string
}

export interface ButtonTypes {
  [key: string]: any
}
