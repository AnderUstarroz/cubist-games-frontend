import * as React from "react"
import { IconType } from "../types"

function Exclamation(props: IconType) {
  return (
    <svg
      onClick={props.onClick ? props.onClick : undefined}
      width={props.width ? props.width : 25}
      height={props.height ? props.height : 25}
      viewBox="0 0 36 36"
      version="1.1"
      style={props.style ? props.style : {}}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color ? props.color : "red"}
        d="M18,6A12,12,0,1,0,30,18,12,12,0,0,0,18,6Zm0,22A10,10,0,1,1,28,18,10,10,0,0,1,18,28Z"
      ></path>
      <path
        fill={props.color ? props.color : "red"}
        d="M18,20.07a1.3,1.3,0,0,1-1.3-1.3v-6a1.3,1.3,0,1,1,2.6,0v6A1.3,1.3,0,0,1,18,20.07Z"
      ></path>
      <circle
        fill={props.color ? props.color : "red"}
        cx="17.95"
        cy="23.02"
        r="1.5"
      ></circle>
      <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
    </svg>
  )
}

export default Exclamation
