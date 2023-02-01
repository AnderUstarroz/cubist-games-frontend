import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { GameType } from "../../../types/game";
import styles from "./GamesList.module.scss";
import { GamesListPropsType } from "./types";
import dynamic from "next/dynamic";
import slugify from "slugify";
import { OptionInputType } from "../../../types/game-settings";
import { useRouter } from "next/router";

const Button = dynamic(() => import("../../button"));
const ImageBlob = dynamic(() => import("../../image-blob"));
const Icon = dynamic(() => import("../../icon"));
const Fire = dynamic(() => import("../../fire"));
const CountdownTimer = dynamic(() => import("../../countdown_timer"));

export default function GamesList({
  games,
  state,
  title,
  fetchMoreGames,
  termsIds,
  setLoading,
}: GamesListPropsType) {
  const router = useRouter();

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
                  <motion.tr
                    className="empty"
                    key={`game-${state}-${0}`}
                    {...DEFAULT_ANIMATION}
                  >
                    <td title="No games" style={{ height: 80 }}></td>
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
                          <div
                            className="vAligned separated gap5"
                            title="See game"
                            onClick={() => {
                              setLoading(true);
                              router.push(
                                `/game/${slugify(
                                  g.cached.definition?.title as string,
                                  { lower: true, strict: true }
                                )}?id=${g.data.gameId}`
                              );
                            }}
                          >
                            <div className="gameCard">
                              <div
                                className={`img${g.cached.thumb1 ? "" : " bg"}`}
                              >
                                <ImageBlob blob={g.cached.thumb1} />
                                {!!g.data.fireThreshold &&
                                  g.data.fireThreshold <= pot && (
                                    <Fire partSize={40} />
                                  )}
                              </div>
                              <div className="terms">
                                <strong>GAME {g.data.gameId}</strong>
                                <span
                                  className={`optBg${
                                    termsIds[g.data.termsId] % 25
                                  }`}
                                >
                                  {g.data.termsId}
                                </span>
                              </div>
                              <p>{g.cached.definition?.title}</p>
                            </div>
                            {state === "Open" && (
                              <CountdownTimer
                                openTime={g.data.openTime}
                                closeTime={g.data.closeTime}
                                size="extra-small"
                              />
                            )}
                          </div>
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
              <Button onClick={fetchMoreGames} className="button3 sm">
                <Icon cType="chevron" />
                Previous games
              </Button>
            </div>
          )}
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
