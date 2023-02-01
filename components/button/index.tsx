import { motion } from "framer-motion";
import styles from "./Button.module.scss";
import dynamic from "next/dynamic";
import { ButtonType, ButtonTypes } from "./types";

const Buttons: ButtonTypes = {
  transparent: dynamic(() => import("./transparent")),
  wallet: dynamic(() => import("./wallet")),
};

function defaultButton(props: ButtonType) {
  return (
    <motion.button
      {...props}
      className={
        (props.className ? `${props.className} ` : "") + styles.default
      }
    >
      {props.children}
    </motion.button>
  );
}

export default function Button(props: any) {
  const { cType, ...childProps } = props;
  const Button = Buttons.hasOwnProperty(cType) ? Buttons[cType] : defaultButton;

  return (
    <Button
      {...{ whileTap: props.disabled ? {} : { scale: 0.9 }, ...childProps }}
    >
      {props.children}
    </Button>
  );
}
