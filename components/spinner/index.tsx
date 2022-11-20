import { motion } from "framer-motion"
import styles from "./Spinner.module.scss"
import { DefaultSpinnerType } from "./types"

const Spinners: any = {}

function defaultSpinner(props: DefaultSpinnerType) {
  return (
    <motion.div
      className={props.mini ? styles.MiniSpinner : styles.DefaultSpinner}
    >
      <div style={{ borderColor: props.color ? props.color : "white" }}></div>
      <div style={{ borderColor: props.color ? props.color : "white" }}></div>
    </motion.div>
  )
}

export default function Spinner(props: any) {
  const { cType, ...childProps } = props
  const Spinner = Spinners.hasOwnProperty(cType)
    ? Spinners[cType]
    : defaultSpinner

  return <Spinner {...childProps} />
}
