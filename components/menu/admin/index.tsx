// import { scrollToElement } from "../../utils/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import Twitter from "../../../public/images/twitter.svg";
import Discord from "../../../public/images/discord.svg";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { HomeMenuType } from "./types";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const SiteLinks = dynamic(() => import("../menu_item/site_links"));
const Button = dynamic(() => import("../../button"));
const MenuItem = dynamic(() => import("../menu_item"));
const Icon = dynamic(() => import("../../icon"));

const size = 20;

export default function AdminMenu({ toggle }: HomeMenuType) {
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const { publicKey } = useWallet();

  // const ScrollSection = (section: string) => {
  //   if (toggle) {
  //     toggle();
  //   }
  //   scrollToElement(section);
  // };

  useEffect(() => {
    setShowAdmin(
      publicKey?.toBase58() === (process.env.NEXT_PUBLIC_AUTHORITY as string)
    );
  }, [publicKey]);

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
          {showAdmin && (
            <>
              <Button cType="transparent" title="Dashboard">
                <Link href="/admin">
                  <a title="Dashboard" onClick={toggle}>
                    <Icon cType="dashboard" width={size} height={size} />
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
                  <a rel="noopener" title="Settings" onClick={toggle}>
                    New Game
                  </a>
                </Link>
              </Button>
            </>
          )}
        </div>
      </MenuItem>
      {!!process.env.NEXT_PUBLIC_WEB && (
        <MenuItem whileTap={{}} whileHover={{}}>
          <div className="vAligned gap5">
            {!!process.env.NEXT_PUBLIC_DISCORD && (
              <Button cType="transparent">
                <Link href={process.env.NEXT_PUBLIC_DISCORD}>
                  <a target="_blank" onClick={toggle}>
                    <Image
                      src={Discord}
                      height={size}
                      width={size}
                      alt="Discord"
                      title="Visit Discord"
                    />
                  </a>
                </Link>
              </Button>
            )}
            {!!process.env.NEXT_PUBLIC_TWITTER && (
              <Button cType="transparent">
                <Link href={process.env.NEXT_PUBLIC_TWITTER}>
                  <a target="_blank" title="Visit Twitter" onClick={toggle}>
                    <Image
                      src={Twitter}
                      height={size}
                      width={size}
                      alt="Twitter"
                      title="Visit Twitter"
                    />
                  </a>
                </Link>
              </Button>
            )}
            <Button cType="transparent" style={{ paddingBottom: 4 }}>
              <Link href={process.env.NEXT_PUBLIC_WEB}>
                <a title="Visit Website" target="_blank" onClick={toggle}>
                  <Icon cType="web" height={size} width={size} />
                </a>
              </Link>
            </Button>
          </div>
        </MenuItem>
      )}
      <MenuItem whileTap={{}} whileHover={{}}>
        <Button cType="wallet" />
      </MenuItem>
    </motion.ul>
  );
}
