"use client";

import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallet } from './useSmartWallet';

export interface FundWalletParams {
  amount: string;
  currencyCode: 'USDC' | 'ETH' | 'COPE';
  network: 'ethereum' | 'base' | 'optimism';
  provider: 'coinbase' | 'moonpay';
}

export interface FundWalletStatus {
  isLoading: boolean;
  error?: string;
  transactionId?: string;
}

export function useFundWallet() {
  const { user, getAccessToken } = usePrivy();
  const { smartWalletAddress } = useSmartWallet();
  const [status, setStatus] = useState<FundWalletStatus>({ isLoading: false });

  const fundWallet = useCallback(async (params: FundWalletParams) => {
    // Use smart wallet address if available, fallback to embedded wallet
    const walletAddress = smartWalletAddress || user?.wallet?.address;
    const emailAddress = user?.email?.address;
    
    if (!walletAddress) {
      throw new Error('No wallet address available');
    }

    setStatus({ isLoading: true });

    try {
      const authToken = await getAccessToken();
      const currentUrl = window.location.href;

      console.log('🏦 Requesting on-ramp URL:', {
        provider: params.provider,
        amount: params.amount,
        currency: params.currencyCode,
        network: params.network,
        wallet: walletAddress
      });

      const response = await fetch('/api/onramp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          address: walletAddress,
          email: emailAddress,
          redirectUrl: currentUrl,
          provider: params.provider,
          currencyCode: params.currencyCode,
          amount: params.amount,
          network: params.network,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate on-ramp URL');
      }

      const data = await response.json();
      const onrampUrl = data.url;

      console.log('✅ On-ramp URL generated:', onrampUrl);

      // Open the on-ramp in a new tab
      window.open(onrampUrl, '_blank', 'noopener,noreferrer');

      setStatus({ isLoading: false });
      
      return onrampUrl;
    } catch (error) {
      console.error('❌ Fund wallet error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus({ isLoading: false, error: errorMessage });
      throw error;
    }
  }, [user, smartWalletAddress, getAccessToken]);

  const reset = useCallback(() => {
    setStatus({ isLoading: false });
  }, []);

  return {
    fundWallet,
    status,
    reset,
    // Helper to check if funding is available
    canFund: !!(smartWalletAddress || user?.wallet?.address),
    // Get the active wallet address
    activeWalletAddress: smartWalletAddress || user?.wallet?.address,
  };
}
