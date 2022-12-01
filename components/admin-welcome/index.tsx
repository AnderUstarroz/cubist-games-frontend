import styles from "./AdminWelcome.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_ANIMATION } from "../utils/animation";
import dynamic from "next/dynamic";

const Button = dynamic(() => import("../../components/button"));

export default function AdminWelcome() {
  return (
    <AnimatePresence>
      <motion.div
        className={`vhAligned ${styles.adminWelcome}`}
        {...DEFAULT_ANIMATION}
      >
        <div>
          <h1>Welcome</h1>
          <p>Connect your wallet to access admin dashboard.</p>
          <Button cType="wallet" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
