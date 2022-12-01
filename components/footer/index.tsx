import Twitter from "../../public/images/twitter.svg";
import Discord from "../../public/images/discord.svg";
import styles from "./Footer.module.scss";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const size = 12;

const Icon = dynamic(() => import("../../components/icon"));
const animation = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.95 },
};

export default function Footer() {
  return (
    <motion.footer className={styles.footer}>
      <div>
        {!!process.env.NEXT_PUBLIC_SITE_NAME && (
          <Link href="/">
            <motion.a href="/" {...animation}>
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </motion.a>
          </Link>
        )}
        <div className={styles.icons}>
          {!!process.env.NEXT_PUBLIC_DISCORD && (
            <motion.a
              href={process.env.NEXT_PUBLIC_DISCORD}
              target="_blank"
              {...animation}
            >
              <Image
                src={Discord}
                height={size}
                width={size}
                alt="Discord"
                title="Visit Discord"
              />
            </motion.a>
          )}

          {!!process.env.NEXT_PUBLIC_TWITTER && (
            <motion.a
              href={process.env.NEXT_PUBLIC_TWITTER}
              target="_blank"
              {...animation}
            >
              <Image
                src={Twitter}
                height={size}
                width={size}
                alt="Twitter"
                title="Visit Twitter"
              />
            </motion.a>
          )}
          {!!process.env.NEXT_PUBLIC_WEB && (
            <motion.a
              href={process.env.NEXT_PUBLIC_WEB}
              title="Visit Website"
              target="_blank"
              {...animation}
            >
              <Icon cType="web" height={size} width={size} />
            </motion.a>
          )}
        </div>
      </div>
    </motion.footer>
  );
}
