import { InfoPropsType } from "./types";
import { formatRelative } from "date-fns";
import { game_state } from "../../utils/game";
import slugify from "slugify";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";

export default function Info({
  gameSettings,
  definition,
  config,
}: InfoPropsType) {
  const gameLink = `http${config.https ? "s" : ""}://${
    config.domain
  }/game/${slugify(definition.title.toLowerCase())}?id=${gameSettings.gameId}`;
  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>Info</h2>
        <fieldset>
          <div>
            <label>State: </label>
            <span>{game_state(gameSettings)}</span>
          </div>
          <div>
            <label>Game link: </label>
            <span>
              <a href={gameLink} target="_blank" rel="noreferrer">
                {gameLink}
              </a>
            </span>
          </div>
          <div>
            <label>Created at: </label>
            <span>
              {formatRelative(gameSettings.createdAt as Date, new Date())}
            </span>
          </div>
          <div>
            <label>Updated at: </label>
            <span>
              {gameSettings.updatedAt
                ? formatRelative(gameSettings.updatedAt, new Date())
                : ""}
            </span>
          </div>
          <div>
            <label>Settled at: </label>
            <span>
              {gameSettings.settledAt
                ? formatRelative(gameSettings.settledAt, new Date())
                : ""}
            </span>
          </div>
          <div>
            <label>Cashed at: </label>
            <span>
              {gameSettings.cashedAt
                ? formatRelative(gameSettings.cashedAt, new Date())
                : ""}
            </span>
          </div>

          {gameSettings.useToken ? (
            <div>
              <label>Token profits</label>
              <span>
                {gameSettings.tokenProfits != null
                  ? gameSettings.tokenProfits
                  : ""}
              </span>
            </div>
          ) : (
            <div>
              <label>SOL profits</label>
              <span>
                {gameSettings.solProfits != null
                  ? `${gameSettings.solProfits} SOL`
                  : ""}
              </span>
            </div>
          )}

          <div>
            <label>Total bets paid</label>
            <span>{gameSettings.totalBetsClaimed}</span>
          </div>
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
