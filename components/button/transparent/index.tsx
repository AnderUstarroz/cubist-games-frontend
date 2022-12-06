import { motion } from "framer-motion";
import styles from "./Transparent.module.scss";

export default function Transparent(props: any) {
  const { className, ...btnProps } = props;

  return (
    <motion.button
      className={
        className
          ? styles.hasOwnProperty(className)
            ? `${styles.default} ${styles[className]}`
            : `${styles.default} ${className}`
          : styles.default
      }
      {...btnProps}
    >
      {props.children}
    </motion.button>
  );
}
