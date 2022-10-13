import { parse_float_input } from "../../utils/number";
import dynamic from "next/dynamic";
import { InfoType } from "./types";

export default function Info({ gameSettings }: InfoType) {
  return (
    <div>
      <h2>Info</h2>
      <fieldset>
        <div>
          <label>State</label>
          <span>{gameSettings.state}</span>
        </div>
        <div>
          <label>Created at</label>
          <span>{gameSettings.createdAt}</span>
        </div>
        <div>
          <label>Updated at</label>
          <span>{gameSettings.updatedAt}</span>
        </div>
        <div>
          <label>Settled at</label>
          <span>{gameSettings.settledAt}</span>
        </div>
        <div>
          <label>Cashed at</label>
          <span>{gameSettings.cashedAt}</span>
        </div>
        <div>
          <label>SOL profits</label>
          <span>{gameSettings.solProfits} SOL</span>
        </div>
        <div>
          <label>Token profits</label>
          <span>{gameSettings.tokenProfits}</span>
        </div>
        <div>
          <label>Total bets paid</label>
          <span>{gameSettings.totalBetsPaid}</span>
        </div>
      </fieldset>
    </div>
  );
}
