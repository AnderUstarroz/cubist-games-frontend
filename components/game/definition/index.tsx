import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultDefinition.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultDefinitionPropsType, DefinitionPropsType } from "./types";
import { game_state } from "../../utils/game";
import ImageBlob from "../../image-blob";
import {
  lamports_to_sol,
  num_format,
} from "@cubist-collective/cubist-games-lib";

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
  systemConfig,
  handleShare,
}: DefaultDefinitionPropsType) {
  return (
    <motion.div {...DEFAULT_ANIMATION}>
      <div>
        <h1 className={styles.title}>{game.cached.definition?.title}</h1>
      </div>
      <div className={styles.desc}>
        {!!game.cached.image1 && (
          <div className={styles.descImg}>
            <ImageBlob blob={game.cached.image1} />
          </div>
        )}
        <div className={styles.descText}>
          <Markdown className={`sqList`}>
            {game.cached.definition?.description as string}
          </Markdown>
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
                <span className="infoIco">
                  <Icon cType="info" width={26} height={26} />
                </span>
                <h4 className="textCenter">Fees</h4>
                <p>
                  The games follow the Pari-Mutuel (also known as
                  &quot;Tote&quot;) model. This means odds are not fixed, but
                  change depending on the final bets placed.
                </p>
                <ul className="sqList">
                  <li>
                    <strong>{num_format(game.data.fee, 2)}% Game fee:</strong>{" "}
                    The fee defined by the game host. Will be collected at the
                    end of the game and deducted from the final pot.
                  </li>
                  {systemConfig.betFee.toNumber() && (
                    <li>
                      <strong>
                        {lamports_to_sol(systemConfig.betFee.toNumber())} SOL
                        Per bet:
                      </strong>{" "}
                      A service fee to help maintaining and improving Cubist
                      Games.
                    </li>
                  )}
                </ul>
              </div>
            )
          }
          cType="transparent"
        >
          Fees <Icon cType="info" className="icon1" />
        </Button>
        <Button
          className="vAligned gap5"
          cType="transparent"
          onClick={() => handleShare()}
        >
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
