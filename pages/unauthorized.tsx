import Head from "next/head";
import type { NextPage } from "next";
import styles from "../styles/Unauthorized.module.scss";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const Button = dynamic(() => import("../components/button"));

const Unauthorized: NextPage = () => {
  return (
    <div className={`vhAligned textCenter ${styles.container}`}>
      <Head>
        <title>Unauthorized</title>
        <meta charSet="utf-8"></meta>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        ></meta>
      </Head>
      <AnimatePresence>
        <motion.section
          key="intro"
          className={styles.intro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h1>Not authorized</h1>
          <p>You are not allowed to access this content.</p>

          <div className="vAligned">
            <Link href="/" passHref>
              <Button>Back to games</Button>
            </Link>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default Unauthorized;
