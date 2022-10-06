import Image from "next/image"
import Medium from "../../../../public/images/medium.svg"
import Twitter from "../../../../public/images/twitter.svg"
import Discord from "../../../../public/images/discord.svg"
import { motion } from "framer-motion"

export default function SocialLinks() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
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
  )
}
