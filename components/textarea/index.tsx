import { motion } from "framer-motion";
import styles from "./Textarea.module.scss";
import { TextareaType, TextareaTypes } from "./types";

const Textareas: TextareaTypes = {};

function defaultTextarea({ className, ...props }: TextareaType) {
  return (
    <motion.textarea
      className={className ? `${styles.default} ${className}` : styles.default}
      {...props}
    />
  );
}

export default function Textarea(props: any) {
  const { cType, ...childProps } = props;
  const Textarea = Textareas.hasOwnProperty(cType)
    ? Textareas[cType]
    : defaultTextarea;

  return <Textarea {...childProps} />;
}
