// Uniswap V3 utility functions for real DeFi integration

import { encodeFunctionData, parseUnits, formatUnits } from 'viem';

// Uniswap V3 contract addresses on Ethereum Sepolia
export const UNISWAP_CONTRACTS = {
  SwapRouter: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
  QuoterV2: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
  Factory: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
  PositionManager: "0x1238536071E1c677A632429e3655c799b22cDA52"
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

// Pool info
export const POOL_INFO = {
  address: "0x6e3a232aab5dabf359a7702f287752eb3db696f8f917e758dce73ae2a9f60301" as `0x${string}`,
  fee: 3000, // 0.3% fee tier
  token0: TOKENS.USDC,
  token1: TOKENS.COPE
};

// Uniswap V3 Pool ABI (minimal for price fetching)
export const POOL_ABI = [
  {
    name: "slot0",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" }
    ]
  },
  {
    name: "liquidity",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint128" }]
  }
];

// SwapRouter ABI (minimal for swapping)
export const SWAP_ROUTER_ABI = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" }
        ]
      }
    ],
    outputs: [{ name: "amountOut", type: "uint256" }]
  }
];

// QuoterV2 ABI (for price quotes)
export const QUOTER_ABI = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "amountIn", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" }
        ]
      }
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" }
    ]
  }
];

// ERC20 ABI for approvals
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
];

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
 * Get quote for exact input swap
 */
export async function getSwapQuote(
  client: any,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  decimals: number
): Promise<{ amountOut: string; priceImpact: number }> {
  try {
    const amountInBigInt = parseUnits(amountIn, decimals);
    
    const result = await client.readContract({
      address: UNISWAP_CONTRACTS.QuoterV2,
      abi: QUOTER_ABI,
      functionName: "quoteExactInputSingle",
      args: [{
        tokenIn: tokenIn as `0x${string}`,
        tokenOut: tokenOut as `0x${string}`,
        fee: POOL_INFO.fee,
        amountIn: amountInBigInt,
        sqrtPriceLimitX96: BigInt(0)
      }]
    });

    const amountOut = formatUnits(result[0], decimals);
    const priceImpact = 0; // Calculate if needed
    
    return { amountOut, priceImpact };
  } catch (error) {
    console.error("Error getting swap quote:", error);
    throw error;
  }
}

/**
 * Check token allowance
 */
export async function checkAllowance(
  client: any,
  tokenAddress: string,
  owner: string,
  spender: string
): Promise<bigint> {
  try {
    const allowance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner as `0x${string}`, spender as `0x${string}`]
    });
    
    return allowance;
  } catch (error) {
    console.error("Error checking allowance:", error);
    return BigInt(0);
  }
}

/**
 * Build approve transaction data
 */
export function buildApproveCallData(spender: string, amount: bigint): `0x${string}` {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spender as `0x${string}`, amount]
  });
}

/**
 * Build swap transaction data
 */
export function buildSwapCallData(
  tokenIn: string,
  tokenOut: string,
  recipient: string,
  amountIn: bigint,
  amountOutMinimum: bigint
): `0x${string}` {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 minutes from now
  
  return encodeFunctionData({
    abi: SWAP_ROUTER_ABI,
    functionName: "exactInputSingle",
    args: [{
      tokenIn: tokenIn as `0x${string}`,
      tokenOut: tokenOut as `0x${string}`,
      fee: POOL_INFO.fee,
      recipient: recipient as `0x${string}`,
      deadline,
      amountIn,
      amountOutMinimum,
      sqrtPriceLimitX96: BigInt(0)
    }]
  });
}

/**
 * Get current pool state (price, liquidity, etc.)
 */
export async function getPoolState(client: any): Promise<{
  price: number;
  tick: number;
  liquidity: string;
}> {
  try {
    const [slot0, liquidity] = await Promise.all([
      client.readContract({
        address: POOL_INFO.address,
        abi: POOL_ABI,
        functionName: "slot0"
      }),
      client.readContract({
        address: POOL_INFO.address,
        abi: POOL_ABI,
        functionName: "liquidity"
      })
    ]);

    const price = sqrtPriceX96ToPrice(slot0[0], TOKENS.USDC.decimals, TOKENS.COPE.decimals);
    
    return {
      price,
      tick: slot0[1],
      liquidity: liquidity.toString()
    };
  } catch (error) {
    console.error("Error getting pool state:", error);
    throw error;
  }
}