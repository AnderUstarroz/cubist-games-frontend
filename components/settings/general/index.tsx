import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { GeneralSettingsType } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";

const Input = dynamic(() => import("../../input"));
const Checkbox = dynamic(() => import("../../checkbox"));
const Icon = dynamic(() => import("../../icon"));

export default function GeneralSettings({
  settings,
  errors,
  handleUpdateSettings,
  handleValidateSettings,
  showModal,
}: GeneralSettingsType) {
  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>General</h2>
        <fieldset>
          <div className="vAligned mWrap">
            <div className="vAligned gap5 mb-med">
              <label
                className="vAligned gap5"
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
                      <span className="infoIco">
                        <Icon cType="info" width={26} height={26} />
                      </span>
                      <h4 className="textCenter">Show pot</h4>
                      <p>
                        Displays the sum of all stakes within the game page.
                      </p>
                    </div>
                  )
                }
              />
            </div>
            <div className="vAligned gap5 mb-med">
              <label
                className="vAligned gap5"
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
                      <span className="infoIco">
                        <Icon cType="info" width={26} height={26} />
                      </span>
                      <h4 className="textCenter">Allow referral</h4>
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
            <label className="overlap fullCol mb-med">
              <Input
                name="fireThreshold"
                type="number"
                className={`fullWidth ${
                  errors.hasOwnProperty("fireThreshold") ? " error" : ""
                }`}
                value={settings.fireThreshold}
                onFocus={(e: any) => e.target.select()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateSettings(
                    "fireThreshold",
                    parse_float_input(e.target.value, settings.fireThreshold)
                  )
                }
                onBlur={() =>
                  handleValidateSettings(
                    "fireThreshold",
                    settings.fireThreshold
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
                      <span className="infoIco">
                        <Icon cType="info" width={26} height={26} />
                      </span>
                      <h4 className="textCenter">Fire threshold</h4>
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
