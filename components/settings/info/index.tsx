import { InfoPropsType } from "./types";
import { game_state } from "../../utils/game";
import slugify from "slugify";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { format_time } from "../../utils/date";
import styles from "./Info.module.scss";
import { OptionInputType } from "../../../types/game-settings";

export default function Info({
  gameSettings,
  definition,
  config,
}: InfoPropsType) {
  const gamePath = `/game/${slugify(definition.title.toLowerCase())}?id=${
    gameSettings.gameId
  }`;
  const gameLink = `http${config.https ? "s" : ""}://${
    config.domain
  }${gamePath}`;
  const gameState = game_state(gameSettings);
  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>Info</h2>
        <fieldset className={styles.infoColumns}>
          <div>
            <div className={styles.title}>
              <label>STATE: </label>
              <span>{gameState}</span>
            </div>
            <div>
              <label>Game link: </label>
              <span>
                <a href={gamePath} target="_blank" rel="noreferrer">
                  {gameLink.length > 20
                    ? `${gameLink.substring(0, 20)}...`
                    : gameLink}
                </a>
              </span>
            </div>
            <div>
              <label>Outcome: </label>
              <span>
                {gameSettings.result === null ||
                definition.options.length < gameSettings.result + 1 ? (
                  gameState === "Voided" ? (
                    "Voided"
                  ) : (
                    ""
                  )
                ) : (
                  <span className={`optColor${gameSettings.result}`}>
                    {definition.options[gameSettings.result].title}
                  </span>
                )}
              </span>
            </div>
            {gameSettings.useToken ? (
              <div>
                <label>Token profits:</label>
                <span>
                  {gameSettings.tokenProfits != null &&
                    gameSettings.tokenProfits}
                </span>
              </div>
            ) : (
              <div>
                <label>SOL profits:</label>
                <span>
                  {gameSettings.solProfits === null
                    ? "-"
                    : `${gameSettings.solProfits} SOL`}
                </span>
              </div>
            )}
            <div>
              <label>
                {gameState === "Voided" ? "Refunded" : "Claimed"} bets:
              </label>
              <span>
                {gameSettings.settledAt
                  ? `${gameSettings.totalBetsClaimed} /
                    ${gameSettings.options.reduce(
                      (acc: number, opt: OptionInputType) =>
                        acc +
                        (gameState === "Voided" ||
                        opt.id === gameSettings.result
                          ? opt.totalBets
                          : 0),
                      0
                    )}`
                  : "-"}
              </span>
            </div>
          </div>
          <div>
            <div className={styles.title}>
              <label>GAME ID: </label>
              <span>{gameSettings.gameId}</span>
            </div>
            <div>
              <label>Created at: </label>
              <span>{format_time(gameSettings.createdAt as Date)}</span>
            </div>
            <div>
              <label>Updated at: </label>
              <span>
                {gameSettings.updatedAt
                  ? format_time(gameSettings.updatedAt as Date)
                  : "-"}
              </span>
            </div>
            <div>
              <label>Settled at: </label>
              <span>
                {gameSettings.settledAt
                  ? format_time(gameSettings.settledAt as Date)
                  : "-"}
              </span>
            </div>
            <div>
              <label>Cashed at: </label>
              <span>
                {gameSettings.cashedAt
                  ? format_time(gameSettings.cashedAt as Date)
                  : "-"}
              </span>
            </div>
          </div>
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
