import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
import { sepolia, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

// Import Contract Artifacts
import TicketNFTArtifact from "./contracts/TicketNFT.json";
import UserVerificationArtifact from "./contracts/UserVerification.json";
import TicketMarketplaceArtifact from "./contracts/TicketMarketplace.json";
import EventTicketArtifact from "./contracts/EventTicket.json";
import EventFactoryArtifact from "./contracts/EventFactory.json";

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
        { type: "external_wallets", walletConnect: { projectId: "d0259a6e22e9749300f42993d1476331" } }
      ],
    ],
    addPasskeyOnSignup: false,
  },
};

export const GAS_POLICY_ID = "5fb79c11-4062-46d2-be37-0473f2907c27";
export const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const TICKET_NFT_ADDRESS = process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS as `0x${string}`;
export const USER_VERIFICATION_ADDRESS = process.env.NEXT_PUBLIC_USER_VERIFICATION_ADDRESS as `0x${string}`;
export const TICKET_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_TICKET_MARKETPLACE_ADDRESS as `0x${string}`;
export const EVENT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS as `0x${string}`;

// ABIs - export directly from artifacts
export const TicketNFTABI = TicketNFTArtifact.abi;
export const UserVerificationABI = UserVerificationArtifact.abi;
export const TicketMarketplaceABI = TicketMarketplaceArtifact.abi;
export const EventTicketABI = EventTicketArtifact.abi;
export const EventFactoryABI = EventFactoryArtifact.abi;

export const config = createConfig(
  {
    transport: alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    }),
    chain: sepolia,
    ssr: true,
    enablePopupOauth: true,
  },
  {
    ...uiConfig,
    theme: {
      dark: {
        "bg-primary": "#000000",
        "bg-secondary": "#0a0a0a",
        "bg-tertiary": "#1a1a1a",
        "fg-primary": "#ffffff",
        "fg-secondary": "#a3a3a3",
        "fg-tertiary": "#525252",
        "border-primary": "#262626",
        "border-secondary": "#171717",
      },
    },
  } as any,
);

export const queryClient = new QueryClient();
