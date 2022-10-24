import { motion } from "framer-motion";
import styles from "./ImageInput.module.scss";
import { ImageInputType } from "./types";

export default function ImageInput({
  className,
  name,
  file,
  ...props
}: ImageInputType) {
  return (
    <div className={`${styles.imageInput} aligned`}>
      {file?.base64 ? <motion.img src={file?.base64} /> : ""}
      <label className="aligned">
        <span>{file === null ? "Upload" : "Change"} Image</span>
        <motion.input type={"file"} name={name} accept="*" {...props} />
      </label>
    </div>
  );
}
