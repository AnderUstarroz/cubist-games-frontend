import { motion } from "framer-motion"
import styles from "./Transparent.module.scss"

export default function Transparent(props: any) {
  const { className, ...btnProps } = props

  return (
    <motion.button
      className={
        className
          ? styles.hasOwnProperty(className)
            ? styles[className]
            : className
          : styles.default
      }
      {...btnProps}
    >
      {props.children}
    </motion.button>
  )
}
