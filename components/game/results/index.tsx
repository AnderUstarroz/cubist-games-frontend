import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultResults.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultResultsPropsType, ResultsPropsType } from "./types";

const Templates: any = {};

function DefaultResults({ game }: DefaultResultsPropsType) {
  return <motion.div {...DEFAULT_ANIMATION}>HERE THE RESULTS</motion.div>;
}

export default function Results({ template, game }: ResultsPropsType) {
  const Results =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultResults;

  return <Results game={game} />;
}
