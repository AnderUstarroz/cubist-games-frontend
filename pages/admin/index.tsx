import type { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/Admin.module.scss";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  flashError,
  flashMsg,
  is_authorized,
  update_available,
} from "../../components/utils/helpers";
import { useEffect, useState } from "react";
import Router from "next/router";
import { PublicKey } from "@solana/web3.js";
import {
  config_pda,
  fetch_pdas,
  initSolanaProgram,
  lamports_to_sol,
  PDATypes,
  short_key,
  SolanaProgramType,
  solana_fiat_price,
  solana_to_usd,
  StatsType,
  stats_pda,
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
} from "@cubist-collective/cubist-games-lib";
import dynamic from "next/dynamic";
import { ConfigInputType, GameStatsDataType } from "../../types/game-settings";
import { fetch_configs } from "../../components/utils/game-settings";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "../../components/spinner";
import { DEFAULT_ANIMATION } from "../../components/utils/animation";
import { human_number } from "../../components/utils/number";
import IDL from "@cubist-collective/cubist-games-lib/lib/idl.json";
import { async_cached, fetch_games } from "../../components/utils/requests";
import { game_batch } from "../../components/utils/game";
import { addDays, format, subDays } from "date-fns";
import { GameType } from "../../types/game";

const AdminWelcome = dynamic(() => import("../../components/admin-welcome"));
const Button = dynamic(() => import("../../components/button"));
const Icon = dynamic(() => import("../../components/icon"));
const ReactTooltip = dynamic(() => import("react-tooltip"), { ssr: false });
const LineAriaChart = dynamic(() => import("../../components/chart/line-aria"));

// Fetches game stats (profits & created games)
const fetchGamesStatsData = async (
  solanaProgram: SolanaProgramType,
  authority: PublicKey,
  lastGameId: number,
  statsData: GameStatsDataType | null = null
): Promise<GameStatsDataType> => {
  // Define default game stats (last 7 days)
  if (!statsData) {
    statsData = [...Array(7).keys()].reduce(
      (obj, days: number) => ({
        ...obj,
        [format(subDays(new Date(), 6 - days), "d MMM")]: {
          profits: 0,
          games: 0,
        },
      }),
      {}
    ) as GameStatsDataType;
  }
  if (lastGameId <= 0) {
    return statsData;
  }
  const games = await fetch_games(
    solanaProgram,
    authority,
    game_batch(lastGameId)
  );
  let finished = true;
  games.map((g: GameType) => {
    const createdAt = format(g.data.createdAt as Date, "d MMM");
    const cashedAt = g.data.cashedAt ? format(g.data.cashedAt, "d MMM") : null;
    if (
      cashedAt && //@ts-ignore
      statsData.hasOwnProperty(cashedAt)
    ) {
      //@ts-ignore
      statsData[cashedAt].profits += g.data.solProfits ? g.data.solProfits : 0;
      finished = false;
    } //@ts-ignore
    if (statsData.hasOwnProperty(createdAt)) {
      //@ts-ignore
      statsData[createdAt].games++;
      finished = false;
    }
  });
  return finished
    ? statsData
    : await fetchGamesStatsData(
        solanaProgram,
        authority,
        games.length ? games[games.length - 1].data.gameId - 1 : 0,
        statsData
      );
};
const AdminHome: NextPage = () => {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [pdas, setPdas] = useState<PDATypes | null>(null);
  const [gameStatsData, setGameStatsData] = useState<GameStatsDataType | null>(
    null
  );
  const [solFiatPrice, setSolFiatPrice] = useState<number | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfigType | null>(
    null
  );
  const [config, setConfig] = useState<ConfigInputType | null>(null);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!publicKey || !wallet || solanaProgram || pdas) return;
    if (!is_authorized(publicKey)) {
      Router.push("/unauthorized");
      return;
    }
    (async () => {
      setSolFiatPrice(await async_cached(solana_fiat_price, [], 21600)); // Cache for 6h
      setPdas(
        await flashError(fetch_pdas, [
          ["systemConfig", system_config_pda, SYSTEM_AUTHORITY],
          ["config", config_pda, authority],
          ["stats", stats_pda, authority],
        ])
      );
      setSolanaProgram(
        await initSolanaProgram(IDL, connection, wallet.adapter)
      );
      async_cached(update_available, [], 21600); // Cached for 6h
    })();
  }, [publicKey, wallet, connection, solanaProgram, authority, pdas]);

  // STEP 2 - Fetch Configs
  useEffect(() => {
    if (!publicKey || !solanaProgram || !pdas || systemConfig) return;
    (async () => {
      if (
        !(await fetch_configs(
          config as ConfigInputType,
          solanaProgram,
          pdas,
          setSystemConfig,
          setConfig,
          setStats,
          9
        ))
      ) {
        flashMsg("You need to define the default game settings first");
        Router.push("/admin/global-settings");
      }
    })();
  }, [publicKey, solanaProgram, pdas, config, systemConfig]);

  // STEP 3 - Fetch Games Stats
  useEffect(() => {
    if (!publicKey || !solanaProgram || !pdas || !stats || gameStatsData)
      return;

    (async () => {
      let tomorrow = addDays(new Date(), 1);
      tomorrow.setHours(0, 0, 0, 0);
      setGameStatsData(
        await async_cached(
          fetchGamesStatsData,
          [solanaProgram, authority, stats.totalGames.toNumber()],
          Math.ceil((tomorrow.getTime() - new Date().getTime()) / 1000),
          `GAMES_STATS_DATA_${short_key(publicKey)}`
        )
      );
    })();
  }, [
    publicKey,
    solanaProgram,
    pdas,
    systemConfig,
    gameStatsData,
    stats,
    authority,
  ]);

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href={process.env.NEXT_PUBLIC_FAVICON} />
      </Head>
      {!publicKey ? (
        <AdminWelcome />
      ) : (
        <div className={`vhAligned  ${styles.content}`}>
          <section>
            <div>
              <h1 className={styles.title}>DASHBOARD</h1>
              <ul>
                <li>
                  <p>Default configuration for new games</p>
                  <Button className="btnRadius2 button3">
                    <a href="admin/global-settings">Global settings</a>
                  </Button>
                </li>
                <li>
                  <p>Edit existing games</p>{" "}
                  <Button className="btnRadius2 button3">
                    <a href="admin/games">Manage Games</a>
                  </Button>
                </li>
                <li>
                  <p>Create a new game</p>
                  <Button className="btnRadius2 button3">
                    <a href="admin/game">New Game</a>
                  </Button>
                </li>
              </ul>
            </div>
          </section>
          <section>
            <div>
              <h2>Global stats</h2>
              {!stats ? (
                <Spinner />
              ) : (
                <AnimatePresence>
                  <motion.div className={styles.stats} {...DEFAULT_ANIMATION}>
                    <div>
                      <h3>
                        Total profits:{" "}
                        <span
                          data-for="profitsTooltip"
                          data-tip={
                            !!solFiatPrice &&
                            `${solana_to_usd(
                              lamports_to_sol(stats.totalSolProfits.toNumber()),
                              solFiatPrice as number
                            )} USD`
                          }
                        >
                          {human_number(
                            lamports_to_sol(stats.totalSolProfits.toNumber()),
                            2
                          )}{" "}
                          SOL
                          <Icon cType="info" className="icon1" />
                        </span>
                      </h3>
                      <p>Profits</p>
                      <AnimatePresence>
                        {!!gameStatsData && (
                          <motion.div {...DEFAULT_ANIMATION}>
                            <LineAriaChart
                              width={250}
                              height={200}
                              legend={"Collected SOL (last 7 days)"}
                              tooltipUnit="SOL"
                              data={Object.entries(gameStatsData).map(
                                ([date, obj]: any) => {
                                  return { name: date, Profits: obj.profits };
                                }
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <ReactTooltip
                        id="profitsTooltip"
                        globalEventOff="click"
                      />
                    </div>
                    <div>
                      <h3>
                        Total games: <span>{stats.totalGames.toNumber()}</span>
                      </h3>
                      <p>Games</p>
                      <AnimatePresence>
                        {!!gameStatsData && (
                          <motion.div {...DEFAULT_ANIMATION}>
                            <LineAriaChart
                              width={250}
                              height={200}
                              legend={"Created games (last 7 days)"}
                              colors={{ Games: "var(--errorBg)" }}
                              data={Object.entries(gameStatsData).map(
                                ([date, obj]: any) => {
                                  return { name: date, Games: obj.games };
                                }
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default AdminHome;
