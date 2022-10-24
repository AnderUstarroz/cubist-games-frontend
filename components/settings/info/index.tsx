import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { InfoType } from "./types";
import { formatRelative } from "date-fns";

export default function Info({ gameSettings }: InfoType) {
  return (
    <div>
      <h2>Info</h2>
      <fieldset>
        <div>
          <label>State</label>
          <span>{Object.keys(gameSettings.state)[0]}</span>
        </div>
        <div>
          <label>Created at</label>
          <span>{formatRelative(gameSettings.createdAt, new Date())}</span>
        </div>
        <div>
          <label>Updated at</label>
          <span>
            {gameSettings.updatedAt
              ? formatRelative(gameSettings.updatedAt, new Date())
              : ""}
          </span>
        </div>
        <div>
          <label>Settled at</label>
          <span>
            {gameSettings.settledAt
              ? formatRelative(gameSettings.settledAt, new Date())
              : ""}
          </span>
        </div>
        <div>
          <label>Cashed at</label>
          <span>
            {gameSettings.cashedAt
              ? formatRelative(gameSettings.cashedAt, new Date())
              : ""}
          </span>
        </div>

        {gameSettings.use_token ? (
          <div>
            <label>Token profits</label>
            <span>
              {gameSettings.tokenProfits != null
                ? gameSettings.tokenProfits
                : ""}
            </span>
          </div>
        ) : (
          <div>
            <label>SOL profits</label>
            <span>
              {gameSettings.solProfits != null
                ? `${gameSettings.solProfits} SOL`
                : ""}
            </span>
          </div>
        )}

        <div>
          <label>Total bets paid</label>
          <span>{gameSettings.totalBetsPaid}</span>
        </div>
      </fieldset>
    </div>
  );
}
