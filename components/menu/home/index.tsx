import { scrollToElement } from "../../../components/utils/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { HomeMenuType } from "./types";
import Link from "next/link";

const SocialLinks = dynamic(() => import("../menu_item/social_links"));
const Button = dynamic(() => import("../../button"));
const MenuItem = dynamic(() => import("../menu_item"));
const Icon = dynamic(() => import("../../icon"));

export default function HomeMenu({ toggle }: HomeMenuType) {
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
      <MenuItem className="social" whileHover={{}}>
        <SocialLinks />
      </MenuItem>
      <MenuItem>
        <Link href={`${process.env.NEXT_PUBLIC_HOST}/`} passHref>
          <Button cType="transparent" onClick={toggle}>
            Home
          </Button>
        </Link>
      </MenuItem>
      <MenuItem>
        <Link href="/admin">Admin</Link>
      </MenuItem>
      <MenuItem>
        <Link href="/admin/settings">
          <a title="Settings" onClick={toggle}>
            <Icon cType="gear" />
          </a>
        </Link>
      </MenuItem>
      <MenuItem whileTap={{}} whileHover={{}}>
        <Button cType="wallet" />
      </MenuItem>
    </motion.ul>
  );
}
