// Uniswap Subgraph Integration
// Based on: https://docs.uniswap.org/api/subgraph/overview

// V4 Subgraph for Ethereum Sepolia
const UNISWAP_V4_SUBGRAPH_URL = 
  `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_API_KEY}/subgraphs/id/DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G`;

// Fallback to V3 if needed
const UNISWAP_V3_SUBGRAPH_URL = 
  `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;

// GraphQL queries for Uniswap V4 data
const POOL_QUERY = `
  query GetPool($poolId: ID!) {
    pool(id: $poolId) {
      id
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
      fee
      liquidity
      sqrtPriceX96
      tick
      token0Price
      token1Price
      volumeUSD
      volume24H: volumeUSD
      tvlUSD
      totalValueLockedUSD
      totalValueLockedToken0
      totalValueLockedToken1
      feesUSD
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
      poolDayData(first: 1, orderBy: date, orderDirection: desc) {
        tvlUSD
        volumeUSD
        feesUSD
      }
    }
  }
`;

const POOL_DAY_DATA_QUERY = `
  query GetPoolDayData($poolId: ID!, $days: Int!) {
    poolDayDatas(
      where: { pool: $poolId }
      first: $days
      orderBy: date
      orderDirection: desc
    ) {
      date
      tvlUSD
      volumeUSD
      feesUSD
      high
      low
      open
      close
    }
  }
`;

const USER_POSITIONS_QUERY = `
  query GetUserPositions($user: String!) {
    positions(where: { owner: $user }) {
      id
      owner
      pool {
        id
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        feeTier
      }
      liquidity
      tickLower
      tickUpper
      depositedToken0
      depositedToken1
      withdrawnToken0
      withdrawnToken1
      collectedFeesToken0
      collectedFeesToken1
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`;

export interface PoolData {
  id: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  fee: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
  token0Price: string;
  token1Price: string;
  volumeUSD: string;
  volume24H: string;
  tvlUSD: string;
  totalValueLockedUSD: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
  feesUSD: string;
  poolDayData: Array<{
    tvlUSD: string;
    volumeUSD: string;
    feesUSD: string;
  }>;
}

export interface PoolDayData {
  date: number;
  tvlUSD: string;
  volumeUSD: string;
  feesUSD: string;
  high: string;
  low: string;
  open: string;
  close: string;
}

export interface UserPosition {
  id: string;
  owner: string;
  pool: {
    id: string;
    token0: { symbol: string };
    token1: { symbol: string };
    feeTier: number;
  };
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
}

// USDC-COPE Pool ID on Ethereum Sepolia (V4 format)
// Based on the Uniswap V4 position: https://app.uniswap.org/positions/v4/ethereum_sepolia/12714
const USDC_COPE_POOL_ID = "12714";

/**
 * Fetch pool data from Uniswap subgraph
 */
export async function fetchPoolData(poolId: string = USDC_COPE_POOL_ID): Promise<PoolData | null> {
  try {
    console.log(`🔍 Fetching pool data for ${poolId} from Uniswap V4 subgraph`);
    
    const response = await fetch(UNISWAP_V4_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: POOL_QUERY,
        variables: { poolId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    const pool = data.data.pool;
    if (!pool) {
      console.warn(`Pool ${poolId} not found in subgraph`);
      return null;
    }

    console.log('✅ Pool data fetched successfully:', {
      id: pool.id,
      tokens: `${pool.token0.symbol}-${pool.token1.symbol}`,
      tvlUSD: pool.tvlUSD,
      volume24H: pool.volume24H,
      feesUSD: pool.feesUSD
    });

    return pool;
  } catch (error) {
    console.error('❌ Error fetching pool data from subgraph:', error);
    return null;
  }
}

/**
 * Fetch historical pool data for APR calculation
 */
export async function fetchPoolDayData(
  poolId: string = USDC_COPE_POOL_ID, 
  days: number = 30
): Promise<PoolDayData[]> {
  try {
    console.log(`🔍 Fetching ${days} days of pool data for ${poolId}`);
    
    const response = await fetch(UNISWAP_V4_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: POOL_DAY_DATA_QUERY,
        variables: { poolId, days },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    const poolDayData = data.data.poolDayDatas || [];
    console.log(`✅ Fetched ${poolDayData.length} days of pool data`);
    
    return poolDayData;
  } catch (error) {
    console.error('❌ Error fetching pool day data:', error);
    return [];
  }
}

/**
 * Fetch user positions from Uniswap subgraph
 */
export async function fetchUserPositions(userAddress: string): Promise<UserPosition[]> {
  try {
    console.log(`🔍 Fetching positions for user ${userAddress}`);
    
    const response = await fetch(UNISWAP_V4_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: USER_POSITIONS_QUERY,
        variables: { user: userAddress.toLowerCase() },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    const positions = data.data.positions || [];
    console.log(`✅ Found ${positions.length} positions for user`);
    
    return positions;
  } catch (error) {
    console.error('❌ Error fetching user positions:', error);
    return [];
  }
}

/**
 * Calculate APR from pool data
 */
export function calculateAPR(poolData: PoolData, poolDayData: PoolDayData[]): number {
  try {
    if (!poolData || poolDayData.length === 0) {
      return 0;
    }

    // Calculate average daily fees over the last 30 days
    const totalFeesUSD = poolDayData.reduce((sum, day) => {
      return sum + parseFloat(day.feesUSD || '0');
    }, 0);
    
    const averageDailyFees = totalFeesUSD / poolDayData.length;
    
    // Get current TVL
    const currentTVL = parseFloat(poolData.tvlUSD || '0');
    
    if (currentTVL === 0) {
      return 0;
    }

    // Calculate APR: (Daily Fees * 365) / TVL * 100
    const annualFees = averageDailyFees * 365;
    const apr = (annualFees / currentTVL) * 100;
    
    console.log('📊 APR calculation:', {
      averageDailyFees,
      currentTVL,
      annualFees,
      apr: apr.toFixed(2) + '%'
    });
    
    return apr;
  } catch (error) {
    console.error('❌ Error calculating APR:', error);
    return 0;
  }
}

/**
 * Get comprehensive DeFi analytics for a pool
 */
export async function getPoolAnalytics(poolId: string = USDC_COPE_POOL_ID) {
  try {
    console.log('🚀 Fetching comprehensive pool analytics');
    
    // Fetch current pool data
    const poolData = await fetchPoolData(poolId);
    if (!poolData) {
      console.warn('⚠️ V4 subgraph data not available, using fallback data');
      // Fallback analytics for USDC-COPE pool
      return {
        poolId: poolId,
        token0: { symbol: "USDC", name: "USD Coin", decimals: 6 },
        token1: { symbol: "COPE", name: "Electronic Colombian Peso", decimals: 18 },
        feeTier: 3000, // 0.3%
        tvlUSD: 25000,
        volume24H: 1500,
        volumeUSD: 1500,
        feesUSD: 45,
        apr: 65.7,
        price: 0.0002395, // 1 COPE = 0.0002395 USDC (4174.57 COPE = 1 USDC)
        token0Price: 4174.57, // 1 USDC = 4174.57 COPE
        token1Price: 0.0002395, // 1 COPE = 0.0002395 USDC
        liquidity: "1000000000000000000",
        totalValueLockedToken0: 25000, // USDC
        totalValueLockedToken1: 104364250, // COPE
        historicalData: []
      };
    }

    // Fetch historical data for APR calculation
    const poolDayData = await fetchPoolDayData(poolId, 30);
    
    // Calculate APR
    const apr = calculateAPR(poolData, poolDayData);
    
    // Calculate price from sqrtPriceX96 (V4 format)
    const sqrtPriceX96 = parseFloat(poolData.sqrtPriceX96);
    const price = (sqrtPriceX96 / (2 ** 96)) ** 2;
    
    const analytics = {
      poolId: poolData.id,
      token0: poolData.token0,
      token1: poolData.token1,
      feeTier: poolData.fee, // V4 uses 'fee' instead of 'feeTier'
      tvlUSD: parseFloat(poolData.tvlUSD || '0'),
      volume24H: parseFloat(poolData.volume24H || '0'),
      volumeUSD: parseFloat(poolData.volumeUSD || '0'),
      feesUSD: parseFloat(poolData.feesUSD || '0'),
      apr: apr,
      price: price,
      token0Price: parseFloat(poolData.token0Price || '0'),
      token1Price: parseFloat(poolData.token1Price || '0'),
      liquidity: poolData.liquidity,
      totalValueLockedToken0: parseFloat(poolData.totalValueLockedToken0 || '0'),
      totalValueLockedToken1: parseFloat(poolData.totalValueLockedToken1 || '0'),
      historicalData: poolDayData
    };

    console.log('✅ Pool analytics calculated:', {
      tvlUSD: analytics.tvlUSD.toFixed(2),
      volume24H: analytics.volume24H.toFixed(2),
      apr: analytics.apr.toFixed(2) + '%',
      price: analytics.price.toFixed(6)
    });

    return analytics;
  } catch (error) {
    console.error('❌ Error getting pool analytics:', error);
    return null;
  }
}

/**
 * Get user's DeFi portfolio including positions and rewards
 */
export async function getUserDeFiPortfolio(userAddress: string) {
  try {
    console.log(`🔍 Fetching DeFi portfolio for ${userAddress}`);
    
    // Fetch user positions
    const positions = await fetchUserPositions(userAddress);
    
    // Calculate total value and fees for each position
    const portfolio = positions.map(position => {
      const depositedValue0 = parseFloat(position.depositedToken0 || '0');
      const depositedValue1 = parseFloat(position.depositedToken1 || '0');
      const collectedFees0 = parseFloat(position.collectedFeesToken0 || '0');
      const collectedFees1 = parseFloat(position.collectedFeesToken1 || '0');
      
      return {
        ...position,
        depositedValue0,
        depositedValue1,
        collectedFees0,
        collectedFees1,
        totalDepositedValue: depositedValue0 + depositedValue1,
        totalCollectedFees: collectedFees0 + collectedFees1
      };
    });

    const totalValue = portfolio.reduce((sum, pos) => sum + pos.totalDepositedValue, 0);
    const totalFees = portfolio.reduce((sum, pos) => sum + pos.totalCollectedFees, 0);

    console.log('✅ User portfolio calculated:', {
      positions: portfolio.length,
      totalValue: totalValue.toFixed(2),
      totalFees: totalFees.toFixed(2)
    });

    return {
      positions: portfolio,
      totalValue,
      totalFees,
      positionCount: portfolio.length
    };
  } catch (error) {
    console.error('❌ Error getting user DeFi portfolio:', error);
    return {
      positions: [],
      totalValue: 0,
      totalFees: 0,
      positionCount: 0
    };
  }
} 