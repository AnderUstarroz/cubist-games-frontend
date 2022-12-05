import * as React from "react";
import { IconType } from "../types";

const directions: any = {
  left: {},
  right: { transform: "rotate(180deg)" },
  top: { transform: "rotate(90deg)" },
  bottom: { transform: "rotate(-90deg)" },
};

function Chevron(props: IconType) {
  return (
    <svg
      width={props.width ? props.width : 10}
      height={props.height ? props.height : 10}
      style={props.direction ? directions[props.direction] : undefined}
      viewBox="0 0 6 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color ? props.color : "var(--iconFill0)"}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.16559 0.234473C5.31556 0.384496 5.39982 0.587942 5.39982 0.800073C5.39982 1.0122 5.31556 1.21565 5.16559 1.36567L2.53119 4.00007L5.16559 6.63447C5.31131 6.78536 5.39195 6.98744 5.39013 7.19719C5.3883 7.40695 5.30417 7.6076 5.15584 7.75593C5.00752 7.90425 4.80687 7.98839 4.59711 7.99021C4.38735 7.99203 4.18527 7.9114 4.03439 7.76567L0.834388 4.56567C0.684411 4.41565 0.600159 4.2122 0.600159 4.00007C0.600159 3.78794 0.684411 3.5845 0.834388 3.43447L4.03439 0.234473C4.18441 0.0844966 4.38786 0.000244141 4.59999 0.000244141C4.81212 0.000244141 5.01557 0.0844966 5.16559 0.234473Z"
      />
    </svg>
  );
}

export default Chevron;
