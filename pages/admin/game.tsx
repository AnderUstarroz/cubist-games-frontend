import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import styles from "../../styles/AdminGame.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorError } from "@project-serum/anchor";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  BundlrWrapper,
  displayRechargeArweave,
} from "../../components/utils/bundlr";
import { PublicKey, Transaction } from "@solana/web3.js";
import Router, { useRouter } from "next/router";
import Select from "react-select";
import {
  ConfigInputType,
  GameSettingsInputType,
  GameStateType,
  ProfitShareInputType,
} from "../types/game-settings";
import { BN } from "@project-serum/anchor";
import { addHours } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import {
  Bundlr,
  FileType,
  FilesType,
  initSolanaProgram,
  SolanaProgramType,
  config_pda,
  fetch_pdas,
  stats_pda,
  solana_fiat_price,
  TermsType,
  arweave_json,
  system_config_pda,
  SYSTEM_AUTHORITY,
  SystemConfigType,
  game_pda,
  StatsType,
  terms_pda,
  arweave_image,
  blob_to_base64,
  PDATypes,
  ProfitShareType,
} from "@cubist-collective/cubist-games-lib";
import { DEFAULT_DECIMALS } from "../../components/utils/number";
import {
  COMBINED_INPUTS,
  validateCombinedInput,
  validateInput,
} from "../../components/validation/settings";
import { SettingsError } from "../../components/validation/errors";
import {
  rustToInputsSettings,
  fetch_configs,
  inputsToRustSettings,
} from "../../components/utils/game-settings";
import { ReactNode } from "react";
import { fetcher, multi_request } from "../../components/utils/requests";
import {
  flashError,
  flashMsg,
  is_authorized,
} from "../../components/utils/helpers";
import { RechargeArweaveType } from "../../components/recharge-arweave/types";
import Link from "next/link";
import { process_image } from "../../components/utils/image";
import {
  DefinitionInputsType,
  OptionType,
  WarningMsgInputsType,
} from "../types/game";
import { MDEditorProps } from "@uiw/react-md-editor";
import {
  bold,
  italic,
  strikethrough,
  hr,
  title,
  link,
  quote,
  unorderedListCommand,
  orderedListCommand,
  checkedListCommand,
  divider,
} from "@uiw/react-md-editor/lib/commands";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { DEFAULT_SELECT_STYLES } from "../../components/utils/game";

const AdminWelcome = dynamic(() => import("../../components/admin-welcome"));
const Input = dynamic(() => import("../../components/input"));
const ImageInput = dynamic(() => import("../../components/image-input"));
const Switch = dynamic(() => import("../../components/switch"));
const Icon = dynamic(() => import("../../components/icon"));
const Modal = dynamic(() => import("../../components/modal"));
const Info = dynamic(() => import("../../components/settings/info"));
const Button = dynamic(() => import("../../components/button"));
const Markdown = dynamic(() => import("../../components/markdown"));
const Spinner = dynamic(() => import("../../components/spinner"));
const Checkbox = dynamic(() => import("../../components/checkbox"));

const DatesSettings = dynamic(() => import("../../components/settings/dates"));
const GeneralSettings = dynamic(
  () => import("../../components/settings/general")
);
const StakeButtons = dynamic(
  () => import("../../components/settings/stake-buttons")
);
const Profits = dynamic(() => import("../../components/settings/profits"));
const RechargeArweave = dynamic(
  () => import("../../components/recharge-arweave")
);
const MDEditor = dynamic<MDEditorProps>(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

const mkEditorDefaults: any = {
  preview: "edit",
  commands: [
    bold,
    italic,
    strikethrough,
    title,
    hr,
    divider,
    link,
    quote,
    divider,
    unorderedListCommand,
    orderedListCommand,
    checkedListCommand,
  ],
  extraCommands: [],
};
const Game: NextPage = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const { data } = useSWR("/api/idl", fetcher);
  const { publicKey, wallet, sendTransaction } = useWallet();
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [solFiatPrice, setSolFiatPrice] = useState<number | null>(null);
  const [pdas, setPdas] = useState<PDATypes | null>(null);
  const [rechargeArweave, setRechargeArweave] = useState<RechargeArweaveType>({
    display: false,
    value: 1,
    requiredSol: 0,
    solBalance: 0,
    requiredUsd: 0,
    recommendedSol: 0,
    error: false,
    loading: false,
    decimals: 9,
    closeModals: { rechargeArweave: false },
  });
  const [files, setFiles] = useState<FilesType>({});
  const [maxDecimals, setMaxDecimals] = useState<number>(DEFAULT_DECIMALS);
  const [bundlr, setBundlr] = useState<Bundlr | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );
  const [systemConfig, setSystemConfig] = useState<SystemConfigType | null>(
    null
  );
  const [config, setConfig] = useState<ConfigInputType | null>(null);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettingsInputType>({
    gameId: 0,
    state: GameStateType.Pending,
    isActive: true,
    createdAt: null,
    updatedAt: null,
    settledAt: null,
    cashedAt: null,
    solProfits: null,
    tokenProfits: null,
    openTime: addHours(new Date(), 3),
    closeTime: addHours(new Date(), 27),
    settleTime: addHours(new Date(), 30),
    fee: 7,
    showPot: true,
    useCategories: false,
    useToken: false,
    allowReferral: true,
    fireThreshold: 100,
    minStake: 0.1,
    minStep: 0.1,
    customStakeButton: true,
    stakeButtons: [],
    profitSharing: [],
    designTemplate: null,
    termsId: "",
    termsHash: "",
    infoHash: null,
    image1Hash: null,
    definitionHash: "",
    category: null,
    hasBets: false,
    totalBetsClaimed: 0,
    options: [],
    result: null,
  });
  const [definition, setDefinition] = useState<DefinitionInputsType>({
    loading: false,
    title: "",
    description: "",
    options: [
      { title: "", description: "" },
      { title: "", description: "" },
    ],
  });
  const [definitionErrors, setDefinitionErrors] = useState<{
    [key: string]: string;
  }>({});
  const [warningMsg, setWarningMsg] = useState<WarningMsgInputsType>({
    loading: false,
    title: "",
    description: "",
  });

  const [modals, setModals] = useState({
    main: false,
    terms: false,
    definition: false,
    warningMsg: false,
    rechargeArweave: false,
  });
  const [mainModalContent, setMainModalContent] = useState<ReactNode>(null);

  const showModal = (content: any) => {
    setMainModalContent(content);
    setModals({ ...modals, main: true });
  };

  const validateSettingsField = (
    key: string,
    value: any,
    nameSpace: string = "",
    updatedSettings: { [key: string]: any } = {}
  ): boolean => {
    try {
      const allSettings = {
        SystemConfig: systemConfig as SystemConfigType,
        Config: config as ConfigInputType,
        Settings: gameSettings,
        ...updatedSettings,
      };
      validateInput(key, value, nameSpace);
      validateCombinedInput(key, allSettings, nameSpace);
      return true;
    } catch (error) {
      if (error instanceof SettingsError) {
        switch (nameSpace) {
          case "Definition":
            setDefinitionErrors({
              ...definitionErrors,
              [error.code]: error.message,
            });
            break;
          default:
            setErrors({ ...errors, [error.code]: error.message });
        }
        if (error.code != "profitSharing") {
          flashMsg(error.message, "error", 2500);
        }
      }
    }
    return false;
  };

  const handleUpdateGameSettings = (key: string, value: any) => {
    delete errors[key];
    setErrors(errors);
    const updatedSettings = { ...gameSettings, [key]: value };
    if (validateSettingsField(key, value, "", { Settings: updatedSettings })) {
      if (key in COMBINED_INPUTS) {
        COMBINED_INPUTS[key].map((input: string) => delete errors[input]);
        setErrors(errors);
      }
    }
    setGameSettings(updatedSettings);
  };

  const handleSave = () => {
    for (const [key, value] of Object.entries(gameSettings)) {
      if (!validateSettingsField(key, value)) return;
    }
    for (const [key, value] of Object.entries(definition)) {
      if (!validateSettingsField(key, value, "Definition")) return;
    }
    (async () => {
      if (!pdas) return;
      // Add game options:
      let params = { ...gameSettings };
      const [termsPda, _] = await terms_pda(authority, params.termsId);
      try {
        let terms = await solanaProgram?.account.terms.fetch(termsPda);
        params.termsHash = terms?.arweaveHash as string;
      } catch (error) {
        return flashMsg(`Terms & Conditions "${params.termsId}" not found!`);
      }
      try {
        setLoading(true);
        !gameSettings.createdAt
          ? // Create new Game
            await solanaProgram?.methods
              .createGame(inputsToRustSettings(params, maxDecimals))
              .accounts({
                authority: authority,
                systemConfig: pdas.systemConfig.pda,
                config: pdas.config.pda,
                stats: pdas.stats.pda,
                game: pdas.game.pda,
              })
              .rpc()
          : // Update existing Game
            await solanaProgram?.methods
              .updateGame(inputsToRustSettings(params, maxDecimals))
              .accounts({
                authority: authority,
                systemConfig: pdas.systemConfig.pda,
                config: pdas.config.pda,
                game: pdas.game.pda,
              })
              .rpc();

        flashMsg("Game saved!", "success");
        Router.push("/admin");
      } catch (error) {
        setLoading(false);
        if (!(error instanceof AnchorError)) {
          throw error;
        }
        flashMsg(`${error.error.errorMessage}`);
      }
    })();
  };
  const handleCashOut = async () => {
    try {
      setLoading(true);
      const tx = new Transaction(await connection.getLatestBlockhash());
      gameSettings.profitSharing.map(async (share: ProfitShareInputType) => {
        tx.add(
          await (solanaProgram as SolanaProgramType).methods
            .collectSolProfits()
            .accounts({
              authority: authority,
              game: pdas?.game.pda,
              stats: pdas?.stats.pda,
              treasury: new PublicKey(share.treasury),
            })
            .instruction()
        );
      });
      const signature = await sendTransaction(tx, connection);
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });
      flashMsg("Game cashed!", "success");
      router.reload();
    } catch (error) {
      flashMsg("Cash out failed", "success");
      console.error(error);
      setLoading(false);
    }
  };
  const handleUpdateDefinition = (key: string, value: any) => {
    delete definitionErrors[key];
    setDefinitionErrors(definitionErrors);
    const updatedDescription = { ...definition, [key]: value };
    validateSettingsField(key, value, "Definition", {
      Description: updatedDescription,
    });
    setDefinition(updatedDescription);
  };

  const handleUpdateOption = (field: string, index: number, value: string) => {
    handleUpdateDefinition(
      "options",
      definition.options.reduce(
        (acc: OptionType[], curr: OptionType, optIndex: number) =>
          acc.concat(index === optIndex ? { ...curr, [field]: value } : curr),
        [] as OptionType[]
      )
    );
  };

  const handleSaveDefinition = async () => {
    for (const [key, value] of Object.entries(definition)) {
      if (!validateSettingsField(key, value, "Definition")) return;
    }
    if (!bundlr || !solanaProgram) return;
    const jsonContent = JSON.stringify((({ loading, ...t }) => t)(definition));
    const [balance, price] = await multi_request([
      [bundlr.balance, []],
      [bundlr.getPrice, [Buffer.byteLength(jsonContent, "utf8")]],
    ]);
    // Reacharge Arweave when there is not enough balance
    if (
      displayRechargeArweave(
        price,
        balance,
        {
          ...rechargeArweave,
          closeModals: { rechargeArweave: false, definition: true },
        },
        setRechargeArweave,
        solFiatPrice as number,
        maxDecimals
      )
    ) {
      setModals({ ...modals, rechargeArweave: true });
      return;
    }
    setDefinition({ ...definition, loading: true });
    const arweaveHash = await bundlr?.uploadJSON(jsonContent);
    if (arweaveHash) {
      setGameSettings({
        ...gameSettings,
        definitionHash: arweaveHash,
        options: definition.options.map((o: OptionType, k: number) => {
          return { id: k, totalStake: 0, totalBets: 0 };
        }),
      });
      flashMsg("Uploaded game definition to Arweave", "success");
      setModals({ ...modals, definition: false });
    }
    setDefinition({ ...definition, loading: false });
  };

  const handleSaveWarningMsg = async () => {
    if (!bundlr || !solanaProgram) return;
    const jsonContent = JSON.stringify((({ loading, ...t }) => t)(warningMsg));
    const [balance, price] = await multi_request([
      [bundlr.balance, []],
      [bundlr.getPrice, [Buffer.byteLength(jsonContent, "utf8")]],
    ]);
    // Reacharge Arweave when there is not enough balance
    if (
      displayRechargeArweave(
        price,
        balance,
        {
          ...rechargeArweave,
          closeModals: { rechargeArweave: false, warningMsg: true },
        },
        setRechargeArweave,
        solFiatPrice as number,
        maxDecimals
      )
    ) {
      setModals({ ...modals, rechargeArweave: true });
      return;
    }
    setWarningMsg({ ...warningMsg, loading: true });
    try {
      const arweaveHash = await bundlr?.uploadJSON(jsonContent);
      if (arweaveHash) {
        await updateInfoHash(arweaveHash);
        flashMsg("Uploaded warning message to Arweave", "success");
        setModals({ ...modals, warningMsg: false });
      }
    } catch (e) {
      console.error(e);
      flashMsg("Failed to save warning message");
    }
    setWarningMsg({ ...warningMsg, loading: false });
  };

  const updateInfoHash = async (arweaveHash: string | null) => {
    await solanaProgram?.methods
      .updateGameInfo(arweaveHash)
      .accounts({
        authority: authority,
        game: (pdas as PDATypes).game.pda,
      })
      .rpc();
    setGameSettings({ ...gameSettings, infoHash: arweaveHash });
  };

  const handleUpdateArweaveInput = (value: string) => {
    setRechargeArweave({ ...rechargeArweave, value: parseFloat(value) });
  };

  const handleRechargeArweave = async () => {
    try {
      setRechargeArweave({ ...rechargeArweave, loading: true });
      await bundlr?.fund(rechargeArweave.value);
      setRechargeArweave({
        ...rechargeArweave,
        loading: false,
        display: false,
      });
      setModals({ ...modals, ...rechargeArweave.closeModals });
    } catch (error) {
      setRechargeArweave({ ...rechargeArweave, loading: false });
    }
  };

  // Init Bundlr
  useEffect(() => {
    if (!publicKey || !wallet || bundlr) return;
    (async () => {
      setBundlr(await BundlrWrapper(connection, wallet.adapter));
    })();
  }, [publicKey, wallet, connection, bundlr]);

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!is_authorized(publicKey) || !wallet || !data || solanaProgram || pdas)
      return;

    if (!is_authorized(publicKey)) {
      Router.push("/unauthorized");
      return;
    }
    (async () => {
      setSolFiatPrice(await solana_fiat_price());
      setMaxDecimals(DEFAULT_DECIMALS);
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
  }, [publicKey, wallet, connection, data, solanaProgram, authority]);

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
          maxDecimals
        ))
      ) {
        flashMsg("You need to define the default game settings first");
        Router.push("/admin/global-settings");
      }
    })();
  }, [solanaProgram, pdas]);

  // STEP 3 - Fetch Game
  useEffect(() => {
    if (!stats || !solanaProgram || !config || !pdas || pdas.game) return;
    (async () => {
      const gameId = new BN(
        router.query.id
          ? (router.query.id as string)
          : stats.totalGames.toNumber() + 1
      );
      const [gamePda, bump] = await game_pda(authority, new BN(gameId));
      setPdas({ ...pdas, game: { pda: gamePda, bump: bump } }); // Add Game to the existing PDAs
      try {
        const existingGame = rustToInputsSettings(
          await solanaProgram.account.game.fetch(gamePda),
          maxDecimals
        );
        // Populate Settings using existing Game
        setGameSettings(existingGame);
        // Populate Game definition
        setDefinition({
          ...definition,
          ...(await arweave_json(existingGame.definitionHash)),
        });
        // Populate image
        if (existingGame.image1Hash) {
          const imageBlob = await arweave_image(existingGame.image1Hash);
          setFiles({
            ...files,
            image1: {
              mimeType: imageBlob.type,
              size: imageBlob.size,
              stream: null,
              base64: await blob_to_base64(imageBlob as Blob),
              arweaveHash: existingGame.image1Hash,
            },
          });
        }
        // Show Info message when games cannot be edited
        if (existingGame.hasBets && !existingGame.settledAt) {
          flashMsg(
            "Ongoing games cannot be modified, but you can still activate/deactivate, set outcome and add warning messages.",
            "info"
          );
        }
      } catch (error) {
        // If game doesn't exist, populate settings using fetched config settings
        setGameSettings({
          ...gameSettings,
          ...Object.keys(config as ConfigInputType)
            .filter((k: string) => k in gameSettings)
            .reduce(
              //@ts-ignore
              (cur: any, k: string) => Object.assign(cur, { [k]: config[k] }),
              {}
            ),
          gameId: gameId.toNumber(),
          termsId: config?.terms.length ? config?.terms[0].id : null,
        });
      }
    })();
  }, [stats]);

  const handleUploadImage = async (name: string, file: FileType) => {
    if (!bundlr || !publicKey) {
      throw new Error("Bundlr or wallet not initialized");
    }
    const [balance, price] = await multi_request([
      [bundlr.balance, []],
      [bundlr.getPrice, [file.size]],
    ]);
    if (
      displayRechargeArweave(
        price,
        balance,
        { ...rechargeArweave, closeModals: { rechargeArweave: false } },
        setRechargeArweave,
        solFiatPrice as number,
        maxDecimals
      )
    ) {
      setModals({ ...modals, rechargeArweave: true });
      return;
    }
    file.arweaveHash = await bundlr?.uploadFile(file);
    if (file.arweaveHash) {
      setFiles({ ...files, [name]: file });
      setGameSettings({ ...gameSettings, [`${name}Hash`]: file.arweaveHash });
      flashMsg(
        "Image was successfully uploaded, but you still need to save the game.",
        "info"
      );
    }
  };

  const handleToggleGame = async (value: boolean) => {
    if (!pdas) return;
    await solanaProgram?.methods
      .toggleGame(value)
      .accounts({
        authority: authority,
        game: pdas.game.pda,
      })
      .rpc();
    setGameSettings({ ...gameSettings, isActive: value });
  };

  const handleSetOutcome = async (optionId: number) => {
    if (!solanaProgram || !pdas) return;
    try {
      // VOID GAME
      if (optionId >= gameSettings.options.length) {
        await solanaProgram.methods
          .voidGame()
          .accounts({
            authority: authority,
            game: pdas.game.pda,
          })
          .rpc();
        flashMsg("Game voided", "success");
      } else {
        // SETTLE GAME
        await solanaProgram.methods
          .settleGame(optionId)
          .accounts({
            authority: authority,
            game: pdas.game.pda,
          })
          .rpc();
        flashMsg("Game settled", "success");
      }
      Router.push("/admin");
    } catch (error) {
      flashMsg(`${error}`);
    }
    setModals({ ...modals, main: false });
  };

  return (
    <>
      <Head>
        <title>Game</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href={process.env.NEXT_PUBLIC_FAVICON} />
      </Head>
      {!publicKey ? (
        <AdminWelcome />
      ) : (
        <div className={styles.content}>
          {!gameSettings.gameId || loading ? (
            <Spinner />
          ) : (
            <>
              <AnimatePresence>
                <motion.div className={`${styles.title}`}>
                  <div className="vAligned jCSB mobileCol">
                    <h1>{`${
                      gameSettings.createdAt ? "Edit Game" : "New Game"
                    }`}</h1>
                    {gameSettings.createdAt && !gameSettings.settledAt && (
                      <div className="vAligned">
                        <Switch
                          onChange={handleToggleGame}
                          value={gameSettings.isActive}
                        />
                        <div className="vAligned gap5">
                          {gameSettings.isActive ? "Activated" : "Disabled"}{" "}
                          <Icon
                            cType="info"
                            className="icon1"
                            onClick={() =>
                              showModal(
                                <div>
                                  <h4>Activate/Deactivate games</h4>
                                  <p>
                                    Deactivated games won&apos;t be displayed in
                                    the games list. Only active games can accept
                                    bets.
                                  </p>
                                </div>
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {!!gameSettings.createdAt && !!config && (
                <Info
                  gameSettings={gameSettings}
                  definition={definition}
                  config={config}
                />
              )}
              <DatesSettings
                settings={gameSettings}
                errors={errors}
                showModal={showModal}
                handleUpdateSettings={handleUpdateGameSettings}
              />
              {!!systemConfig && (
                <Profits
                  systemConfig={systemConfig}
                  settings={gameSettings}
                  errors={errors}
                  showModal={showModal}
                  handleUpdateSettings={handleUpdateGameSettings}
                  modals={modals}
                  setModals={setModals}
                />
              )}
              <GeneralSettings
                settings={gameSettings}
                errors={errors}
                showModal={showModal}
                handleUpdateSettings={handleUpdateGameSettings}
              />
              <StakeButtons
                settings={gameSettings}
                errors={errors}
                showModal={showModal}
                handleUpdateSettings={handleUpdateGameSettings}
                maxDecimals={maxDecimals}
              />
              <div className={styles.flexCols}>
                <motion.section>
                  <h2>Terms & Conditions</h2>
                  <fieldset>
                    <p className="mb-big">
                      Define the T&C which should be applied to the game. T&Cs
                      can be created at the{" "}
                      <Link href="/admin/global-settings">
                        <a title="Settings" className="icon1">
                          Global settings page
                        </a>
                      </Link>
                      .
                    </p>
                    <div className="flex mb-med">
                      <label className="overlap fullCol">
                        <Select
                          className="fullWidth"
                          placeholder="Select one option..."
                          name="termsId"
                          options={config?.terms.map((t: TermsType) => {
                            return { value: t.id, label: t.id };
                          })}
                          value={
                            gameSettings.termsId
                              ? {
                                  value: gameSettings.termsId,
                                  label: gameSettings.termsId,
                                }
                              : null
                          }
                          styles={
                            errors?.termsId
                              ? {
                                  container: (styles) => ({
                                    ...styles,
                                    border: "1px solid var(--errorBg)",
                                  }),
                                }
                              : DEFAULT_SELECT_STYLES
                          }
                          onChange={(option, _actionMeta) => {
                            handleUpdateGameSettings("termsId", option?.value);
                          }}
                        />
                        <span>Terms & Conditions</span>
                      </label>
                    </div>
                    {!gameSettings.termsId && (
                      <div className="errorMsg">
                        You need to{" "}
                        <Link href="/admin/global-settings">
                          <a title="Settings">
                            <strong>create Terms & Conditions</strong>
                          </a>
                        </Link>{" "}
                        first
                      </div>
                    )}
                  </fieldset>
                </motion.section>
                <motion.section>
                  <h2 className="vAligned gap5">
                    Image{" "}
                    <Icon
                      cType="info"
                      className="icon1"
                      onClick={() =>
                        showModal(
                          <div>
                            <h4>Game image</h4>
                            <p>
                              Upload and image to enrich the game interface.
                            </p>
                          </div>
                        )
                      }
                    />
                  </h2>
                  <fieldset className={styles.imageField}>
                    <ImageInput
                      name="image1"
                      file={files.image1 ? files.image1 : null}
                      onChange={async (e: any) =>
                        process_image(
                          e.target.name,
                          e.target.files,
                          handleUploadImage
                        )
                      }
                    />
                  </fieldset>
                </motion.section>
                {!!gameSettings.createdAt && (
                  <motion.section>
                    <h2>Warning message</h2>
                    <fieldset>
                      <p>
                        Use it to inform users about unexpected events, delays
                        or any important update related to the game.
                      </p>
                      <div className="vAligned">
                        <label
                          className="vAligned gap5"
                          onClick={() => {
                            if (!gameSettings.infoHash) {
                              return setModals({ ...modals, warningMsg: true });
                            }
                            updateInfoHash(null);
                          }}
                        >
                          <Checkbox
                            name="showPot"
                            value={!!gameSettings.infoHash}
                          />
                          <span>
                            <em>Show warning</em>
                          </span>
                        </label>
                        {!!gameSettings.infoHash && (
                          <span
                            title="Edit warning message"
                            onClick={() =>
                              setModals({ ...modals, warningMsg: true })
                            }
                          >
                            <Icon cType="edit" className="icon1" />
                          </span>
                        )}
                      </div>
                    </fieldset>
                  </motion.section>
                )}
              </div>
              <section>
                <h2 className="vAligned">
                  <span>Definition</span>{" "}
                  {!gameSettings.hasBets && (
                    <span
                      title="Edit definition"
                      onClick={() => setModals({ ...modals, definition: true })}
                    >
                      <Icon cType="edit" className="icon1" />
                    </span>
                  )}
                </h2>
                <fieldset
                  title="Edit definition"
                  className={styles.preview}
                  onClick={() => {
                    if (gameSettings.hasBets) return;
                    setModals({ ...modals, definition: true });
                  }}
                >
                  <div className="overlap">
                    <h3>
                      <Markdown>
                        {definition.title
                          ? definition.title
                          : "Define a game title.."}
                      </Markdown>
                    </h3>
                    <span>Game title</span>
                  </div>
                  <div className="overlap mb-big">
                    <Markdown>
                      {definition.description
                        ? definition.description
                        : "Define a game description.."}
                    </Markdown>
                    <span>Game description</span>
                  </div>
                  <h3>Options </h3>
                  <ul>
                    {definition.options.map((o: OptionType, k: number) => (
                      <li key={`descOpt-${k}`}>
                        <div>
                          <div className={`optBg${k}`}></div>
                        </div>
                        <div className="fullCol">
                          <h6 className={`optColor${k}`}>
                            <Markdown>{o.title}</Markdown>
                          </h6>
                          <div className={styles.opDesc}>
                            <Markdown>{o.description}</Markdown>
                          </div>
                          <div className={styles.opStats}>
                            <span>
                              Bets: {gameSettings.options[k].totalBets}
                            </span>{" "}
                            <span>
                              Stake: {gameSettings.options[k].totalStake} SOL
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              </section>
              {gameSettings.createdAt &&
                gameSettings.isActive &&
                !gameSettings.totalBetsClaimed && (
                  <section>
                    <h2>Game result</h2>
                    <fieldset>
                      <p>
                        Once you define the game outcome the winners will be
                        able to claim their prizes:
                      </p>
                      <Select
                        placeholder="Select game outcome..."
                        name="result"
                        options={[
                          ...definition.options.map(
                            (o: OptionType, k: number) => {
                              return {
                                value: k,
                                label: o.title,
                              };
                            }
                          ),
                          {
                            value: definition.options.length,
                            label: "Void game",
                          },
                        ]}
                        value={
                          gameSettings.result !== null
                            ? {
                                value: gameSettings.result,
                                label:
                                  definition.options[gameSettings.result].title,
                              }
                            : null
                        }
                        styles={{
                          ...DEFAULT_SELECT_STYLES,
                          option: (baseStyles: any, state: any) => {
                            return {
                              ...baseStyles,
                              color:
                                state.data.value < definition.options.length
                                  ? `var(--opt${state.data.value})`
                                  : "var(--color0)",
                              backgroundColor: "var(--inputBg0)",
                              ":hover": {
                                ...baseStyles[":hover"],
                                backgroundColor: state.isFocused
                                  ? "var(--color17)"
                                  : "var(--inputBg0)",
                              },
                              ":active": {
                                ...baseStyles[":active"],
                                backgroundColor: state.isSelected
                                  ? "var(--color17)"
                                  : "var(--inputBg0)",
                              },
                            };
                          },
                        }}
                        onChange={(option, _actionMeta) => {
                          if (!option) return;
                          showModal(
                            <div>
                              <h4>Game outcome</h4>
                              <p>
                                The following option will be selected as the
                                outcome of the game:
                              </p>
                              <ul className={styles.outcome}>
                                <li>
                                  <div>
                                    <span
                                      className={
                                        option.value < definition.options.length
                                          ? `optBg${option.value}`
                                          : "voidBg"
                                      }
                                    ></span>
                                  </div>
                                  <strong
                                    className={
                                      option.value < definition.options.length
                                        ? `optColor${option.value}`
                                        : "colorVoid"
                                    }
                                  >
                                    {option.label}
                                  </strong>
                                </li>
                              </ul>
                              <div className="errorMsg mb-med">
                                If the outcome is set and a prize is claimed by
                                any player, you won&apos;t be able to change the
                                outcome anymore.
                              </div>
                              <p>
                                <strong>
                                  Are you completly sure this is the correct
                                  outcome of the game?{" "}
                                </strong>
                              </p>

                              <div className="vAligned">
                                <Button
                                  onClick={() => handleSetOutcome(option.value)}
                                >
                                  Yes, set outcome
                                </Button>
                                <Button
                                  className="button1"
                                  onClick={() =>
                                    setModals({ ...modals, main: false })
                                  }
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </fieldset>
                  </section>
                )}
              <div className="vAligned centered mb-big">
                {gameSettings.settledAt && !gameSettings.cashedAt && (
                  <Button className="button2" onClick={() => handleCashOut()}>
                    Cash out
                  </Button>
                )}
                {!gameSettings.hasBets && (
                  <Button
                    onClick={() => handleSave()}
                    disabled={
                      Boolean(Object.keys(errors).length) ||
                      Boolean(Object.keys(definitionErrors).length)
                    }
                  >
                    Save
                  </Button>
                )}
                <Button className="button1">
                  <Link href={`/admin`}>
                    <a>Cancel</a>
                  </Link>
                </Button>
              </div>
            </>
          )}
          <Modal modalId={"definition"} modals={modals} setIsOpen={setModals}>
            <div>
              <h4 className="mb-big">Definition</h4>
              {definition.loading ? (
                <Spinner />
              ) : (
                <>
                  <div className="mb-med">
                    <label className="overlap fullWidth">
                      <Input
                        name="title"
                        type="text"
                        maxLength={64}
                        placeholder="Type a game title.."
                        className={`fullWidth ${
                          definitionErrors.hasOwnProperty("title")
                            ? "error"
                            : ""
                        }`}
                        value={definition.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleUpdateDefinition("title", e.target.value)
                        }
                      />
                      <span>Game title</span>
                    </label>
                  </div>
                  <div className="mb-med">
                    <div className="overlap fullWidth">
                      <MDEditor
                        value={definition.description}
                        className={`fullWidth ${
                          definitionErrors.hasOwnProperty("description")
                            ? styles.MDEditorError
                            : ""
                        }`}
                        onChange={(text: any) =>
                          handleUpdateDefinition(
                            "description",
                            text.slice(0, 1000)
                          )
                        }
                        {...mkEditorDefaults}
                      />
                      <span>Description</span>
                    </div>
                  </div>
                  <h3 className="vAligned">
                    Options
                    <span
                      className="icon1"
                      onClick={() =>
                        setDefinition({
                          ...definition,
                          options: [
                            ...definition.options,
                            {
                              title: ``,
                              description: "",
                            },
                          ],
                        })
                      }
                    >
                      +
                    </span>
                  </h3>
                  {definitionErrors.hasOwnProperty("options") && (
                    <div className="errorMsg mb-med">
                      {definitionErrors.options}
                    </div>
                  )}
                  <ul className={styles.options}>
                    {definition.options.map((o: OptionType, k: number) => (
                      <li key={`descOpt-${k}`} className="vAligned gap5">
                        <div className="">
                          <div className={`optBg${k}`}></div>
                        </div>
                        <label className="overlap">
                          <Input
                            name="title"
                            type="text"
                            maxLength={32}
                            placeholder="Type option.."
                            value={o.title}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => handleUpdateOption("title", k, e.target.value)}
                          />
                          <span>Title</span>
                        </label>
                        <label className="overlap">
                          <Input
                            name="description"
                            type="text"
                            maxLength={64}
                            placeholder=""
                            value={o.description}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              handleUpdateOption(
                                "description",
                                k,
                                e.target.value.slice(0, 64)
                              )
                            }
                          />
                          <span>Description</span>
                        </label>
                        <span
                          title="Remove option"
                          className="icon2"
                          onClick={() =>
                            setDefinition({
                              ...definition,
                              options: definition.options.filter(
                                (_: OptionType, index: number) => index !== k
                              ),
                            })
                          }
                        >
                          —
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="vAligned centered">
                    <Button onClick={() => handleSaveDefinition()}>Save</Button>{" "}
                    <Button
                      className="button1"
                      onClick={() =>
                        setModals({ ...modals, definition: false })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Modal>
          <Modal modalId={"warningMsg"} modals={modals} setIsOpen={setModals}>
            <div>
              <h4>Warning message</h4>
              <p className="mb-big">
                Use it to inform users about unexpected events, delays or any
                important update related to the game.
              </p>
              {warningMsg.loading ? (
                <Spinner />
              ) : (
                <>
                  <div className="mb-med">
                    <label className="overlap fullWidth">
                      <Input
                        name="title"
                        type="text"
                        maxLength={64}
                        placeholder="Type a title.."
                        className="fullWidth"
                        value={warningMsg.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setWarningMsg({
                            ...warningMsg,
                            title: e.target.value.slice(0, 64),
                          })
                        }
                      />
                      <span>Warning title</span>
                    </label>
                  </div>
                  <div className="mb-med">
                    <div className="overlap fullWidth">
                      <MDEditor
                        value={warningMsg.description}
                        onChange={(text: any) =>
                          setWarningMsg({
                            ...warningMsg,
                            description: text.slice(0, 500),
                          })
                        }
                        {...mkEditorDefaults}
                      />
                      <span>Warning message</span>
                    </div>
                  </div>
                  <div className="vAligned centered">
                    <Button onClick={() => handleSaveWarningMsg()}>Save</Button>{" "}
                    <Button
                      className="button1"
                      onClick={() =>
                        setModals({ ...modals, warningMsg: false })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Modal>
          <Modal
            modalId={"rechargeArweave"}
            modals={modals}
            setIsOpen={setModals}
          >
            <RechargeArweave
              {...rechargeArweave}
              handleUpdate={(value: string) => handleUpdateArweaveInput(value)}
              handleRechargeArweave={() => handleRechargeArweave()}
            />
          </Modal>
          <Modal modalId={"main"} modals={modals} setIsOpen={setModals}>
            {mainModalContent}
          </Modal>
        </div>
      )}
    </>
  );
};

export default Game;
