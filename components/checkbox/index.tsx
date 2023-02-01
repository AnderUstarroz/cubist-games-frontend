import { motion, useMotionValue, useTransform } from "framer-motion";
import styles from "./Checkbox.module.scss";
import { CheckboxType } from "./types";

const tickVariants = {
  pressed: (isChecked: boolean) => ({ pathLength: isChecked ? 0.85 : 0.2 }),
  checked: { pathLength: 1 },
  unchecked: { pathLength: 0 },
};

const boxVariants = {
  hover: { scale: 1.05, strokeWidth: 4 },
  pressed: { scale: 0.95, strokeWidth: 4 },
  checked: { stroke: "var(--color16)" },
  unchecked: { stroke: "var(--color16)", strokeWidth: 4 },
};

export default function Checkbox(props: CheckboxType) {
  const pathLength = useMotionValue(0);
  const opacity = useTransform(pathLength, [0.05, 0.15], [0, 1]);

  return (
    <motion.svg
      id={props.id}
      initial={props.value}
      animate={props.value ? "checked" : "unchecked"}
      whileHover="hover"
      whileTap="pressed"
      width={props.width ? props.width : 30}
      height={props.height ? props.height : 30}
      viewBox="0 0 440 440"
      onClick={props.onClick}
      onChange={props.onChange}
      className={props.className ? props.className : styles.default}
    >
      <motion.path
        d="M 72 136 C 72 100.654 100.654 72 136 72 L 304 72 C 339.346 72 368 100.654 368 136 L 368 304 C 368 339.346 339.346 368 304 368 L 136 368 C 100.654 368 72 339.346 72 304 Z"
        fill="var(--checkbox)"
        strokeWidth={3}
        stroke="#FF008C"
        variants={boxVariants}
      />
      <motion.path
        d="M 90 110 L 128 240 L 341.808 0"
        transform="translate(54.917 68.947) rotate(-4 170.904 18.687)"
        fill="transparent"
        strokeWidth={30}
        stroke="var(--color0)"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={tickVariants}
        style={{ pathLength, opacity }}
        custom={props.value}
      />
    </motion.svg>
  );
}
