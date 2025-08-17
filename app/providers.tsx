"use client";
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PropsWithChildren } from "react";

// Create a simple Redux store for Uniswap widget
const store = configureStore({
  reducer: {
    // Simple dummy reducer to prevent Redux errors
    dummy: (state = {}, action: any) => state,
  },
});

export const Providers = (props: PropsWithChildren) => {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const alchemyPolicyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID || process.env.NEXT_PUBLIC_ALCHEMY_APP_ID;

  if (!privyAppId) {
    console.error('Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable');
    return <>{props.children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Login methods - social logins create embedded wallets automatically
        loginMethods: ['google', 'apple', 'telegram'],
        
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#4B66F3',
          logo: '/convexo-logo.png',
          showWalletLoginFirst: false,
        },
        
        // CREATE embedded wallets (needed for smart wallets)
        embeddedWallets: {
          createOnLogin: 'all-users',
          requireUserPasswordOnCreate: false,
          showWalletUIs: false,
        },

        // Supported chains configuration
        supportedChains: [
          {
            id: 11155111, // Ethereum Sepolia
            name: 'Ethereum Sepolia',
            network: 'sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://eth-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
          },
          {
            id: 11155420, // OP Sepolia  
            name: 'OP Sepolia',
            network: 'optimism-sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://opt-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Optimism Sepolia Explorer', url: 'https://sepolia-optimism.etherscan.io' } },
          },
          {
            id: 84532, // Base Sepolia
            name: 'Base Sepolia',
            network: 'base-sepolia', 
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://base-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Base Sepolia Explorer', url: 'https://sepolia.basescan.org' } },
          },
          {
            id: 1301, // Unichain Sepolia
            name: 'Unichain Sepolia',
            network: 'unichain-sepolia',
            nativeCurrency: { name: 'Unichain Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://unichain-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Unichain Sepolia Explorer', url: 'https://unichain-sepolia.blockscout.com' } },
          },
        ],
        
        // Set default chain to Ethereum Sepolia
        defaultChain: {
          id: 11155111,
          name: 'Ethereum Sepolia',
          network: 'sepolia',
          nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://eth-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
          blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
        },
      }}
    >
      <SmartWalletsProvider
        config={{
          // Only enable paymaster if we have a valid policy/app ID
          paymasterContext: alchemyApiKey && alchemyPolicyId && 
            alchemyPolicyId !== 'your_alchemy_policy_id' && 
            alchemyPolicyId !== 'your_alchemy_app_id' &&
            alchemyPolicyId !== 'd6a1b0a4-4f71-4a92-bb4c-5e5f1b8c9d7e' ? {
            policyId: alchemyPolicyId,
          } : undefined,
        }}
      >
        <Provider store={store}>
          {props.children}
        </Provider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
};