import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./DefaultStats.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultStatsPropsType, StatsPropsType } from "./types";
import { OptionInputType } from "../../../types/game-settings";
import { human_number } from "../../utils/number";
import { num_format } from "@cubist-collective/cubist-games-lib";
import { get_pot } from "../../utils/game";
import CountUp from "react-countup";
import { solana_to_usd } from "@cubist-collective/cubist-games-lib";

const Templates: any = {};

const Icon = dynamic(() => import("../../icon"));
const Markdown = dynamic(() => import("../../markdown"));
const Flame = dynamic(() => import("../../flame"));

const formatPot = (pot: number, prevPot: number): [number, number, string] => {
  const divPot = (n: number) => (prevPot ? prevPot / n : prevPot);
  if (pot < 1000) {
    return [pot, prevPot, ""]; // Thousands
  } else if (pot < 1_000_000) {
    return [pot / 1000, divPot(1000), "K"]; // Thousands
  } else if (pot < 1_000_000_000) {
    return [pot / 1_000_000, divPot(1_000_000), "M"]; // Millions
  }
  return [pot / 1_000_000_000, divPot(1_000_000_000), "B"]; // Billions
};

function DefaultStats({
  game,
  prevGame,
  setMainModal,
  solFiatPrice,
}: DefaultStatsPropsType) {
  let totalStake = game.data.options.reduce(
    (acc: number, opt: OptionInputType) => acc + opt.totalStake,
    0
  );
  const totalPot = get_pot(game.data);
  const [pot, prevPot, potUnit] = formatPot(totalPot, prevGame.pot);
  return (
    <motion.div {...DEFAULT_ANIMATION} className={styles.stats}>
      <h2>Stats</h2>
      <div className={styles.statsBox}>
        <div>
          <ul>
            {game.data.options.map((opt: OptionInputType, k: number) => (
              <li key={`stats-${k}`}>
                <div className={`vAligned ${styles.statsDef}`}>
                  <strong>{opt.totalStake} SOL</strong>{" "}
                  {game.cached.definition ? (
                    <span
                      className={`vAligned gap5 optColor${opt.id}`}
                      onClick={() =>
                        game.cached.definition?.options[opt.id].description
                          ? setMainModal(
                              <div className="textCenter">
                                <h4 className={`optColor${opt.id}`}>
                                  {game.cached.definition.options[opt.id].title}
                                </h4>
                                <Markdown>
                                  {
                                    game.cached.definition.options[opt.id]
                                      .description
                                  }
                                </Markdown>
                              </div>
                            )
                          : null
                      }
                    >
                      {game.cached.definition.options[opt.id].title}{" "}
                      {game.cached.definition.options[opt.id].description ? (
                        <Icon
                          cType="info"
                          className="icon3"
                          width={12}
                          height={12}
                        />
                      ) : (
                        ""
                      )}
                    </span>
                  ) : (
                    "Unknown"
                  )}
                </div>
                <div className={styles.statsBar}>
                  <motion.div
                    className={`optBg${opt.id}`}
                    initial={{
                      width: `${
                        prevGame[opt.id]
                          ? (prevGame[opt.id] / prevGame.pot) * 100
                          : 0
                      }%`,
                    }}
                    animate={{
                      width: `${num_format(
                        (opt.totalStake / totalStake) * 100
                      )}%`,
                    }}
                    transition={{ duration: 1.5 }}
                    style={{
                      boxShadow: `0px 0px 12px 0.5px var(--opt${opt.id})`,
                    }}
                  ></motion.div>
                  <strong className={`optColor${opt.id}`}>
                    {opt.totalStake
                      ? human_number((opt.totalStake / totalStake) * 100, 2)
                      : 0}
                    %
                  </strong>
                  {game.data.result === opt.id ? (
                    <span className={styles.award}>
                      <Icon width={30} height={30} cType="award" />
                      <p>Winner</p>
                    </span>
                  ) : (
                    <span></span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {game.data.showPot && (
            <>
              <Flame active={game.data.fireThreshold <= totalPot}>
                <div
                  className={`${styles.pot} ${
                    game.data.fireThreshold <= totalPot ? styles.burning : ""
                  }`}
                >
                  <i>
                    <Icon
                      cType="sol"
                      color={
                        game.data.fireThreshold <= totalPot
                          ? "var(--color1)"
                          : "var(--color0)"
                      }
                    />
                  </i>
                  <div>
                    <label>Pot size</label>
                    <CountUp
                      start={prevPot}
                      end={pot}
                      decimals={2}
                      decimal="."
                      suffix={potUnit}
                    />
                  </div>
                </div>
              </Flame>
              <p>
                {solFiatPrice
                  ? `Pot size: ${solana_to_usd(
                      totalPot,
                      solFiatPrice
                    )}${potUnit} USD`
                  : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Stats({
  template,
  game,
  prevGame,
  setMainModal,
}: StatsPropsType) {
  const Stats =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultStats;

  return <Stats game={game} prevGame={prevGame} setMainModal={setMainModal} />;
}
