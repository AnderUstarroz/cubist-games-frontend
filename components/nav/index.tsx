import { motion } from "framer-motion";
import styles from "./Nav.module.scss";
import dynamic from "next/dynamic";

const Menu = dynamic(() => import("../menu"));

export default function Nav() {
  return (
    <motion.nav className={styles.nav}>
      <Menu />
    </motion.nav>
  );
}
