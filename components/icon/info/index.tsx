import * as React from "react";
import styles from "./Icon.module.scss";
import { IconType } from "../types";
function Info(props: IconType) {
  return (
    <svg
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 490 490"
      width={props.width ? props.width : 20}
      height={props.height ? props.height : 20}
      className={props.className ? props.className : styles.icon}
      onClick={props.onClick ? props.onClick : undefined}
    >
      <g>
        <g>
          <g>
            <path
              fill={props.color ? props.color : "var(--iconsColor)"}
              d="M245,490C109.9,490,0,380.1,0,245S109.9,0,245,0s245,109.9,245,245S380.1,490,245,490z M245,62C144.1,62,62,144.1,62,245
    			s82.1,183,183,183s183-82.1,183-183S345.9,62,245,62z"
            />
          </g>
          <g>
            <g>
              <circle
                fill={props.color ? props.color : "var(--iconsColor)"}
                cx="241.3"
                cy="159.2"
                r="29.1"
              />
            </g>
            <g>
              <polygon
                fill={props.color ? props.color : "var(--iconsColor)"}
                points="285.1,359.9 270.4,359.9 219.6,359.9 204.9,359.9 204.9,321 219.6,321 219.6,254.8 205.1,254.8 205.1,215.9
    				219.6,215.9 263.1,215.9 270.4,215.9 270.4,321 285.1,321 				"
              />
            </g>
          </g>
        </g>
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
  );
}

export default Info;
