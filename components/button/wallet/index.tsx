import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./Wallet.module.scss";
import React, { FC, useEffect } from "react";
import { motion } from "framer-motion";
import { DisconnectButtonType } from "./types";

export const DisconnectButton = ({ onClick }: DisconnectButtonType) => {
  return (
    <motion.button
      className={styles.default}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      Disconnect
    </motion.button>
  );
};

const Wallet: FC = () => {
  return <WalletMultiButton />;
};

export default Wallet;
