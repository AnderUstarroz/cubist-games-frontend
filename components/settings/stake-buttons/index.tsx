import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { StakeButtonsType } from "./types";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { AnimatePresence, motion } from "framer-motion";
import { MAX_STAKE_BUTTONS } from "@cubist-collective/cubist-games-lib";
import styles from "./StakeButtons.module.scss";

const Input = dynamic(() => import("../../input"));
const Checkbox = dynamic(() => import("../../checkbox"));
const Icon = dynamic(() => import("../../icon"));

export default function StakeButtons({
  settings,
  errors,
  handleUpdateSettings,
  handleValidateSettings,
  maxDecimals,
  showModal,
}: StakeButtonsType) {
  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>Stake buttons</h2>
        <fieldset>
          <div className="vAligned mobileCol">
            <div className="vAligned gap5 mb-med">
              <label
                className="vAligned gap5"
                onClick={() =>
                  handleUpdateSettings(
                    "customStakeButton",
                    !settings.customStakeButton
                  )
                }
              >
                <Checkbox
                  name="customStakeButton"
                  value={settings.customStakeButton}
                />
                <span>Allow custom stake </span>
              </label>
              <Icon
                cType="info"
                className="icon1"
                onClick={() =>
                  showModal(
                    <div>
                      <span className="infoIco">
                        <Icon cType="info" width={26} height={26} />
                      </span>
                      <h4 className="textCenter">Allow custom stake</h4>
                      <p>
                        Displays the stake input, so users can freely type the
                        amount to bet.
                      </p>
                    </div>
                  )
                }
              />
            </div>
            <div className={`vAligned gap0 mb-med ${styles.stakeInputs}`}>
              <label className="overlap">
                <Input
                  name="minStake"
                  type="number"
                  onFocus={(e: any) => e.target.select()}
                  className={errors.hasOwnProperty("minStake") ? "error" : null}
                  value={settings.minStake}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings(
                      "minStake",
                      parse_float_input(e.target.value, settings.minStake),
                      ["stakeButtons"]
                    )
                  }
                  onBlur={() =>
                    handleValidateSettings("minStake", settings.minStake)
                  }
                  min={1 / Math.pow(10, maxDecimals)}
                  max={100}
                />
                <span>Minimum stake </span>
                <Icon
                  cType="info"
                  className="icon1"
                  onClick={() =>
                    showModal(
                      <div>
                        <span className="infoIco">
                          <Icon cType="info" width={26} height={26} />
                        </span>
                        <h4 className="textCenter">Minimum stake</h4>
                        <p>The minimum amount allowed to place a bet.</p>
                      </div>
                    )
                  }
                />
              </label>
              <label className="overlap">
                <Input
                  name="minStep"
                  type="number"
                  onFocus={(e: any) => e.target.select()}
                  className={errors.hasOwnProperty("minStep") ? "error" : null}
                  value={settings.minStep}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings(
                      "minStep",
                      parse_float_input(e.target.value, settings.minStep),
                      ["stakeButtons"]
                    )
                  }
                  onBlur={() =>
                    handleValidateSettings("minStep", settings.minStep)
                  }
                  min={1 / Math.pow(10, maxDecimals)}
                  max={100}
                />
                <span>Min step </span>
                <Icon
                  cType="info"
                  className="icon1"
                  onClick={() =>
                    showModal(
                      <div>
                        <span className="infoIco">
                          <Icon cType="info" width={26} height={26} />
                        </span>
                        <h4 className="textCenter">Min step</h4>
                        <p>
                          The minimum amount in which a bet can be
                          increased/decreased.
                        </p>
                      </div>
                    )
                  }
                />
              </label>
            </div>
          </div>
          <h3 className="vAligned gap5">
            Default stake buttons{" "}
            <Icon
              cType="info"
              className="icon1"
              onClick={() =>
                showModal(
                  <div>
                    <span className="infoIco">
                      <Icon cType="info" width={26} height={26} />
                    </span>
                    <h4 className="textCenter">Default stake buttons</h4>
                    <p>
                      Shows buttons with predefined amounts for each game
                      option. This allows users to place bets quicker.
                    </p>
                  </div>
                )
              }
            />
            {settings.stakeButtons.length < MAX_STAKE_BUTTONS && (
              <span
                className="icon1"
                onClick={() =>
                  handleUpdateSettings("stakeButtons", [
                    ...settings.stakeButtons,
                    1,
                  ])
                }
              >
                +
              </span>
            )}
          </h3>
          <ul className={styles.stakeButtons}>
            {settings.stakeButtons.map((v: number, k: number) => (
              <li key={`stake-btn${k}`}>
                <Input
                  type="number"
                  value={v}
                  onFocus={(e: any) => e.target.select()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings(
                      "stakeButtons",
                      settings.stakeButtons.map((v: number, l: number) =>
                        k === l
                          ? parse_float_input(e.target.value, settings.minStake)
                          : v
                      ),
                      ["minStake", "minStep"]
                    )
                  }
                  onBlur={() =>
                    handleValidateSettings(
                      "stakeButtons",
                      settings.stakeButtons
                    )
                  }
                  min={settings.minStake}
                  step={settings.minStep}
                  max={100000}
                />{" "}
                <span
                  title="Remove share"
                  className="icon2"
                  onClick={() =>
                    handleUpdateSettings(
                      "stakeButtons",
                      settings.stakeButtons.filter(
                        (_: number, l: number) => l !== k
                      )
                    )
                  }
                >
                  —
                </span>
              </li>
            ))}
          </ul>
          {!!errors.hasOwnProperty("stakeButtons") && (
            <div className="errorMsg">{errors["stakeButtons"]}</div>
          )}
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
