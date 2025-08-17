"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Zap, AlertCircle, ExternalLink, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { CrossChainPayment } from "@/app/components/CrossChainPayment";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";
import TokenIcon from "@/app/components/token-icon";
import ChainLogo from "@/app/components/chain-logo";

export default function CrossChainModule() {
  const { smartWalletAddress, isSmartWallet, canUseGasSponsorship } = useSmartWallet();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const features = [
    {
      icon: <ArrowRightLeft className="w-6 h-6 text-blue-600" />,
      title: "Cross-Chain USDC Transfers",
      description: "Send USDC seamlessly between Ethereum, Base, and Optimism testnets",
      status: "active",
      color: "blue"
    },
    {
      icon: <Zap className="w-6 h-6 text-green-600" />,
      title: "Gasless Transactions",
      description: "Smart wallet enables gas-free transactions across all supported chains",
      status: canUseGasSponsorship ? "active" : "unavailable",
      color: "green"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-purple-600" />,
      title: "Circle CCTP Integration",
      description: "Native Circle Cross-Chain Transfer Protocol for secure, fast transfers",
      status: "active",
      color: "purple"
    }
  ];

  const supportedChains = [
    { id: 11155111, name: "Ethereum Sepolia", symbol: "ETH", color: "text-blue-600" },
    { id: 84532, name: "Base Sepolia", symbol: "BASE", color: "text-cyan-600" },
    { id: 11155420, name: "Optimism Sepolia", symbol: "OP", color: "text-red-600" }
  ];

  // Recent transfers would be loaded from transaction history
  // For now showing empty state to encourage users to make their first transfer
  const recentTransfers: any[] = [];

  if (!smartWalletAddress) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold">Connect Smart Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect your smart wallet to access cross-chain USDC transfers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Cross-Chain Hub</h1>
        <p className="text-lg text-white">
          Transfer USDC seamlessly across multiple blockchain networks
        </p>
        
        {/* Wallet Status */}
        <div className="flex justify-center">
          <Badge variant={isSmartWallet ? "default" : "secondary"} className="gap-2">
            {isSmartWallet && "🚀 Smart Wallet"}
            {!isSmartWallet && "🦊 External Wallet"}
            {canUseGasSponsorship && " • Gas Sponsored"}
          </Badge>
        </div>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Cross-Chain Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  {feature.icon}
                  <Badge 
                    variant={feature.status === 'active' ? 'default' : 'secondary'}
                    className={feature.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                  >
                    {feature.status === 'active' ? 'Active' : 'Unavailable'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supported Networks */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportedChains.map((chain) => (
              <div key={chain.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <ChainLogo chainId={chain.id} size={32} />
                <div>
                  <div className="font-semibold text-sm">{chain.name}</div>
                  <div className={`text-xs ${chain.color}`}>Chain ID: {chain.id}</div>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                <TokenIcon symbol="USDC" size={20} />
                <span className="text-sm font-medium">
                  USDC is supported on all networks with native Circle CCTP integration
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-400">
                <strong>✅ Real Smart Wallet Balances:</strong> The transfer interface uses your actual USDC balances from your smart wallet across all supported chains.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Chain Transfer Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Cross-Chain Transfer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrossChainPayment />
        </CardContent>
      </Card>

      {/* Recent Transfers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Transfers
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransfers.length > 0 ? (
            <div className="space-y-3">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{transfer.from}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{transfer.to}</span>
                      </div>
                      <Badge 
                        variant={transfer.status === 'completed' ? 'default' : 'secondary'}
                        className={transfer.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      >
                        {transfer.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{transfer.amount}</div>
                      <div className="text-xs text-gray-500">{transfer.timestamp}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {transfer.txHash}
                    </code>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent cross-chain transfers</p>
              <p className="text-xs mt-1">Your transfer history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Settings</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gas Price Strategy</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>Auto (Recommended)</option>
                  <option>Fast</option>
                  <option>Standard</option>
                  <option>Slow</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Slippage Tolerance</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>0.1%</option>
                  <option>0.5%</option>
                  <option>1.0%</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-sm text-yellow-800 dark:text-yellow-400">
                <strong>Note:</strong> Advanced settings are for experienced users. 
                Default settings work best for most transactions.
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}