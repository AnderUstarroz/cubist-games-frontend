import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { StakeButtonsType } from "./types";

const Input = dynamic(() => import("../../input"));
const Checkbox = dynamic(() => import("../../checkbox"));
const Icon = dynamic(() => import("../../icon"));
const Button = dynamic(() => import("../../button"));

export default function StakeButtons({
  settings,
  errors,
  handleUpdateSettings,
  maxDecimals,
  showModal,
}: StakeButtonsType) {
  return (
    <div>
      <h2>Stake buttons</h2>
      <fieldset>
        <label>
          <span>
            Minimum stake{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Minimum stake</h3>
                    <p>The minimum amount allowed to place a bet.</p>
                  </div>
                )
              }
            />
          </span>
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
            min={1 / Math.pow(10, maxDecimals)}
            max={100}
          />
        </label>
        <label>
          <span>
            Min step{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Min step</h3>
                    <p>
                      The minimum amount in which a bet can be
                      increased/decreased.
                    </p>
                  </div>
                )
              }
            />
          </span>
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
            min={1 / Math.pow(10, maxDecimals)}
            max={100}
          />
        </label>
        <label>
          <span>
            Display custom stake button{" "}
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Display custom stake button</h3>
                    <p>
                      Displays a button which allows to define a customized
                      amount to bet.
                    </p>
                  </div>
                )
              }
            />
          </span>
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
        <div>
          <span>
            Default stake buttons
            <Icon
              cType="info"
              onClick={() =>
                showModal(
                  <div>
                    <h3>Default stake buttons</h3>
                    <p>
                      Shows buttons with predefined amounts for each game
                      option. This allows users to place bets quicker.
                    </p>
                  </div>
                )
              }
            />
            {settings.stakeButtons.length < 10 ? (
              <Button
                onClick={() =>
                  handleUpdateSettings("stakeButtons", [
                    ...settings.stakeButtons,
                    1,
                  ])
                }
              >
                +
              </Button>
            ) : (
              ""
            )}
          </span>
          <ul>
            {settings.stakeButtons.map((v: number, k: number) => (
              <li key={`stake-btn${k}`}>
                <Input
                  type="number"
                  value={v}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateSettings(
                      "stakeButtons",
                      settings.stakeButtons.map((v: number, l: number) =>
                        k === l
                          ? parse_float_input(e.target.value, settings.minStake)
                          : v
                      )
                    )
                  }
                  min={settings.minStake}
                  step={settings.minStep}
                  max={100000}
                />{" "}
                <Button
                  cType="transparent"
                  onClick={() =>
                    handleUpdateSettings(
                      "stakeButtons",
                      settings.stakeButtons.filter(
                        (_: number, l: number) => l !== k
                      )
                    )
                  }
                >
                  -
                </Button>
              </li>
            ))}
          </ul>
          {errors.hasOwnProperty("stakeButtons") ? (
            <div>{errors["stakeButtons"]}</div>
          ) : (
            ""
          )}
        </div>
      </fieldset>
    </div>
  );
}
