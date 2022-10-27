import styles from "../styles/NotFound.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import React from "react";

const NotFound: NextPage = () => {
  return (
    <>
      <div className={styles.container}>
        <AnimatePresence>
          <motion.div
            className={styles.notFound}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1>404 Page not found</h1>
            <p>Whoops we couldn&apos;t find the page.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotFound;
