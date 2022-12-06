import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultResults.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultResultsPropsType, ResultsPropsType } from "./types";
import { MyBetType } from "../../utils/bet";
import { game_state, tx_link } from "../../utils/game";
import { short_key } from "@cubist-collective/cubist-games-lib";

const Templates: any = {};
const Icon = dynamic(() => import("../../icon"));

function DefaultResults({ game, myBets }: DefaultResultsPropsType) {
  const gameState = game_state(game.data);
  const totalPrizes = myBets.reduce(
    (acc: number, bet: MyBetType) =>
      (acc +=
        gameState !== "Voided" && game.data.result === bet.optionId ? 1 : 0),
    0
  );
  return (
    <motion.section className={styles.results} {...DEFAULT_ANIMATION}>
      <h2>Results</h2>
      <div>
        <h4>Total won: {totalPrizes}</h4>
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
            {myBets.map((bet: MyBetType, k: number) => (
              <tr key={`result-${k}`}>
                <td>{bet.stake} SOL</td>
                <td className={`optColor${bet.optionId}`}>{bet.title}</td>
                <td>
                  {gameState === "Voided" ? (
                    "VOIDED"
                  ) : game.data.result === bet.optionId ? (
                    <span className="vAligned gap5">
                      <Icon cType="coins" width={12} height={12} /> WON
                    </span>
                  ) : (
                    <span className="vAligned gap5">
                      <Icon cType="forbidden" width={12} height={12} />
                      LOST
                    </span>
                  )}
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
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

export default function Results({ template, ...props }: ResultsPropsType) {
  const Results =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultResults;

  return <Results {...props} />;
}
