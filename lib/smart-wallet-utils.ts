/**
 * Smart Wallet Transaction Utilities
 * Integrates Privy smart wallets with Alchemy gas sponsorship
 */

import { getGasManager, type UserOp } from './alchemy-gas-manager';
import { parseEther, parseUnits } from 'viem';

export interface TransactionParams {
  to: string;
  value?: bigint;
  data?: string;
  chainId: number;
}

export interface TokenTransferParams {
  recipient: string;
  amount: string;
  tokenAddress?: string; // undefined for native ETH
  decimals?: number;
  chainId: number;
}

/**
 * Prepare a transaction with Alchemy gas sponsorship
 * Following the 3-step process from Alchemy docs:
 * 1. Create a Gas Manager Policy (done in dashboard)
 * 2. Get Gas Manager's signature
 * 3. Send the sponsored userOp
 */
export async function prepareSponsoredTransaction(
  params: TransactionParams,
  senderAddress: string
): Promise<UserOp> {
  const gasManager = getGasManager();
  
  // Step 1: Build the basic user operation
  const baseUserOp: Partial<UserOp> = {
    sender: senderAddress,
    nonce: '0x0', // This should be fetched from the smart wallet
    initCode: '0x', // Empty for already deployed wallets
    callData: buildCallData(params),
    callGasLimit: '0x5208', // Basic transfer gas limit
    verificationGasLimit: '0x186A0', // Default verification gas
    preVerificationGas: '0x5208', // Default pre-verification gas
    maxFeePerGas: '0x3B9ACA00', // 1 gwei
    maxPriorityFeePerGas: '0x3B9ACA00', // 1 gwei
    signature: '0x', // Will be filled after signing
  };

  // Step 2: Get Gas Manager's signature (paymaster data)
  const entryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'; // ERC-4337 EntryPoint v0.6
  const paymasterData = await gasManager.requestGasAndPaymasterAndData(
    baseUserOp,
    entryPoint,
    params.chainId
  );

  // Step 3: Build final user operation with paymaster data
  const sponsoredUserOp: UserOp = {
    ...baseUserOp,
    callGasLimit: paymasterData.callGasLimit,
    verificationGasLimit: paymasterData.verificationGasLimit,
    preVerificationGas: paymasterData.preVerificationGas,
    maxFeePerGas: paymasterData.maxFeePerGas,
    maxPriorityFeePerGas: paymasterData.maxPriorityFeePerGas,
    paymasterAndData: `${paymasterData.paymaster}${paymasterData.paymasterData.slice(2)}`,
  } as UserOp;

  return sponsoredUserOp;
}

/**
 * Build call data for different transaction types
 */
function buildCallData(params: TransactionParams): string {
  if (!params.data && params.value) {
    // Native ETH transfer - no call data needed for simple transfers
    return '0x';
  } else if (params.data) {
    // Contract interaction
    return params.data;
  } else {
    // Default empty call data
    return '0x';
  }
}

/**
 * Prepare a token transfer transaction with gas sponsorship
 */
export async function prepareSponsoredTokenTransfer(
  params: TokenTransferParams,
  senderAddress: string
): Promise<UserOp> {
  let txParams: TransactionParams;

  if (!params.tokenAddress) {
    // Native ETH transfer
    txParams = {
      to: params.recipient,
      value: parseEther(params.amount),
      chainId: params.chainId,
    };
  } else {
    // ERC-20 token transfer
    const decimals = params.decimals || 18;
    const tokenAmount = parseUnits(params.amount, decimals);
    
    // ERC-20 transfer(address,uint256) function signature
    const transferSelector = '0xa9059cbb';
    const recipientPadded = params.recipient.slice(2).padStart(64, '0');
    const amountPadded = tokenAmount.toString(16).padStart(64, '0');
    
    txParams = {
      to: params.tokenAddress,
      data: `${transferSelector}${recipientPadded}${amountPadded}`,
      chainId: params.chainId,
    };
  }

  return prepareSponsoredTransaction(txParams, senderAddress);
}

/**
 * Execute a sponsored transaction using Privy's smart wallet
 */
export async function executeSponsoredTransaction(
  userOp: UserOp,
  chainId: number,
  signFunction: (userOp: UserOp) => Promise<string>
): Promise<string> {
  // Sign the user operation
  const signature = await signFunction(userOp);
  const signedUserOp = { ...userOp, signature };

  // Send the sponsored transaction
  const gasManager = getGasManager();
  const entryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
  
  return gasManager.sendUserOperation(signedUserOp, entryPoint, chainId);
}

/**
 * Check if gas sponsorship is available for a transaction
 */
export async function isGasSponsorshipAvailable(
  params: TransactionParams,
  senderAddress: string
): Promise<boolean> {
  try {
    const gasManager = getGasManager();
    
    const userOp: Partial<UserOp> = {
      sender: senderAddress,
      callData: buildCallData(params),
    };

    return gasManager.isEligibleForSponsorship(userOp, params.chainId);
  } catch (error) {
    console.warn('Failed to check gas sponsorship eligibility:', error);
    return false;
  }
}

/**
 * Get estimated gas costs (for fallback when sponsorship unavailable)
 */
export async function estimateGasCosts(
  params: TransactionParams
): Promise<{
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
}> {
  // This would typically use viem or ethers to estimate gas
  // For now, return reasonable defaults
  const gasLimit = BigInt(21000); // Basic transfer
  const maxFeePerGas = BigInt(1000000000); // 1 gwei
  const maxPriorityFeePerGas = BigInt(1000000000); // 1 gwei
  const estimatedCost = gasLimit * maxFeePerGas;

  return {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    estimatedCost,
  };
} 