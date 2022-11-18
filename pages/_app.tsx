import { ContextProvider } from "../components/provider";
import { ThemeProvider } from "next-themes";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/variables.scss";
import "../styles/globals.scss";

function CubistGames({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      enableSystem={false}
      forcedTheme={
        (process.env.NEXT_PUBLIC_THEME as string)
          ? (process.env.NEXT_PUBLIC_THEME as string)
          : "default"
      }
      themes={["default", "another"]}
    >
      <ContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ContextProvider>
    </ThemeProvider>
  );
}

export default CubistGames;
