import * as React from "react"
import { IconType } from "../types"

export default function Game(props: IconType) {
  return (
    <svg
      onClick={props.onClick ? props.onClick : undefined}
      width={props.width ? props.width : 25}
      height={props.height ? props.height : 25}
      className={props.className ? props.className : ""}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 60.731 60.731"
      // style="enable-background:new 0 0 60.731 60.731;"
    >
      <g>
        <path
          fill={props.color ? props.color : "var(--iconsColor)"}
          d="M0.867,37.455C0.319,35.179,0,32.811,0,30.365C0,13.594,13.595,0,30.366,0C41.812,0,51.778,6.341,56.95,15.699h-7.802
		l2.729,2.729L37.342,35.488L31.36,16.689L17.668,44.081L9.991,24.12L0.867,37.455z M35.658,43.906l-5.152-16.18L17.176,54.392
		L8.952,33.019L2.51,42.43H2.507c4.664,10.765,15.379,18.302,27.859,18.302c16.775,0,30.365-13.596,30.365-30.366
		c0-4.779-1.131-9.285-3.102-13.304v7.115l-2.792-2.791L35.658,43.906z"
        />
      </g>
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
