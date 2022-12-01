import { scrollToElement } from "../../utils/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { HomeMenuType } from "./types";
import Link from "next/link";

const SiteLinks = dynamic(() => import("../menu_item/site_links"));
const Button = dynamic(() => import("../../button"));
const MenuItem = dynamic(() => import("../menu_item"));
const Icon = dynamic(() => import("../../icon"));

export default function AdminMenu({ toggle }: HomeMenuType) {
  const ScrollSection = (section: string) => {
    if (toggle) {
      toggle();
    }
    scrollToElement(section);
  };

  return (
    <motion.ul
      variants={{
        open: {
          transition: { staggerChildren: 0.07, delayChildren: 0.2 },
        },
        closed: {
          transition: { staggerChildren: 0.05, staggerDirection: -1 },
        },
      }}
    >
      <MenuItem className="leftItems" whileHover={{}} whileTap={{}}>
        <div>
          <SiteLinks toggle={toggle} />
          <Button cType="transparent" title="Dashboard">
            <Link href="/admin">
              <a title="Dashboard" onClick={toggle}>
                <Icon cType="dashboard" width={20} height={20} />
              </a>
            </Link>
          </Button>
          <Button cType="transparent">
            <Link href="/admin/global-settings">
              <a title="Settings" onClick={toggle}>
                Settings
              </a>
            </Link>
          </Button>
          <Button cType="transparent">
            <Link href="/admin/games">
              <a title="Settings" onClick={toggle}>
                Manage Games
              </a>
            </Link>
          </Button>
          <Button cType="transparent">
            <Link href="/admin/game">
              <a title="Settings" onClick={toggle}>
                New Game
              </a>
            </Link>
          </Button>
        </div>
      </MenuItem>
      <MenuItem whileTap={{}} whileHover={{}}>
        <Button cType="wallet" />
      </MenuItem>
    </motion.ul>
  );
}
