import { createConfig } from "@account-kit/react";
import { alchemy } from "@account-kit/infra";
import { sepolia } from "@account-kit/infra";

export const config = createConfig({
  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  chain: sepolia,
  ssr: true, // set to false if you're not using server-side rendering
  enablePopupOauth: true, // set to false to use redirect auth
}, {
  auth: {
    sections: [[{"type":"email"}]],
    addPasskeyOnSignup: false,
  },
});
