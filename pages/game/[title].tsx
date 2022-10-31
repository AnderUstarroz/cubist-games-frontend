import type { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/Game.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
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
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
} from "@cubist-collective/cubist-games-lib";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Fragment, ReactNode, useEffect, useState } from "react";
import fs from "fs";
import {
  GameType,
  OptionType,
  PrevGameType,
  CustomStakeType,
  GameTermsType,
} from "../types/game";
import { PDAType } from "../types/game-settings";
import { flashError } from "../../components/utils/helpers";
import { DEFAULT_DECIMALS } from "../../components/utils/number";
import { fetch_games, fetch_terms } from "../../components/utils/requests";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { update_prev_game } from "../../components/utils/game";

const Game = dynamic(() => import("../../components/game"));
const Modal = dynamic(() => import("../../components/modal"));

const GamePage: NextPage = ({ data, path }: any) => {
  const { publicKey, wallet } = useWallet();
  const { setVisible: setWalletVisible } = useWalletModal();
  const { connection } = useConnection();
  const [pdas, setPdas] = useState<PDAType[] | null>(null);
  const [solUsdPrice, setSolUsdPrice] = useState<number | null>(null);
  const [terms, setTerms] = useState<GameTermsType>({
    agreed: false,
    id: "",
    hash: "",
    title: "",
    description: "",
  });
  const [game, setGame] = useState<GameType | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfigType | null>(
    null
  );
  const [customStake, setCustomStake] = useState<CustomStakeType>({
    id: 0,
    title: "",
    description: "",
    color: "",
    stake: "1",
    error: false,
  });
  const [maxDecimals, setMaxDecimals] = useState<number>(DEFAULT_DECIMALS);
  const [refreshGame, setRefreshGame] = useState<boolean>(false);
  const [prevGame, setPrevGame] = useState<PrevGameType | null>(null);
  const [modals, setModals] = useState({
    main: false,
    customStake: false,
  });
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );
  const [mainModalContent, setMainModalContent] = useState<ReactNode>(null);

  const setMainModal = (content: any, show = true) => {
    if (show) {
      setMainModalContent(content);
    }
    setModals({ ...modals, main: show });
  };

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!data || solanaProgram || pdas) return;
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
        await initSolanaProgram(
          data.idl,
          connection,
          wallet ? wallet.adapter : new PhantomWalletAdapter()
        )
      );
    })();
  }, [wallet, connection, data, solanaProgram, authority]);

  // STEP 2 - Fetch Game
  useEffect(() => {
    if (!connection || !solanaProgram || !pdas || game || terms.id) return;
    let websocket: null | number = null;
    (async () => {
      // Populate Settings using existing Game
      const fetchedGame = (
        await fetch_games(solanaProgram, authority, [data.gameId])
      )[0];
      setPrevGame(update_prev_game(fetchedGame.data, true));
      setGame(fetchedGame);
      setSystemConfig(
        await solanaProgram.account.systemConfig.fetch(pdas[0][0])
      );
      setTerms({
        ...terms,
        ...(await fetch_terms(
          solanaProgram,
          fetchedGame.data.termsId,
          fetchedGame.data.termsHash
        )),
      });
    })();
    // Create Websocket connection to apply Game updates.
    websocket = connection.onAccountChange(
      pdas[2][0],
      (updatedAccountInfo: any, context: any) => {
        if (!refreshGame) setRefreshGame(true);
        // console.log("Updated game account:", updatedAccountInfo);
        // console.log("game account context:", context);
      },
      "confirmed"
    );
    // Refresh game every 15 seconds (if needed)
    const refreshGameInterval = setInterval(
      () => handleRefreshGame(),
      15 * 1000
    );
    return () => {
      if (websocket) connection.removeAccountChangeListener(websocket);
      clearInterval(refreshGameInterval);
    };
  }, [solanaProgram, pdas]);

  // Wallet connected
  useEffect(() => {
    if (!wallet || !publicKey || !connection || !data.idl) return;
    (async () => {
      setSolanaProgram(
        await initSolanaProgram(data.idl, connection, wallet.adapter)
      );
    })();
  }, [publicKey, wallet, connection, data.idl]);

  const handleRefreshGame = async () => {
    if (!refreshGame || !solanaProgram) return;
    // Refresh game
    const g = (await fetch_games(solanaProgram, authority, [data.gameId]))[0];
    setPrevGame(update_prev_game(g.data));
    setGame(g);
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
          {solanaProgram && pdas && systemConfig && game && prevGame ? (
            <Game
              template={game.data.designTemplate}
              solanaProgram={solanaProgram}
              connection={connection}
              systemConfig={systemConfig}
              game={game}
              pdas={pdas}
              prevGame={prevGame}
              modals={modals}
              setModals={setModals}
              setMainModal={setMainModal}
              customStake={customStake}
              setCustomStake={setCustomStake}
              setWalletVisible={setWalletVisible}
              terms={terms}
              setTerms={setTerms}
              publickey={publicKey}
            />
          ) : (
            <div>Loading...</div>
          )}
        </AnimatePresence>
        <Modal modalId={"main"} modals={modals} setIsOpen={setModals}>
          {mainModalContent}
        </Modal>
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
    new PhantomWalletAdapter() as any,
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

export default GamePage;
