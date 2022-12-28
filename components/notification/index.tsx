import React, { FC, ReactNode } from "react";
import styles from "./Notification.module.scss";
import { ToastPosition } from "react-hot-toast";
import { keyframes } from "goober";

const enterAnimation = (factor: number) => `
0% {transform: translate3d(0,${factor * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`;

const exitAnimation = (factor: number) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${factor * -150}%,-1px) scale(.6); opacity:0;}
`;

const fadeInAnimation = `0%{opacity:0;} 100%{opacity:1;}`;
const fadeOutAnimation = `0%{opacity:1;} 100%{opacity:0;}`;

const prefersReducedMotion = (() => {
  // Cache result
  let shouldReduceMotion: boolean | undefined = undefined;

  return () => {
    if (shouldReduceMotion === undefined && typeof window !== "undefined") {
      const mediaQuery = matchMedia("(prefers-reduced-motion: reduce)");
      shouldReduceMotion = !mediaQuery || mediaQuery.matches;
    }
    return shouldReduceMotion;
  };
})();

const getAnimationStyle = (
  position: ToastPosition,
  visible: boolean
): React.CSSProperties => {
  const top = position.includes("top");
  const factor = top ? 1 : -1;

  const [enter, exit] = prefersReducedMotion()
    ? [fadeInAnimation, fadeOutAnimation]
    : [enterAnimation(factor), exitAnimation(factor)];

  return {
    animation: visible
      ? `${keyframes(enter)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`
      : `${keyframes(exit)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`,
  };
};

export interface NotificationProps {
  visible: boolean;
  message: string | ReactNode;
  height?: number;
  position?: ToastPosition;
  variant: "error" | "info" | "success";
}

export const Notification: FC<NotificationProps> = ({
  visible,
  message,
  height,
  position,
  variant,
}) => {
  const animationStyle: React.CSSProperties = height
    ? getAnimationStyle(position || "top-center", visible)
    : { opacity: 0 };

  return (
    <div
      className={`${visible ? "animate-enter" : "animate-leave"} ${styles.wn} ${
        styles[variant]
      }`}
      style={{
        ...animationStyle,
      }}
    >
      {message}
    </div>
  );
};

export default Notification;
