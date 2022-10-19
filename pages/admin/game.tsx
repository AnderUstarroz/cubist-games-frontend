import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import NextImage from "next/image";
import styles from "../../styles/GamesSettings.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Button from "../../components/button";
import { BundlrWrapper } from "../../components/utils/bundlr";
import { PublicKey, Transaction } from "@solana/web3.js";
import Router, { useRouter } from "next/router";
import Select from "react-select";
import {
  ConfigInputType,
  GameSettingsInputType,
  GameStateType,
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
} from "../../components/utils/game-settings";
import { ReactNode } from "react";
import { fetcher, multi_request } from "../../components/utils/requests";
import { flashError, flashMsg } from "../../components/utils/helpers";
import { RechargeArweaveType } from "../../components/recharge-arweave/types";
import Link from "next/link";
import { process_image } from "../../components/utils/image";

const Input = dynamic(() => import("../../components/input"));
const ImageInput = dynamic(() => import("../../components/image-input"));
const Checkbox = dynamic(() => import("../../components/checkbox"));
const Icon = dynamic(() => import("../../components/icon"));
const Modal = dynamic(() => import("../../components/modal"));
const Info = dynamic(() => import("../../components/settings/info"));
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

const Game: NextPage = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const { data } = useSWR("/api/idl", fetcher);
  const { publicKey, wallet, sendTransaction } = useWallet();
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [solUsdPrice, setSolUsdPrice] = useState<number | null>(null);
  const [pdas, setPdas] = useState<any>(null);
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
  const [modals, setModals] = useState({
    main: false,
    terms: false,
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
    let config = gameSettings;
    for (const [key, value] of Object.entries(config)) {
      if (!validateSettingsField(key, value)) return;
    }
    // (async () => {
    //   try {
    //     configExists
    //       ? // Update existing config
    //         await solanaProgram?.methods
    //           .updateConfig(inputsToRustSettings(config, maxDecimals))
    //           .accounts({
    //             authority: authority,
    //             systemConfig: pdas[0][0],
    //             config: pdas[1][0],
    //           })
    //           .rpc()
    //       : // Create new Config
    //         await solanaProgram?.methods
    //           .initializeConfig(inputsToRustSettings(config, maxDecimals))
    //           .accounts({
    //             authority: authority,
    //             systemConfig: pdas[0][0],
    //             config: pdas[1][0],
    //             stats: pdas[2][0],
    //           })
    //           .rpc();
    //     flashMsg("Configuration saved!", "success");
    //     Router.push("/admin");
    //   } catch (error) {
    //     if (!(error instanceof AnchorError)) {
    //       throw error;
    //     }
    //     flashMsg(`${error.error.errorMessage}`);
    //   }
    // })();
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
    } catch (error) {
      setRechargeArweave({ ...rechargeArweave, loading: false });
    }
  };

  // Init
  useEffect(() => {
    if (solUsdPrice) return;
    (async () => {
      setSolUsdPrice(await solana_usd_price());
      setMaxDecimals(DEFAULT_DECIMALS);
    })();
  }, []);

  // Init Bundlr
  useEffect(() => {
    if (!publicKey || !wallet || bundlr) return;
    (async () => {
      setBundlr(await BundlrWrapper(connection, wallet.adapter));
    })();
  }, [publicKey, wallet, connection, bundlr]);

  // STEP 1 - Init Program and PDAs
  useEffect(() => {
    if (!publicKey || !wallet || !data || solanaProgram) return;
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
  }, [publicKey, wallet, connection, data, solanaProgram, authority]);

  // STEP 2 - Fetch Configs
  useEffect(() => {
    if (!solanaProgram || !pdas) return;
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
    if (!stats || !solanaProgram || !config) return;
    (async () => {
      const gameId = new BN(
        router.query.id
          ? (router.query.id as string)
          : stats.totalGames.toNumber() + 1
      );
      const [gamePda, _bump] = await game_pda(authority, new BN(gameId));
      try {
        // Populate Settings using fetched Game
        setGameSettings(
          rustToInputsSettings(
            await solanaProgram.account.game.fetch(gamePda),
            maxDecimals
          )
        );
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

  const displayRechargeArweave = (price: BN, balance: BN) => {
    // Reacharge Arweave when there is not enough balance
    if (price.gte(balance)) {
      const requiredLamports = price.toNumber() - balance.toNumber();
      setRechargeArweave({
        ...rechargeArweave,
        display: true,
        value: Math.max(
          ...[1 / (solUsdPrice as number), lamports_to_sol(requiredLamports)]
        ),
        requiredSol: lamports_to_sol(requiredLamports),
        solBalance: lamports_to_sol(balance.toNumber()),
        requiredUsd: solana_to_usd(
          lamports_to_sol(requiredLamports),
          solUsdPrice as number
        ),
        recommendedSol: 1 / (solUsdPrice as number),
        decimals: maxDecimals,
      });
      return true;
    }
    return false;
  };

  const handleUploadImage = async (name: string, file: FileType) => {
    if (!bundlr || !publicKey) {
      throw new Error("Bundlr or wallet not initialized");
    }

    const [balance, price] = await multi_request([
      [bundlr.balance, []],
      [bundlr.getPrice, [file.size]],
    ]);
    if (displayRechargeArweave(price, balance)) {
      setModals({ ...modals, rechargeArweave: true });
      return;
    }
    file.arweave_hash = await bundlr?.uploadFile(file);
    if (file.arweave_hash) {
      setFiles({ ...files, [name]: file });
      setGameSettings({ ...gameSettings, [`${name}Hash`]: file.arweave_hash });
      flashMsg(
        "Image was successfully uploaded, but you still need to save the game.",
        "info"
      );
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Game</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!publicKey ? (
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
                        <Link href="/admin/games-settings">
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
                  file={files.image ? files.image : null}
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
                <Button
                  onClick={() => handleSave()}
                  disabled={Boolean(Object.keys(errors).length)}
                >
                  Save
                </Button>
                <Link href={`${process.env.NEXT_PUBLIC_HOST}/admin`}>
                  <a>Cancel</a>
                </Link>
              </div>
            </>
          )}
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
