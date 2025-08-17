"use client";

import { SwapWidget } from '@uniswap/widgets';
import '@uniswap/widgets/fonts.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useEffect, useState } from "react";

// Custom token list for Ethereum Sepolia - Valid addresses only
const SEPOLIA_TOKEN_LIST = [
  {
    name: "USD Coin",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    symbol: "USDC",
    decimals: 6,
    chainId: 11155111,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
  },
  {
    name: "Electronic Colombian Peso",
    address: "0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219",
    symbol: "COPE",
    decimals: 6,
    chainId: 11155111,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
  }
];

// RPC endpoints for Ethereum Sepolia - Using Alchemy for better reliability
const jsonRpcUrlMap = {
  11155111: [
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
  ]
};

export default function SimpleSwap() {
  const { user } = usePrivy();
  const { smartWalletAddress } = useSmartWallet();

  // Handle errors from the swap widget
  const handleSwapError = (error: Error) => {
    console.error('SwapWidget error:', error);
    // You can add user-friendly error handling here
  };

  // Handle wallet connection - prevent if smart wallet is already connected
  const handleConnectWallet = () => {
    if (smartWalletAddress) {
      alert('You are already connected with your smart wallet. Use the wallet address shown below.');
      return false; // Prevent default connection
    }
    return true; // Allow connection if no smart wallet
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            USDC ⇄ COPE Swap
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to use the swap feature
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            USDC ⇄ COPE Swap
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://sepolia.etherscan.io/token/0xa4a4fcb23ffcd964346d2e4ecdf5a8c15c69b219', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View COPE
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-center">
          <SwapWidget 
            jsonRpcUrlMap={jsonRpcUrlMap}
            tokenList={SEPOLIA_TOKEN_LIST}
            defaultInputTokenAddress="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // USDC
            defaultOutputTokenAddress="0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219" // COPE
            onConnectWalletClick={handleConnectWallet}
            width={380}
            theme={{
              primary: '#4B66F3',
              secondary: '#F3F4F6',
              interactive: '#E5E7EB',
              container: '#FFFFFF',
              module: '#FFFFFF',
              accent: '#4B66F3',
              outline: '#E5E7EB',
              dialog: '#FFFFFF',
            }}
            onError={handleSwapError}
          />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Trade on Ethereum Sepolia • USDC-COPE Liquidity Pool
          </p>
          {smartWalletAddress && (
            <div className="text-xs mt-2 space-y-1">
              <p className="text-green-600">
                ✅ Smart Wallet Connected: {smartWalletAddress.slice(0, 6)}...{smartWalletAddress.slice(-4)}
              </p>
              <p className="text-orange-600">
                ⚠️ If widget asks to connect, use your smart wallet address above or external wallet
              </p>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            💱 Swapping between USDC and COPE on the Sepolia testnet
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pool Address: 
            <a 
              href="https://app.uniswap.org/positions/v4/ethereum_sepolia/12714" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 hover:text-blue-600 underline"
            >
              View Analytics
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}