import { createPublicClient, http, formatEther, formatUnits, parseAbi } from 'viem';
import { sepolia, optimismSepolia, baseSepolia } from 'viem/chains';
import { getChainById, TokenContract, getAllChains } from './chains';

// ERC-20 ABI for balance and token info
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]);

// Create public clients for different chains
const getPublicClient = (chainId: number) => {
  try {
    switch (chainId) {
      case 11155111: // Ethereum Sepolia
        return createPublicClient({
          chain: sepolia,
          transport: http('https://eth-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'),
        });
      case 11155420: // Optimism Sepolia  
        return createPublicClient({
          chain: optimismSepolia,
          transport: http('https://opt-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'),
        });
      case 84532: // Base Sepolia
        return createPublicClient({
          chain: baseSepolia,
          transport: http('https://base-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'),
        });
      case 1301: // Unichain Sepolia
        return createPublicClient({
          chain: {
            id: 1301,
            name: 'Unichain Sepolia',
            network: 'unichain-sepolia',
            nativeCurrency: {
              decimals: 18,
              name: 'Ether',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://unichain-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'],
              },
              public: {
                http: ['https://unichain-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Unichain Sepolia Explorer',
                url: 'https://unichain-sepolia.blockscout.com',
              },
            },
            testnet: true,
          },
          transport: http('https://unichain-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'),
        });
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  } catch (error) {
    console.error(`Error creating client for chain ${chainId}:`, error);
    throw error;
  }
};

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  formattedBalance: string;
  usdValue?: string;
  contract?: string;
  contractExplorerUrl?: string; // New field for explorer link
  isLoading?: boolean;
  error?: string;
}

// Fetch native ETH balance
export async function fetchNativeBalance(
  walletAddress: string, 
  chainId: number
): Promise<TokenBalance> {
  try {
    const chain = getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const client = getPublicClient(chainId);
    const balance = await client.getBalance({ 
      address: walletAddress as `0x${string}` 
    });

    const balanceInEth = formatEther(balance);
    const formattedBalance = parseFloat(balanceInEth).toFixed(4);

    return {
      symbol: chain.nativeCurrency.symbol,
      name: chain.nativeCurrency.name,
      balance: balanceInEth,
      formattedBalance,
      // Mock USD value - you can integrate with price APIs
      usdValue: `$${(parseFloat(balanceInEth) * 2000).toFixed(2)}`, // Assuming $2000 per ETH
    };
  } catch (error) {
    console.error(`Error fetching native balance for chain ${chainId}:`, error);
    return {
      symbol: 'ETH',
      name: 'Ether',
      balance: '0',
      formattedBalance: '0.0000',
      error: 'Failed to load',
    };
  }
}

// Fetch ERC-20 token balance
export async function fetchTokenBalance(
  walletAddress: string,
  tokenContract: TokenContract,
  chainId: number
): Promise<TokenBalance> {
  console.log(`🔍 Fetching ${tokenContract.symbol} balance for ${walletAddress} on chain ${chainId}`);
  console.log(`Contract address: ${tokenContract.address}`);
  
  try {
    const chain = getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const client = getPublicClient(chainId);
    
    // Get token balance with detailed logging
    console.log(`📞 Calling balanceOf for ${tokenContract.symbol}...`);
    const balance = await client.readContract({
      address: tokenContract.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });

    console.log(`✅ Raw balance for ${tokenContract.symbol}:`, balance);

    // Format balance using token decimals
    const balanceFormatted = formatUnits(balance as bigint, tokenContract.decimals);
    const formattedBalance = parseFloat(balanceFormatted).toFixed(
      tokenContract.decimals === 6 ? 2 : 4
    );

    console.log(`✅ Formatted balance for ${tokenContract.symbol}: ${formattedBalance}`);

    // Create explorer URL for the token contract
    const contractExplorerUrl = `${chain.blockExplorer}/token/${tokenContract.address}`;

    // USD values
    let usdValue: string | undefined;
    if (tokenContract.symbol === 'USDC') {
      usdValue = `$${formattedBalance}`; // USDC is pegged to $1
    } else if (tokenContract.symbol === 'EURC') {
      // EURC is pegged to €1, approximate USD conversion
      const eurToUsd = 1.08; // Approximate EUR to USD rate
      usdValue = `$${(parseFloat(formattedBalance) * eurToUsd).toFixed(2)}`;
    }

    return {
      symbol: tokenContract.symbol,
      name: tokenContract.name,
      balance: balanceFormatted,
      formattedBalance,
      usdValue,
      contract: tokenContract.address,
      contractExplorerUrl,
    };
  } catch (error) {
    console.error(`❌ FAILED to fetch ${tokenContract.symbol} balance:`, error);
    console.error(`Contract: ${tokenContract.address}, Chain: ${chainId}, Wallet: ${walletAddress}`);
    
    // Create explorer URL even for failed requests
    const chain = getChainById(chainId);
    const contractExplorerUrl = chain ? `${chain.blockExplorer}/token/${tokenContract.address}` : undefined;
    
    return {
      symbol: tokenContract.symbol,
      name: tokenContract.name,
      balance: '0',
      formattedBalance: '0.00',
      usdValue: '$0.00',
      contract: tokenContract.address,
      contractExplorerUrl,
      error: 'Failed to load',
    };
  }
}



// Fetch all balances for a wallet on a specific chain
export async function fetchAllBalances(
  walletAddress: string,
  chainId: number
): Promise<TokenBalance[]> {
  const chain = getChainById(chainId);
  if (!chain) {
    return [];
  }

  const balances: TokenBalance[] = [];

  try {
    // Always fetch native balance first
    const nativeBalance = await fetchNativeBalance(walletAddress, chainId);
    balances.push(nativeBalance);

    // Fetch token balances if available on this chain
    const tokenPromises: Promise<TokenBalance>[] = [];
    
    if (chain.tokens.usdc) {
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.usdc, chainId));
    }
    
    if (chain.tokens.ecop) {
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.ecop, chainId));
    }
    
    if (chain.tokens.eurc) {
      tokenPromises.push(fetchTokenBalance(walletAddress, chain.tokens.eurc, chainId));
    }

    // Wait for all token balances
    if (tokenPromises.length > 0) {
      const tokenBalances = await Promise.all(tokenPromises);
      balances.push(...tokenBalances);
    }

  } catch (error) {
    console.error('Error fetching balances:', error);
  }

  return balances;
}

// Get USD price for tokens - REMOVED MOCK PRICES
// Use real price APIs only
export async function getTokenPrice(symbol: string): Promise<number> {
  console.warn(`getTokenPrice(${symbol}) called - use real price APIs instead`);
  return 0; // No mock data
}

// Format large numbers with proper suffixes
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
} 

/**
 * Fetch balances across all supported chains for a wallet address
 */
export async function fetchAllChainsBalances(walletAddress: string): Promise<{
  [chainId: number]: TokenBalance[];
}> {
  const allChains = getAllChains();
  const results: { [chainId: number]: TokenBalance[] } = {};
  
  // Fetch balances for all chains in parallel
  const promises = allChains.map(async (chain) => {
    try {
      const balances = await fetchAllBalances(walletAddress, chain.chainId);
      results[chain.chainId] = balances;
      return { chainId: chain.chainId, balances, error: null };
    } catch (error) {
      console.error(`Chain ${chain.chainId}: Error fetching balances:`, error);
      results[chain.chainId] = [];
      return { chainId: chain.chainId, balances: [], error };
    }
  });
  
  await Promise.all(promises);
  
  return results;
}

/**
 * Get aggregated balance summary across all chains
 */
export function getAggregatedBalanceSummary(allChainsBalances: { [chainId: number]: TokenBalance[] }): {
  totalEth: number;
  totalUsdc: number;
  totalCope: number;
  totalEurc: number;
  chainBreakdown: { [chainId: number]: { eth: number; usdc: number; cope: number; eurc: number; } };
} {
  const summary = {
    totalEth: 0,
    totalUsdc: 0,
    totalCope: 0,
    totalEurc: 0,
    chainBreakdown: {} as { [chainId: number]: { eth: number; usdc: number; cope: number; eurc: number; } }
  };
  
  Object.entries(allChainsBalances).forEach(([chainId, balances]) => {
    const chainSummary = { eth: 0, usdc: 0, cope: 0, eurc: 0 };
    
    balances.forEach(balance => {
      const amount = parseFloat(balance.balance);
      if (balance.symbol === 'ETH') {
        chainSummary.eth += amount;
        summary.totalEth += amount;
      } else if (balance.symbol === 'USDC') {
        chainSummary.usdc += amount;
        summary.totalUsdc += amount;
      } else if (balance.symbol === 'COPe') {
        chainSummary.cope += amount;
        summary.totalCope += amount;
      } else if (balance.symbol === 'EURC') {
        chainSummary.eurc += amount;
        summary.totalEurc += amount;
      }
    });
    
    summary.chainBreakdown[parseInt(chainId)] = chainSummary;
  });
  
  return summary;
} 