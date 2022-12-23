import React, { FC, ReactNode } from "react";
import styles from "./Notification.module.scss";

export interface NotificationProps {
  visible: boolean;
  message: string | ReactNode;
  variant: "error" | "info" | "success";
}

export const Notification: FC<NotificationProps> = ({
  visible,
  message,
  variant,
}) => {
  return (
    <div
      className={`${visible ? "animate-enter" : "animate-leave"} ${styles.wn} ${
        styles[variant]
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;
