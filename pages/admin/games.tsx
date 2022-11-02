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
import { ConfigInputType } from "../types/game-settings";
import useSWR from "swr";
import { fetcher, fetch_games } from "../../components/utils/requests";
import { fetch_configs } from "../../components/utils/game-settings";
import Router from "next/router";
import { GameType } from "../types/game";
import { game_batch } from "../../components/utils/game";

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
    (async () => {
      setPdas(
        await flashError(fetch_pdas, [
          [system_config_pda, SYSTEM_AUTHORITY],
          [config_pda, authority],
          [stats_pda, authority],
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
        Router.push("/admin");
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
    <div className={styles.container}>
      <Head>
        <title>Manage games</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!is_authorized(publicKey) ? (
        <main className={styles.main}>Not authorized</main>
      ) : (
        <main className={styles.main}>
          <h1 className={styles.title}>Manage games</h1>
          <ul>
            {games.map((g: GameType, k: number) => (
              <li key={`game-${k}`}>
                <a href={`/admin/game?id=${g.data.gameId}`}>
                  Game {g.data.gameId} - {g.cached.definition?.title}
                </a>
              </li>
            ))}
          </ul>
        </main>
      )}
    </div>
  );
};

export default Games;
