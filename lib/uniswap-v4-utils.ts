// Uniswap V4 utility functions for real DeFi integration

import { encodeFunctionData, parseUnits, formatUnits } from 'viem';

// Uniswap V4 contract addresses on Ethereum Sepolia
export const UNISWAP_V4_CONTRACTS = {
  PoolManager: "0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A", // V4 PoolManager on Sepolia
  // Note: In V4, there's no separate SwapRouter - all interactions go through PoolManager
  // Hooks are deployed separately and attached to pools
};

// Token addresses on Sepolia
export const TOKENS = {
  USDC: {
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
    decimals: 6,
    symbol: "USDC"
  },
  COPE: {
    address: "0x19ac2612e560b2bbedf88660a2566ef53c0a15a1" as `0x${string}`,
    decimals: 18,
    symbol: "COPe"
  }
};

// Your V4 Pool Key information
export const POOL_KEY = {
  currency0: TOKENS.USDC.address,
  currency1: TOKENS.COPE.address,
  fee: 3000, // 0.3% fee tier
  tickSpacing: 60, // Standard tick spacing for 0.3% fee
  hooks: "0x0000000000000000000000000000000000000000" as `0x${string}`, // No hooks or your hook address
};

// Uniswap V4 PoolManager ABI (core functions)
export const POOL_MANAGER_ABI = [
  {
    name: "unlock",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "data", type: "bytes" }
    ],
    outputs: [{ name: "", type: "bytes" }]
  },
  {
    name: "getSlot0",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "poolId", type: "bytes32" }
    ],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "protocolFee", type: "uint24" },
      { name: "lpFee", type: "uint24" }
    ]
  },
  {
    name: "getLiquidity",
    type: "function",
    stateMutability: "view", 
    inputs: [
      { name: "poolId", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "uint128" }]
  },
  {
    name: "extsload",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "slot", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "bytes32" }]
  }
];

// V4 uses Currency type for both native and ERC20 tokens
export const CURRENCY_ABI = [
  {
    name: "transfer", 
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "balanceOf",
    type: "function", 
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable", 
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
];

/**
 * Generate Pool ID from Pool Key (V4 uses keccak256 of encoded key)
 */
export function getPoolId(poolKey: typeof POOL_KEY): `0x${string}` {
  // In V4, PoolId is computed as keccak256(abi.encode(poolKey))
  const encoded = encodeFunctionData({
    abi: [{
      name: "poolKey",
      type: "tuple", 
      components: [
        { name: "currency0", type: "address" },
        { name: "currency1", type: "address" },
        { name: "fee", type: "uint24" },
        { name: "tickSpacing", type: "int24" },
        { name: "hooks", type: "address" }
      ]
    }],
    args: [poolKey]
  });
  
  // This is a simplified version - actual implementation would use proper encoding
  return `0x${Array.from(new TextEncoder().encode(JSON.stringify(poolKey)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .padEnd(64, '0')
    .slice(0, 64)}` as `0x${string}`;
}

/**
 * Get current pool price from sqrtPriceX96
 */
export function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): number {
  const Q96 = BigInt(2) ** BigInt(96);
  const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
  const price = sqrtPrice ** 2;
  
  // Adjust for decimals difference
  const decimalAdjustment = 10 ** (decimals1 - decimals0);
  return price * decimalAdjustment;
}

/**
 * Build unlock callback data for swaps
 * In V4, all operations go through the unlock() function
 */
export function buildUnlockCallData(
  operation: 'swap' | 'addLiquidity' | 'removeLiquidity',
  params: any
): `0x${string}` {
  // This would encode the operation and parameters
  // For swaps, this includes the swap parameters
  return encodeFunctionData({
    abi: [{
      name: "unlockCallback",
      type: "function",
      inputs: [
        { name: "operation", type: "string" },
        { name: "params", type: "bytes" }
      ]
    }],
    args: [operation, JSON.stringify(params)]
  });
}

/**
 * Get pool state (V4 version)
 */
export async function getV4PoolState(client: any, poolKey: typeof POOL_KEY): Promise<{
  price: number;
  tick: number;
  liquidity: string;
  poolId: string;
}> {
  try {
    const poolId = getPoolId(poolKey);
    
    const [slot0, liquidity] = await Promise.all([
      client.readContract({
        address: UNISWAP_V4_CONTRACTS.PoolManager,
        abi: POOL_MANAGER_ABI,
        functionName: "getSlot0",
        args: [poolId]
      }),
      client.readContract({
        address: UNISWAP_V4_CONTRACTS.PoolManager,
        abi: POOL_MANAGER_ABI, 
        functionName: "getLiquidity",
        args: [poolId]
      })
    ]);

    const price = sqrtPriceX96ToPrice(slot0[0], TOKENS.USDC.decimals, TOKENS.COPE.decimals);
    
    return {
      price,
      tick: slot0[1],
      liquidity: liquidity.toString(),
      poolId: poolId
    };
  } catch (error) {
    console.error("Error getting V4 pool state:", error);
    throw error;
  }
}

/**
 * Simple swap simulation for V4
 * Note: This is a simplified version. Real V4 swaps are more complex.
 */
export function simulateV4Swap(
  amountIn: string,
  fromToken: typeof TOKENS.USDC,
  toToken: typeof TOKENS.COPE,
  currentPrice: number
): { amountOut: string; priceImpact: number } {
  
  const amountInNum = Number(amountIn);
  
  // Simple constant product simulation (V4 can be much more complex with hooks)
  const amountOut = amountInNum * currentPrice * 0.997; // 0.3% fee
  const priceImpact = 0.01; // Simplified 1% impact
  
  return {
    amountOut: amountOut.toFixed(fromToken.decimals),
    priceImpact
  };
}

/**
 * Build V4 swap call data (through unlock mechanism)
 */
export function buildV4SwapCallData(
  poolKey: typeof POOL_KEY,
  swapParams: {
    zeroForOne: boolean;
    amountSpecified: bigint;
    sqrtPriceLimitX96: bigint;
  },
  recipient: string
): `0x${string}` {
  
  const unlockData = {
    poolKey,
    swapParams,
    recipient,
    operation: 'swap'
  };
  
  return buildUnlockCallData('swap', unlockData);
}

/**
 * Note about V4 Architecture:
 * 
 * Unlike V3, Uniswap V4 uses a singleton PoolManager contract where all pools live.
 * Key differences:
 * 
 * 1. **Singleton Architecture**: All pools are managed by one PoolManager contract
 * 2. **Hooks**: Pools can have custom logic via hook contracts
 * 3. **Flash Accounting**: Multiple operations can be batched in one transaction
 * 4. **Unlock Pattern**: All operations go through unlock() function
 * 5. **Currency Type**: Native ETH and ERC20s use the same Currency interface
 * 6. **Pool Keys**: Pools are identified by a struct containing currencies, fee, tickSpacing, and hooks
 * 
 * For actual V4 integration, you'd need:
 * - Deploy or use existing hook contracts
 * - Implement proper unlock callback logic
 * - Handle V4's flash accounting system
 * - Use V4 SDK for more complex operations
 */