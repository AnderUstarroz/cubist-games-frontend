import type { NextPage } from "next";
import Head from "next/head";
import useSWR from "swr";
import Image from "next/image";
import styles from "../../styles/GamesSettings.module.scss";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Button from "../../components/button";
import { BundlrWrapper } from "../../components/utils/bundlr";

import {
  DefaultSettingsInputType,
  ProfitShareInputType,
} from "../types/game-settings";

import {
  Bundlr,
  FileType,
  FilesType,
  initSolanaProgram,
  SolanaProgramType,
} from "@cubist-collective/cubist-games-lib";
import {
  parseFloatInput,
  DEFAULT_DECIMALS,
} from "../../components/utils/number";
import {
  validateCombinedInput,
  validateInput,
} from "../../components/validation/settings";
import { SettingsError } from "../../components/validation/errors";
import {
  addProfitShare,
  profitSharingCompleted,
} from "../../components/utils/game-settings";
import { ReactNode } from "react";
import { fetcher } from "../../components/utils/requests";

const Notification = dynamic(() => import("../../components/notification"));
const Input = dynamic(() => import("../../components/input"));
const Checkbox = dynamic(() => import("../../components/checkbox"));
const Modal = dynamic(() => import("../../components/modal"));

const Settings: NextPage = () => {
  const { connection } = useConnection();
  const { data } = useSWR("/api/idl", fetcher);
  const { publicKey, wallet } = useWallet();
  const [files, setFiles] = useState<FilesType>({});
  const [maxDecimals, setMaxDecimals] = useState<number | null>(null);
  const [bundlr, setBundlr] = useState<Bundlr | undefined>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [solanaProgram, setSolanaProgram] = useState<SolanaProgramType | null>(
    null
  );
  const [settings, setSettings] = useState<DefaultSettingsInputType>({
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
    profitSharing: [],
  });
  const [modals, setModals] = useState({
    main: false,
  });
  const [mainModalContent, setMainModalContent] = useState<ReactNode>(null);

  const showModal = (content: any) => {
    setMainModalContent(content);
    setModals({ ...modals, main: true });
  };

  const handleUpdateSettings = (key: string, value: any) => {
    delete errors[key];
    setErrors(errors);
    try {
      validateInput(key, value);
      validateCombinedInput(key, settings);
    } catch (error) {
      if (error instanceof SettingsError) {
        setErrors({ [error.code]: error.message });
        if (error.code != "profitSharing")
          toast.custom(
            <Notification message={error.message} variant="error" />,
            {
              duration: 2500,
            }
          );
      }
    }
    setSettings({ ...settings, [key]: value });
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
    if (maxDecimals) return maxDecimals;
    setMaxDecimals(DEFAULT_DECIMALS);
    return DEFAULT_DECIMALS;
  };

  useEffect(() => {
    (async () => {
      // Wallet connected
      if (publicKey && wallet) {
        setBundlr(await BundlrWrapper(connection, wallet.adapter));
        if (!solanaProgram) {
          setSolanaProgram(
            await initSolanaProgram(
              JSON.parse(data),
              connection,
              wallet.adapter
            )
          );
        }
      }
    })();
  }, [publicKey, wallet, connection]);

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
                    parseFloatInput(e.target.value, 0)
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
                value={settings.fireThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "fireThreshold",
                    parseFloatInput(e.target.value, settings.fireThreshold)
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
                value={settings.minStake}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "minStake",
                    parseFloatInput(e.target.value, settings.minStake)
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
                value={settings.minStep}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "minStep",
                    parseFloatInput(e.target.value, settings.minStep)
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
                                parseFloatInput(e.target.value, 0)
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
          <fieldset className={styles.grid}>
            <h2>Terms &amp; Conditions</h2>

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

            {/* stake_buttons: Vec<u64>,
    design_templates: Vec<String>, // Up to two alphanumeric char
    profit_sharing: Vec<TreasuryShare>,
    terms: Vec<TermsPDA>,
 */}
          </fieldset>
          <Modal modalId={"main"} modals={modals} setIsOpen={setModals}>
            {mainModalContent}
          </Modal>
        </main>
      )}
    </div>
  );
};

export default Settings;
