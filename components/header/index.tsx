import { motion } from "framer-motion";
import styles from "./Header.module.scss";
import Headroom from "react-headroom";
import dynamic from "next/dynamic";

const Nav = dynamic(() => import("../nav"));
const MobileNav = dynamic(() => import("../mobile_nav"));

export default function Header() {
  return (
    <Headroom className={styles.HeadRoom}>
      <motion.header>
        <Nav />
        <MobileNav />
      </motion.header>
    </Headroom>
  );
}
