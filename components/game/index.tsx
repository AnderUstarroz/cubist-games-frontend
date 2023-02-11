import { AnimatePresence, motion } from "framer-motion";
import styles from "./DefaultGame.module.scss";
import dynamic from "next/dynamic";
import { GamePropsType, DefaultGamePropsType } from "./types";
import { format_time } from "../utils/date";
import { game_state } from "../utils/game";

const Templates: any = {};

const Definition = dynamic(() => import("./definition"));
const StakeButtons = dynamic(() => import("./stake-buttons"));
const Stats = dynamic(() => import("./stats"));
const Results = dynamic(() => import("./results"));
const CTA = dynamic(() => import("./cta"));

function DefaultGame({ template, ...props }: DefaultGamePropsType) {
  const gameState = game_state(props.game.data);
  return (
    <>
      <motion.ul className={styles.states}>
        <li className={gameState === "Open" ? "active" : ""}>
          <h5>Open</h5>
          <time>{format_time(props.game.data.openTime)}</time>
        </li>
        <li className={gameState === "Closed" ? "active" : ""}>
          <h5>Closed</h5>
          <time>{format_time(props.game.data.closeTime)}</time>
        </li>
        <li
          className={["Settled", "Voided"].includes(gameState) ? "active" : ""}
        >
          <h5>{gameState === "Voided" ? gameState : "Settled"}</h5>
          <time>{format_time(props.game.data.settleTime)}</time>
        </li>
      </motion.ul>
      <Definition
        template={template}
        game={props.game}
        terms={props.terms}
        setTerms={props.setTerms}
        setMainModal={props.setMainModal}
        systemConfig={props.systemConfig}
        handleShare={props.handleShare}
      />
      <Stats
        template={template}
        game={props.game}
        prevGame={props.prevGame}
        setMainModal={props.setMainModal}
        solFiatPrice={props.solFiatPrice}
      />
      {gameState === "Open" && (
        <StakeButtons
          template={template}
          solanaProgram={props.solanaProgram}
          systemConfig={props.systemConfig}
          game={props.game}
          pdas={props.pdas}
          modals={props.modals}
          setModals={props.setModals}
          customStake={props.customStake}
          setCustomStake={props.setCustomStake}
          setWalletVisible={props.setWalletVisible}
          sendTransaction={props.sendTransaction}
          termsAgreed={props.terms.agreed}
          publickey={props.publickey}
          playerBets={props.playerBets}
        />
      )}
      <AnimatePresence>
        {!!props.game.data.settledAt && !!props.myBets.length && (
          <Results
            template={template}
            game={props.game}
            myBets={props.myBets}
          />
        )}
      </AnimatePresence>
      <CTA
        publickey={props.publickey}
        template={template}
        game={props.game}
        myBets={props.myBets}
        playerBets={props.playerBets}
        handleClaim={props.handleClaim}
        modals={props.modals}
        setModals={props.setModals}
        termsAgreed={props.terms.agreed}
      />
    </>
  );
}

export default function Game({ template, ...props }: GamePropsType) {
  const Game =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultGame;

  return <Game template={template} {...props} />;
}
