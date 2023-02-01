import { ContextProvider } from "../components/provider";
import { get_theme } from "../components/utils/helpers";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/common-variables.scss";
import "../styles/globals.scss";

function CubistGames({ Component, pageProps }: AppProps) {
  if (get_theme() == "badlands") {
    //@ts-ignore
    import("../styles/badlands-variables.scss");
  } else {
    //@ts-ignore
    import("../styles/galaxy-variables.scss");
  }
  return (
    <ContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ContextProvider>
  );
}

export default CubistGames;
