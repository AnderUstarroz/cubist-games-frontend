import { NONAME } from "dns"
import * as React from "react"
import { IconType } from "../types"

function Linkedin(props: IconType) {
  return (
    <div style={{ position: "relative", display: "inline-block", top: "2px" }}>
      <div
        style={{
          width: (props.width ? props.width - 6 : 30 - 6) + "px",
          height: (props.height ? props.height - 6 : 30 - 6) + "px",
          background: "white",
          position: "absolute",
          top: "3px",
          left: "3px",
        }}
      ></div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="251 251 521 521"
        width={props.width ? props.width : 30}
        height={props.height ? props.height : 30}
        style={{
          borderRadius: "3px",
          position: "relative",
        }}
      >
        <title>{props.title ? props.title : "linkedin logo icon"}</title>
        <path
          d="M695.53,695.54H618.29v-121c0-28.85-.52-66-40.18-66-40.23,0-46.39,31.43-46.39,63.88V695.53H454.48V446.77h74.15v34h1a81.27,81.27,0,0,1,73.17-40.18c78.29,0,92.73,51.5,92.73,118.49ZM367.32,412.76a44.83,44.83,0,1,1,44.82-44.83,44.83,44.83,0,0,1-44.82,44.83h0m38.62,282.77H328.62V446.77h77.33ZM734,251.38H289.8A38,38,0,0,0,251.34,289V735a38.07,38.07,0,0,0,38.47,37.62H734A38.15,38.15,0,0,0,772.66,735V288.92A38.12,38.12,0,0,0,734,251.35"
          fill={props.color ? props.color : "#0a66c2"}
        />
      </svg>
    </div>
  )
}

export default Linkedin
