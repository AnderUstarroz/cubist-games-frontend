import { FileInputType } from "./types";
import styles from "./FileInput.module.scss";
import { motion } from "framer-motion";

export default function FileInput(props: FileInputType) {
  return (
    <motion.label>
      <span>{props.label ? props.label : "Select file"}</span>
      <input type="file" className={styles.default} {...props} />
    </motion.label>
  );
}
