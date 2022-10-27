import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import NextImage from "next/image";
import styles from "../../styles/AdminGame.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorError } from "@project-serum/anchor";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  BundlrWrapper,
  displayRechargeArweave,
} from "../../components/utils/bundlr";
import { PublicKey } from "@solana/web3.js";
import Router, { useRouter } from "next/router";
import Select from "react-select";
import {
  ConfigInputType,
  GameSettingsInputType,
  GameStateType,
  OptionInputType,
  PDAType,
} from "../types/game-settings";
import { BN } from "@project-serum/anchor";
import { addHours } from "date-fns";

import {
  Bundlr,
  FileType,
  FilesType,
  initSolanaProgram,
  SolanaProgramType,
  config_pda,
  fetch_pdas,
  stats_pda,
  MAX_TERMS,
  solana_usd_price,
  TermsType,
  arweave_json,
  system_config_pda,
  SYSTEM_AUTHORITY,
  SystemConfigType,
  game_pda,
  StatsType,
  lamports_to_sol,
  solana_to_usd,
  terms_pda,
  arweave_image,
  blob_to_base64,
} from "@cubist-collective/cubist-games-lib";
import { DEFAULT_DECIMALS, ordinal } from "../../components/utils/number";
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
import { DefinitionInputsType, OptionType } from "../types/game";
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
  fullscreen,
} from "@uiw/react-md-editor/lib/commands";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const Input = dynamic(() => import("../../components/input"));
const ImageInput = dynamic(() => import("../../components/image-input"));
const Switch = dynamic(() => import("../../components/switch"));
const Icon = dynamic(() => import("../../components/icon"));
const Modal = dynamic(() => import("../../components/modal"));
const Info = dynamic(() => import("../../components/settings/info"));
const Button = dynamic(() => import("../../components/button"));
const Markdown = dynamic(() => import("../../components/markdown"));

const GeneralSettings = dynamic(
  () => import("../../components/settings/general")
);
const StakeButtons = dynamic(
  () => import("../../components/settings/stake-buttons")
);
const ProfitSharing = dynamic(
  () => import("../../components/settings/profit-sharing")
);
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
  const [solUsdPrice, setSolUsdPrice] = useState<number | null>(null);
  const [pdas, setPdas] = useState<PDAType[] | null>(null);
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
    image1Hash: null,
    definitionHash: "",
    category: null,
    hasBets: false,
    totalBetsPaid: 0,
    options: [],
    result: null,
  });
  const [definition, setDefinition] = useState<DefinitionInputsType>({
    loading: false,
    title: "",
    description: "",
    warning: "",
    options: [
      { title: "TypeOption1", description: "", color: "#53BC46" },
      { title: "TypeOption2", description: "", color: "#CF4E4E" },
    ],
  });
  const [definitionErrors, setDefinitionErrors] = useState<{
    [key: string]: string;
  }>({});
  const [modals, setModals] = useState({
    main: false,
    terms: false,
    definition: false,
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
        !gameSettings.createdAt
          ? // Create new Game
            await solanaProgram?.methods
              .createGame(inputsToRustSettings(params, maxDecimals))
              .accounts({
                authority: authority,
                systemConfig: pdas[0][0],
                config: pdas[1][0],
                stats: pdas[2][0],
                game: pdas[3][0],
              })
              .rpc()
          : // Update existing Game
            await solanaProgram?.methods
              .updateGame(inputsToRustSettings(params, maxDecimals))
              .accounts({
                authority: authority,
                systemConfig: pdas[0][0],
                config: pdas[1][0],
                game: pdas[3][0],
              })
              .rpc();

        flashMsg("Game saved!", "success");
        Router.push("/admin");
      } catch (error) {
        if (!(error instanceof AnchorError)) {
          throw error;
        }
        flashMsg(`${error.error.errorMessage}`);
      }
    })();
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
        solUsdPrice as number,
        maxDecimals
      )
    ) {
      setModals({ ...modals, rechargeArweave: true });
      return;
    }
    setDefinition({ ...definition, loading: true });
    const arweaveHash = await bundlr?.uploadJSON(jsonContent);
    if (arweaveHash) {
      setDefinition({ ...definition, loading: false });
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
    (async () => {
      setSolUsdPrice(await solana_usd_price());
      setMaxDecimals(DEFAULT_DECIMALS);
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
        Router.push("/admin");
      }
    })();
  }, [solanaProgram, pdas]);

  // STEP 3 - Fetch Game
  useEffect(() => {
    if (!stats || !solanaProgram || !config || !pdas) return;
    (async () => {
      const gameId = new BN(
        router.query.id
          ? (router.query.id as string)
          : stats.totalGames.toNumber() + 1
      );
      const [gamePda, bump] = await game_pda(authority, new BN(gameId));
      setPdas(pdas.concat([[gamePda, bump]])); // Add Game to the existing PDAs
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
        solUsdPrice as number,
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
    console.log("GAME STATE", value);
    await solanaProgram?.methods
      .toggleGame(value)
      .accounts({
        authority: authority,
        game: pdas[3][0],
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
            game: pdas[3][0],
          })
          .rpc();
        flashMsg("Game voided", "success");
      } else {
        // SETTLE GAME
        await solanaProgram.methods
          .settleGame(optionId)
          .accounts({
            authority: authority,
            game: pdas[3][0],
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
    <div className={styles.container}>
      <Head>
        <title>Game</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!is_authorized(publicKey) ? (
        <main className={styles.main}>Not registered</main>
      ) : (
        <main className={styles.main}>
          {!gameSettings.gameId ? (
            <div>LOADING..</div>
          ) : (
            <>
              <h1 className={styles.title}>Game</h1>
              <p>New games will be created with this settings by default</p>
              {!!gameSettings.createdAt && <Info gameSettings={gameSettings} />}
              {!gameSettings.settledAt ? (
                <div className="aligned">
                  <Switch
                    onChange={handleToggleGame}
                    value={gameSettings.isActive}
                  />
                  {gameSettings.isActive ? "Active" : "Disabled"}{" "}
                  <Icon
                    cType="info"
                    onClick={() =>
                      showModal(
                        <div>
                          <h3>Activate/Deactivate games</h3>
                          <p>
                            Only active games can accept bets. Disabled games
                            won&apos;t be displayed in the games list.
                          </p>
                        </div>
                      )
                    }
                  />
                </div>
              ) : (
                ""
              )}
              <div>
                <h2>Dates</h2>

                <fieldset>
                  <label>
                    <span>Terms & Conditions</span>
                    <Select
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
                                border: "1px solid red",
                              }),
                            }
                          : {}
                      }
                      onChange={(option, _actionMeta) => {
                        handleUpdateGameSettings("termsId", option?.value);
                      }}
                    />
                    {!gameSettings.termsId ? (
                      <p>
                        You need to{" "}
                        <Link href="/admin/global-settings">
                          <a title="Settings">create Terms & Conditions</a>
                        </Link>{" "}
                        first
                      </p>
                    ) : (
                      ""
                    )}
                  </label>
                </fieldset>
              </div>
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
              {!!systemConfig && (
                <ProfitSharing
                  systemConfig={systemConfig}
                  settings={gameSettings}
                  errors={errors}
                  showModal={showModal}
                  handleUpdateSettings={handleUpdateGameSettings}
                  modals={modals}
                  setModals={setModals}
                />
              )}
              <div>
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
              </div>
              <div>
                <h3>
                  Definition{" "}
                  <Button
                    onClick={() => setModals({ ...modals, definition: true })}
                  >
                    Edit
                  </Button>
                </h3>
                <h4>Title</h4>
                <Markdown>{definition.title}</Markdown>
                <h4>Description</h4>
                <Markdown>{definition.description}</Markdown>
                <h4>Options </h4>
                <ul>
                  {definition.options.map((o: OptionType, k: number) => (
                    <li key={`descOpt-${k}`}>
                      <Markdown>{o.title}</Markdown>
                      <Markdown>{o.description}</Markdown>
                    </li>
                  ))}
                </ul>{" "}
              </div>
              {gameSettings.isActive && !gameSettings.totalBetsPaid ? (
                <div>
                  Game result:
                  <Select
                    placeholder="Select game outcome..."
                    name="result"
                    options={[
                      ...definition.options.map((o: OptionType, k: number) => {
                        return {
                          value: k,
                          label: o.title,
                        };
                      }),
                      { value: definition.options.length, label: "Void game" },
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
                    onChange={(option, _actionMeta) => {
                      if (!option) return;
                      showModal(
                        <div>
                          <h3>Game outcome</h3>
                          <p>You have selected the following outcome:</p>
                          <ul>
                            <li>
                              <strong
                                style={{
                                  color:
                                    option.value < definition.options.length
                                      ? definition.options[option.value].color
                                      : "black",
                                }}
                              >
                                {option.label}
                              </strong>
                            </li>
                          </ul>
                          <p>
                            <strong>
                              Note that the outcome cannot be changed if some
                              participant has claimed a prize already
                            </strong>
                            . Are you completly sure you want to select this
                            option as the outcome of the game?
                          </p>
                          <div className="aligned">
                            <Button
                              onClick={() => handleSetOutcome(option.value)}
                            >
                              Set outcome
                            </Button>
                            <Button
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
                </div>
              ) : (
                ""
              )}
              <div>
                {!gameSettings.hasBets ? (
                  <Button
                    onClick={() => handleSave()}
                    disabled={
                      Boolean(Object.keys(errors).length) ||
                      Boolean(Object.keys(definitionErrors).length)
                    }
                  >
                    Save
                  </Button>
                ) : (
                  ""
                )}
                <Button>
                  <Link href={`/admin`}>
                    <a>Go Back</a>
                  </Link>
                </Button>
              </div>
            </>
          )}
          <Modal modalId={"definition"} modals={modals} setIsOpen={setModals}>
            <div>
              <h3>Warning message</h3>
              <div>
                <p>Used to inform users about unexpected events or delays.</p>
                <MDEditor
                  value={definition.warning}
                  onChange={(text: any) =>
                    setDefinition({ ...definition, warning: text })
                  }
                  {...mkEditorDefaults}
                />
              </div>
              <label>
                <span>Game title</span>
                <Input
                  name="title"
                  type="text"
                  maxLength={64}
                  placeholder="Game title"
                  className={
                    definitionErrors.hasOwnProperty("title") ? "error" : null
                  }
                  value={definition.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateDefinition("title", e.target.value)
                  }
                />
              </label>
              <label>
                <span>Description</span>
                <MDEditor
                  value={definition.description}
                  className={
                    definitionErrors.hasOwnProperty("description")
                      ? styles.MDEditorError
                      : null
                  }
                  onChange={(text: any) =>
                    handleUpdateDefinition("description", text.slice(0, 1000))
                  }
                  {...mkEditorDefaults}
                />
              </label>
              <h3>Options</h3>
              {definitionErrors.hasOwnProperty("options") ? (
                <p>{definitionErrors.options}</p>
              ) : (
                ""
              )}
              <ul>
                {definition.options.map((o: OptionType, k: number) => (
                  <li key={`descOpt-${k}`}>
                    <label>
                      <span>
                        Option{" "}
                        <Button
                          onClick={() =>
                            setDefinition({
                              ...definition,
                              options: [
                                ...definition.options,
                                {
                                  title: `TypeOption${
                                    definition.options.length + 1
                                  }`,
                                  description: "",
                                  color: "#000000",
                                },
                              ],
                            })
                          }
                        >
                          +
                        </Button>
                      </span>
                      <Input
                        name="title"
                        type="text"
                        maxLength={32}
                        placeholder="Option name"
                        value={o.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleUpdateOption("title", k, e.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span>color</span>
                      <Input
                        type="color"
                        value={o.color}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleUpdateOption("color", k, e.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <MDEditor
                        value={o.description}
                        height={85}
                        onChange={(text: any) =>
                          handleUpdateOption(
                            "description",
                            k,
                            text.slice(0, 64)
                          )
                        }
                        {...mkEditorDefaults}
                      />
                    </label>
                    <Button
                      onClick={() =>
                        setDefinition({
                          ...definition,
                          options: definition.options.filter(
                            (_: OptionType, index: number) => index !== k
                          ),
                        })
                      }
                    >
                      -
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="aligned">
                <Button onClick={() => handleSaveDefinition()}>Save</Button>{" "}
                <Button
                  onClick={() => setModals({ ...modals, definition: false })}
                >
                  Cancel
                </Button>
              </div>
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
        </main>
      )}
    </div>
  );
};

export default Game;
