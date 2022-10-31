import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultDefinition.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultDefinitionPropsType, DefinitionPropsType } from "./types";
import CountUp from "react-countup";
import { get_pot } from "../../utils/game";

const Templates: any = {};

const Markdown = dynamic(() => import("../../markdown"));
const Terms = dynamic(() => import("../terms"));

function DefaultDefinition({
  game,
  prevGame,
  terms,
  setTerms,
  setMainModal,
}: DefaultDefinitionPropsType) {
  return (
    <motion.div {...DEFAULT_ANIMATION}>
      <div>
        <h1 className={styles.title}>{game.cached.definition?.title}</h1>
        <div>
          {game.data.showPot ? (
            <div>
              <CountUp
                start={prevGame.pot}
                end={get_pot(game.data)}
                decimals={2}
                decimal="."
                suffix="◎"
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div>
        <Markdown>{game.cached.definition?.description as string}</Markdown>
        <Terms
          display={game.data.closeTime > new Date()}
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
