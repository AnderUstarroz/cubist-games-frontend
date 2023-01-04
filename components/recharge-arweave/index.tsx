import { motion } from "framer-motion";
import styles from "./RechargeArweave.module.scss";
import { RechargeArweavePropsType } from "./types";
import dynamic from "next/dynamic";
import { human_number } from "../utils/number";

const Input = dynamic(() => import("../../components/input"));
const Button = dynamic(() => import("../../components/button"));
const Spinner = dynamic(() => import("../../components/spinner"));

export default function RechargeArweave({
  value,
  handleUpdate,
  solBalance,
  requiredSol,
  requiredUsd,
  recommendedSol,
  display,
  error,
  loading,
  decimals,
  handleRechargeArweave,
  closeModals,
  ...props
}: RechargeArweavePropsType) {
  return (
    <motion.div className={styles.default} {...props}>
      <h4>Not enought balance in Arweave</h4>
      <p>
        Game data and images are stored permanently in the blockchain using{" "}
        <a
          className="icon1"
          href="https://www.arweave.org/"
          rel="noreferrer"
          target="_blank"
        >
          Arweave storage
        </a>
        .
      </p>
      <ul className="mb-med">
        <li>
          Arweave balance:{" "}
          <span className="icon1">
            {human_number(solBalance, decimals)} SOL
          </span>
        </li>
        <li>
          Required balance:{" "}
          <span className="icon1">
            {human_number(requiredSol + solBalance, decimals)} SOL{" "}
          </span>
        </li>
      </ul>
      <p className="mb-big">
        You need to top up at least{" "}
        <strong className="icon1">
          {human_number(requiredSol, decimals)} SOL
        </strong>{" "}
        ({human_number(requiredUsd, decimals)} USD) into your Arweave account to
        be able to upload your data, but we recommend you to recharge{" "}
        <strong className="icon1">
          {human_number(recommendedSol, decimals)} SOL
        </strong>{" "}
        (1 USD), so you don&apos;t need to repeat this step every single time
        you change some data.
      </p>
      <div className="mb-med">
        {loading ? (
          <Spinner />
        ) : (
          <div className="vAligned">
            <label className="overlap">
              <Input
                type="number"
                autoComplete="off"
                name="rechargeArweave"
                className={error ? "error" : null}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdate(e.target.value)
                }
                min={solBalance - requiredSol}
                max={100}
              />
              <span>
                SOL{" "}
                {requiredSol > 0
                  ? `(${human_number(
                      value * (requiredUsd / requiredSol),
                      2
                    )} USD)`
                  : ""}
              </span>
            </label>
            <Button onClick={() => handleRechargeArweave()}>Recharge</Button>{" "}
          </div>
        )}
      </div>
    </motion.div>
  );
}
