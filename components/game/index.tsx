import { motion } from "framer-motion";
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
  return (
    <>
      <motion.ul className="aligned">
        <li>
          Open<div>{format_time(props.game.data.openTime)}</div>
        </li>
        <li>
          Closed<div>{format_time(props.game.data.closeTime)}</div>
        </li>
        <li>
          Settled<div>{format_time(props.game.data.settleTime)}</div>
        </li>
      </motion.ul>
      <Definition
        template={template}
        game={props.game}
        terms={props.terms}
        setTerms={props.setTerms}
        setMainModal={props.setMainModal}
      />
      <Stats template={template} game={props.game} />
      {game_state(props.game.data) === "Open" && (
        <StakeButtons
          template={template}
          solanaProgram={props.solanaProgram}
          connection={props.connection}
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
      {!!props.game.data.settledAt && !!props.myBets.length && (
        <Results
          template={template}
          game={props.game}
          publickey={props.publickey}
          myBets={props.myBets}
          playerBets={props.playerBets}
        />
      )}
      <CTA
        template={template}
        game={props.game}
        prevGame={props.prevGame}
        myBets={props.myBets}
        playerBets={props.playerBets}
        handleClaim={props.handleClaim}
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
