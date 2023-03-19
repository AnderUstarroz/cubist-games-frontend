import type { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/Game.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import {
  arweave_json,
  arweave_url,
  claim_sol_bets_tx,
  config_pda,
  CubistGames,
  fetch_pdas,
  game_pda,
  initSolanaProgram,
  num_format,
  PDATypes,
  PlayerBetsType,
  player_bets_pda,
  PROGRAM_ID,
  refund_sol_bets_tx,
  short_key,
  SolanaProgramType,
  solana_fiat_price,
  SystemConfigType,
  SYSTEM_AUTHORITY,
  system_config_pda,
} from "@cubist-collective/cubist-games-lib";
import { PublicKey, Connection } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Fragment, ReactNode, useEffect, useState } from "react";
import {
  GameType,
  OptionType,
  PrevGameType,
  CustomStakeType,
  GameTermsType,
  WarningMsgType,
} from "../../types/game";
import IDL from "@cubist-collective/cubist-games-lib/lib/idl.json";
import { flashError, flashMsg } from "../../components/utils/helpers";
import {
  fetch_games,
  fetch_terms,
  async_cached,
} from "../../components/utils/requests";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { update_prev_game } from "../../components/utils/game";
import { useInterval } from "../../components/utils/helpers";
import { ShowCTA } from "../../components/game/cta/types";
import {
  calculate_stakes,
  fetch_my_bets,
  MyBetType,
} from "../../components/utils/bet";
import "swiper/css";
import "swiper/css/lazy";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { DEFAULT_ANIMATION } from "../../components/utils/animation";

const Game = dynamic(() => import("../../components/game"));
const Spinner = dynamic(() => import("../../components/spinner"));
const Modal = dynamic(() => import("../../components/modal"));
const Icon = dynamic(() => import("../../components/icon"));
const Markdown = dynamic(() => import("../../components/markdown"));
const Button = dynamic(() => import("../../components/button"));

const GamePage: NextPage = ({ data, path }: any) => {
  const { publicKey, wallet, sendTransaction } = useWallet();
  const { setVisible: setWalletVisible } = useWalletModal();
  const { connection } = useConnection();
  const [pdas, setPdas] = useState<PDATypes | null>(null);
  const [solFiatPrice, setSolFiatPrice] = useState<number | null>(null);
  const [warningMsg, setWarningMsg] = useState<WarningMsgType>({
    show: false,
    title: "",
    description: "",
  });
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
    stake: "1.0",
    error: false,
    loading: false,
  });
  const [myBets, setMyBets] = useState<MyBetType[]>([]);
  const [playerBets, setPlayerBets] = useState<PlayerBetsType | null>(null);
  const [refreshGame, setRefreshGame] = useState<boolean>(false);
  const [prevGame, setPrevGame] = useState<PrevGameType | null>(null);
  const [modals, setModals] = useState({
    main: false,
    bet: false,
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

  const handleRefreshGame = async () => {
    // Refreshes game every 5 secs (if needed)
    if (!refreshGame || !solanaProgram) return;
    // Refresh game
    const g = (await fetch_games(solanaProgram, authority, [data.gameId]))[0];
    setPrevGame(update_prev_game(g.data));
    setGame(g);
    setRefreshGame(false);
    refreshBets(g);
  };

  const handleClaim = async (action: ShowCTA, bets: PlayerBetsType) => {
    if (!solanaProgram || !game || !pdas || !publicKey) return;
    const [totalStake, winnerStake] = calculate_stakes(
      game.data.result as number,
      game.data.options
    );
    const [tx, _] =
      action === ShowCTA.Pay
        ? await claim_sol_bets_tx(
            solanaProgram,
            game.data.gameId,
            game.data.result as number,
            game.data.fee,
            pdas,
            publicKey,
            totalStake,
            winnerStake,
            bets
          )
        : await refund_sol_bets_tx(
            solanaProgram,
            game?.data.gameId,
            pdas,
            publicKey,
            bets
          );
    try {
      const latestBlockHash = await connection.getLatestBlockhash();
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
      flashMsg(
        `${action === ShowCTA.Pay ? "Payment" : "Refund"} claimed: ${short_key(
          signature
        )}`,
        "success"
      );
    } catch (error) {
      console.error(error);
      flashMsg(
        `Failed to claim ${action === ShowCTA.Pay ? "payment" : "refund"}`
      );
    }
  };
  const refreshBets = async (game: GameType) => {
    if (!publicKey || !solanaProgram || !pdas) return;
    setMyBets(await fetch_my_bets(connection, publicKey, game));
    const [playerBetsPda, playerBetsBump] = await player_bets_pda(
      publicKey,
      pdas.game.pda // Game PDA
    );
    // Fetch only when necessary
    if (
      !pdas.playerBets ||
      pdas.playerBets.pda.toBase58() != publicKey.toBase58()
    ) {
      setPdas({
        ...pdas,
        playerBets: { pda: playerBetsPda, bump: playerBetsBump },
      });
    }
    // Fetch playerBets (account only exists if at least one bet has been placed)
    try {
      setPlayerBets(
        //@ts-ignore
        await solanaProgram.account.playerBets.fetch(playerBetsPda)
      );
    } catch (e) {}
  };

  const fetchInfo = async (hash: string) => {
    const r = await fetch(`https://arweave.net/${hash}`);
    if (r.ok) {
      const data = await r.json();
      setWarningMsg({ ...data, show: true });
    }
  };
  const handleShare = () => {
    if (!game || !game.cached.definition) return;
    const totalStake = game.data.options.reduce((a, o) => a + o.totalStake, 0);
    window.open(
      `http://twitter.com/share?text=${
        game.cached.definition.title
      }%0A${game.cached.definition.options
        .map(
          (option, index) =>
            `%0A🔹${option.title}:%20${num_format(
              totalStake
                ? (game.data.options[index].totalStake / totalStake) * 100
                : 0,
              2
            )}%25`
        )
        .join("")}%0A%0A💰Place your bet:&url=${window.location.href}`,
      "_blank"
    );
  };
  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!data || solanaProgram || pdas) return;
    (async () => {
      // Init
      setSolFiatPrice(await async_cached(solana_fiat_price, [], 43200)); // Cache for 12h
      setPdas(
        await flashError(fetch_pdas, [
          ["systemConfig", system_config_pda, SYSTEM_AUTHORITY],
          ["config", config_pda, authority],
          ["game", game_pda, authority, new BN(data.gameId)],
        ])
      );
      setSolanaProgram(
        await initSolanaProgram(
          IDL,
          connection,
          wallet ? wallet.adapter : new PhantomWalletAdapter()
        )
      );
    })();
  }, [wallet, connection, solanaProgram, authority]);

  // STEP 2 - Fetch Game
  useEffect(() => {
    if (!connection || !solanaProgram || !pdas || prevGame || game || terms.id)
      return;
    let websocket: null | number = null;
    (async () => {
      // Populate Settings using existing Game
      const fetchedGame = (
        await fetch_games(solanaProgram, authority, [data.gameId])
      )[0];
      setPrevGame(update_prev_game(fetchedGame.data, true));
      setGame(fetchedGame);
      setSystemConfig(
        await solanaProgram.account.systemConfig.fetch(pdas.systemConfig.pda)
      );
      // Display Warning when Game is disabled or when info message is defined
      if (!fetchedGame.data.isActive) {
        setWarningMsg({
          show: true,
          title: "Game is disabled",
          description:
            "The game has been temporarily disabled, we apologize for the inconvenience.",
        });
      } else if (fetchedGame.data.infoHash) {
        fetchInfo(fetchedGame.data.infoHash);
      }
      setTerms({
        ...terms,
        ...(await fetch_terms(
          solanaProgram,
          fetchedGame.data.termsId,
          fetchedGame.data.termsHash
        )),
      });
      setCustomStake({
        ...customStake,
        stake: (fetchedGame.data.minStep * 10.0).toFixed(2),
      });
      refreshBets(fetchedGame);
    })();
    // Create Websocket connection to apply Game updates.
    websocket = connection.onAccountChange(
      pdas.game.pda,
      (updatedAccountInfo: any, context: any) => {
        if (!refreshGame) setRefreshGame(true);
        // console.log("Updated game account:", updatedAccountInfo);
        // console.log("game account context:", context);
      },
      "confirmed"
    );
    return () => {
      if (websocket) connection.removeAccountChangeListener(websocket);
    };
  }, [solanaProgram, pdas]);

  // Refresh game every 5 seconds (when updated)
  useInterval(() => {
    handleRefreshGame();
  }, 5 * 1000);

  // Wallet connected/Disconnected
  useEffect(() => {
    // Reset Mybets, playerBets, pdas when disconnected
    if (!wallet || !publicKey || !connection) {
      if (myBets) setMyBets([]);
      if (playerBets) setPlayerBets(null);
      return;
    }
    (async () => {
      setSolanaProgram(
        await initSolanaProgram(IDL, connection, wallet.adapter)
      );
      if (game) {
        refreshBets(game);
      }
    })();
  }, [publicKey, wallet, connection]);

  return (
    <>
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
      <div className={styles.navPlaceholder}></div>
      <AnimatePresence>
        {warningMsg.show && (
          <motion.div className={styles.warningMsg} {...DEFAULT_ANIMATION}>
            <div>
              <div>
                <Icon cType="notification" width={35} height={39} />
                <div>
                  <h5>{warningMsg.title}</h5>
                  <div>
                    <Markdown>{warningMsg.description}</Markdown>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  className="button1 rounded"
                  onClick={() => setWarningMsg({ ...warningMsg, show: false })}
                >
                  Accept
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.content}>
        <AnimatePresence>
          {solanaProgram && pdas && systemConfig && game && prevGame ? (
            <Game
              template={game.data.designTemplate}
              solanaProgram={solanaProgram}
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
              sendTransaction={sendTransaction}
              terms={terms}
              setTerms={setTerms}
              publickey={publicKey}
              myBets={myBets}
              playerBets={playerBets}
              handleClaim={handleClaim}
              solFiatPrice={solFiatPrice}
              handleShare={handleShare}
            />
          ) : (
            <Spinner />
          )}
        </AnimatePresence>
        <Modal modalId={"main"} modals={modals} setIsOpen={setModals}>
          {mainModalContent}
        </Modal>
      </div>
    </>
  );
};

export async function getServerSideProps(context: any) {
  const path = context.resolvedUrl;
  const authority = new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string);
  const connection = new Connection(
    //process.env.NEXT_PUBLIC_SOLANA_RPC_HOST as string
    (process.env.NEXT_PUBLIC_ENV as string) === "production"
      ? "https://rpc.ankr.com/solana/"
      : "https://api.devnet.solana.com"
  );
  const provider = new AnchorProvider(
    connection,
    new PhantomWalletAdapter() as any,
    AnchorProvider.defaultOptions()
  );
  setProvider(provider);
  const program = new Program<CubistGames>(IDL as any, PROGRAM_ID, provider);
  try {
    const pdas = await fetch_pdas([
      ["config", config_pda, authority],
      ["game", game_pda, authority, new BN(context.query.id)],
    ]);
    const [config, game] = (
      await Promise.allSettled([
        program.account.config.fetch(pdas.config.pda),
        program.account.game.fetch(pdas.game.pda),
      ])
    )
      .filter((i: any) => i.status === "fulfilled")
      .map((i: any) => i.value);
    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=172800" //Cached 24H
    );
    const data = {
      idl: IDL,
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
