import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
import { sepolia, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [
        { type: "passkey" },
        { type: "social", authProviderId: "google", mode: "popup" },
        { type: "social", authProviderId: "facebook", mode: "popup" },
        { type: "social", authProviderId: "twitch", mode: "popup" },
        {
          type: "social",
          authProviderId: "auth0",
          mode: "popup",
          auth0Connection: "discord",
          displayName: "Discord",
          logoUrl: "/images/discord.svg",
          scope: "openid profile",
        },
        {
          type: "social",
          authProviderId: "auth0",
          mode: "popup",
          auth0Connection: "twitter",
          displayName: "Twitter",
          logoUrl: "/images/twitter.svg",
          logoUrlDark: "/images/twitter-dark.svg",
          scope: "openid profile",
        },
      ],
      [
        {
          type: "external_wallets",
          walletConnect: { projectId: "30e7ffaff99063e68cc9870c105d905b" },
          wallets: ["wallet_connect", "coinbase wallet"],
          chainType: ["svm", "evm"],
          moreButtonText: "More wallets",
          hideMoreButton: false,
          numFeaturedWallets: 1,
        },
      ],
    ],
    addPasskeyOnSignup: false,
  },
};

export const GAS_POLICY_ID = "5fb79c11-4062-46d2-be37-0473f2907c27";

export const config = createConfig(
  {
    transport: alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
      gasPolicyId: GAS_POLICY_ID,
    }),
    chain: sepolia,
    ssr: true,
    enablePopupOauth: true,
  },
  uiConfig,
);

export const queryClient = new QueryClient();
