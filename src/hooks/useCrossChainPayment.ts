/**
 * Simplified Cross-Chain Payment Hook for Hackathon
 */

import { useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
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
  const { wallets } = useWallets();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });

  const getWallet = (chainId: number) => {
    return wallets.find(w => w.chainId === chainId.toString());
  };

  const getProvider = async (chainId: number) => {
    const wallet = getWallet(chainId);
    if (!wallet) throw new Error(`No wallet for chain ${chainId}`);
    const provider = await wallet.getEthereumProvider();
    return new ethers.BrowserProvider(provider);
  };

  const checkBalance = useCallback(async (chainId: number, userAddress: string) => {
    const config = GATEWAY_ADDRESSES[chainId as keyof typeof GATEWAY_ADDRESSES];
    if (!config) throw new Error(`Unsupported chain: ${chainId}`);

    const provider = await getProvider(chainId);
    const usdc = new ethers.Contract(config.usdc, ERC20_ABI, provider);
    const balance = await usdc.balanceOf(userAddress);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }, [wallets]);

  const executePayment = useCallback(async (params: PaymentParams) => {
    try {
      setPaymentStatus({ status: 'approving' });

      const sourceConfig = GATEWAY_ADDRESSES[params.sourceChain as keyof typeof GATEWAY_ADDRESSES];
      const destConfig = GATEWAY_ADDRESSES[params.destinationChain as keyof typeof GATEWAY_ADDRESSES];
      
      if (!sourceConfig.wallet || !destConfig.minter) {
        throw new Error('Contracts not deployed. Please deploy first!');
      }

      // Step 1: Approve USDC on source chain
      const sourceProvider = await getProvider(params.sourceChain);
      const sourceSigner = await sourceProvider.getSigner();
      const sourceUsdc = new ethers.Contract(sourceConfig.usdc, ERC20_ABI, sourceSigner);
      
      const amount = ethers.parseUnits(params.amount, 6);
      console.log('Approving USDC...');
      const approveTx = await sourceUsdc.approve(sourceConfig.wallet, amount);
      await approveTx.wait();

      // Step 2: Deposit to GatewayWallet
      setPaymentStatus({ status: 'depositing' });
      const gatewayWallet = new ethers.Contract(sourceConfig.wallet, GATEWAY_WALLET_EXTENDED_ABI, sourceSigner);
      
      console.log('Depositing to gateway...');
      const depositTx = await gatewayWallet.deposit(sourceConfig.usdc, amount);
      await depositTx.wait();

      // Step 3: Initiate cross-chain transfer
      console.log('Initiating cross-chain transfer...');
      const transferTx = await gatewayWallet.initiateCrossChainTransfer(
        sourceConfig.usdc,
        destConfig.domain || 0, // Use domain from config
        params.recipient,
        amount
      );
      const transferReceipt = await transferTx.wait();
      
      // Extract transfer ID from transaction logs
      const transferId = transferReceipt.logs[0]?.topics[3] || ethers.keccak256(ethers.toUtf8Bytes(transferTx.hash));

      // Step 4: Complete transfer on destination chain
      setPaymentStatus({ status: 'minting' });
      const destProvider = await getProvider(params.destinationChain);
      const destSigner = await destProvider.getSigner();
      const gatewayReceiver = new ethers.Contract(destConfig.minter, GATEWAY_MINTER_ABI, destSigner);

      console.log('Completing transfer on destination...');
      const completeTx = await gatewayReceiver.completeCrossChainTransfer(
        destConfig.usdc,
        params.recipient,
        amount,
        transferId,
        sourceConfig.domain || 0
      );
      await completeTx.wait();

      setPaymentStatus({ status: 'completed', txHash: completeTx.hash });
      
      return {
        depositTx: depositTx.hash,
        transferTx: transferTx.hash,
        completeTx: completeTx.hash
      };

    } catch (error: any) {
      console.error('Payment failed:', error);
      setPaymentStatus({ status: 'error', error: error.message });
      throw error;
    }
  }, [wallets]);

  const resetStatus = useCallback(() => {
    setPaymentStatus({ status: 'idle' });
  }, []);

  return {
    paymentStatus,
    executePayment,
    checkBalance,
    resetStatus,
    GATEWAY_ADDRESSES
  };
}
