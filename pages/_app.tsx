import { ContextProvider } from "../components/provider";
import { ThemeProvider } from "next-themes";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import "../styles/variables.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme={"light"} themes={["light", "dark"]}>
      <ContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ContextProvider>
    </ThemeProvider>
  );
}

export default MyApp;
