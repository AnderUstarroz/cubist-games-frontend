import { motion } from "framer-motion";
import styles from "./MyBets.module.scss";
import { DEFAULT_ANIMATION } from "../../utils/animation";
import { DefaultMyBetsPropsType, MyBetsPropsType } from "./types";
import { MyBetType } from "../../utils/bet";

const Templates: any = {};

function DefaultMyBets({ myBets }: DefaultMyBetsPropsType) {
  return (
    <motion.div {...DEFAULT_ANIMATION}>
      <div>
        <h1 className={styles.title}>My bets ({myBets.length})</h1>
        <ul>
          {myBets.map((bet: MyBetType, k: number) => (
            <li key={`bet${k}`}>
              <strong style={{ color: bet.color }}>{bet.title}</strong>{" "}
              {bet.stake} SOL
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
