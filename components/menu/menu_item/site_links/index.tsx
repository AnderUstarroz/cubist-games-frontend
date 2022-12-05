import dynamic from "next/dynamic";
import styles from "./SiteLinks.module.scss";
import Link from "next/link";
import { flashMsg } from "../../../utils/helpers";
import { motion } from "framer-motion";

const Button = dynamic(() => import("../../../button"));
const Icon = dynamic(() => import("../../../icon"));

export default function SiteLinks({
  toggle,
}: {
  toggle: () => void | undefined;
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  if (!siteName) {
    flashMsg(
      `The variable "NEXT_PUBLIC_SITE_NAME" must be added into Vercel's environment variables`
    );
  }
  return (
    <div className={styles.siteLinks}>
      <Button cType="transparent">
        <Link href="/">
          <a onClick={toggle} className={styles.logo}>
            {process.env.NEXT_PUBLIC_LOGO ? (
              <motion.img
                src={process.env.NEXT_PUBLIC_LOGO}
                alt="Discord"
                title="Homepage"
              />
            ) : (
              <span>
                <Icon
                  cType="sol"
                  width={12}
                  height={12}
                  color="var(--color1)"
                />
              </span>
            )}
          </a>
        </Link>
      </Button>
      <Button cType="transparent">
        <Link href="/">
          <a className={styles.siteName} title="Homepage" onClick={toggle}>
            {siteName ? siteName : "Your site's name"}
          </a>
        </Link>
      </Button>
    </div>
  );
}
