import { createPublicClient, http, formatUnits, getContract } from 'viem';
import { sepolia } from 'viem/chains';
import { SUPPORTED_CHAINS } from './chains';
import { getEcopUsdcPriceFromLP, LPPriceData } from './uniswap-integration';

// ERC20 ABI for balance checks
const ERC20_ABI = [
  {
    "inputs": [{"type": "address"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Get token addresses from chains config (Ethereum Sepolia by default)
const CHAIN_ID = 11155111; // Ethereum Sepolia
const chainConfig = SUPPORTED_CHAINS[CHAIN_ID];
const USDC_ADDRESS = chainConfig.tokens.usdc?.address || "";
const ECOP_ADDRESS = chainConfig.tokens.ecop?.address || "";

export interface PoolData {
  poolType: 'USDC/ETH' | 'USDC/ECOP';
  usdcEcopPrice?: number;
  ethUsdcPrice?: number;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  tvlUSD: number;
  volumeUSD: number;
  feesUSD: number;
  token0: {
    symbol: string;
    name: string;
    address: string;
  };
  token1: {
    symbol: string;
    name: string;
    address: string;
  };
}

export interface UserBalance {
  eth: number;
  usdc: number;
  ecop: number;
  totalUsd: number;
}

// Create a public client for Sepolia
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

/**
 * Fetch market data combining CoinGecko (for ETH) and LP data (for ECOP)
 */
export async function fetchMarketData(): Promise<{
  ethPrice: number;
  ecopPrice: number;
  usdcEcopRate: number;
  lpData?: LPPriceData;
}> {
  try {
    console.log('💰 Fetching market data from CoinGecko and LP...');
    
    // Get ETH price from CoinGecko
    const ethResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
    );
    
    if (!ethResponse.ok) {
      throw new Error(`CoinGecko ETH API failed: ${ethResponse.status}`);
    }
    
    const ethData = await ethResponse.json();
    const ethPrice = ethData.ethereum?.usd || 0;
    
    if (!ethPrice) {
      throw new Error('Missing ETH price from CoinGecko');
    }
    
    // Get ECOP price from LP - NO FALLBACK, must use real price
    let ecopPrice = 0; // Will be set from LP
    let usdcEcopRate = 0; // Will be set from LP
    let lpData: LPPriceData | undefined;
    
    try {
      console.log('🔍 Fetching REAL ECOP price from LP...');
      lpData = await getEcopUsdcPriceFromLP(CHAIN_ID);
      ecopPrice = lpData.price; // ECOP price in USDC (e.g., 0.0002395 if 4174.57 ECOP = 1 USDC)
      usdcEcopRate = 1 / ecopPrice; // How many ECOP tokens for 1 USDC (e.g., 4174.57)
      
      console.log('✅ Using REAL LP price for ECOP:', {
        ecopPrice: ecopPrice.toFixed(8),
        usdcEcopRate: usdcEcopRate.toFixed(2),
        explanation: `${usdcEcopRate.toFixed(2)} ECOP = 1 USDC`,
        poolAddress: lpData.poolAddress,
        liquidity: lpData.liquidity.toString(),
      });
    } catch (error) {
      console.error('❌ CRITICAL: Failed to fetch ECOP price from LP:', error);
      throw new Error(`Cannot get ECOP price from LP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    if (!lpData || ecopPrice === 0) {
      throw new Error('Invalid LP data - ECOP price cannot be zero');
    }
    
    console.log('📊 Market data:', {
      ethPrice,
      ecopPrice,
      usdcEcopRate,
      source: lpData ? 'LP + CoinGecko' : 'CoinGecko + Fallback',
      timestamp: new Date().toISOString(),
    });
    
    return {
      ethPrice,
      ecopPrice, // Real ECOP price in USDC from LP
      usdcEcopRate, // Real rate: how many ECOP for 1 USDC
      lpData,
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch market data:', error);
    throw new Error(`Unable to fetch market data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate pool analytics for different pool types
 */
function generatePoolAnalytics(poolType: 'USDC/ETH' | 'USDC/ECOP', ethPrice: number, ecopPrice: number): {
  tvlUSD: number;
  volumeUSD: number;
  feesUSD: number;
  volume24h: number;
  fees24h: number;
  apr: number;
} {
  let baseTVL: number;
  let volumeMultiplier: number;
  
  if (poolType === 'USDC/ETH') {
    // ETH pools typically have higher liquidity
    baseTVL = 150000; // $150k base TVL for ETH pool
    volumeMultiplier = 0.3; // Higher volume for ETH
  } else {
    // ECOP pools smaller but growing
    baseTVL = 25000; // $25k base TVL for ECOP pool
    volumeMultiplier = 0.15; // Lower volume for newer token
  }
  
  const tvlUSD = baseTVL + (Math.random() * 50000); // Add some variance
  const volume24h = tvlUSD * (volumeMultiplier + Math.random() * 0.2);
  const feeRate = 0.003; // 0.3% fee
  const fees24h = volume24h * feeRate;
  
  // APR calculation: (daily fees * 365) / TVL * 100
  const apr = (fees24h * 365 / tvlUSD) * 100;
  
  return {
    tvlUSD,
    volumeUSD: volume24h,
    feesUSD: fees24h,
    volume24h,
    fees24h,
    apr,
  };
}

/**
 * Fetch user's token balances from blockchain
 */
export async function fetchUserBalances(walletAddress: string): Promise<UserBalance> {
  try {
    console.log('👛 Fetching user balances for:', walletAddress);
    
    // Fetch ETH balance
    const ethBalance = await publicClient.getBalance({
      address: walletAddress as `0x${string}`
    });
    const ethAmount = Number(formatUnits(ethBalance, 18));

    // Fetch USDC balance
    let usdcAmount = 0;
    if (USDC_ADDRESS && USDC_ADDRESS !== "0x") {
      try {
        const usdcBalance = await publicClient.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`],
        }) as bigint;
        usdcAmount = Number(formatUnits(usdcBalance, 6));
      } catch (error) {
        console.warn('Failed to fetch USDC balance:', error);
      }
    }

    // Fetch ECOP balance
    let ecopAmount = 0;
    if (ECOP_ADDRESS && ECOP_ADDRESS !== "0x") {
      try {
        const ecopBalance = await publicClient.readContract({
          address: ECOP_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`],
        }) as bigint;
        ecopAmount = Number(formatUnits(ecopBalance, 18));
      } catch (error) {
        console.warn('Failed to fetch ECOP balance:', error);
      }
    }

    return {
      eth: ethAmount,
      usdc: usdcAmount,
      ecop: ecopAmount,
      totalUsd: 0 // Will be calculated in the main function
    };
  } catch (error) {
    console.error('❌ Failed to fetch user balances:', error);
    throw new Error(`Unable to fetch user balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch data for both pools
 */
export async function fetchAllPoolsData(walletAddress?: string): Promise<{ 
  pools: PoolData[]; 
  userBalance?: UserBalance 
}> {
  console.log('🚀 Starting dual pool data fetch...');
  
  try {
    // Get market prices from CoinGecko
    const marketData = await fetchMarketData();
    
    // Generate analytics for both pools
    const usdcEthAnalytics = generatePoolAnalytics('USDC/ETH', marketData.ethPrice, marketData.ecopPrice);
    const usdcEcopAnalytics = generatePoolAnalytics('USDC/ECOP', marketData.ethPrice, marketData.ecopPrice);
    
    // Fetch user balances if wallet address provided
    let userBalance: UserBalance | undefined;
    if (walletAddress) {
      try {
        userBalance = await fetchUserBalances(walletAddress);
        
        // Calculate total USD value
        const ethValueUsd = userBalance.eth * marketData.ethPrice;
        const usdcValueUsd = userBalance.usdc; // USDC is already ~$1
        const ecopValueUsd = userBalance.ecop * marketData.ecopPrice;
        
        userBalance.totalUsd = ethValueUsd + usdcValueUsd + ecopValueUsd;
        console.log('👛 User balance calculated:', userBalance);
      } catch (error) {
        console.warn('⚠️ Failed to fetch user balances:', error);
      }
    }

    const pools: PoolData[] = [
      // USDC/ETH Pool
      {
        poolType: 'USDC/ETH',
        ethUsdcPrice: marketData.ethPrice,
        totalLiquidity: usdcEthAnalytics.tvlUSD,
        volume24h: usdcEthAnalytics.volume24h,
        fees24h: usdcEthAnalytics.fees24h,
        apr: usdcEthAnalytics.apr,
        tvlUSD: usdcEthAnalytics.tvlUSD,
        volumeUSD: usdcEthAnalytics.volumeUSD,
        feesUSD: usdcEthAnalytics.feesUSD,
        token0: {
          symbol: 'USDC',
          name: 'USD Coin',
          address: USDC_ADDRESS,
        },
        token1: {
          symbol: 'ETH',
          name: 'Ethereum',
          address: '0x0000000000000000000000000000000000000000', // ETH native
        }
      },
      // USDC/ECOP Pool
      {
        poolType: 'USDC/ECOP',
        usdcEcopPrice: marketData.usdcEcopRate,
        totalLiquidity: usdcEcopAnalytics.tvlUSD,
        volume24h: usdcEcopAnalytics.volume24h,
        fees24h: usdcEcopAnalytics.fees24h,
        apr: usdcEcopAnalytics.apr,
        tvlUSD: usdcEcopAnalytics.tvlUSD,
        volumeUSD: usdcEcopAnalytics.volumeUSD,
        feesUSD: usdcEcopAnalytics.feesUSD,
        token0: {
          symbol: 'USDC',
          name: 'USD Coin',
          address: USDC_ADDRESS,
        },
        token1: {
          symbol: 'COPe',
          name: 'Electronic Colombian Peso',
          address: ECOP_ADDRESS,
        }
      }
    ];

    console.log('✅ All pools data complete:', pools);
    return { pools, userBalance };

  } catch (error) {
    console.error('💥 ERROR fetching pools data:', error);
    throw new Error(`Failed to fetch pools data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch single pool data (backward compatibility)
 */
export async function fetchPoolData(walletAddress?: string): Promise<{ poolData: PoolData; userBalance?: UserBalance }> {
  const result = await fetchAllPoolsData(walletAddress);
  // Return the USDC/ECOP pool as default for backward compatibility
  const poolData = result.pools.find(p => p.poolType === 'USDC/ECOP') || result.pools[0];
  return { poolData, userBalance: result.userBalance };
}

/**
 * Simple price fetcher for backward compatibility
 */
export async function fetchUsdcEcopPrice(): Promise<number> {
  const marketData = await fetchMarketData();
  return marketData.usdcEcopRate;
}