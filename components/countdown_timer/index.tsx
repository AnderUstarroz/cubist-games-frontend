import React, { useEffect, useState } from "react";
import styles from "./CountdownTimer.module.scss";
import { CountdownTimerPropsType } from "./types";
const FlipCountdown = require("@rumess/react-flip-countdown");
import { addDays, addMinutes, format } from "date-fns";

export default function CountdownTimer({
  openTime,
  closeTime,
  closeTimeString,
  size,
}: CountdownTimerPropsType) {
  const [date, setDate] = useState<Date>(new Date());
  const dateRefresh = () => {
    setDate(new Date());
  };

  useEffect(() => {
    const interval = setInterval(dateRefresh, 1000);
    return () => clearInterval(interval);
  }, [date]);

  const showCountDown =
    new Date() >= openTime &&
    new Date() < closeTime &&
    addDays(new Date(), 1) > closeTime;

  return (
    <div
      className={`${styles.timer}  ${
        showCountDown && addMinutes(new Date(), 5) >= closeTime
          ? "timerBlink"
          : ""
      }`}
    >
      {showCountDown && (
        <FlipCountdown
          theme={
            !process.env.NEXT_PUBLIC_THEME ||
            process.env.NEXT_PUBLIC_THEME === "default"
              ? "light"
              : "dark"
          } // check https://github.com/rumess/react-flip-countdown/blob/master/src/styles.scss
          titlePosition="top" // Options (Default: top): top, bottom.
          hideYear
          hideMonth
          hideDay
          size={size} // Options (Default: medium): large, medium, small, extra-small.
          endAt={
            closeTime
              ? format(new Date(closeTime), "yyyy-MM-dd HH:mm:ss")
              : closeTimeString &&
                format(new Date(closeTimeString), "yyyy-MM-dd HH:mm:ss")
          }
        />
      )}
    </div>
  );
}
