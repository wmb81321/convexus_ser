"use client";

import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { 
  prepareSponsoredTokenTransfer, 
  isGasSponsorshipAvailable,
  type TokenTransferParams 
} from '@/lib/smart-wallet-utils';

export interface SponsoredTransactionStatus {
  isLoading: boolean;
  isSponsored: boolean;
  transactionHash?: string;
  error?: string;
}

export interface UseSponsoredTransactionsReturn {
  sendSponsoredTransaction: (params: TokenTransferParams) => Promise<void>;
  checkSponsorship: (params: TokenTransferParams) => Promise<boolean>;
  status: SponsoredTransactionStatus;
  reset: () => void;
}

/**
 * Hook for sending transactions with Alchemy gas sponsorship
 * Integrates Privy smart wallets with proper Alchemy Gas Manager API
 */
export function useSponsoredTransactions(): UseSponsoredTransactionsReturn {
  const { user } = usePrivy();
  const { client } = useSmartWallets();
  
  const [status, setStatus] = useState<SponsoredTransactionStatus>({
    isLoading: false,
    isSponsored: false,
  });

  const embeddedWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'wallet'
  );

  const smartWalletAddress = client?.account?.address;

  const reset = useCallback(() => {
    setStatus({
      isLoading: false,
      isSponsored: false,
    });
  }, []);

  const checkSponsorship = useCallback(async (params: TokenTransferParams): Promise<boolean> => {
    if (!smartWalletAddress) {
      throw new Error('No smart wallet connected');
    }

    if (!client) {
      console.warn('Smart wallet client not available');
      return false;
    }

    try {
      // Check if paymaster context is configured in the smart wallet client
      const paymasterAvailable = (client as any)?.paymasterContext !== undefined;
      console.log('🔍 Checking sponsorship eligibility:', {
        smartWalletAddress,
        paymasterAvailable,
        chainId: params.chainId
      });
      
      return paymasterAvailable;
    } catch (error) {
      console.warn('Failed to check sponsorship eligibility:', error);
      return false;
    }
  }, [smartWalletAddress, client]);

  const sendSponsoredTransaction = useCallback(async (params: TokenTransferParams) => {
    if (!smartWalletAddress) {
      throw new Error('No smart wallet connected');
    }

    if (!client) {
      throw new Error('Smart wallet client not available');
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      console.log('🚀 Attempting sponsored transaction:', params);
      
      // Build transaction parameters with proper decimals
      const decimals = params.decimals || 18;
      const txParams = params.tokenAddress 
        ? {
            // ERC-20 token transfer
            to: params.tokenAddress as `0x${string}`,
            data: buildTransferCallData(params.recipient, params.amount, decimals),
          }
        : {
            // Native ETH transfer  
            to: params.recipient as `0x${string}`,
            value: BigInt(parseFloat(params.amount) * Math.pow(10, 18)),
          };

      console.log('📝 Transaction parameters:', txParams);

      // Check if paymaster is available by inspecting the client configuration
      const paymasterAvailable = (client as any)?.paymasterContext !== undefined;
      console.log('💰 Paymaster available:', paymasterAvailable);

      if (paymasterAvailable) {
        console.log('✨ Using sponsored transaction (paymaster enabled)');
        setStatus(prev => ({ ...prev, isSponsored: true }));
      } else {
        console.log('💸 Using user-paid transaction (no paymaster)');
        setStatus(prev => ({ ...prev, isSponsored: false }));
      }

      // Send the transaction - Privy will automatically use paymaster if available
      const txHash = await client.sendTransaction(txParams);
      
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        transactionHash: txHash,
        isSponsored: paymasterAvailable
      }));

      console.log('✅ Transaction sent successfully:', txHash);
      console.log('🎯 Transaction was sponsored:', paymasterAvailable);
      
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        isSponsored: false
      }));

      throw error;
    }
  }, [smartWalletAddress, client]);

  return {
    sendSponsoredTransaction,
    checkSponsorship,
    status,
    reset,
  };
}

/**
 * Build call data for ERC-20 token transfer
 */
function buildTransferCallData(
  recipient: string, 
  amount: string, 
  decimals: number = 18
): `0x${string}` {
  const transferSelector = '0xa9059cbb';
  const recipientPadded = recipient.slice(2).padStart(64, '0');
  const tokenAmount = BigInt(parseFloat(amount) * Math.pow(10, decimals));
  const amountPadded = tokenAmount.toString(16).padStart(64, '0');
  
  return `${transferSelector}${recipientPadded}${amountPadded}` as `0x${string}`;
} 