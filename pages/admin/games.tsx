import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  flashError,
  flashMsg,
  is_authorized,
} from "../../components/utils/helpers";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  arweave_json,
  config_pda,
  fetch_pdas,
  game_pda,
  initSolanaProgram,
  SolanaProgramType,
  StatsType,
  stats_pda,
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
} from "@cubist-collective/cubist-games-lib";
import { ConfigInputType, PDAType } from "../types/game-settings";
import useSWR from "swr";
import { fetcher } from "../../components/utils/requests";
import { fetch_configs } from "../../components/utils/game-settings";
import Router from "next/router";
import { BN } from "@project-serum/anchor";

const Games: NextPage = () => {
  const { data } = useSWR("/api/idl", fetcher);
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [pdas, setPdas] = useState<PDAType[] | null>(null);
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

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!publicKey || !wallet || solanaProgram || !data || pdas) return;
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

  const load_next_games = async (
    solanaProgram: SolanaProgramType,
    authority: PublicKey,
    gameIds: number[],
    fetchDefinition: boolean = true
  ) => {
    let pdas = await fetch_pdas(
      gameIds.map((id: number) => [game_pda, authority, new BN(id)])
    );
    let games: any = await Promise.allSettled(
      pdas.map((pda: PDAType) => solanaProgram.account.game.fetch(pda[0]))
    );
    games = games
      .filter((g: any) => g.status === "fulfilled")
      .map((g: any) => g.value);
    if (games && fetchDefinition) {
      let definitions = await Promise.allSettled(
        games.map((game: any) => arweave_json(game.definitionHash))
      );
      definitions.map((r: any, k: number) => {
        if (r.status === "fulfilled") {
          games[k].definition = r.value;
        }
      });
    }
    return games;
  };
  const game_batch = (maxGameId: number, max = 10): number[] => {
    // Returns a list with the Game ids in descendent order
    let batch: number[] = [];
    for (let i = 0; i < max; i++) {
      if (maxGameId - i <= 0) {
        break;
      }
      batch.push(maxGameId - i);
    }
    return batch;
  };
  // STEP 3 - Fetch Game
  useEffect(() => {
    if (!stats || !solanaProgram || !config || !pdas) return;
    (async () => {
      let games = await load_next_games(
        solanaProgram,
        authority,
        game_batch(stats.totalGames.toNumber())
      );
      debugger;
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
          <div className={styles.grid}>
            <a href="admin/games-settings" className={styles.card}>
              <h2>Settings &rarr;</h2>
              <p>Default configuration for games.</p>
            </a>
          </div>
          <div className={styles.grid}>
            <a href="admin/game" className={styles.card}>
              <h2>New Game</h2>
              <p>Create a new game.</p>
            </a>
          </div>
          <div className={styles.grid}>
            <a href="admin/manage-games" className={styles.card}>
              <h2>Manage Games</h2>
              <p>Edit existing games.</p>
            </a>
          </div>
        </main>
      )}
    </div>
  );
};

export default Games;
