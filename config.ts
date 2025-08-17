import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from "@account-kit/react";
import { alchemy, sepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!API_KEY) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}

const SPONSORSHIP_POLICY_ID = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID || process.env.NEXT_PUBLIC_ALCHEMY_APP_ID;
if (!SPONSORSHIP_POLICY_ID) {
  console.warn("Neither NEXT_PUBLIC_ALCHEMY_POLICY_ID nor NEXT_PUBLIC_ALCHEMY_APP_ID is set - gas sponsorship will be disabled");
}

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [
        { type: "passkey" },
        { type: "social", authProviderId: "google", mode: "popup" },
        { type: "social", authProviderId: "facebook", mode: "popup" },
      ],
    ],
    addPasskeyOnSignup: false,
  },
};

export const config = createConfig(
  {
    transport: alchemy({ apiKey: API_KEY }),
    // Configured for Ethereum Sepolia for testing with real pools
    chain: sepolia,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
    ...(SPONSORSHIP_POLICY_ID && { policyId: SPONSORSHIP_POLICY_ID }),
  },
  uiConfig
);

export const queryClient = new QueryClient();
