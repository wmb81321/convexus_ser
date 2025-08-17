"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { useCrossChainPayment } from "../../src/hooks/useCrossChainPayment";
import { usePrivy } from "@privy-io/react-auth";

const CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH', color: 'bg-blue-500' },
  { id: 84532, name: 'Base Sepolia', symbol: 'BASE', color: 'bg-blue-600' },
  { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP', color: 'bg-red-500' }
];

export default function CrossChainModule() {
  const { authenticated, user } = usePrivy();
  const { paymentStatus, executePayment, checkBalance, resetStatus, GATEWAY_ADDRESSES } = useCrossChainPayment();

  const [amount, setAmount] = useState('10');
  const [recipient, setRecipient] = useState('');
  const [sourceChain, setSourceChain] = useState(11155111);
  const [destinationChain, setDestinationChain] = useState(84532);
  const [sourceBalance, setSourceBalance] = useState('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Set recipient to user's address by default
  useEffect(() => {
    if (user?.wallet?.address && !recipient) {
      setRecipient(user.wallet.address);
    }
  }, [user?.wallet?.address, recipient]);

  // Load balance when chain changes
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setIsLoadingBalance(true);
      checkBalance(sourceChain, user.wallet.address)
        .then(setSourceBalance)
        .catch(() => setSourceBalance('0'))
        .finally(() => setIsLoadingBalance(false));
    }
  }, [sourceChain, authenticated, user?.wallet?.address, checkBalance]);

  const handlePayment = async () => {
    if (!authenticated || !user?.wallet?.address) {
      alert('Please connect your wallet');
      return;
    }

    if (parseFloat(amount) > parseFloat(sourceBalance)) {
      alert('Insufficient USDC balance');
      return;
    }

    try {
      await executePayment({
        sourceChain,
        destinationChain,
        amount,
        recipient
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus.status) {
      case 'approving':
        return { message: '🔄 Approving USDC...', color: 'text-blue-600' };
      case 'depositing':
        return { message: '📦 Depositing to Gateway...', color: 'text-blue-600' };
      case 'minting':
        return { message: '🪙 Completing transfer...', color: 'text-blue-600' };
      case 'completed':
        return { message: '✅ Cross-chain payment completed!', color: 'text-green-600' };
      case 'error':
        return { message: `❌ Error: ${paymentStatus.error}`, color: 'text-red-600' };
      default:
        return { message: '', color: '' };
    }
  };

  const isProcessing = ['approving', 'depositing', 'minting'].includes(paymentStatus.status);
  const sourceChainConfig = GATEWAY_ADDRESSES[sourceChain as keyof typeof GATEWAY_ADDRESSES];
  const destChainConfig = GATEWAY_ADDRESSES[destinationChain as keyof typeof GATEWAY_ADDRESSES];
  const isDeployed = sourceChainConfig?.wallet && destChainConfig?.minter;

  const statusInfo = getStatusMessage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-white">Cross-Chain USDC</h1>
        </div>
        <p className="text-lg text-white/80">
          Send USDC across chains with gasless transactions
        </p>
      </div>

      {/* Status Display */}
      {paymentStatus.status !== 'idle' && (
        <Card>
          <CardContent className="p-4">
            <div className={`text-center ${statusInfo.color}`}>
              <div className="font-medium">{statusInfo.message}</div>
              {paymentStatus.txHash && (
                <div className="mt-2 text-xs text-gray-500">
                  Tx: {paymentStatus.txHash.slice(0, 10)}...{paymentStatus.txHash.slice(-8)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gateway Status Warning */}
      {!isDeployed && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">Gateway contracts deployed!</div>
                <div className="text-sm">Ready for cross-chain transfers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Transfer Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Cross-Chain USDC Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
                step="0.000001"
                min="0"
                placeholder="10"
              />
              <div className="absolute right-3 top-3 text-gray-500 text-sm font-medium">USDC</div>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Available: {isLoadingBalance ? '...' : sourceBalance} USDC
            </div>
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <div className="mt-1 text-xs text-gray-500">
              Default: Your wallet address
            </div>
          </div>

          {/* Chain Selection */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">From Chain</label>
              <select 
                value={sourceChain} 
                onChange={(e) => setSourceChain(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              >
                {CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">To Chain</label>
              <select 
                value={destinationChain} 
                onChange={(e) => setDestinationChain(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              >
                {CHAINS.filter(chain => chain.id !== sourceChain).map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Visualization */}
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full ${CHAINS.find(c => c.id === sourceChain)?.color} flex items-center justify-center text-white font-bold mb-2`}>
                  {CHAINS.find(c => c.id === sourceChain)?.symbol.slice(0, 2)}
                </div>
                <div className="text-xs text-gray-600">Source</div>
              </div>
              
              <ArrowRightLeft className="w-6 h-6 text-gray-400" />
              
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full ${CHAINS.find(c => c.id === destinationChain)?.color} flex items-center justify-center text-white font-bold mb-2`}>
                  {CHAINS.find(c => c.id === destinationChain)?.symbol.slice(0, 2)}
                </div>
                <div className="text-xs text-gray-600">Destination</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing || !amount || !recipient || !isDeployed || parseFloat(amount) <= 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Send Cross-Chain (Gasless)
                </div>
              )}
            </Button>

            {paymentStatus.status !== 'idle' && (
              <Button 
                onClick={resetStatus}
                variant="outline"
                className="w-full"
              >
                Start New Transfer
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Gasless</div>
            </div>
            <div className="text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Fast</div>
            </div>
            <div className="text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Secure</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gateway Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CHAINS.map(chain => {
              const config = GATEWAY_ADDRESSES[chain.id as keyof typeof GATEWAY_ADDRESSES];
              const deployed = config?.wallet && config?.minter;
              return (
                <div key={chain.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${chain.color}`}></div>
                    <span className="font-medium">{chain.name}</span>
                  </div>
                  <Badge variant={deployed ? "default" : "secondary"}>
                    {deployed ? '✅ Ready' : '❌ Not Ready'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
