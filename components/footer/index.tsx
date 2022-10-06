import Medium from "../../public/images/medium.svg";
import Twitter from "../../public/images/twitter.svg";
import Discord from "../../public/images/discord.svg";
import styles from "./Footer.module.scss";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  return (
    <motion.footer className={styles.footer}>
      <div className={styles.pow}>
        <div>
          <a href="#" target="_blank" rel="noopener noreferrer">
            Powered by the <strong>Cubist Collective</strong>
          </a>
        </div>
        <div className={styles.social}>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://discord.gg/ed6sbyWnPV"
          >
            <Image
              src={Discord}
              height={25}
              width={25}
              alt="Discord"
              title="Cubist Collective in Discord"
            />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://twitter.com/CubistNFT"
          >
            <Image
              src={Twitter}
              height={25}
              width={25}
              alt="Twitter"
              title="Cubist Collective in Twitter"
            />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://cubistcollective.medium.com/the-cubist-collective-whitepaper-e017c58cff21"
          >
            <Image
              src={Medium}
              height={25}
              width={25}
              alt="Medium"
              title="Cubist Collective in Medium"
            />
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
}
