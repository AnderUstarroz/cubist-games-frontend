import type { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/AdminGames.module.scss";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  flashError,
  flashMsg,
  is_authorized,
} from "../../components/utils/helpers";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  config_pda,
  fetch_pdas,
  initSolanaProgram,
  PDATypes,
  SolanaProgramType,
  solana_fiat_price,
  solana_to_usd,
  StatsType,
  stats_pda,
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
  TermsType,
} from "@cubist-collective/cubist-games-lib";
import {
  ConfigInputType,
  GameStateOutputType,
  OptionInputType,
} from "../types/game-settings";
import useSWR from "swr";
import { fetcher, fetch_games } from "../../components/utils/requests";
import { fetch_configs } from "../../components/utils/game-settings";
import Router from "next/router";
import { GameType } from "../types/game";
import { game_batch, game_state } from "../../components/utils/game";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../components/utils/animation";
import { human_number } from "../../components/utils/number";
import Link from "next/link";

const AdminWelcome = dynamic(() => import("../../components/admin-welcome"));
const Button = dynamic(() => import("../../components/button"));
const Icon = dynamic(() => import("../../components/icon"));
const ImageBlob = dynamic(() => import("../../components/image-blob"));
const Spinner = dynamic(() => import("../../components/spinner"));
const ReactTooltip = dynamic(() => import("react-tooltip"), { ssr: false });

const showState = (state: GameStateOutputType) => {
  switch (state) {
    case "Pending":
      return (
        <span className={`vAligned gap5 ${styles.pending}`}>
          <Icon cType="time" width={12} height={12} /> Pending
        </span>
      );
    case "Open":
      return <span className={styles.open}>Open</span>;
    case "Closed":
      return <span className={styles.closed}>Closed</span>;
    case "Settled":
      return (
        <span className="vAligned gap5">
          <Icon cType="coins" width={12} height={12} /> Settled
        </span>
      );
    case "Voided":
      return (
        <span className="vAligned gap5">
          <Icon cType="coins" width={12} height={12} /> Voided
        </span>
      );
  }
};

const MAX_GAMES = 10;

const Games: NextPage = () => {
  const { data } = useSWR("/api/idl", fetcher);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [pdas, setPdas] = useState<PDATypes | null>(null);
  const [solFiatPrice, setSolFiatPrice] = useState<number | null>(null);
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );
  const [systemConfig, setSystemConfig] = useState<SystemConfigType | null>(
    null
  );
  const [config, setConfig] = useState<ConfigInputType | null>(null);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [games, setGames] = useState<GameType[]>([]);

  const fetchGames = async (lastGameId: number) => {
    try {
      setLoading(true);
      setGames(
        await fetch_games(
          solanaProgram as SolanaProgramType,
          authority,
          game_batch(lastGameId)
        )
      );
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const lastGameId = () => {
    return games.length ? games[games.length - 1].data.gameId : 0;
  };

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!is_authorized(publicKey) || !wallet || solanaProgram || !data || pdas)
      return;

    if (!is_authorized(publicKey)) {
      Router.push("/unauthorized");
      return;
    }

    (async () => {
      setSolFiatPrice(await solana_fiat_price());
      setPdas(
        await flashError(fetch_pdas, [
          ["systemConfig", system_config_pda, SYSTEM_AUTHORITY],
          ["config", config_pda, authority],
          ["stats", stats_pda, authority],
        ])
      );
      setSolanaProgram(
        await initSolanaProgram(JSON.parse(data), connection, wallet.adapter)
      );
    })();
  }, [publicKey, wallet, connection, data, solanaProgram, authority, pdas]);

  // STEP 2 - Fetch Configs
  useEffect(() => {
    if (!solanaProgram || !pdas || systemConfig) return;
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
  }, [solanaProgram, pdas]);

  // STEP 3 - Fetch Game
  useEffect(() => {
    if (!stats || !solanaProgram || !config || !pdas) return;
    (async () => {
      fetchGames(stats.totalGames.toNumber());
    })();
  }, [stats]);

  const termsHash = config
    ? config.terms.reduce((acc: any, t: TermsType, k: number) => {
        acc[t.id] = k;
        return acc;
      }, {})
    : {};

  return (
    <>
      <Head>
        <title>Manage games</title>
        <link rel="icon" href={process.env.NEXT_PUBLIC_FAVICON} />
      </Head>

      {!publicKey ? (
        <AdminWelcome />
      ) : (
        <div className={styles.content}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              <h1 className={styles.title}>Manage games</h1>
              <section>
                <fieldset>
                  <p>
                    {!!games.length &&
                      `Showing games from ${Math.max(
                        1,
                        lastGameId() - MAX_GAMES
                      )} to ${lastGameId()}`}
                  </p>
                  <table className="gamesTable">
                    <thead>
                      <tr>
                        <th>Game</th>
                        <th>Pot</th>
                        <th className="hiddenMobile">Prices claimed</th>
                        <th className="textCenter">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {games.map((g: GameType, k: number) => {
                          const pot = g.data.options.reduce(
                            (acc: number, opt: OptionInputType) =>
                              acc + opt.totalStake,
                            0
                          );
                          return (
                            <motion.tr key={`game-${k}`} {...DEFAULT_ANIMATION}>
                              <td>
                                <Link href={`/admin/game?id=${g.data.gameId}`}>
                                  <a title="Edit game">
                                    <div className="gameCard">
                                      <div className="img">
                                        <ImageBlob blob={g.cached.thumb1} />
                                      </div>
                                      <div className="terms">
                                        <strong>GAME {g.data.gameId}</strong>
                                        <span
                                          className={`optBg${
                                            termsHash[g.data.termsId] % 25
                                          }`}
                                        >
                                          {g.data.termsId}
                                        </span>
                                      </div>
                                      <h4>{g.cached.definition?.title}</h4>
                                    </div>
                                  </a>
                                </Link>
                              </td>
                              <td>
                                <span
                                  className="vAligned gap5"
                                  data-tip={
                                    !!solFiatPrice &&
                                    `${solana_to_usd(
                                      pot,
                                      solFiatPrice as number
                                    )} USD`
                                  }
                                  data-for={`potTooltip${k}`}
                                >
                                  {human_number(pot, 2)} SOL
                                  {!!solFiatPrice && (
                                    <Icon cType="info" className="icon1" />
                                  )}
                                </span>
                                <ReactTooltip
                                  id={`potTooltip${k}`}
                                  globalEventOff="click"
                                />
                              </td>
                              <td className="hiddenMobile">
                                {g.data.result
                                  ? `${g.data.totalBetsClaimed}}/${
                                      g.data.options[g.data.result].totalBets
                                    }`
                                  : "-"}
                              </td>
                              <td>{showState(game_state(g.data))}</td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {!!games.length && stats && (
                    <div className={`vAligned ${styles.btns}`}>
                      {lastGameId() - MAX_GAMES > 0 && (
                        <Button
                          className="button1 sm rounded"
                          onClick={() => fetchGames(lastGameId() - MAX_GAMES)}
                        >
                          <Icon cType="chevron" /> Previous
                        </Button>
                      )}
                      {lastGameId() + MAX_GAMES <=
                        stats.totalGames.toNumber() && (
                        <Button
                          className="button1 sm rounded"
                          onClick={() => fetchGames(lastGameId() + MAX_GAMES)}
                        >
                          Next <Icon cType="chevron" direction="right" />
                        </Button>
                      )}
                    </div>
                  )}
                </fieldset>
              </section>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Games;
