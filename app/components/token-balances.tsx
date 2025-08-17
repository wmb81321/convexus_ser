"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ExternalLink, Copy, Check, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllChains, getChainById, ChainConfig } from "@/lib/chains";
import { fetchAllChainsBalances, getAggregatedBalanceSummary, TokenBalance } from "@/lib/blockchain";
import ChainLogo from "./chain-logo";
import TokenIcon from "./token-icon";

interface TokenBalancesProps {
  walletAddress: string;
}

export default function TokenBalances({ walletAddress }: TokenBalancesProps) {
  const [allChainsBalances, setAllChainsBalances] = useState<{ [chainId: number]: TokenBalance[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const chains = getAllChains();
  const aggregatedSummary = getAggregatedBalanceSummary(allChainsBalances);

  // Fetch balances across all chains
  const fetchBalances = useCallback(async () => {
    if (!walletAddress) {
      console.log('⚠️ TokenBalances: No wallet address provided');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🔍 TokenBalances: Fetching multi-chain balances for ${walletAddress}`);
      
      const balances = await fetchAllChainsBalances(walletAddress);
      setAllChainsBalances(balances);
      setLastUpdated(new Date());
      
      console.log('✅ TokenBalances: Multi-chain balances fetched successfully');
    } catch (error) {
      console.error("❌ TokenBalances: Error fetching multi-chain balances:", error);
      setAllChainsBalances({});
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);



  useEffect(() => {
    fetchBalances();
  }, [walletAddress, fetchBalances]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };



  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // Get all unique tokens across all chains
  type TokenSummary = {
    symbol: string;
    name: string;
    totalBalance: number;
    chains: { chainId: number; balance: number; chainName: string }[];
  };
  
  const getAllTokens = (): TokenSummary[] => {
    const tokenMap = new Map<string, TokenSummary>();
    
    Object.entries(allChainsBalances).forEach(([chainId, balances]) => {
      const chain = getChainById(parseInt(chainId));
      if (!chain) return;
      
      balances.forEach(balance => {
        const amount = parseFloat(balance.balance);
        if (amount === 0) return;
        
        const existing = tokenMap.get(balance.symbol);
        if (existing) {
          existing.totalBalance += amount;
          existing.chains.push({ chainId: parseInt(chainId), balance: amount, chainName: chain.shortName });
        } else {
          tokenMap.set(balance.symbol, {
            symbol: balance.symbol,
            name: balance.name,
            totalBalance: amount,
            chains: [{ chainId: parseInt(chainId), balance: amount, chainName: chain.shortName }]
          });
        }
      });
    });
    
    return Array.from(tokenMap.values()).sort((a, b) => b.totalBalance - a.totalBalance);
  };

  const allTokens = getAllTokens();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Cross-Chain Token Balances
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBalances}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <TokenIcon symbol="ETH" size={40} />
              <div className="font-semibold">{formatNumber(aggregatedSummary.totalEth, 6)} ETH</div>
              <div className="text-sm text-gray-500">Total across all chains</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <TokenIcon symbol="USDC" size={40} />
              <div className="font-semibold">{formatNumber(aggregatedSummary.totalUsdc, 2)} USDC</div>
              <div className="text-sm text-gray-500">Total across all chains</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <TokenIcon symbol="COPe" size={40} />
              <div className="font-semibold">{formatNumber(aggregatedSummary.totalCope, 2)} COPe</div>
              <div className="text-sm text-gray-500">Total across all chains</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <TokenIcon symbol="EURC" size={40} />
              <div className="font-semibold">{formatNumber(aggregatedSummary.totalEurc, 2)} EURC</div>
              <div className="text-sm text-gray-500">Total across all chains</div>
            </div>
          </div>





          {/* Token Balances by Chain */}
          <div className="space-y-4">
            <h4 className="font-semibold">Token Balances by Chain</h4>
            
            {allTokens.map((token) => (
              <div key={token.symbol} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={token.symbol} size={40} />
                    <div>
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-gray-500">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatNumber(token.totalBalance, token.symbol === 'ETH' ? 6 : 2)} {token.symbol}</div>
                    <div className="text-sm text-gray-500">Total across {token.chains.length} chain{token.chains.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                
                {/* Chain breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {token.chains.map((chain) => (
                    <div key={chain.chainId} className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-center">
                      <div className="text-xs text-gray-500">{chain.chainName}</div>
                      <div className="font-medium">{formatNumber(chain.balance, token.symbol === 'ETH' ? 6 : 2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Loading state */}
          {isLoading && allTokens.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading balances across all chains...</span>
              </div>
            </div>
          )}

          {/* No tokens message */}
          {!isLoading && allTokens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">
                💡 No token balances found across any chains
              </div>
              <div className="text-xs mt-1">
                Make sure you have tokens on any of the supported chains
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </>
  );
} 