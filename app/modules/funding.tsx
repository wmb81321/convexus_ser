"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine,
  ExternalLink,
  Copy,
  RefreshCw,
  CreditCard,
  Building2,
  DollarSign,
  Banknote,
  TrendingUp,
  Users,
  Shield,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import TokenIcon from "@/app/components/token-icon";
import ChainSelector from "@/app/components/chain-selector";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_CHAIN } from "@/lib/chains";
import { useFundWallet } from "@/app/hooks/useFundWallet";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";

type FundingType = 'cash-in' | 'cash-out';
type TokenSymbol = 'USDC' | 'ETH' | 'COPE';

interface QuoteRequest {
  type: FundingType;
  amount: string;
  token: TokenSymbol;
  chainId: number;
  fiatCurrency: string;
}

export default function Funding() {
  const { smartWalletAddress, canUseGasSponsorship } = useSmartWallet();
  const { fundWallet, status, reset, canFund, activeWalletAddress } = useFundWallet();
  
  const [activeSection, setActiveSection] = useState<'small-buy' | 'otc'>('small-buy');
  const [selectedProvider, setSelectedProvider] = useState<'coinbase' | 'moonpay'>('coinbase');
  
  // Small Buy section state
  const [smallBuyAmount, setSmallBuyAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC');
  const [chainId, setChainId] = useState(DEFAULT_CHAIN.chainId);
  
  // OTC section state
  const [otcType, setOtcType] = useState<FundingType>('cash-in');
  const [otcAmount, setOtcAmount] = useState('');
  const [otcToken, setOtcToken] = useState<TokenSymbol>('USDC');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [quoteId, setQuoteId] = useState<string | null>(null);

  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 11155111: return 'ethereum';
      case 84532: return 'base';
      case 11155420: return 'optimism';
      default: return 'ethereum';
    }
  };

  const handlePivyFunding = async () => {
    if (!canFund) {
      alert('Please connect your wallet first');
      return;
    }

    if (!smallBuyAmount || parseFloat(smallBuyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(smallBuyAmount) > 1000) {
      alert('Maximum purchase amount is $1,000. For larger amounts, use OTC trading.');
      return;
    }

    try {
      await fundWallet({
        amount: smallBuyAmount,
        currencyCode: selectedToken,
        network: getNetworkName(chainId) as 'ethereum' | 'base' | 'optimism',
        provider: selectedProvider,
      });
    } catch (error) {
      console.error('Funding failed:', error);
      alert(`Funding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleOtcQuote = async () => {
    const newQuoteId = Math.random().toString(36).substring(2, 15);
    setQuoteId(newQuoteId);
    
    // In production, this would make an API call to get a real quote
    const quoteRequest: QuoteRequest = {
      type: otcType,
      amount: otcAmount,
      token: otcToken,
      chainId: chainId,
      fiatCurrency: fiatCurrency,
    };
    
    console.log('🏦 OTC Quote Request:', quoteRequest);
    console.log('📋 Quote ID:', newQuoteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="w-6 h-6" />
            Funding Solutions
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Multiple ways to fund your wallet - from small purchases to institutional OTC trades
          </p>
          
          {/* Wallet Status */}
          {activeWalletAddress && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    {smartWalletAddress ? 'Smart Wallet' : 'Embedded Wallet'}
                  </span>
                  {canUseGasSponsorship && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      Gas Sponsored
                    </Badge>
                  )}
                </div>
                <code className="text-xs font-mono text-blue-700 dark:text-blue-300">
                  {activeWalletAddress.slice(0, 8)}...{activeWalletAddress.slice(-6)}
                </code>
              </div>
            </div>
          )}
          
          {/* Status Display */}
          {status.isLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Opening funding provider...</span>
              </div>
            </div>
          )}
          
          {status.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Error: {status.error}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={reset}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Section Selector */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant={activeSection === 'small-buy' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('small-buy')}
              className="flex-1 gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Small Buy (≤ $1,000)
            </Button>
            <Button
              variant={activeSection === 'otc' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('otc')}
              className="flex-1 gap-2"
            >
              <Building2 className="w-4 h-4" />
              OTC Trading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Small Buy Section */}
      {activeSection === 'small-buy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Small Buy Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Quick Purchase
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Buy crypto instantly with credit card or bank transfer
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount (max $1,000)"
                    value={smallBuyAmount}
                    onChange={(e) => setSmallBuyAmount(e.target.value)}
                    className="pl-10"
                    max="1000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum purchase: $1,000 USD
                </p>
              </div>

              {/* Token Selection */}
              <div>
                <Label>Select Token</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['USDC', 'ETH', 'COPE'].map((token) => (
                    <Button
                      key={token}
                      variant={selectedToken === token ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedToken(token as TokenSymbol)}
                      className="gap-2"
                    >
                      <TokenIcon symbol={token} size={16} />
                      {token}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <Label>Funding Provider</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={selectedProvider === 'coinbase' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedProvider('coinbase')}
                    className="gap-2"
                  >
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    Coinbase
                  </Button>
                  <Button
                    variant={selectedProvider === 'moonpay' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedProvider('moonpay')}
                    className="gap-2"
                  >
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    Moonpay
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProvider === 'coinbase' 
                    ? 'Coinbase CDP - Enterprise onramp with Apple Pay, Google Pay, and card payments'
                    : 'Moonpay - Global coverage with multiple payment methods'
                  }
                </p>
                {selectedProvider === 'coinbase' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default" className="bg-blue-100 text-blue-700 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      CDP Integrated
                    </Badge>
                  </div>
                )}
              </div>

              {/* Chain Selection */}
              <div>
                <Label>Select Network</Label>
                <ChainSelector 
                  currentChainId={chainId}
                  onChainChange={setChainId}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label>Quick Select</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['$50', '$100', '$250', '$500'].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setSmallBuyAmount(amount.replace('$', ''))}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Real Funding Button */}
              <Button 
                onClick={handlePivyFunding}
                className={`w-full gap-2 ${
                  selectedProvider === 'coinbase' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                }`}
                disabled={!smallBuyAmount || parseFloat(smallBuyAmount) > 1000 || !canFund || status.isLoading}
              >
                {status.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening {selectedProvider === 'coinbase' ? 'Coinbase' : 'Moonpay'}...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Buy with {selectedProvider === 'coinbase' ? 'Coinbase' : 'Moonpay'}
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">
                  {selectedProvider === 'coinbase' 
                    ? 'Powered by Coinbase CDP - Enterprise onramp with Apple Pay, Google Pay, and card payments'
                    : 'Powered by Moonpay - Global coverage with multiple payment methods'
                  }
                </p>
                
                {!canFund && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <span className="text-xs text-yellow-800">
                      Please connect your wallet to use funding
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Provider Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {selectedProvider === 'coinbase' ? 'Coinbase CDP Features' : 'Moonpay Features'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProvider === 'coinbase' ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Apple Pay & Google Pay</h4>
                      <p className="text-xs text-gray-600">Quick checkout with mobile payments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Instant Delivery</h4>
                      <p className="text-xs text-gray-600">Crypto delivered to your wallet in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Enterprise CDP API</h4>
                      <p className="text-xs text-gray-600">Developer Platform with advanced integration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Trusted by Millions</h4>
                      <p className="text-xs text-gray-600">Coinbase's secure and regulated platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Low Fees</h4>
                      <p className="text-xs text-gray-600">Competitive rates with transparent pricing</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Global Coverage</h4>
                      <p className="text-xs text-gray-600">Available in 160+ countries worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Multiple Payment Methods</h4>
                      <p className="text-xs text-gray-600">Cards, bank transfers, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Multi-Chain Support</h4>
                      <p className="text-xs text-gray-600">Buy crypto on multiple blockchains</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Fast KYC</h4>
                      <p className="text-xs text-gray-600">Quick verification for faster purchases</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Receive */}
              {smallBuyAmount && parseFloat(smallBuyAmount) > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-sm mb-2">Estimated Receipt</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">You pay:</span>
                    <span className="font-semibold">${smallBuyAmount} USD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">You receive:</span>
                    <div className="flex items-center gap-1">
                      <TokenIcon symbol={selectedToken} size={16} />
                      <span className="font-semibold">
                        ~{selectedToken === 'ETH' ? (parseFloat(smallBuyAmount) / 2000).toFixed(4) : smallBuyAmount} {selectedToken}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*Estimated amount, actual may vary based on current rates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* OTC Section */}
      {activeSection === 'otc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OTC Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                OTC Trading
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Large volume trades with institutional pricing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Transaction Type */}
              <div>
                <Label>Transaction Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={otcType === 'cash-in' ? 'default' : 'outline'}
                    onClick={() => setOtcType('cash-in')}
                    className="gap-2"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    Cash In
                  </Button>
                  <Button
                    variant={otcType === 'cash-out' ? 'default' : 'outline'}
                    onClick={() => setOtcType('cash-out')}
                    className="gap-2"
                  >
                    <ArrowUpFromLine className="w-4 h-4" />
                    Cash Out
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="otcAmount">Amount</Label>
                <Input
                  id="otcAmount"
                  type="number"
                  placeholder="Enter amount (minimum $1,000)"
                  value={otcAmount}
                  onChange={(e) => setOtcAmount(e.target.value)}
                  min="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum trade: $1,000 USD equivalent
                </p>
              </div>

              {/* Token Selection */}
              <div>
                <Label>Token</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['USDC', 'ETH', 'COPE'].map((token) => (
                    <Button
                      key={token}
                      variant={otcToken === token ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOtcToken(token as TokenSymbol)}
                      className="gap-2"
                    >
                      <TokenIcon symbol={token} size={16} />
                      {token}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Fiat Currency */}
              <div>
                <Label htmlFor="fiatCurrency">Fiat Currency</Label>
                <select
                  id="fiatCurrency"
                  className="w-full p-2 border rounded-md"
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="COP">COP - Colombian Peso</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              {/* Chain Selection */}
              <div>
                <Label>Network</Label>
                <ChainSelector 
                  currentChainId={chainId}
                  onChainChange={setChainId}
                />
              </div>

              {/* Get Quote Button */}
              <Button 
                onClick={handleOtcQuote}
                className="w-full gap-2"
                disabled={!otcAmount || parseFloat(otcAmount) < 1000}
              >
                <TrendingUp className="w-4 h-4" />
                Get OTC Quote
              </Button>

              {/* Quote Display */}
              {quoteId && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                    OTC Quote Generated
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Quote ID:</span>
                      <span className="font-mono">{quoteId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant={otcType === 'cash-in' ? 'default' : 'secondary'}>
                        {otcType === 'cash-in' ? 'Buy' : 'Sell'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>{otcAmount} {otcToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline">Pending Review</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                    Our OTC team will contact you within 1 business hour to finalize the trade.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* OTC Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                OTC Trading Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Institutional Pricing</h4>
                    <p className="text-xs text-gray-600">Better rates for large volume trades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Dedicated Support</h4>
                    <p className="text-xs text-gray-600">Personal relationship manager for your trades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Flexible Settlement</h4>
                    <p className="text-xs text-gray-600">Wire transfer, crypto, or mixed settlement options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Risk Management</h4>
                    <p className="text-xs text-gray-600">Advanced hedging strategies available</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-sm mb-2">OTC Trading Desk</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>📞 Phone: +1 (555) 123-4567</p>
                  <p>📧 Email: otc@convexo.finance</p>
                  <p>🕒 Hours: 24/7 for institutional clients</p>
                  <p>💬 Telegram: @ConvexoOTC</p>
                </div>
              </div>

              {/* Minimum Requirements */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 text-sm mb-2">
                  Minimum Requirements
                </h4>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• Minimum trade size: $1,000 USD</li>
                  <li>• Enhanced KYC verification required</li>
                  <li>• Corporate clients preferred for large trades</li>
                  <li>• Source of funds documentation may be required</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Features */}
      <Card>
        <CardHeader>
          <CardTitle>Why Choose Convexo Funding?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-sm text-gray-600">Multi-signature wallets and institutional custody solutions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Competitive Rates</h3>
              <p className="text-sm text-gray-600">Best-in-class pricing for both retail and institutional clients</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Round-the-clock customer support and trading assistance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}