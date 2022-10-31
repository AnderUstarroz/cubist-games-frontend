import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultStats.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultStatsPropsType, StatsPropsType } from "./types";

const Templates: any = {};

function DefaultStats({ game }: DefaultStatsPropsType) {
  return <motion.div {...DEFAULT_ANIMATION}>Stats</motion.div>;
}

export default function Stats({ template, game }: StatsPropsType) {
  const Stats =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultStats;

  return <Stats game={game} />;
}
