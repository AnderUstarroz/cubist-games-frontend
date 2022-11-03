import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultResults.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultResultsPropsType, ResultsPropsType } from "./types";
import { MyBetType } from "../../utils/bet";
import { human_number } from "../../utils/number";
import { game_state, tx_link } from "../../utils/game";
import {
  lamports_to_sol,
  short_key,
} from "@cubist-collective/cubist-games-lib";

const Templates: any = {};

function DefaultResults({
  game,
  publickey,
  myBets,
  playerBets,
}: DefaultResultsPropsType) {
  const gameState = game_state(game.data);
  return (
    <motion.div {...DEFAULT_ANIMATION}>
      <table>
        <thead>
          <tr>
            <th>Bet</th>
            <th>Option</th>
            <th>Outcome</th>
            <th>Balance</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {myBets.map((bet: MyBetType, betId: number) => (
            <tr key={`result-${betId}`}>
              <td>{bet.stake} SOL</td>
              <td>{bet.title}</td>
              <td>
                {gameState === "Voided"
                  ? "VOIDED"
                  : game.data.result === bet.optionId
                  ? "WON"
                  : "LOST"}
              </td>
              <td>
                {bet.payment
                  ? `+${bet.payment} SOL`
                  : game.data.result === bet.optionId
                  ? "Not claimed"
                  : gameState === "Voided"
                  ? "Not refunded"
                  : `-${bet.stake} SOL`}
              </td>
              <td>
                {bet.paySignature ? (
                  <a
                    href={tx_link(bet.paySignature)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {short_key(bet.paySignature)}
                  </a>
                ) : (
                  ""
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

export default function Results({ template, ...props }: ResultsPropsType) {
  const Results =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultResults;

  return <Results {...props} />;
}
