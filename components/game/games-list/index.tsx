import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { GameType } from "../../../pages/types/game";
import styles from "./GamesList.module.scss";
import { GamesListPropsType } from "./types";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { OptionInputType } from "../../../pages/types/game-settings";

const Button = dynamic(() => import("../../button"));
const ImageBlob = dynamic(() => import("../../image-blob"));
const Icon = dynamic(() => import("../../icon"));
const Fire = dynamic(() => import("../../fire"));

export default function GamesList({
  games,
  state,
  title,
  fetchMoreGames,
  termsIds,
}: GamesListPropsType) {
  return (
    <AnimatePresence>
      <motion.section>
        {!!title && <h2>{title}</h2>}
        <fieldset>
          <h3>{state}</h3>
          <table className="gamesTable">
            <tbody>
              <AnimatePresence>
                {!games.length ? (
                  <motion.tr key={`game-${state}-${0}`} {...DEFAULT_ANIMATION}>
                    <td></td>
                  </motion.tr>
                ) : (
                  games.map((g: GameType, k: number) => {
                    const pot = g.data.options.reduce(
                      (acc: number, opt: OptionInputType) =>
                        acc + opt.totalStake,
                      0
                    );
                    return (
                      <motion.tr
                        key={`game-${state}-${k}`}
                        {...DEFAULT_ANIMATION}
                      >
                        <td>
                          <a
                            title="See game"
                            href={`/game/${slugify(
                              g.cached.definition?.title as string,
                              { lower: true }
                            )}?id=${g.data.gameId}`}
                          >
                            <div className="gameCard">
                              <div className="img">
                                {/* {g.data.fireThreshold &&
                                  g.data.fireThreshold >= pot && <Fire />} */}
                                <Fire />
                                <ImageBlob blob={g.cached.thumb1} />
                              </div>
                              <div
                                className={`terms optBg${
                                  termsIds[g.data.termsId] % 25
                                }`}
                              >
                                {g.data.termsId}
                              </div>
                              <h4>
                                <strong>GAME {g.data.gameId}</strong>
                                {g.cached.definition?.title}
                              </h4>
                            </div>
                          </a>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
          {!!fetchMoreGames && (
            <div className={styles.btns}>
              <Button onClick={fetchMoreGames} className="sm">
                <Icon cType="chevron" /> Load previous games
              </Button>
            </div>
          )}
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
