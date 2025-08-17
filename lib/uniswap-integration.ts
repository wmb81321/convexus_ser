import { createPublicClient, http, getContract, parseUnits, formatUnits } from 'viem';
import { sepolia, mainnet } from 'viem/chains';
import { SUPPORTED_CHAINS } from './chains';

// Uniswap V3 Contract Addresses
const UNISWAP_V3_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  // Ethereum Sepolia
  11155111: {
    router: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    quoter: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
    factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  },
};

// Uniswap V3 Router ABI (essential functions only)
const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Uniswap V3 Quoter ABI
const QUOTER_ABI = [
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
    ],
    name: 'quoteExactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Uniswap V3 Pool ABI for price and liquidity data
const POOL_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Uniswap V3 Factory ABI to get pool address
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' },
    ],
    name: 'getPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI for approvals
const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippagePercent: number;
  recipient: string;
  chainId: number;
}

export interface SwapQuote {
  amountOut: string;
  amountOutFormatted: string;
  priceImpact: number;
  minimumAmountOut: string;
  route: string;
}

export interface LPPriceData {
  token0: string;
  token1: string;
  price: number; // token1/token0 price
  sqrtPriceX96: bigint;
  liquidity: bigint;
  poolAddress: string;
}

/**
 * Get token decimals from chain config
 */
function getTokenDecimals(tokenAddress: string, chainId: number): number {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) return 18; // Default to 18
  
  const normalizedAddress = tokenAddress.toLowerCase();
  
  if (chain.tokens.usdc?.address.toLowerCase() === normalizedAddress) {
    return chain.tokens.usdc.decimals;
  }
  if (chain.tokens.ecop?.address.toLowerCase() === normalizedAddress) {
    return chain.tokens.ecop.decimals;
  }
  
  return 18; // Default
}

/**
 * Calculate price from Uniswap V3 sqrtPriceX96
 */
function calculatePriceFromSqrtPriceX96(
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number
): number {
  // Price = (sqrtPriceX96 / 2^96)^2 * (10^token0Decimals / 10^token1Decimals)
  const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
  const price = sqrtPrice ** 2;
  const decimalAdjustment = (10 ** token0Decimals) / (10 ** token1Decimals);
  return price * decimalAdjustment;
}

/**
 * Get ECOP-USDC price directly from Uniswap LP
 */
export async function getEcopUsdcPriceFromLP(chainId: number = 11155111): Promise<LPPriceData> {
  const addresses = UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
  const chainConfig = SUPPORTED_CHAINS[chainId];
  
  if (!addresses || !chainConfig?.tokens.usdc || !chainConfig?.tokens.ecop) {
    throw new Error(`ECOP-USDC pair not available on chain ${chainId}`);
  }

  const chain = chainId === 11155111 ? sepolia : mainnet;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  try {
    const usdcAddress = chainConfig.tokens.usdc.address;
    const ecopAddress = chainConfig.tokens.ecop.address;
    
    // Get pool address from factory
    const poolAddress = await publicClient.readContract({
      address: addresses.factory as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getPool',
      args: [
        usdcAddress as `0x${string}`,
        ecopAddress as `0x${string}`,
        3000 // 0.3% fee tier
      ],
    }) as string;

    if (poolAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('ECOP-USDC pool does not exist');
    }

    console.log('🏊 Found ECOP-USDC pool at:', poolAddress);

    // Get pool data
    const [slot0, liquidity, token0, token1] = await Promise.all([
      publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'slot0',
      }) as Promise<readonly [bigint, number, number, number, number, number, boolean]>,
      publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'liquidity',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'token0',
      }) as Promise<string>,
      publicClient.readContract({
        address: poolAddress as `0x${string}`,
        abi: POOL_ABI,
        functionName: 'token1',
      }) as Promise<string>,
    ]);

    const sqrtPriceX96 = slot0[0] as bigint;
    
    // Determine which token is token0 and token1
    const isUsdcToken0 = token0.toLowerCase() === usdcAddress.toLowerCase();
    const token0Decimals = isUsdcToken0 ? 6 : 18;
    const token1Decimals = isUsdcToken0 ? 18 : 6;
    
    // Calculate price (token1/token0)
    let price = calculatePriceFromSqrtPriceX96(sqrtPriceX96, token0Decimals, token1Decimals);
    
    // If USDC is token1, we need the inverse for ECOP/USDC price
    if (!isUsdcToken0) {
      price = 1 / price;
    }

    console.log('💰 ECOP-USDC LP Price:', {
      price,
      sqrtPriceX96: sqrtPriceX96.toString(),
      liquidity: liquidity.toString(),
      token0,
      token1,
      isUsdcToken0,
    });

    return {
      token0,
      token1,
      price, // ECOP price in USDC
      sqrtPriceX96,
      liquidity,
      poolAddress,
    };
  } catch (error) {
    console.error('❌ Error fetching ECOP-USDC price from LP:', error);
    throw new Error(`Failed to fetch LP price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get quote for exact input swap
 */
export async function getSwapQuote(params: SwapParams): Promise<SwapQuote> {
  const addresses = UNISWAP_V3_ADDRESSES[params.chainId as keyof typeof UNISWAP_V3_ADDRESSES];
  if (!addresses) {
    throw new Error(`Uniswap V3 not supported on chain ${params.chainId}`);
  }

  // Create client for the appropriate chain
  const chain = params.chainId === 11155111 ? sepolia : mainnet;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  try {
    // Get correct decimals for input and output tokens
    const tokenInDecimals = getTokenDecimals(params.tokenIn, params.chainId);
    const tokenOutDecimals = getTokenDecimals(params.tokenOut, params.chainId);
    
    const amountInWei = parseUnits(params.amountIn, tokenInDecimals);
    const fee = 3000; // 0.3% fee tier (most common)

    console.log('🔍 Getting swap quote...', {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      tokenInDecimals,
      tokenOutDecimals,
      amountInWei: amountInWei.toString(),
    });

    // Use readContract instead of getContract for read operations
    const amountOut = await publicClient.readContract({
      address: addresses.quoter as `0x${string}`,
      abi: QUOTER_ABI,
      functionName: 'quoteExactInputSingle',
      args: [
        params.tokenIn as `0x${string}`,
        params.tokenOut as `0x${string}`,
        fee,
        amountInWei,
        BigInt(0), // sqrtPriceLimitX96 = 0 (no limit)
      ],
    }) as bigint;

    const amountOutFormatted = formatUnits(amountOut, tokenOutDecimals);
    
    // Calculate minimum amount out with slippage
    const slippageMultiplier = (100 - params.slippagePercent) / 100;
    const minimumAmountOut = BigInt(Math.floor(Number(amountOut) * slippageMultiplier));

    // Calculate price impact using LP data if available
    let priceImpact = 0.1; // Default fallback
    try {
      // Try to get real price impact from LP
      const chainConfig = SUPPORTED_CHAINS[params.chainId];
      if (chainConfig?.tokens.usdc && chainConfig?.tokens.ecop) {
        const lpData = await getEcopUsdcPriceFromLP(params.chainId);
        // Simple price impact calculation based on trade size vs liquidity
        const tradeValue = Number(params.amountIn) * (tokenInDecimals === 6 ? 1 : lpData.price);
        const liquidityUSD = Number(lpData.liquidity) / 1e18 * lpData.price; // Rough estimate
        priceImpact = Math.min((tradeValue / liquidityUSD) * 100, 5); // Cap at 5%
      }
    } catch (error) {
      console.warn('⚠️ Could not calculate real price impact, using default');
    }

    return {
      amountOut: amountOut.toString(),
      amountOutFormatted,
      priceImpact,
      minimumAmountOut: minimumAmountOut.toString(),
      route: `${params.tokenIn} → ${params.tokenOut}`,
    };
  } catch (error) {
    console.error('❌ Error getting swap quote:', error);
    throw new Error(`Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if token approval is needed
 */
export async function checkTokenApproval(
  tokenAddress: string,
  owner: string,
  spender: string,
  amount: string,
  chainId: number
): Promise<boolean> {
  const chain = chainId === 11155111 ? sepolia : mainnet;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  try {
    const allowance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_APPROVE_ABI,
      functionName: 'allowance',
      args: [
        owner as `0x${string}`,
        spender as `0x${string}`,
      ],
    }) as bigint;

    const tokenDecimals = getTokenDecimals(tokenAddress, chainId);
    const amountWei = parseUnits(amount, tokenDecimals);
    return allowance >= amountWei;
  } catch (error) {
    console.error('❌ Error checking token approval:', error);
    return false;
  }
}

/**
 * Prepare approval transaction data
 */
export function prepareApprovalTransaction(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  chainId: number = 11155111
) {
  const tokenDecimals = getTokenDecimals(tokenAddress, chainId);
  const amountWei = parseUnits(amount, tokenDecimals);
  
  // Encode the approval function call
  const approveCalldata = `0x095ea7b3${spenderAddress.slice(2).padStart(64, '0')}${amountWei.toString(16).padStart(64, '0')}`;

  return {
    to: tokenAddress as `0x${string}`,
    data: approveCalldata as `0x${string}`,
    value: BigInt(0),
  };
}

/**
 * Prepare swap transaction data
 */
export function prepareSwapTransaction(
  params: SwapParams,
  quote: SwapQuote,
  chainId: number
) {
  const addresses = UNISWAP_V3_ADDRESSES[chainId as keyof typeof UNISWAP_V3_ADDRESSES];
  if (!addresses) {
    throw new Error(`Uniswap V3 not supported on chain ${chainId}`);
  }

  const deadline = Math.floor(Date.now() / 1000) + 20 * 60; // 20 minutes from now
  const tokenInDecimals = getTokenDecimals(params.tokenIn, chainId);
  const amountInWei = parseUnits(params.amountIn, tokenInDecimals);
  const amountOutMinimum = BigInt(quote.minimumAmountOut);

  // Encode exactInputSingle call
  const swapParams = {
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    fee: 3000, // 0.3%
    recipient: params.recipient,
    deadline: BigInt(deadline),
    amountIn: amountInWei,
    amountOutMinimum,
    sqrtPriceLimitX96: BigInt(0),
  };

  // This is a simplified encoding - in a real app you'd use a proper ABI encoder
  console.log('🔧 Preparing swap transaction:', swapParams);

  return {
    to: addresses.router as `0x${string}`,
    data: '0x' as `0x${string}`, // You'd encode the actual call data here
    value: BigInt(0),
  };
}

/**
 * Get pool information for display
 */
export async function getPoolInfo(tokenA: string, tokenB: string, chainId: number) {
  // This would fetch pool information from the factory
  // For now, return mock data structure
  return {
    address: '0x0000000000000000000000000000000000000000',
    fee: 3000,
    token0: tokenA,
    token1: tokenB,
    liquidity: '0',
    sqrtPriceX96: '0',
  };
}