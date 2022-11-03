import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultDefinition.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultDefinitionPropsType, DefinitionPropsType } from "./types";
import { game_state } from "../../utils/game";

const Templates: any = {};

const Markdown = dynamic(() => import("../../markdown"));
const Terms = dynamic(() => import("../terms"));

function DefaultDefinition({
  game,
  terms,
  setTerms,
  setMainModal,
}: DefaultDefinitionPropsType) {
  return (
    <motion.div {...DEFAULT_ANIMATION}>
      <div>
        <h1 className={styles.title}>{game.cached.definition?.title}</h1>
      </div>
      <div>
        <Markdown>{game.cached.definition?.description as string}</Markdown>
        <Terms
          display={game_state(game.data) === "Open"}
          terms={terms}
          setTerms={setTerms}
          setMainModal={setMainModal}
        />
      </div>
    </motion.div>
  );
}

export default function Definition({
  template,
  ...props
}: DefinitionPropsType) {
  const Definition =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultDefinition;

  return <Definition {...props} />;
}
