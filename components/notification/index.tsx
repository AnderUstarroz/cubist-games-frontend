import React, { FC } from "react";
import styles from "./Notification.module.scss";

export interface NotificationProps {
  message: string;
  variant: "error" | "info" | "success";
}

export const Notification: FC<NotificationProps> = ({ message, variant }) => {
  return <div className={styles.wn + " " + styles[variant]}>{message}</div>;
};

export default Notification;
