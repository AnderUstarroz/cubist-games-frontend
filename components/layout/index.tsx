import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./Layout.module.scss";
import Headroom from "react-headroom";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const MobileNav = dynamic(() => import("../mobile_nav"));
const Footer = dynamic(() => import("../footer"));
const Nav = dynamic(() => import("../nav"));

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [showLayout, setShowLayout] = useState(true);

  // Hide layout only on Admin pages when wallet not connected
  useEffect(() => {
    if (router.pathname.slice(0, 7) === "/admin/") {
      if (!publicKey) {
        if (showLayout) {
          setShowLayout(false);
        }
      } else {
        if (!showLayout) {
          setShowLayout(true);
        }
      }
    }
  }, [publicKey, router]);

  return (
    <>
      {!!showLayout && (
        <Headroom className={styles.HeadRoom}>
          <motion.header>
            <Nav />
            <MobileNav />
          </motion.header>
        </Headroom>
      )}
      <main>{children}</main>
      {!!showLayout && (
        <Footer
          className={
            router.pathname.slice(0, 6) === "/game/" ? "gameFooter" : ""
          }
        />
      )}
    </>
  );
}
