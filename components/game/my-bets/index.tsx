import { motion } from "framer-motion";
import styles from "./MyBets.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultMyBetsPropsType, MyBetsPropsType } from "./types";
import { MyBetType } from "../../utils/bet";
import { short_key } from "@cubist-collective/cubist-games-lib";
import dynamic from "next/dynamic";
import { tx_link } from "../../utils/game";

const Templates: any = {};

const Icon = dynamic(() => import("../../icon"));

function DefaultMyBets({ myBets }: DefaultMyBetsPropsType) {
  return (
    <motion.table {...DEFAULT_ANIMATION} className={styles.myBets}>
      <thead>
        <tr>
          <th>Stake</th>
          <th>Selection</th>
          <th>Signature</th>
        </tr>
      </thead>
      <tbody>
        {myBets.map((bet: MyBetType, k: number) => (
          <tr key={`bet${k}`}>
            <td>{bet.stake} SOL</td>
            <td>
              <strong className={`optColor${bet.optionId}`}>{bet.title}</strong>
            </td>
            <td>
              <a
                href={tx_link(bet.signature)}
                title="View transaction"
                target="_blank"
                rel="noreferrer"
                className="vAligned gap5 fEnd"
              >
                <Icon cType="eye" width={14} height={14} />
                {short_key(bet.signature)}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </motion.table>
  );
}

export default function MyBets({ template, ...props }: MyBetsPropsType) {
  const MyBets =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultMyBets;

  return <MyBets {...props} />;
}
