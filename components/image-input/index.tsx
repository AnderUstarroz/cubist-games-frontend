import { motion } from "framer-motion";
import styles from "./ImageInput.module.scss";
import { ImageInputType } from "./types";
import dynamic from "next/dynamic";

const Icon = dynamic(() => import("../../components/icon"));

export default function ImageInput({
  className,
  name,
  file,
  ...props
}: ImageInputType) {
  return (
    <label className={`${styles.imageInput} icon1`}>
      {file?.base64 ? (
        <div title="Change image">
          <motion.img src={file?.base64} />
          <Icon cType="edit" className="icon1" />
        </div>
      ) : (
        <span>Upload Image</span>
      )}
      <motion.input type={"file"} name={name} accept="*" {...props} />
    </label>
  );
}
