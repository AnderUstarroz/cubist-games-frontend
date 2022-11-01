import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import styles from "./MyBets.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultMyBetsPropsType, MyBetsPropsType } from "./types";
import { MyBetType } from "../../utils/bet";
import { lamports_to_sol } from "@cubist-collective/cubist-games-lib";

const Templates: any = {};

function DefaultMyBets({ myBets }: DefaultMyBetsPropsType) {
  return (
    <motion.div {...DEFAULT_ANIMATION}>
      <div>
        <h1 className={styles.title}>My bets ({myBets.length})</h1>
        <ul>
          {myBets.map((bet: MyBetType, k: number) => (
            <li key={`bet${k}`}>
              {bet.name} {lamports_to_sol(bet.stake)} SOL
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function MyBets({ template, ...props }: MyBetsPropsType) {
  const MyBets =
    template && Templates.hasOwnProperty(template)
      ? Templates[template]
      : DefaultMyBets;

  return <MyBets {...props} />;
}
