"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  connectorsForWallets
} from "@rainbow-me/rainbowkit";

import {
  metaMaskWallet,
  trustWallet,
  coinbaseWallet,
  walletConnectWallet,
  binanceWallet
} from "@rainbow-me/rainbowkit/wallets";

const queryClient = new QueryClient();

const projectId = "49ca3cdf736acde7b748fb31e63846f8";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular Wallets",
      wallets: [
        metaMaskWallet,
        trustWallet,
        coinbaseWallet,
        binanceWallet,
        walletConnectWallet
      ]
    }
  ],
  {
    appName: "Lottery Dapp",
    projectId
  }
);

const config = createConfig({
  connectors,
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545/")
  }
});

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}