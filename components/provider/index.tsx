import { WalletError } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  //   TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { FC, ReactNode, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Notification } from "../notification";
import { SettingsProvider } from "./settings";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as any;
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST as string;

  const wallets: any = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
      // new TorusWalletAdapter(),
    ],
    [network]
  );

  const onError = useCallback(
    (error: WalletError) =>
      toast.custom(
        <Notification
          message={
            error.message ? `${error.name}: ${error.message}` : error.name
          }
          variant="error"
        />
      ),
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WalletContextProvider>
      <Toaster />
      <SettingsProvider>{children}</SettingsProvider>
    </WalletContextProvider>
  );
};
