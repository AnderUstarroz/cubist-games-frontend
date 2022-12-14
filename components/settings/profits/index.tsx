import { human_number, parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { ProfitsPropsType } from "./types";
import { ProfitShareInputType } from "../../../types/game-settings";
import styles from "./Profits.module.scss";
import {
  addProfitShare,
  profitSharingCompleted,
} from "../../utils/game-settings";
import { num_format, short_key } from "@cubist-collective/cubist-games-lib";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { AnimatePresence, motion } from "framer-motion";

const Input = dynamic(() => import("../../input"));
const Button = dynamic(() => import("../../button"));
const Icon = dynamic(() => import("../../icon"));
const Modal = dynamic(() => import("../../modal"));
const Spinner = dynamic(() => import("../../spinner"));

export default function Profits({
  systemConfig,
  settings,
  errors,
  handleUpdateSettings,
  showModal,
  modals,
  setModals,
}: ProfitsPropsType) {
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

  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>Profits</h2>
        <fieldset className={styles.fieldset}>
          {systemConfig ? (
            <>
              <div>
                <h3 className="vAligned">
                  Profit Sharing{" "}
                  {!profitSharingCompleted(settings.profitSharing) && (
                    <span
                      className="icon1"
                      onClick={() =>
                        addProfitShare(
                          settings.profitSharing,
                          handleUpdateSettings
                        )
                      }
                    >
                      +
                    </span>
                  )}
                </h3>
                <p>
                  Defines which wallets will receive the profits of the game.
                  The 100% of the shares represents the total profits generated
                  by the defined fee (
                  <strong>{human_number(settings.fee, 2)}%</strong>)
                </p>
                <ul>
                  {settings.profitSharing.map(
                    (item: ProfitShareInputType, k: number) => (
                      <li key={`share-${k}`}>
                        <div className="vAligned">
                          <em
                            title="Remove share"
                            className="icon2"
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
                            —
                          </em>
                          <span
                            className="vAligned"
                            onClick={() =>
                              setModals({ ...modals, [`mps-${k}`]: true })
                            }
                            title="Edit share"
                          >
                            <em className="vAligned icon0">
                              <Icon cType="coins" width={14} />
                              {human_number(item.share, 2)}%
                            </em>
                            <Icon cType="arrow" color={"var(--color12)"} />
                            <em className="vAligned icon0">
                              {item.treasury
                                ? `${short_key(item.treasury)}`
                                : "________"}
                            </em>
                          </span>
                          {item.treasury ===
                            systemConfig?.treasury.toBase58() && (
                            <Icon
                              cType="info"
                              className="icon1"
                              onClick={() =>
                                showModal(
                                  <div>
                                    <span className="infoIco">
                                      <Icon
                                        cType="info"
                                        width={26}
                                        height={26}
                                      />
                                    </span>
                                    <h4 className="textCenter">Service fee</h4>
                                    <p>
                                      The program keeps the{" "}
                                      {human_number(
                                        systemConfig.profitFee / 100,
                                        2
                                      )}
                                      % of the total pot as a service fee, which
                                      corresponds to a{" "}
                                      {human_number(
                                        systemConfig.profitFee / settings.fee,
                                        2
                                      )}
                                      % share of the current game fee:{" "}
                                      <strong>{settings.fee}%</strong>.
                                    </p>
                                  </div>
                                )
                              }
                            />
                          )}
                        </div>
                        <Modal
                          modalId={`mps-${k}`}
                          modals={modals}
                          setIsOpen={setModals}
                        >
                          <div className={styles.editShare}>
                            <h4>Edit share</h4>
                            <div className="vAligned">
                              <label className="overlap">
                                <Input
                                  type="number"
                                  name={`ps-share${k}`}
                                  value={item.share}
                                  onFocus={(e: any) => e.target.select()}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    handleUpdateSettings(
                                      "profitSharing",
                                      handleUpdateProfitSharing(
                                        k,
                                        "share",
                                        num_format(
                                          parse_float_input(
                                            e.target.value,
                                            0,
                                            100
                                          ),
                                          2
                                        )
                                      )
                                    )
                                  }
                                />
                                <span>Share</span>
                                <em className="icon1">%</em>
                              </label>{" "}
                              <Icon cType="arrow" color={"var(--color12)"} />{" "}
                              <label className="overlap fullCol">
                                <Input
                                  type="text"
                                  name={`ps-treasury${k}`}
                                  className="fullWidth"
                                  placeholder="Solana Public Key"
                                  value={item.treasury}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    handleUpdateSettings(
                                      "profitSharing",
                                      handleUpdateProfitSharing(
                                        k,
                                        "treasury",
                                        e.target.value
                                      )
                                    )
                                  }
                                />
                                <span>Public key</span>
                              </label>{" "}
                            </div>
                            {!!errors.hasOwnProperty("profitSharing") && (
                              <div className="errorMsg">
                                {errors["profitSharing"]}
                              </div>
                            )}
                            <Button
                              className="cancel"
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
                {!!errors.hasOwnProperty("profitSharing") && (
                  <div className="errorMsg">{errors["profitSharing"]}</div>
                )}
              </div>
              <div className={styles.fee}>
                <label className="overlap">
                  <Input
                    type="number"
                    name="fee"
                    style={{ width: 260 }}
                    className={errors.hasOwnProperty("fee") ? "error" : null}
                    value={settings.fee}
                    onFocus={(e: any) => e.target.select()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleUpdateSettings(
                        "fee",
                        num_format(parse_float_input(e.target.value, 0, 100), 2)
                      )
                    }
                    min={0}
                    max={100}
                    step={0.01}
                  />
                  <span>Fee</span>
                  <Icon
                    cType="info"
                    className="icon1"
                    onClick={() =>
                      showModal(
                        <div>
                          <span className="infoIco">
                            <Icon cType="info" width={26} height={26} />
                          </span>
                          <h4 className="textCenter">Fee</h4>
                          <p>
                            Defines the percentage of benefits collected. This
                            fee will be extracted from all placed bets (total
                            pot).
                          </p>
                        </div>
                      )
                    }
                  />
                </label>
              </div>
            </>
          ) : (
            <Spinner />
          )}
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
