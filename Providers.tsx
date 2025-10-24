"use client";
import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        // Default to Base Sepolia for all operations
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],

        // Customize the login methods displayed to users upfront
        loginMethods: ["email", "wallet", "google"],

        appearance: {
          theme: "light",
          // Additional appearance customizations, e.g. brand color:
          accentColor: "#676FFF",
        },

        // Embedded wallet creation on Base Sepolia
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
