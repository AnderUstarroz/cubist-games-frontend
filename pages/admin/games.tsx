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
  StatsType,
  stats_pda,
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
} from "@cubist-collective/cubist-games-lib";
import { ConfigInputType, GameStateOutputType } from "../types/game-settings";
import useSWR from "swr";
import { fetcher, fetch_games } from "../../components/utils/requests";
import { fetch_configs } from "../../components/utils/game-settings";
import Router from "next/router";
import { GameType } from "../types/game";
import { game_batch, game_state } from "../../components/utils/game";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../components/utils/animation";

const AdminWelcome = dynamic(() => import("../../components/admin-welcome"));
const Button = dynamic(() => import("../../components/button"));
const Icon = dynamic(() => import("../../components/icon"));
const ImageBlob = dynamic(() => import("../../components/image-blob"));

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
const Games: NextPage = () => {
  const { data } = useSWR("/api/idl", fetcher);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [pdas, setPdas] = useState<PDATypes | null>(null);
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

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!is_authorized(publicKey) || !wallet || solanaProgram || !data || pdas)
      return;

    if (!is_authorized(publicKey)) {
      Router.push("/unauthorized");
      return;
    }

    (async () => {
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
      setGames(
        await fetch_games(
          solanaProgram,
          authority,
          game_batch(stats.totalGames.toNumber())
        )
      );
    })();
  }, [stats]);

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
          <h1 className={styles.title}>Manage games</h1>
          <section>
            <fieldset>
              <p>Showing games from 1 to 5</p>
              <table className={styles.gamesTable}>
                <thead>
                  <tr>
                    <th>Game</th>
                    <th className="textCenter">State</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {games.map((g: GameType, k: number) => (
                      <motion.tr key={`game-${k}`} {...DEFAULT_ANIMATION}>
                        <td
                          title="Edit game"
                          onClick={() =>
                            Router.push(`/admin/game?id=${g.data.gameId}`)
                          }
                        >
                          <div className={styles.details}>
                            <div className="img">
                              <ImageBlob blob={g.cached.thumb1} />
                            </div>
                            <div className="terms">
                              GAME {g.data.gameId}
                              <span>{g.data.termsId}</span>
                            </div>
                            <span>{g.cached.definition?.title}</span>
                          </div>
                        </td>
                        <td>{showState(game_state(g.data))}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              <div className={`vAligned ${styles.btns}`}>
                <Button className="button1 sm rounded">Previous</Button>{" "}
                <Button className="button1 sm rounded">Next</Button>
              </div>
            </fieldset>
          </section>
        </div>
      )}
    </>
  );
};

export default Games;
