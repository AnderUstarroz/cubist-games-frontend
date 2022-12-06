import * as React from "react";
import { IconType } from "../types";
function Arrow(props: IconType) {
  return (
    <svg
      width={props.width ? props.width : 14}
      height={props.height ? props.height : 14}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.176 0.975721C5.28851 0.863238 5.4411 0.800049 5.60019 0.800049C5.75929 0.800049 5.91188 0.863238 6.02439 0.975721L9.6244 4.57572C9.73688 4.68824 9.80007 4.84082 9.80007 4.99992C9.80007 5.15902 9.73688 5.3116 9.6244 5.42412L6.02439 9.02412C5.91123 9.13342 5.75967 9.19389 5.60235 9.19252C5.44504 9.19116 5.29455 9.12806 5.1833 9.01681C5.07206 8.90557 5.00896 8.75508 5.00759 8.59776C5.00622 8.44044 5.0667 8.28888 5.176 8.17572L7.7518 5.59992H0.800195C0.641065 5.59992 0.488453 5.53671 0.375931 5.42418C0.263409 5.31166 0.200195 5.15905 0.200195 4.99992C0.200195 4.84079 0.263409 4.68818 0.375931 4.57566C0.488453 4.46313 0.641065 4.39992 0.800195 4.39992H7.7518L5.176 1.82412C5.06351 1.7116 5.00032 1.55902 5.00032 1.39992C5.00032 1.24082 5.06351 1.08824 5.176 0.975721Z"
        fill={props.color ? props.color : "var(--iconFill0)"}
      />
    </svg>
  );
}

export default Arrow;
