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
                  value={format(settings.openTime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings("openTime", new Date(e.target.value))
                  }
                />
                <span>Open Time</span>
                <Icon
                  cType="info"
                  className="icon1"
                  onClick={() =>
                    showModal(
                      <div>
                        <span className="infoIco">
                          <Icon cType="info" width={26} height={26} />
                        </span>
                        <h4 className="textCenter">Open time</h4>
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
                  value={format(settings.closeTime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings("closeTime", new Date(e.target.value))
                  }
                />
                <span>Close time</span>
                <Icon
                  cType="info"
                  className="icon1"
                  onClick={() =>
                    showModal(
                      <div>
                        <span className="infoIco">
                          <Icon cType="info" width={26} height={26} />
                        </span>
                        <h4 className="textCenter">Close time</h4>
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
                  value={format(settings.settleTime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings("settleTime", new Date(e.target.value))
                  }
                />
                <span>Settle time</span>
                <Icon
                  cType="info"
                  className="icon1"
                  onClick={() =>
                    showModal(
                      <div>
                        <span className="infoIco">
                          <Icon cType="info" width={26} height={26} />
                        </span>
                        <h4 className="textCenter">Settle time</h4>
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
