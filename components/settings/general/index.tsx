import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { GeneralSettingsType } from "./types";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";

const Input = dynamic(() => import("../../input"));
const Checkbox = dynamic(() => import("../../checkbox"));
const Icon = dynamic(() => import("../../icon"));

export default function GeneralSettings({
  settings,
  errors,
  handleUpdateSettings,
  showModal,
}: GeneralSettingsType) {
  const TZ = `Time zone: ${
    Intl.DateTimeFormat().resolvedOptions().timeZone
  } (${format(new Date(), "OOOO")})`;
  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>General</h2>
        <fieldset>
          {settings.openTime ? (
            <label>
              <span>
                Open time{" "}
                <Icon
                  cType="info"
                  onClick={() =>
                    showModal(
                      <div>
                        <h4>Open time</h4>
                        <p>
                          Defines the time at which the game will start being
                          displayed and accepting bets.
                        </p>
                      </div>
                    )
                  }
                />
              </span>
              <Input
                type="datetime-local"
                name="openTime"
                className={errors.hasOwnProperty("openTime") ? "error" : null}
                value={settings.openTime.toISOString().slice(0, 16)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "openTime",
                    new Date(e.target.valueAsNumber)
                  )
                }
              />
              <div>{TZ}</div>
            </label>
          ) : (
            ""
          )}{" "}
          {settings.closeTime ? (
            <label className="overlap">
              <Input
                type="datetime-local"
                name="closeTime"
                className={errors.hasOwnProperty("closeTime") ? "error" : null}
                value={settings.closeTime.toISOString().slice(0, 16)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "closeTime",
                    new Date(e.target.valueAsNumber)
                  )
                }
              />
              <span>Close time</span>
              <Icon
                cType="info"
                onClick={() =>
                  showModal(
                    <div>
                      <h4>Close time</h4>
                      <p>
                        Defines the time at which the game will stop accepting
                        bets.
                      </p>
                    </div>
                  )
                }
              />
              <div>{TZ}</div>
            </label>
          ) : (
            ""
          )}
          {settings.settleTime ? (
            <label className="overlap">
              <Input
                type="datetime-local"
                name="settleTime"
                className={errors.hasOwnProperty("settleTime") ? "error" : null}
                value={settings.settleTime.toISOString().slice(0, 16)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "settleTime",
                    new Date(e.target.valueAsNumber)
                  )
                }
              />
              <span>Settle time</span>
              <Icon
                cType="info"
                onClick={() =>
                  showModal(
                    <div>
                      <h4>Settle time</h4>
                      <p>
                        Defines the approximated time at which the game should
                        be settled.{" "}
                      </p>
                      <p>
                        <strong>
                          Remember that you must settle the game manually by
                          selecting the result/outcome of the game.
                        </strong>
                      </p>
                    </div>
                  )
                }
              />
              <div>{TZ}</div>
            </label>
          ) : (
            ""
          )}{" "}
          <div className="v-aligned mWrap">
            <div className="v-aligned gap5 mb-med">
              <label
                className="v-aligned gap5"
                onClick={() =>
                  handleUpdateSettings("showPot", !settings.showPot)
                }
              >
                <Checkbox name="showPot" value={settings.showPot} />
                <span>
                  <em>Show pot</em>
                </span>
              </label>
              <Icon
                cType="info"
                className="icon1"
                onClick={() =>
                  showModal(
                    <div>
                      <h4>Show pot</h4>
                      <p>
                        Displays the sum of all stakes within the game page.
                      </p>
                    </div>
                  )
                }
              />
            </div>
            <div className="v-aligned gap5 mb-med">
              <label
                className="v-aligned gap5"
                onClick={() =>
                  handleUpdateSettings("allowReferral", !settings.allowReferral)
                }
              >
                <Checkbox name="allowReferral" value={settings.allowReferral} />
                <span>Allow referral </span>
              </label>{" "}
              <Icon
                cType="info"
                className="icon1"
                onClick={() =>
                  showModal(
                    <div>
                      <h4>Allow referral</h4>
                      <p>
                        A referral code is just a unique game URL which contains
                        a referral ID. All the bets placed using these game
                        links will also reflect the referral ID in their
                        transactions. This can be used to reward users depending
                        on the amount of bets that were placed using their
                        referral links.
                      </p>
                    </div>
                  )
                }
              />
            </div>

            <label className="overlap fullCol   mb-med">
              <Input
                name="fireThreshold"
                type="number"
                className={`fullWidth ${
                  errors.hasOwnProperty("fireThreshold") ? " error" : ""
                }`}
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
              <span>Fire threshold </span>
              <Icon
                cType="info"
                className="icon1"
                onClick={() =>
                  showModal(
                    <div>
                      <h4>Fire threshold</h4>
                      <p>
                        The fire threshold is just a flame animation which is
                        displayed when the pot (sum of all bet stakes) has
                        reached certain amount. It is just a visual way to tell
                        which game is getting most attention.
                      </p>
                    </div>
                  )
                }
              />
            </label>
          </div>
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
