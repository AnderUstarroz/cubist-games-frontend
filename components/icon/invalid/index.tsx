import * as React from "react"
import { IconType } from "../types"

export default function Close(props: IconType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      id="Capa_1"
      x="0px"
      y="0px"
      viewBox="0 0 240 240"
      width={props.width ? props.width : 25}
      height={props.height ? props.height : 25}
      //style="enable-background:new 0 0 240 240;"
    >
      <path
        fill={props.color ? props.color : "var(--iconsColor)"}
        d="M120,240c66.168,0,120-53.831,120-120S186.168,0,120,0S0,53.832,0,120S53.832,240,120,240z M120,30  c49.626,0,90,40.374,90,90s-40.374,90-90,90s-90-40.374-90-90S70.374,30,120,30z M69.144,149.644L98.787,120L69.144,90.356  l21.213-21.213L120,98.787l29.644-29.644l21.213,21.213L141.213,120l29.643,29.644l-21.213,21.213L120,141.213l-29.644,29.643  L69.144,149.644z"
      />
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
    </svg>
  )
}
