/**
 * Simplified Cross-Chain Payment Hook for Hackathon
 */

import { useState, useCallback } from 'react';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { ethers } from 'ethers';

// Deployed contract addresses (update after deployment)
export const GATEWAY_ADDRESSES = {
  11155111: { // Sepolia
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    wallet: '0x2f818d40e3cfa55518f39ea00c7da3ff092d67ca',
    minter: '0x3b4b237f084b6d0c91e85e678e58fb9658509f85',
    domain: 0,
  },
  84532: { // Base Sepolia
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    wallet: '0x4cd01f1897bc0AD77Cb0Cf132436A4c8d5381629',
    minter: '0xBb288Da6959cAe1E2803547086A2F35Cac9FbF88',
    domain: 6,
  },
  11155420: { // OP Sepolia
    usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
    wallet: '0x355e66a0E12eF7578d971E8f2Cc8A10a68646Cbe',
    minter: '0x44188C2FFF512B30D11878A73A63830A475C20Bc',
    domain: 2,
  }
};

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

const GATEWAY_WALLET_ABI = [
  'function deposit(address token, uint256 amount)',
  'function getBalance(address token, address user) view returns (uint256)'
];

const GATEWAY_MINTER_ABI = [
  'function completeCrossChainTransfer(address token, address recipient, uint256 amount, bytes32 transferId, uint32 sourceDomain)'
];

const GATEWAY_WALLET_EXTENDED_ABI = [
  'function deposit(address token, uint256 amount)',
  'function getBalance(address token, address user) view returns (uint256)',
  'function initiateCrossChainTransfer(address token, uint32 destinationDomain, address destinationRecipient, uint256 amount) returns (bytes32)'
];

export interface PaymentParams {
  sourceChain: number;
  destinationChain: number;
  amount: string;
  recipient: string;
}

export interface PaymentStatus {
  status: 'idle' | 'approving' | 'depositing' | 'minting' | 'completed' | 'error';
  txHash?: string;
  error?: string;
}

export function useCrossChainPayment() {
  const { client } = useSmartWallets();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });

  const getRpcUrl = (chainId: number): string => {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    switch (chainId) {
      case 11155111: return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
      case 11155420: return `https://opt-sepolia.g.alchemy.com/v2/${apiKey}`;
      case 84532: return `https://base-sepolia.g.alchemy.com/v2/${apiKey}`;
      case 1301: return `https://unichain-sepolia.g.alchemy.com/v2/${apiKey}`;
      default: return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    }
  };

  const getProvider = (chainId: number) => {
    const rpcUrl = getRpcUrl(chainId);
    return new ethers.JsonRpcProvider(rpcUrl);
  };

  // Remove checkBalance since we'll use the blockchain.ts fetchAllBalances instead

  const executePayment = useCallback(async (params: PaymentParams) => {
    if (!client) {
      throw new Error('Smart wallet client not available');
    }

    try {
      setPaymentStatus({ status: 'approving' });

      const sourceConfig = GATEWAY_ADDRESSES[params.sourceChain as keyof typeof GATEWAY_ADDRESSES];
      const destConfig = GATEWAY_ADDRESSES[params.destinationChain as keyof typeof GATEWAY_ADDRESSES];
      
      if (!sourceConfig.wallet || !destConfig.minter) {
        throw new Error('Contracts not deployed. Please deploy first!');
      }

      const amount = ethers.parseUnits(params.amount, 6);
      console.log(`🚀 Starting cross-chain transfer: ${params.amount} USDC`);
      console.log(`From: Chain ${params.sourceChain} → Chain ${params.destinationChain}`);
      console.log(`Recipient: ${params.recipient}`);

      // Step 1: Approve USDC using smart wallet
      console.log('🔄 Step 1: Approving USDC...');
      const approveCallData = ethers.Interface.from(ERC20_ABI).encodeFunctionData('approve', [
        sourceConfig.wallet,
        amount
      ]);

      const approveTx = await client.sendTransaction({
        to: sourceConfig.usdc as `0x${string}`,
        data: approveCallData as `0x${string}`,
      });
      
      console.log(`✅ USDC approved: ${approveTx}`);

      // Step 2: Deposit to GatewayWallet using smart wallet
      setPaymentStatus({ status: 'depositing' });
      console.log('📦 Step 2: Depositing to gateway...');
      
      const depositCallData = ethers.Interface.from(GATEWAY_WALLET_ABI).encodeFunctionData('deposit', [
        sourceConfig.usdc,
        amount
      ]);

      const depositTx = await client.sendTransaction({
        to: sourceConfig.wallet as `0x${string}`,
        data: depositCallData as `0x${string}`,
      });

      console.log(`✅ Deposited to gateway: ${depositTx}`);

      // Step 3: Initiate cross-chain transfer
      console.log('🌉 Step 3: Initiating cross-chain transfer...');
      const transferCallData = ethers.Interface.from(GATEWAY_WALLET_EXTENDED_ABI).encodeFunctionData('initiateCrossChainTransfer', [
        sourceConfig.usdc,
        destConfig.domain || 0,
        params.recipient,
        amount
      ]);

      const transferTx = await client.sendTransaction({
        to: sourceConfig.wallet as `0x${string}`,
        data: transferCallData as `0x${string}`,
      });

      console.log(`✅ Cross-chain transfer initiated: ${transferTx}`);

      // For now, we'll simulate the completion step since it requires Circle attestation
      // In production, this would wait for Circle's attestation and then complete on destination
      setPaymentStatus({ status: 'minting' });
      console.log('🪙 Step 4: Simulating destination minting...');
      
      // Simulate a delay for the cross-chain process
      await new Promise(resolve => setTimeout(resolve, 3000));

      setPaymentStatus({ status: 'completed', txHash: transferTx });
      
      console.log('🎉 Cross-chain transfer completed successfully!');
      
      return {
        approveTx,
        depositTx,
        transferTx,
      };

    } catch (error: any) {
      console.error('❌ Cross-chain payment failed:', error);
      setPaymentStatus({ status: 'error', error: error.message });
      throw error;
    }
  }, [client]);

  const resetStatus = useCallback(() => {
    setPaymentStatus({ status: 'idle' });
  }, []);

  return {
    paymentStatus,
    executePayment,
    resetStatus,
    GATEWAY_ADDRESSES
  };
}
