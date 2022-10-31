import { motion } from "framer-motion";
import styles from "./DefaultGame.module.scss";
import dynamic from "next/dynamic";
import { GamePropsType, DefaultGamePropsType } from "./types";
import { format_time } from "../utils/date";

const Templates: any = {};

const Definition = dynamic(() => import("./definition"));
const StakeButtons = dynamic(() => import("./stake-buttons"));
const Stats = dynamic(() => import("./stats"));
const Results = dynamic(() => import("./results"));

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
        prevGame={props.prevGame}
        terms={props.terms}
        setTerms={props.setTerms}
        setMainModal={props.setMainModal}
      />
      <Stats template={template} game={props.game} />
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
        termsAgreed={props.terms.agreed}
        publickey={props.publickey}
      />
      <Results template={template} game={props.game} />
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
