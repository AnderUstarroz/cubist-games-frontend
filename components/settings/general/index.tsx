import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { GeneralSettingsType } from "./types";

const Input = dynamic(() => import("../../input"));
const Checkbox = dynamic(() => import("../../checkbox"));
const Icon = dynamic(() => import("../../icon"));

export default function GeneralSettings({
  settings,
  errors,
  handleUpdateSettings,
  showModal,
}: GeneralSettingsType) {
  return (
    <div>
      <h2>General</h2>
      <fieldset>
        <label>
          <span>
            Fee{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Fee</h3>
                    <p>
                      Defines the percentage of benefits collected on each game.
                    </p>
                  </div>
                )
              }
            />
          </span>
          <Input
            type="number"
            name="fee"
            className={errors.hasOwnProperty("fee") ? "error" : null}
            value={settings.fee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleUpdateSettings("fee", parse_float_input(e.target.value, 0))
            }
            min={0}
            max={100}
            step={0.01}
          />
        </label>
        <label>
          <span>
            Show pot{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Show pot</h3>
                    <p>Displays the sum of all stakes on the game page.</p>
                  </div>
                )
              }
            />
          </span>
          <Checkbox
            name="showPot"
            value={settings.showPot}
            onClick={() => handleUpdateSettings("showPot", !settings.showPot)}
          />
        </label>
        <label>
          <span>
            Allow referral{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Allow referral</h3>
                    <p>
                      A referral code is just a unique game URL which contains a
                      referral ID. All the bets placed using these game links
                      will also reflect the referral ID in their transactions.
                      This can be used to reward users depending on the amount
                      of bets that were placed using their referral links.
                    </p>
                  </div>
                )
              }
            />
          </span>
          <Checkbox
            name="allowReferral"
            value={settings.allowReferral}
            onClick={() =>
              handleUpdateSettings("allowReferral", !settings.allowReferral)
            }
          />
        </label>
        <label>
          <span>
            Fire threshold{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Fire threshold</h3>
                    <p>
                      The fire threshold is just a flame animation which is
                      displayed when the pot (sum of all bet stakes) has reached
                      certain amount. Just a visual way to tell that a game is
                      getting &quot;hot&quot;.
                    </p>
                  </div>
                )
              }
            />
          </span>
          <Input
            name="fireThreshold"
            type="number"
            className={errors.hasOwnProperty("fireThreshold") ? "error" : null}
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
    </div>
  );
}
