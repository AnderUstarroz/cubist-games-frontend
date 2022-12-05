import { blob_to_base64 } from "@cubist-collective/cubist-games-lib";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { DEFAULT_ANIMATION } from "../utils/animation";
import { ImageBlobPropsType } from "./types";

export default function ImageBlob({ blob }: ImageBlobPropsType) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    (async () => {
      setSrc(await blob_to_base64(blob));
    })();
  }, []);

  return (
    <AnimatePresence>
      {!!src && <motion.img src={src} {...DEFAULT_ANIMATION} />}
    </AnimatePresence>
  );
}
