import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { flashError, flashMsg } from "../components/utils/helpers";
import {
  config_pda,
  fetch_pdas,
  initSolanaProgram,
  PDATypes,
  SolanaProgramType,
  StatsType,
  stats_pda,
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
  TermsType,
} from "@cubist-collective/cubist-games-lib";
import { ConfigInputType } from "../types/game-settings";
import { PublicKey } from "@solana/web3.js";
import IDL from "@cubist-collective/cubist-games-lib/lib/idl.json";
import { fetch_games } from "../components/utils/requests";
import { useConnection } from "@solana/wallet-adapter-react";
import { GamesByStateType, GameType } from "../types/game";
import { game_batch, game_state } from "../components/utils/game";
import { fetch_configs } from "../components/utils/game-settings";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { motion } from "framer-motion";
import Link from "next/link";

const Icon = dynamic(() => import("../components/icon"));
const GamesList = dynamic(() => import("../components/game/games-list"));

const Home: NextPage = () => {
  const { connection } = useConnection();
  const [pdas, setPdas] = useState<PDATypes | null>(null);
  const [openGames, setOpenGames] = useState<GameType[]>([]);
  const [closedGames, setClosedGames] = useState<GameType[]>([]);
  const [settledGames, setSettledGames] = useState<GameType[]>([]);
  const [nextGameId, setNextGameId] = useState<number>(0);
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

  const fetchMoreGames = async (
    gamesByState: GamesByStateType,
    batchSize: number,
    lastGameId: number
  ): Promise<GamesByStateType> => {
    const gamesIds = game_batch(lastGameId, batchSize);
    let state = null;
    for (const game of await fetch_games(
      solanaProgram as SolanaProgramType,
      authority,
      gamesIds
    )) {
      state = game_state(game.data);
      gamesByState[state === "Voided" ? "Settled" : state].push(game);
    }
    const nextGameId = gamesIds.length ? gamesIds[gamesIds.length - 1] - 1 : 0;
    setNextGameId(nextGameId);
    // If the last game is not settled, keep fetching:
    if (nextGameId && state != "Settled") {
      return fetchMoreGames(gamesByState, batchSize, nextGameId);
    }
    // Set Games
    for (const [state, games] of Object.entries(gamesByState)) {
      switch (state) {
        case "Open":
          setOpenGames(games);
          break;
        case "Closed":
          setClosedGames(games);
          break;
        default:
          setSettledGames(games);
      }
    }
    return gamesByState;
  };
  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!connection || solanaProgram || pdas) return;
    (async () => {
      setPdas(
        await flashError(fetch_pdas, [
          ["systemConfig", system_config_pda, SYSTEM_AUTHORITY],
          ["config", config_pda, authority],
          ["stats", stats_pda, authority],
        ])
      );
      setSolanaProgram(
        await initSolanaProgram(IDL, connection, new PhantomWalletAdapter())
      );
    })();
  }, [connection, solanaProgram, authority, pdas]);

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
        flashMsg(
          <>
            <span className="vAligned gap5">
              Site is not configured, please update
              <Link href="/admin/global-settings">
                <a className="link" title="Update global settings">
                  Global Settings
                </a>
              </Link>
            </span>
          </>
        );
      }
    })();
  }, [solanaProgram, pdas]);

  // STEP 3 - Fetch Games
  useEffect(() => {
    if (!stats || !solanaProgram || !config || !pdas) return;
    (async () => {
      const batchSize = 10;
      const gamesByState: GamesByStateType = {
        Pending: [],
        Open: [],
        Closed: [],
        Settled: [],
      };
      await fetchMoreGames(
        gamesByState,
        batchSize,
        (stats as StatsType).totalGames.toNumber()
      );
    })();
  }, [stats]);

  const termsIds = config
    ? config.terms.reduce((acc: any, t: TermsType, k: number) => {
        acc[t.id] = k;
        return acc;
      }, {})
    : {};

  return (
    <>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_SITE_NAME} | Games`}</title>
        <meta
          name="description"
          content={`${process.env.NEXT_PUBLIC_SITE_NAME}, list of games`}
        />
        {!!process.env.NEXT_PUBLIC_FAVICON && (
          <link rel="icon" href={process.env.NEXT_PUBLIC_FAVICON} />
        )}
      </Head>

      <div className={styles.content}>
        <h1
          className={styles.title}
          style={{
            backgroundImage: process.env.NEXT_PUBLIC_HOME_IMAGE_URL
              ? `url(${process.env.NEXT_PUBLIC_HOME_IMAGE_URL})`
              : "var(--homeImg)",
          }}
        >
          {process.env.NEXT_PUBLIC_LOGO ? (
            <motion.img
              src={process.env.NEXT_PUBLIC_LOGO}
              alt="Discord"
              title="Homepage"
            />
          ) : (
            <i>
              <Icon cType="sol" width={35} height={35} color="#4076bb" />
            </i>
          )}
          <span>{process.env.NEXT_PUBLIC_SITE_NAME}</span>
        </h1>
        <GamesList
          games={openGames}
          state="Open"
          title="Games"
          termsIds={termsIds}
        />
        <div className={styles.flexCols}>
          <GamesList games={closedGames} state="Closed" termsIds={termsIds} />
          <GamesList
            games={settledGames}
            state="Settled"
            termsIds={termsIds}
            fetchMoreGames={
              !!nextGameId
                ? () =>
                    fetchMoreGames(
                      {
                        Open: openGames,
                        Closed: closedGames,
                        Settled: settledGames,
                      },
                      10,
                      nextGameId
                    )
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
};

export default Home;
