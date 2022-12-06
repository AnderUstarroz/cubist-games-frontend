import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultDefinition.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultDefinitionPropsType, DefinitionPropsType } from "./types";
import { game_state } from "../../utils/game";
import ImageBlob from "../../image-blob";

const Templates: any = {};

const Markdown = dynamic(() => import("../../markdown"));
const Terms = dynamic(() => import("../terms"));
const Icon = dynamic(() => import("../../icon"));
const Button = dynamic(() => import("../../button"));

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
      <div className={styles.desc}>
        {!!game.cached.image1 && (
          <div>
            <ImageBlob blob={game.cached.image1} />
          </div>
        )}
        <div>
          <Markdown>{game.cached.definition?.description as string}</Markdown>
        </div>
      </div>
      <div className={styles.info}>
        <Terms
          display={game_state(game.data) === "Open"}
          terms={terms}
          setTerms={setTerms}
          setMainModal={setMainModal}
        />
        <Button
          className="vAligned gap5"
          onClick={() =>
            setMainModal(
              <div>
                <h4>Fees</h4>
                <p>Fees introduction</p>
              </div>
            )
          }
          cType="transparent"
        >
          Fees <Icon cType="info" className="icon1" />
        </Button>
        <Button className="vAligned gap5" cType="transparent">
          Share <Icon cType="share" className="icon1" />{" "}
        </Button>
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
