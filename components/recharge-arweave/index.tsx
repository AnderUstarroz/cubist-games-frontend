import { motion } from "framer-motion";
import styles from "./RechargeArweave.module.scss";
import { RechargeArweavePropsType } from "./types";
import dynamic from "next/dynamic";
import { human_number } from "../utils/number";

const Input = dynamic(() => import("../../components/input"));
const Button = dynamic(() => import("../../components/button"));

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
      <h3>Not enought balance in Arweave</h3>
      <p>
        Game data and images are stored permanently in the blockchain using{" "}
        <a href="https://www.arweave.org/" rel="noreferrer" target="_blank">
          Arweave storage
        </a>
        .
      </p>
      <ul>
        <li>Arweave balance: {human_number(solBalance, decimals)} SOL</li>
        <li>Required balance: {human_number(requiredSol, decimals)} SOL</li>
      </ul>
      <p>
        You need to top up at least{" "}
        <strong>{human_number(requiredSol, decimals)} SOL</strong> (
        {human_number(requiredUsd, decimals)} USD) into your Arweave account to
        be able to upload your data, but we recommend you to top up at least{" "}
        <strong>{human_number(recommendedSol, decimals)}</strong> (1 USD), so
        you don&apos;t need to repeat this step every single time you change
        some data.
      </p>
      <div>
        <Input
          type="number"
          name="rechargeArweave"
          className={error ? "error" : null}
          value={human_number(value, decimals)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleUpdate(e.target.value)
          }
          min={solBalance - requiredSol}
          max={100}
        />{" "}
        SOL ({human_number(value * (requiredUsd / requiredSol), 2)} USD)
        {loading ? (
          <div>Loading..</div>
        ) : (
          <Button onClick={() => handleRechargeArweave()}>Recharge</Button>
        )}
      </div>
    </motion.div>
  );
}
