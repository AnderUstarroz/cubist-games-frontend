import { motion } from "framer-motion";
import styles from "./Input.module.scss";
import { InputType, InputTypes } from "./types";
import dynamic from "next/dynamic";

const Buttons: InputTypes = {
  file: dynamic(() => import("./file")),
};

function defaultInput({ className, ...props }: InputType) {
  return (
    <motion.input
      className={className ? `${styles.default} ${className}` : styles.default}
      {...props}
    />
  );
}

export default function Input(props: any) {
  const { cType, ...childProps } = props;
  const Input = Buttons.hasOwnProperty(cType) ? Buttons[cType] : defaultInput;

  return <Input {...childProps} />;
}
