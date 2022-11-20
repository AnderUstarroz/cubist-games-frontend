import * as React from "react";
import { IconType } from "../types";

export default function Close(props: IconType) {
  return (
    <svg
      width={props.width ? props.width : 10}
      height={props.height ? props.height : 10}
      className={props.className ? props.className : ""}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={props.onClick ? props.onClick : undefined}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.0884023 9.91162C0.147321 9.97051 0.224536 9.99998 0.30175 9.99998C0.378965 9.99998 0.45618 9.97051 0.515099 9.91162L5 5.42669L9.48492 9.91164C9.54381 9.97053 9.62108 10 9.69829 10C9.77548 10 9.8527 9.97053 9.91164 9.91164C10.0295 9.79383 10.0295 9.60278 9.91164 9.48492L5.42669 5L9.91164 0.515075C10.0295 0.397237 10.0295 0.206216 9.91164 0.0883781C9.7938 -0.0294594 9.60278 -0.0294594 9.48492 0.0883781L5 4.5733L0.515075 0.0884264C0.397237 -0.0294111 0.206216 -0.0294111 0.0883781 0.0884264C-0.0294594 0.20624 -0.0294594 0.397285 0.0883781 0.515123L4.5733 5.00002L0.0884023 9.48492C-0.0294352 9.60276 -0.0294352 9.7938 0.0884023 9.91162Z"
        fill={props.color ? props.color : "var(--iconFill0)"}
      />
    </svg>
  );
}
