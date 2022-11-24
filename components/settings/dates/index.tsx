import dynamic from "next/dynamic";
import { DatesSettingsType } from "./types";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_ANIMATION } from "../../utils/animation";

const Input = dynamic(() => import("../../input"));
const Icon = dynamic(() => import("../../icon"));

export default function DatesSettings({
  settings,
  errors,
  handleUpdateSettings,
  showModal,
}: DatesSettingsType) {
  const TZ = `Time zone: ${
    Intl.DateTimeFormat().resolvedOptions().timeZone
  } (${format(new Date(), "OOOO")})`;
  return (
    <AnimatePresence>
      <motion.section {...DEFAULT_ANIMATION}>
        <h2>Dates</h2>
        <fieldset>
          <p className="mb-big">{TZ}</p>
          <div className="vAligned mobileCol">
            {!!settings.openTime && (
              <label className="overlap">
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
                <span>Open Time</span>
                <Icon
                  cType="info"
                  className="icon1"
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
              </label>
            )}
            {!!settings.closeTime && (
              <label className="overlap">
                <Input
                  type="datetime-local"
                  name="closeTime"
                  className={
                    errors.hasOwnProperty("closeTime") ? "error" : null
                  }
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
                  className="icon1"
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
              </label>
            )}
            {!!settings.settleTime && (
              <label className="overlap">
                <Input
                  type="datetime-local"
                  name="settleTime"
                  className={
                    errors.hasOwnProperty("settleTime") ? "error" : null
                  }
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
                  className="icon1"
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
              </label>
            )}
          </div>
        </fieldset>
      </motion.section>
    </AnimatePresence>
  );
}
