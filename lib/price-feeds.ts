/**
 * Real-time price feeds and market data utilities
 * Replaces hardcoded mock data with live API integrations
 */

export interface PriceData {
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: Date;
}

export interface TokenMetrics {
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

/**
 * Fetch real-time price data from CoinGecko
 */
export async function fetchTokenPrice(coinId: string): Promise<PriceData> {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}` +
      `&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
    
    console.log(`🔍 Fetching price for ${coinId} from:`, url);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 API response for ${coinId}:`, data);
    
    const tokenData = data[coinId];
    
    if (!tokenData) {
      throw new Error(`Token ${coinId} not found`);
    }
    
    return {
      price: tokenData.usd,
      change24h: tokenData.usd_24h_change || 0,
      marketCap: tokenData.usd_market_cap,
      volume24h: tokenData.usd_24h_vol,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to fetch price for ${coinId}:`, error);
    throw new Error(`Unable to fetch real price data for ${coinId}`);
  }
}

/**
 * Fetch multiple token prices in a single request
 */
export async function fetchMultipleTokenPrices(coinIds: string[]): Promise<Record<string, PriceData>> {
  try {
    const idsParam = coinIds.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}` +
      `&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const result: Record<string, PriceData> = {};
    
    for (const coinId of coinIds) {
      const tokenData = data[coinId];
      if (tokenData) {
        result[coinId] = {
          price: tokenData.usd,
          change24h: tokenData.usd_24h_change || 0,
          marketCap: tokenData.usd_market_cap,
          volume24h: tokenData.usd_24h_vol,
          lastUpdated: new Date(),
        };
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch multiple token prices:', error);
    throw new Error('Unable to fetch real price data');
  }
}

/**
 * Calculate synthetic USDC/COPE exchange rate using real market prices
 */
export async function calculateUsdcCopeRate(): Promise<number> {
  try {
    const copePrice = await fetchTokenPrice('cope');
    
    // USDC is approximately $1, so USDC/COPE = 1 / COPE_USD_PRICE
    // This means: how many COPE tokens you get for 1 USDC
    const usdcCopeRate = 1 / copePrice.price;
    
    console.log('💰 Calculated USDC/COPE rate:', {
      copeUsdPrice: copePrice.price,
      usdcCopeRate,
      timestamp: copePrice.lastUpdated,
    });
    
    return usdcCopeRate;
  } catch (error) {
    console.error('❌ Failed to calculate USDC/COPE rate:', error);
    throw error;
  }
}

/**
 * Get trending tokens data
 */
export async function getTrendingTokens(): Promise<TokenMetrics[]> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.coins.slice(0, 5).map((coin: any) => ({
      symbol: coin.item.symbol.toUpperCase(),
      price: 0, // Would need additional API call for prices
      priceChange24h: 0,
      volume24h: 0,
      marketCap: coin.item.market_cap_rank || 0,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch trending tokens:', error);
    return [];
  }
}

/**
 * Price formatting utilities
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
}

export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toFixed(0)}`;
  }
}