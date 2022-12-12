import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import styles from "../../styles/GlobalSettings.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Button from "../../components/button";
import {
  BundlrWrapper,
  displayRechargeArweave,
} from "../../components/utils/bundlr";
import { PublicKey } from "@solana/web3.js";
import Router from "next/router";
import { ConfigInputType, TermsInputsType } from "../../types/game-settings";
import {
  Bundlr,
  initSolanaProgram,
  SolanaProgramType,
  config_pda,
  fetch_pdas,
  stats_pda,
  MAX_TERMS,
  solana_fiat_price,
  terms_pda,
  TermsType,
  arweave_json,
  system_config_pda,
  SYSTEM_AUTHORITY,
  SystemConfigType,
  StatsType,
  PDATypes,
} from "@cubist-collective/cubist-games-lib";
import { DEFAULT_DECIMALS } from "../../components/utils/number";
import {
  COMBINED_INPUTS,
  validateCombinedInput,
  validateInput,
} from "../../components/validation/settings";
import { SettingsError } from "../../components/validation/errors";
import {
  inputsToRustSettings,
  fetch_configs,
} from "../../components/utils/game-settings";
import { ReactNode } from "react";
import {
  fetcher,
  multi_request,
  new_domain,
} from "../../components/utils/requests";
import {
  flashError,
  flashMsg,
  is_authorized,
} from "../../components/utils/helpers";
import { RechargeArweaveType } from "../../components/recharge-arweave/types";
import { AnimatePresence, motion } from "framer-motion";
import { AnchorError } from "@project-serum/anchor";
import Link from "next/link";
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
import { DEFAULT_ANIMATION } from "../../components/utils/animation";

const AdminWelcome = dynamic(() => import("../../components/admin-welcome"));
const Input = dynamic(() => import("../../components/input"));
const Modal = dynamic(() => import("../../components/modal"));
const Profits = dynamic(() => import("../../components/settings/profits"));
const Icon = dynamic(() => import("../../components/icon"));
const Spinner = dynamic(() => import("../../components/spinner"));
const ReactTooltip = dynamic(() => import("react-tooltip"), { ssr: false });
const MDEditor = dynamic<MDEditorProps>(() => import("@uiw/react-md-editor"), {
  ssr: false,
});
const GeneralSettings = dynamic(
  () => import("../../components/settings/general")
);
const StakeButtons = dynamic(
  () => import("../../components/settings/stake-buttons")
);
const RechargeArweave = dynamic(
  () => import("../../components/recharge-arweave")
);

const EMPTY_TERMS: TermsInputsType = {
  bump: null,
  loading: false,
  id: "",
  title: "",
  description: "",
};
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

const GameSettings: NextPage = () => {
  const { connection } = useConnection();
  const { data } = useSWR("/api/idl", fetcher);
  const { publicKey, wallet } = useWallet();
  const [authority, _setAuthority] = useState<PublicKey>(
    new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY as string)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [configExists, setConfigExists] = useState<boolean>(false);
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
    closeModals: {},
  });
  const [maxDecimals, setMaxDecimals] = useState<number>(DEFAULT_DECIMALS);
  const [bundlr, setBundlr] = useState<Bundlr | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [termsErrors, setTermsErrors] = useState<{
    [key: string]: string;
  }>({});
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );
  const [systemConfig, setSystemConfig] = useState<SystemConfigType | null>(
    null
  );
  const [_stats, setStats] = useState<StatsType | null>(null);
  const [settings, setSettings] = useState<ConfigInputType>({
    https: true, // Populated on page load using window.location.protocol
    domain: "", // Populated on page load using window.location.host
    fee: 7,
    showPot: true,
    useCategories: false,
    allowReferral: true,
    fireThreshold: 100,
    minStake: 0.1,
    minStep: 0.1,
    customStakeButton: true,
    stakeButtons: [0.5, 1],
    designTemplatesHash: null,
    categoriesHash: null,
    profitSharing: [],
    terms: [],
  });
  const [terms, setTerms] = useState<TermsInputsType>(EMPTY_TERMS);
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
    nameSpace: string = "",
    updatedSettings: { [key: string]: any } = {}
  ): boolean => {
    try {
      const allSettings = {
        SystemConfig: systemConfig as SystemConfigType,
        Settings: settings,
        ...updatedSettings,
      };
      validateInput(key, value, nameSpace);
      validateCombinedInput(key, allSettings, nameSpace);
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
          flashMsg(error.message, "error", 3500);
        }
      }
    }
    return false;
  };

  const handleUpdateSettings = (key: string, value: any) => {
    delete errors[key];
    setErrors(errors);
    const updatedSettings = { ...settings, [key]: value };
    if (validateSettingsField(key, value, "", { Settings: updatedSettings })) {
      if (key in COMBINED_INPUTS) {
        COMBINED_INPUTS[key].map((input: string) => delete errors[input]);
        setErrors(errors);
      }
    }
    setSettings(updatedSettings);
  };

  const handleUpdateTerms = (key: string, value: any) => {
    delete termsErrors[key];
    setTermsErrors(termsErrors);
    const updatedTerms = { ...terms, [key]: value };
    validateSettingsField(key, value, "Terms", { Terms: updatedTerms });
    setTerms(updatedTerms);
  };

  const handleSave = () => {
    // Update Domain if has changed
    let config = new_domain(settings.domain)
      ? {
          ...settings,
          https: window.location.protocol === "https:",
          domain: window.location.host.slice(0, 32), // Cannot be longer than 32 char
        }
      : settings;
    for (const [key, value] of Object.entries(config)) {
      if (!validateSettingsField(key, value)) return;
    }
    (async () => {
      if (!pdas) {
        return;
      }
      try {
        setLoading(true);
        !configExists
          ? // Create new Config
            await solanaProgram?.methods
              .initializeConfig(inputsToRustSettings(config, maxDecimals))
              .accounts({
                authority: authority,
                systemConfig: pdas.systemConfig.pda,
                config: pdas.config.pda,
                stats: pdas.stats.pda,
              })
              .rpc()
          : // Update existing config
            await solanaProgram?.methods
              .updateConfig(inputsToRustSettings(config, maxDecimals))
              .accounts({
                authority: authority,
                systemConfig: pdas.systemConfig.pda,
                config: pdas.config.pda,
              })
              .rpc();

        flashMsg("Configuration saved!", "success");
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

  const handleSaveTerms = async () => {
    for (const [key, value] of Object.entries(terms)) {
      if (!validateSettingsField(key, value, "Terms")) return;
    }
    if (!bundlr || !solanaProgram || !pdas) return;
    const termsJSONString = JSON.stringify(
      (({ bump, loading, ...t }) => t)(terms)
    );
    const [balance, [termsPda, termsBump], price] = await multi_request([
      [bundlr.balance, []],
      [terms_pda, [authority, terms.id]],
      [bundlr.getPrice, [Buffer.byteLength(termsJSONString, "utf8")]],
    ]);
    // Reacharge Arweave when there is not enough balance
    if (
      displayRechargeArweave(
        price,
        balance,
        rechargeArweave,
        setRechargeArweave,
        solFiatPrice as number,
        maxDecimals
      )
    ) {
      return;
    }
    const arweaveHash = await bundlr?.uploadJSON(termsJSONString);
    setTerms({ ...terms, loading: true });
    flashMsg("Uploading Terms & Conditions to Arweave...", "success");
    // Check if Terms PDA already exists
    let termsPDAExists = true;
    try {
      await solanaProgram?.account.terms.fetch(termsPda);
    } catch (e) {
      termsPDAExists = false;
    }
    try {
      // Update existing Terms & Conditions
      if (termsPDAExists) {
        await solanaProgram.methods
          .updateTerms(terms.id as string, arweaveHash as string)
          .accounts({
            authority: authority,
            config: pdas.config.pda,
            terms: termsPda,
          })
          .rpc();
      } else {
        // Create new Terms & Conditions
        await solanaProgram.methods
          .createTerms(terms.id as string, arweaveHash as string)
          .accounts({
            authority: authority,
            config: pdas.config.pda,
            terms: termsPda,
          })
          .rpc();
        setSettings({
          ...settings,
          terms: settings.terms.concat([{ id: terms.id, bump: termsBump }]),
        });
      }
      setModals({ ...modals, terms: false });
      flashMsg(
        `${
          termsPDAExists ? "Updated" : "Created new"
        } Terms & Conditions successfully`,
        "success"
      );
    } catch (error) {
      if (!(error instanceof AnchorError)) {
        throw error;
      }
      flashMsg(`${error.error.errorMessage}`);
    } finally {
      setTerms({ ...terms, loading: false });
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
      console.error(error);
      setRechargeArweave({ ...rechargeArweave, loading: false });
    }
  };
  const handleEditTerms = async (termsId: string) => {
    setTerms({ ...terms, loading: true });
    setModals({ ...modals, terms: true });
    const [termsPda, termsBump] = await terms_pda(authority, termsId);
    const termsData = await solanaProgram?.account.terms.fetch(termsPda);
    const termsContent = await arweave_json(termsData?.arweaveHash as string);
    setTerms({
      bump: termsBump,
      loading: false,
      id: termsId,
      title: termsContent.title,
      description: termsContent.description,
    });
  };

  // Init Bundlr
  useEffect(() => {
    if (!publicKey || !wallet || bundlr) return;
    (async () => {
      setBundlr(await BundlrWrapper(connection, wallet.adapter));
    })();
  }, [publicKey, wallet, connection, bundlr]);

  // Step 1 - Init Program and PDAs
  useEffect(() => {
    if (!publicKey || !wallet || !data || solanaProgram) return;
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

  // Fetch Configs
  useEffect(() => {
    if (!solanaProgram || !pdas) return;
    (async () => {
      setConfigExists(
        await fetch_configs(
          settings,
          solanaProgram,
          pdas,
          setSystemConfig,
          setSettings,
          setStats,
          maxDecimals
        )
      );
    })();
  }, [solanaProgram, pdas]);

  return (
    <>
      <Head>
        <title>Global Settings</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href={process.env.NEXT_PUBLIC_FAVICON} />
      </Head>
      {!publicKey ? (
        <AdminWelcome />
      ) : (
        <div className={styles.content}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              <AnimatePresence>
                <motion.div className={styles.title}>
                  <h1>GLOBAL SETTINGS</h1>
                  <p>
                    New games will be created with the following settings by
                    default
                  </p>
                </motion.div>
              </AnimatePresence>

              <Profits
                systemConfig={systemConfig}
                settings={settings}
                errors={errors}
                showModal={showModal}
                handleUpdateSettings={handleUpdateSettings}
                modals={modals}
                setModals={setModals}
              />
              <GeneralSettings
                settings={settings}
                errors={errors}
                showModal={showModal}
                handleUpdateSettings={handleUpdateSettings}
              />
              <StakeButtons
                settings={settings}
                errors={errors}
                showModal={showModal}
                handleUpdateSettings={handleUpdateSettings}
                maxDecimals={maxDecimals}
              />
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
              <div className={styles.flexCols}>
                <AnimatePresence>
                  {!!configExists && (
                    <motion.section {...DEFAULT_ANIMATION}>
                      <h2>
                        Terms &amp; Conditions{" "}
                        {settings.terms.length < MAX_TERMS && (
                          <span
                            title="Add new Terms & Conditions"
                            className="icon1"
                            onClick={() => {
                              setTerms(EMPTY_TERMS);
                              setModals({ ...modals, terms: true });
                            }}
                          >
                            +
                          </span>
                        )}
                      </h2>
                      <fieldset key="tc">
                        <p>
                          Terms & Conditions templates to be attached to your
                          games.
                        </p>
                        <ul className={styles.tc}>
                          {settings.terms.map((t: TermsType, k: number) => (
                            <li
                              key={`terms-${t.id}`}
                              title={`Edit ${t.id}`}
                              onClick={() => handleEditTerms(t.id)}
                            >
                              <label className={`optBg${k % 25}`}>{t.id}</label>
                              <Icon cType="edit" className="icon1" />
                            </li>
                          ))}
                        </ul>
                        <div>
                          <Modal
                            modalId={"terms"}
                            modals={modals}
                            setIsOpen={setModals}
                          >
                            <AnimatePresence>
                              {rechargeArweave.display ? (
                                <RechargeArweave
                                  {...rechargeArweave}
                                  handleUpdate={(value: string) =>
                                    handleUpdateArweaveInput(value)
                                  }
                                  handleRechargeArweave={() =>
                                    handleRechargeArweave()
                                  }
                                />
                              ) : (
                                <motion.div key={"tc-modal"}>
                                  <h4>
                                    {terms.bump ? "Edit" : "New"} Terms &
                                    Conditions
                                  </h4>
                                  {terms.loading ? (
                                    <Spinner />
                                  ) : (
                                    <div>
                                      <div className="mb-med">
                                        <label className="overlap">
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
                                            readOnly={terms.bump ? true : false}
                                            onChange={(
                                              e: React.ChangeEvent<HTMLInputElement>
                                            ) =>
                                              handleUpdateTerms(
                                                "id",
                                                e.target.value
                                              )
                                            }
                                          />
                                          <span>ID</span>
                                          <em
                                            data-tip="Codename to identify your Terms & Conditions"
                                            data-for="termsTooltip"
                                          >
                                            <Icon
                                              cType="info"
                                              className="icon1"
                                            />
                                          </em>
                                        </label>
                                      </div>
                                      <div className="mb-med">
                                        <label className="overlap">
                                          <Input
                                            type="text"
                                            className={
                                              termsErrors.hasOwnProperty(
                                                "title"
                                              )
                                                ? "error"
                                                : null
                                            }
                                            name={`title`}
                                            maxLength={64}
                                            value={terms.title}
                                            onChange={(
                                              e: React.ChangeEvent<HTMLInputElement>
                                            ) =>
                                              handleUpdateTerms(
                                                "title",
                                                e.target.value
                                              )
                                            }
                                          />
                                          <span>Title</span>
                                        </label>
                                      </div>
                                      <div className="mb-med">
                                        <div className={"overlap"}>
                                          <MDEditor
                                            name={`description`}
                                            value={terms.description}
                                            className={
                                              termsErrors.hasOwnProperty(
                                                "description"
                                              )
                                                ? styles.MDEditorError
                                                : null
                                            }
                                            onChange={(text: any) =>
                                              handleUpdateTerms(
                                                "description",
                                                text.slice(0, 1000)
                                              )
                                            }
                                            {...mkEditorDefaults}
                                          />
                                          <span>Description:</span>
                                        </div>
                                      </div>
                                      <div className="vAligned centered">
                                        <Button
                                          onClick={() => handleSaveTerms()}
                                          disabled={Boolean(
                                            Object.keys(termsErrors).length
                                          )}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          className="button1"
                                          onClick={() =>
                                            setModals({
                                              ...modals,
                                              terms: false,
                                            })
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Modal>
                        </div>
                      </fieldset>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                <motion.div className="vAligned centered mb-big">
                  <Button
                    onClick={() => handleSave()}
                    disabled={Boolean(Object.keys(errors).length)}
                  >
                    Save
                  </Button>
                  <Button className="button1">
                    <Link href={`/admin`}>
                      <a>Cancel</a>
                    </Link>
                  </Button>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      )}
      <Modal modalId={"main"} modals={modals} setIsOpen={setModals}>
        {mainModalContent}
      </Modal>
      <ReactTooltip id="termsTooltip" globalEventOff="click" />
    </>
  );
};

export default GameSettings;
