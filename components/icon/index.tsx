import * as React from "react";
import dynamic from "next/dynamic";
import { IconType, IconTypes } from "./types";

const Icons: IconTypes = {
  info: dynamic(() => import("./info")),
  close: dynamic(() => import("./close")),
  dashboard: dynamic(() => import("./dashboard")),
  linkedin: dynamic(() => import("./linkedin")),
  exclamation: dynamic(() => import("./exclamation")),
  edit: dynamic(() => import("./edit")),
  calendar: dynamic(() => import("./calendar")),
  eye: dynamic(() => import("./eye")),
  gear: dynamic(() => import("./gear")),
  sol: dynamic(() => import("./sol")),
  valid: dynamic(() => import("./valid")),
  invalid: dynamic(() => import("./invalid")),
  coins: dynamic(() => import("./coins")),
  game: dynamic(() => import("./game")),
  award: dynamic(() => import("./award")),
  crystalBall: dynamic(() => import("./crystal_ball")),
  treasure: dynamic(() => import("./treasure")),
  share: dynamic(() => import("./share")),
  vs: dynamic(() => import("./vs")),
  arrow: dynamic(() => import("./arrow")),
  web: dynamic(() => import("./web")),
};

function Icon(props: IconType) {
  const IconWrapper = Icons.hasOwnProperty(props.cType)
    ? Icons[props.cType]
    : React.Fragment;
  return <IconWrapper {...props} />;
}

export default Icon;
