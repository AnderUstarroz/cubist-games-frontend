import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import Image from "next/image";
import styles from "../../styles/GamesSettings.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Button from "../../components/button";
import { BundlrWrapper } from "../../components/utils/bundlr";
import { PublicKey } from "@solana/web3.js";
import {
  DefaultSettingsInputType,
  ProfitShareInputType,
  TermsInputsType,
} from "../types/game-settings";

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
  terms_pda,
  lamports_to_sol,
  solana_to_usd,
} from "@cubist-collective/cubist-games-lib";
import {
  parse_float_input,
  human_number,
  DEFAULT_DECIMALS,
} from "../../components/utils/number";
import {
  validateCombinedInput,
  validateInput,
} from "../../components/validation/settings";
import { SettingsError } from "../../components/validation/errors";
import {
  addProfitShare,
  rustToInputsSettings,
  profitSharingCompleted,
  inputsToRustSettings,
} from "../../components/utils/game-settings";
import { ReactNode } from "react";
import {
  fetcher,
  multi_request,
  new_domain,
} from "../../components/utils/requests";
import { flashError, flashMsg } from "../../components/utils/helpers";
import { RechargeArweaveType } from "../../components/recharge-arweave/types";
import { AnimatePresence, motion } from "framer-motion";
import { AnchorError } from "@project-serum/anchor";

const Input = dynamic(() => import("../../components/input"));
const Textarea = dynamic(() => import("../../components/textarea"));
const Checkbox = dynamic(() => import("../../components/checkbox"));
const RechargeArweave = dynamic(
  () => import("../../components/recharge-arweave")
);
const Modal = dynamic(() => import("../../components/modal"));

const Settings: NextPage = () => {
  const { connection } = useConnection();
  const { data } = useSWR("/api/idl", fetcher);
  const { publicKey, wallet } = useWallet();
  const [authority, setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [configExists, setConfigExists] = useState<boolean>(false);
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
  const [maxDecimals, setMaxDecimals] = useState<number | null>(null);
  const [bundlr, setBundlr] = useState<Bundlr | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [termsErrors, setTermsErrors] = useState<{
    [key: string]: string;
  }>({});
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );
  const [settings, setSettings] = useState<DefaultSettingsInputType>({
    https: true, // Populated on page load using window.location.protocol
    domain: "", // Populated on page load using window.location.host
    fee: 10,
    showPot: true,
    useCategories: false,
    allowReferral: true,
    fireThreshold: 100,
    minStake: 0.1,
    minStep: 0.1,
    customStakeButton: true,
    stakeButtons: [0.1, 0.25, 0.5, 1],
    designTemplatesHash: null,
    categoriesHash: null,
    profitSharing: [
      { treasury: process.env.NEXT_PUBLIC_AUTHORITY as string, share: 100 },
    ],
    terms: [],
  });
  const [terms, setTerms] = useState<TermsInputsType>({
    bump: null,
    id: "",
    title: "",
    description: "",
  });
  const [modals, setModals] = useState({
    main: false,
    terms: false,
  });
  const [mainModalContent, setMainModalContent] = useState<ReactNode>(null);

  const showModal = (content: any) => {
    setMainModalContent(content);
    setModals({ ...modals, main: true });
  };
  const validateSettingsField = (
    key: string,
    value: any,
    nameSpace: string = ""
  ): boolean => {
    try {
      validateInput(key, value, nameSpace);
      validateCombinedInput(
        key,
        { Settings: settings, Terms: terms },
        nameSpace
      );
      return true;
    } catch (error) {
      if (error instanceof SettingsError) {
        switch (nameSpace) {
          case "Terms":
            setTermsErrors({ ...termsErrors, [error.code]: error.message });
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

  const handleUpdateSettings = (key: string, value: any) => {
    delete errors[key];
    setErrors(errors);
    validateSettingsField(key, value);
    setSettings({ ...settings, [key]: value });
  };

  const handleUpdateTerms = (key: string, value: any) => {
    delete termsErrors[key];
    setTermsErrors(termsErrors);
    validateSettingsField(key, value, "Terms");
    setTerms({ ...terms, [key]: value });
  };

  const handleSave = () => {
    // Update Domain if has changed
    let config = new_domain(settings.domain)
      ? {
          ...settings,
          https: window.location.protocol === "https:",
          domain: window.location.host,
        }
      : settings;
    for (const [key, value] of Object.entries(config)) {
      if (!validateSettingsField(key, value)) return;
    }
    (async () => {
      try {
        configExists
          ? // Update existing config
            await solanaProgram?.methods
              .updateConfig(inputsToRustSettings(config, getMaxDecimals()))
              .accounts({
                authority: authority,
                config: pdas[0][0],
              })
              .rpc()
          : // Create new Config
            await solanaProgram?.methods
              .initializeConfig(inputsToRustSettings(config, getMaxDecimals()))
              .accounts({
                authority: authority,
                config: pdas[0][0],
                stats: pdas[1][0],
              })
              .rpc();
        flashMsg("Configuration saved!", "success");
      } catch (error) {
        if (!(error instanceof AnchorError)) {
          throw error;
        }
        flashMsg(`${error.error.errorMessage}`);
      }
    })();
  };

  const handleSaveTerms = async () => {
    for (const [key, value] of Object.entries(terms)) {
      if (!validateSettingsField(key, value, "Terms")) return;
    }
    if (!bundlr) return;
    const termsJSONString = JSON.stringify(terms);
    const [balance, [termsPda, termsBump], price] = await multi_request([
      [bundlr.balance, []],
      [terms_pda, [authority, terms.id]],
      [bundlr.getPrice, [Buffer.byteLength(termsJSONString, "utf8")]],
    ]);
    if (price.gte(balance)) {
      const requiredLamports = balance.toNumber() - price.toNumber();
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
        decimals: getMaxDecimals(),
      });
      return;
    }
    const arweaveHash = await bundlr?.uploadJSON(termsJSONString);
    try {
      terms.bump
        ? // Update existing Terms & Conditions
          await solanaProgram?.methods
            .updateTerms(terms.id as string, arweaveHash as string)
            .accounts({
              authority: authority,
              config: pdas[0][0],
              terms: termsPda,
            })
            .rpc()
        : // Create new Terms & Conditions
          await solanaProgram?.methods
            .createTerms(terms.id as string, arweaveHash as string)
            .accounts({
              authority: authority,
              config: pdas[0][0],
              terms: termsPda,
            })
            .rpc();
      flashMsg("Terms uploaded to Arweave", "success");
      // Add the new terms to the vector
      if (!terms.bump) {
        setSettings({
          ...settings,
          terms: settings.terms.concat([{ id: terms.id, bump: termsBump }]),
        });
      }
    } catch (error) {
      if (!(error instanceof AnchorError)) {
        throw error;
      }
      flashMsg(`${error.error.errorMessage}`);
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
    } catch (error) {
      setRechargeArweave({ ...rechargeArweave, loading: false });
    }
  };

  const handleUpdateProfitSharing = (
    key: number,
    field: string,
    value: any
  ): ProfitShareInputType[] => {
    let profitSharing = settings.profitSharing;
    //@ts-ignore
    profitSharing[key][field] = value;
    return profitSharing;
  };

  const getMaxDecimals = () => {
    // Calculate max decimals (defaults to 9 for SOL and default tokens)
    // @TODO modify this function when tokens are available
    if (maxDecimals) return maxDecimals;
    setMaxDecimals(DEFAULT_DECIMALS);
    return DEFAULT_DECIMALS;
  };
  // Init Bundlr
  useEffect(() => {
    (async () => {
      setSolUsdPrice(await solana_usd_price());
    })();
  }, []);

  // Init Bundlr
  useEffect(() => {
    if (!publicKey || !wallet || bundlr) return;
    (async () => {
      setBundlr(await BundlrWrapper(connection, wallet.adapter));
    })();
  }, [publicKey, wallet, connection, bundlr]);

  // Init Program and PDAs
  useEffect(() => {
    if (!publicKey || !wallet || !data || solanaProgram) return;
    (async () => {
      setPdas(
        await flashError(fetch_pdas, [
          [config_pda, authority],
          [stats_pda, authority],
        ])
      );
      setSolanaProgram(
        await initSolanaProgram(JSON.parse(data), connection, wallet.adapter)
      );
    })();
  }, [publicKey, wallet, connection, data, solanaProgram, authority]);

  // Init Config
  useEffect(() => {
    if (!solanaProgram || !publicKey) return;
    (async () => {
      const [configPDA, _] = await config_pda(publicKey as PublicKey);
      try {
        const config = await solanaProgram.account.config.fetch(configPDA);
        setConfigExists(true);
        setSettings(rustToInputsSettings(config, getMaxDecimals()));
      } catch (_err) {
        setConfigExists(false);
      }
    })();
  }, [solanaProgram, publicKey]);

  const handleUpload = async (file: FileType) => {
    if (!bundlr || !publicKey) {
      return;
    }
    console.log("Wallet:", bundlr.address);
    const price = await bundlr.getPrice(file.size);
    console.log("Price works!", price);
    // const price = await bundlrMethod(bundlr, "getPrice", [file.size]);
    // const balance_wallet = await connection.getBalance(publicKey);
    // const balance_bundlr = await bundlrMethod(bundlr, "balance", [
    //   publicKey as PublicKey,
    // ]);
    // console.log(
    //   `Upload cost: ${bundlr.lamportsToSol(price).toString()} ${bundlr.ticker}`
    // );
    // console.log(
    //   "Bundler balance:",
    //   `${bundlr.lamportsToSol(balance_bundlr).toString()} ${bundlr.ticker}`
    // );
    // console.log(
    //   `Wallet balance: ${bundlr.lamportsToSol(balance_wallet).toString()} ${
    //     bundlr.ticker
    //   }`
    // );

    // await fund(bundler, 0.01);

    // bundler.utils.unitConverter(balance).toFixed(7, 2).toString()
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Games Settings</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!publicKey ? (
        <main className={styles.main}>Not registered</main>
      ) : (
        <main className={styles.main}>
          <h1 className={styles.title}>Games Settings</h1>
          <div>New games will be created with this settings by default</div>
          <fieldset className={styles.grid}>
            <h2>General</h2>
            <label>
              <span>Fee</span>
              <Input
                type="number"
                name="fee"
                className={errors.hasOwnProperty("fee") ? "error" : null}
                value={settings.fee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "fee",
                    parse_float_input(e.target.value, 0)
                  )
                }
                min={0}
                max={100}
                step={0.01}
              />
            </label>
            <label>
              <span>Show pot</span>
              <Checkbox
                name="showPot"
                value={settings.showPot}
                onClick={() =>
                  handleUpdateSettings("showPot", !settings.showPot)
                }
              />
            </label>
            <label>
              <span>Allow referral</span>
              <Checkbox
                name="allowReferral"
                value={settings.allowReferral}
                onClick={() =>
                  handleUpdateSettings("allowReferral", !settings.allowReferral)
                }
              />
            </label>
            <label>
              <span>Fire threshold</span>
              <Input
                name="fireThreshold"
                type="number"
                className={
                  errors.hasOwnProperty("fireThreshold") ? "error" : null
                }
                value={settings.fireThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "fireThreshold",
                    parse_float_input(e.target.value, settings.fireThreshold)
                  )
                }
                min={0}
                max={100000}
              />
            </label>
          </fieldset>
          {/* <fieldset className={styles.grid}>
            <h2>Categories</h2>

            <label>
              <span>Use categories</span>
              <Checkbox
                name="useCategories"
                value={settings.useCategories}
                onClick={() =>
                  handleUpdateSettings("useCategories", !settings.useCategories)
                }
              />
            </label>
          </fieldset> */}
          <fieldset className={styles.grid}>
            <h2>Stake buttons</h2>

            <label>
              <span>Minimum stake</span>
              <Input
                name="minStake"
                type="number"
                className={errors.hasOwnProperty("minStake") ? "error" : null}
                value={settings.minStake}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "minStake",
                    parse_float_input(e.target.value, settings.minStake)
                  )
                }
                min={1 / Math.pow(10, getMaxDecimals())}
                max={100}
              />
            </label>
            <label>
              <span>Min step</span>
              <Input
                name="minStep"
                type="number"
                className={errors.hasOwnProperty("minStep") ? "error" : null}
                value={settings.minStep}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "minStep",
                    parse_float_input(e.target.value, settings.minStep)
                  )
                }
                min={1 / Math.pow(10, getMaxDecimals())}
                max={100}
              />
            </label>
            <label>
              <span>Display custom stake button</span>
              <Checkbox
                name="customStakeButton"
                value={settings.customStakeButton}
                onClick={() =>
                  handleUpdateSettings(
                    "customStakeButton",
                    !settings.customStakeButton
                  )
                }
              />
            </label>
          </fieldset>
          <fieldset className={styles.grid}>
            <h2>
              Profit sharing{" "}
              {!profitSharingCompleted(settings.profitSharing) ? (
                <Button
                  onClick={() =>
                    addProfitShare(settings.profitSharing, handleUpdateSettings)
                  }
                >
                  +
                </Button>
              ) : (
                ""
              )}
            </h2>
            <ul className={styles.profitSharing}>
              {settings.profitSharing.map(
                (item: ProfitShareInputType, k: number) => (
                  <li key={`ps-${k}`}>
                    <span>
                      {item.treasury
                        ? `${item.treasury.slice(0, 4)}...${item.treasury.slice(
                            item.treasury.length - 4,
                            item.treasury.length
                          )}`
                        : "__________"}{" "}
                      -&gt; {item.share}%
                    </span>
                    <Button
                      onClick={() =>
                        setModals({ ...modals, [`mps-${k}`]: true })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateSettings(
                          "profitSharing",
                          settings.profitSharing.filter(
                            (_: ProfitShareInputType, index: number) =>
                              index !== k
                          )
                        )
                      }
                    >
                      -
                    </Button>
                    <Modal
                      modalId={`mps-${k}`}
                      modals={modals}
                      setIsOpen={setModals}
                    >
                      <div>
                        <Input
                          type="text"
                          name={`ps-treasury${k}`}
                          placeholder="Solana Public Key"
                          value={item.treasury}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateSettings(
                              "profitSharing",
                              handleUpdateProfitSharing(
                                k,
                                "treasury",
                                e.target.value
                              )
                            )
                          }
                        />{" "}
                        -&gt;{" "}
                        <Input
                          width={50}
                          type="text"
                          name={`ps-share${k}`}
                          value={item.share}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateSettings(
                              "profitSharing",
                              handleUpdateProfitSharing(
                                k,
                                "share",
                                parse_float_input(e.target.value, 0)
                              )
                            )
                          }
                        />
                        {errors.hasOwnProperty("profitSharing") ? (
                          <div>{errors["profitSharing"]}</div>
                        ) : (
                          ""
                        )}
                        <Button
                          onClick={() =>
                            setModals({ ...modals, [`mps-${k}`]: false })
                          }
                        >
                          Close
                        </Button>
                      </div>
                    </Modal>
                  </li>
                )
              )}
            </ul>
            {errors.hasOwnProperty("profitSharing")
              ? errors["profitSharing"]
              : ""}
          </fieldset>
          {configExists ? (
            <fieldset className={styles.grid}>
              <h2>
                Terms &amp; Conditions{" "}
                {settings.terms.length < MAX_TERMS ? (
                  <Button onClick={() => setModals({ ...modals, terms: true })}>
                    +
                  </Button>
                ) : (
                  ""
                )}
              </h2>

              <div>
                <Input
                  cType={"file"}
                  name="image"
                  accept="*"
                  onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                    setFiles(
                      Object.assign({}, files, await bundlr?.getFileData(e))
                    );
                  }}
                />
                <Modal modalId={"terms"} modals={modals} setIsOpen={setModals}>
                  <AnimatePresence>
                    {rechargeArweave.display ? (
                      <RechargeArweave
                        {...rechargeArweave}
                        handleUpdate={(value: string) =>
                          handleUpdateArweaveInput(value)
                        }
                        handleRechargeArweave={() => handleRechargeArweave()}
                      />
                    ) : (
                      <motion.div>
                        <h4>
                          {terms.bump ? "Edit" : "New"} Terms & Conditions
                        </h4>
                        <div>
                          <label>
                            <span>
                              ID:{" "}
                              <Input
                                type="text"
                                placeholder="E.g. NBA"
                                className={
                                  termsErrors.hasOwnProperty("id")
                                    ? "error"
                                    : null
                                }
                                name={`id`}
                                maxLength={4}
                                value={terms.id}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleUpdateTerms("id", e.target.value)}
                              />
                            </span>
                            <legend>
                              Codename to identify your Terms & Conditions
                            </legend>
                          </label>
                          <label>
                            Title:{" "}
                            <Input
                              type="text"
                              className={
                                termsErrors.hasOwnProperty("title")
                                  ? "error"
                                  : null
                              }
                              name={`title`}
                              maxLength={64}
                              value={terms.title}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => handleUpdateTerms("title", e.target.value)}
                            />
                          </label>
                          <label>
                            Description:{" "}
                            <Textarea
                              name={`description`}
                              className={
                                termsErrors.hasOwnProperty("description")
                                  ? "error"
                                  : null
                              }
                              maxLength={1000}
                              rows={4}
                              value={terms.description}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                handleUpdateTerms("description", e.target.value)
                              }
                            />
                          </label>
                          <Button
                            onClick={() => handleSaveTerms()}
                            disabled={Boolean(Object.keys(termsErrors).length)}
                          >
                            Save terms
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Modal>
              </div>
              {bundlr && Object.keys(files).length ? (
                <div>
                  <Button onClick={() => handleUpload(files["image"])}>
                    Upload file
                  </Button>
                </div>
              ) : (
                ""
              )}
            </fieldset>
          ) : (
            ""
          )}
          <Button
            onClick={() => handleSave()}
            disabled={Boolean(Object.keys(errors).length)}
          >
            Save
          </Button>
          <Modal modalId={"main"} modals={modals} setIsOpen={setModals}>
            {mainModalContent}
          </Modal>
        </main>
      )}
    </div>
  );
};

export default Settings;
