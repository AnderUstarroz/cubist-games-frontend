import styles from "../styles/NotFound.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import React from "react";
import { DEFAULT_ANIMATION } from "../components/utils/animation";

const NotFound: NextPage = () => {
  return (
    <>
      <div className="vhAligned textCenter">
        <AnimatePresence>
          <motion.div className={styles.notFound} {...DEFAULT_ANIMATION}>
            <h1>404 Page not found</h1>
            <p>Whoops we couldn&apos;t find the page.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotFound;
