import { MouseEventHandler } from "react"

export interface IconType {
  cType: string
  className?: string
  width?: number
  height?: number
  color?: string
  bg?: string
  title?: string
  style?: { [key: string]: any }
  onClick?: MouseEventHandler<SVGSVGElement>
}

export interface IconTypes {
  [key: string]: any
}
