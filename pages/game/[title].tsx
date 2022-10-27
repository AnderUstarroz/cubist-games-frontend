import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Game.module.scss";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import {
  arweave_json,
  arweave_url,
  config_pda,
  CubistGames,
  fetch_pdas,
  game_pda,
  initSolanaProgram,
  PROGRAM_ID,
  SolanaProgramType,
  solana_usd_price,
  SYSTEM_AUTHORITY,
  system_config_pda,
} from "@cubist-collective/cubist-games-lib";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Fragment, useEffect, useState } from "react";
import fs from "fs";
import { GameType, OptionType } from "../types/game";
import { OptionInputType, PDAType } from "../types/game-settings";
import { flashError } from "../../components/utils/helpers";
import { DEFAULT_DECIMALS } from "../../components/utils/number";
import { fetch_games } from "../../components/utils/requests";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../components/utils/animation";
import { format_time } from "../../components/utils/date";

const Button = dynamic(() => import("../../components/button"));
const Markdown = dynamic(() => import("../../components/markdown"));

const Game: NextPage = ({ data, path }: any) => {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [pdas, setPdas] = useState<PDAType[] | null>(null);
  const [solUsdPrice, setSolUsdPrice] = useState<number | null>(null);
  const [game, setGame] = useState<GameType | null>(null);
  const [maxDecimals, setMaxDecimals] = useState<number>(DEFAULT_DECIMALS);
  const [refreshGame, setRefreshGame] = useState<boolean>(false);
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!wallet || !data || solanaProgram || pdas) return;
    (async () => {
      // Init
      setSolUsdPrice(await solana_usd_price());
      setMaxDecimals(DEFAULT_DECIMALS);
      setPdas(
        await flashError(fetch_pdas, [
          [system_config_pda, SYSTEM_AUTHORITY],
          [config_pda, authority],
          [game_pda, authority, new BN(data.gameId)],
        ])
      );
      setSolanaProgram(
        await initSolanaProgram(data.idl, connection, wallet.adapter)
      );
    })();
  }, [wallet, connection, data, solanaProgram, authority]);

  // STEP 2 - Fetch Game
  useEffect(() => {
    if (!connection || !solanaProgram || !pdas || game) return;
    let websocket: null | number = null;
    (async () => {
      // Populate Settings using existing Game
      setGame((await fetch_games(solanaProgram, authority, [data.gameId]))[0]);
    })();
    // Create Websocket connection to apply Game updates.
    websocket = connection.onAccountChange(
      pdas[2][0],
      (updatedAccountInfo: any, context: any) => {
        setRefreshGame(true);
        console.log("UPDATED ACCOUNT", updatedAccountInfo);
        console.log("ACCOUNT CONTEXT", context);
      },
      "confirmed"
    );
    // Refresh game every 20 seconds (if needed)
    const refreshGameInterval = setInterval(
      () => handleRefreshGame(),
      20 * 1000
    );
    return () => {
      if (websocket) connection.removeAccountChangeListener(websocket);
      clearInterval(refreshGameInterval);
    };
  }, [solanaProgram, pdas]);

  const handleRefreshGame = async () => {
    if (!refreshGame || !solanaProgram) return;
    // Refresh game
    setGame((await fetch_games(solanaProgram, authority, [data.gameId]))[0]);
    setRefreshGame(false);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>{data.title}</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="description" content="Prediction game" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:domain"
          content={`${data.protocol}://${data.domain}`}
        />
        <meta
          property="og:url"
          content={`${data.protocol}://${data.domain}${path}`}
        />
        <meta
          name="twitter:url"
          content={`${data.protocol}://${data.domain}${path}`}
        />
        <meta property="og:title" content={data.definition.title} />
        <meta name="twitter:title" content={data.definition.title} />
        {data.image1 ? (
          <>
            <meta property="og:image" content={data.image1} />
            <meta name="twitter:image" content={data.image1} />
          </>
        ) : (
          ""
        )}
        <meta name="twitter:description" content="Time to play!" />
        <meta property="og:description" content="Time to play!" />
        {data.definition.options.map((opt: OptionType, k: number) => (
          <Fragment key={`meta${k + 1}`}>
            <meta name={`twitter:label${k + 1}`} content={opt.title} />
            {opt.description ? (
              <meta name={`twitter:data${k + 1}`} content={opt.description} />
            ) : (
              ""
            )}
          </Fragment>
        ))}
      </Head>
      <main className={styles.main}>
        <AnimatePresence>
          {game ? (
            <>
              <motion.ul className="aligned">
                <li>
                  Open<div>{format_time(game.data.openTime)}</div>
                </li>
                <li>
                  Closed<div>{format_time(game.data.closeTime)}</div>
                </li>
                <li>
                  Settled<div>{format_time(game.data.settleTime)}</div>
                </li>
              </motion.ul>
              <motion.div {...DEFAULT_ANIMATION}>
                <h1 className={styles.title}>
                  {game.cached.definition?.title}
                </h1>
                <div>
                  <Markdown>
                    {game.cached.definition?.description as string}
                  </Markdown>
                </div>
              </motion.div>
              <motion.div>STATS</motion.div>
              <motion.div className={styles.options}>
                {game.cached.definition?.options.map(
                  (o: OptionType, k: number) => (
                    <div key={`betOpt${k}`} className="aligned">
                      <div>
                        <h4>{o.title}</h4>
                        {o.description ? <p>{o.description}</p> : ""}
                      </div>
                      <ul className="aligned">
                        {game.data.stakeButtons.map(
                          (stakeAmount: number, k: number) => (
                            <li key={`stakeBtn${k}`}>
                              <Button style={{ backgroundColor: o.color }}>
                                {stakeAmount}
                              </Button>
                            </li>
                          )
                        )}
                        {game.data.customStakeButton ? (
                          <li>
                            <Button style={{ backgroundColor: o.color }}>
                              Custom stake!
                            </Button>
                          </li>
                        ) : (
                          ""
                        )}
                      </ul>
                    </div>
                  )
                )}
              </motion.div>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const path = context.resolvedUrl;
  const idl = JSON.parse(
    fs
      .readFileSync(
        "node_modules/@cubist-collective/cubist-games-lib/lib/idl.json"
      )
      .toString()
  );
  const authority = new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string);
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_HOST as string
  );
  const provider = new AnchorProvider(
    connection,
    AnchorProvider.env().wallet,
    AnchorProvider.defaultOptions()
  );
  setProvider(provider);
  const program = new Program<CubistGames>(idl, PROGRAM_ID, provider);
  try {
    const [configPda, gamePda] = await fetch_pdas([
      [config_pda, authority],
      [game_pda, authority, new BN(context.query.id)],
    ]);
    const [config, game] = (
      await Promise.allSettled([
        program.account.config.fetch(configPda[0]),
        program.account.game.fetch(gamePda[0]),
      ])
    )
      .filter((i: any) => i.status === "fulfilled")
      .map((i: any) => i.value);
    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=10800"
    );
    const data = {
      idl: idl,
      gameId: game.gameId.toNumber(),
      definition: await arweave_json(game.definitionHash),
      image1: game.image1Hash ? arweave_url(game.image1Hash) : null,
      protocol: config.https ? "https" : "http",
      domain: config.domain,
    };
    return { props: { data, path } };
  } catch (error) {
    console.error(error);
  }
  return { notFound: true };
}

export default Game;
