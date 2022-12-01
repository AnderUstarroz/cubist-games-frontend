import { useRef } from "react";
import { motion, useCycle } from "framer-motion";
import styles from "./MobileNav.module.scss";
import ViewPort from "../view_port";
import ToggleMenu from "./toggle_menu";
import dynamic from "next/dynamic";

const Menu = dynamic(() => import("../menu"));

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(25px at 260px 40px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

export default function MobileNav() {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const containerRef = useRef(null);
  const { height } = ViewPort(containerRef);

  return (
    <motion.nav
      className={styles.mobilenav}
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={height}
      ref={containerRef}
    >
      <motion.div
        style={{ height: height ? height : 80 }}
        className={styles.sideBar}
        variants={sidebar}
      >
        <Menu toggle={() => toggleOpen()} />
      </motion.div>
      <ToggleMenu toggle={() => toggleOpen()} />
    </motion.nav>
  );
}
