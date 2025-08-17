'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallet } from '@/app/hooks/useSmartWallet';
import { useCrossChainPayment } from '@/src/hooks/useCrossChainPayment';
import { fetchAllBalances, TokenBalance } from '@/lib/blockchain';
import { getChainById } from '@/lib/chains';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Wallet, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react';
import TokenIcon from './token-icon';
import ChainLogo from './chain-logo';

const CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
  { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
  { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP' }
];

export function CrossChainPayment() {
  const { authenticated } = usePrivy();
  const { smartWalletAddress, isSmartWallet, canUseGasSponsorship } = useSmartWallet();
  const { paymentStatus, executePayment, resetStatus, GATEWAY_ADDRESSES } = useCrossChainPayment();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceChain, setSourceChain] = useState(11155111); // Sepolia
  const [destinationChain, setDestinationChain] = useState(84532); // Base
  const [sourceBalances, setSourceBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [customRecipient, setCustomRecipient] = useState(false);

  // Get USDC balance from the source chain
  const usdcBalance = sourceBalances.find(balance => balance.symbol === 'USDC');
  const availableUsdc = usdcBalance ? parseFloat(usdcBalance.balance) : 0;

  // Load balances when chain or wallet changes
  useEffect(() => {
    const loadBalances = async () => {
      if (!smartWalletAddress) return;
      
      setIsLoadingBalances(true);
      try {
        console.log(`🔍 Loading USDC balance for smart wallet: ${smartWalletAddress} on chain ${sourceChain}`);
        const balances = await fetchAllBalances(smartWalletAddress, sourceChain);
        setSourceBalances(balances);
        console.log('✅ Balances loaded:', balances);
      } catch (error) {
        console.error('❌ Error loading balances:', error);
        setSourceBalances([]);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    loadBalances();
  }, [sourceChain, smartWalletAddress]);

  // Set recipient to smart wallet address by default
  useEffect(() => {
    if (smartWalletAddress && !customRecipient) {
      setRecipient(smartWalletAddress);
    }
  }, [smartWalletAddress, customRecipient]);

  const handlePayment = async () => {
    if (!authenticated || !smartWalletAddress) {
      alert('Please connect your smart wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > availableUsdc) {
      alert(`Insufficient USDC balance. Available: ${availableUsdc.toFixed(6)} USDC`);
      return;
    }

    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      alert('Please enter a valid recipient address');
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
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus.status) {
      case 'approving':
        return '🔄 Approving USDC...';
      case 'depositing':
        return '📦 Depositing to Gateway...';
      case 'minting':
        return '🪙 Minting on destination...';
      case 'completed':
        return '✅ Cross-chain payment completed!';
      case 'error':
        return `❌ Error: ${paymentStatus.error}`;
      default:
        return '';
    }
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const isProcessing = ['approving', 'depositing', 'minting'].includes(paymentStatus.status);
  const isDeployed = GATEWAY_ADDRESSES[sourceChain as keyof typeof GATEWAY_ADDRESSES]?.wallet;

  if (!authenticated || !smartWalletAddress) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold">Connect Smart Wallet</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your smart wallet to send USDC across chains
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          Cross-Chain USDC Transfer
        </CardTitle>
        
        {/* Smart Wallet Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isSmartWallet ? "default" : "secondary"} className="gap-1">
            <Wallet className="w-3 h-3" />
            Smart Wallet
            {canUseGasSponsorship && " • Gas Sponsored"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Display */}
        {paymentStatus.status !== 'idle' && (
          <div className={`p-4 rounded-lg text-center ${
            paymentStatus.status === 'completed' ? 'bg-green-50 text-green-800 border border-green-200' :
            paymentStatus.status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              {paymentStatus.status === 'completed' && <CheckCircle className="w-4 h-4" />}
              {paymentStatus.status === 'error' && <AlertCircle className="w-4 h-4" />}
              <span>{getStatusMessage()}</span>
            </div>
            {paymentStatus.txHash && (
              <div className="mt-2 text-xs font-mono">
                Tx: {paymentStatus.txHash.slice(0, 10)}...{paymentStatus.txHash.slice(-8)}
              </div>
            )}
          </div>
        )}

        {/* Deployment Warning */}
        {!isDeployed && (
          <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Contracts not deployed on {getChainById(sourceChain)?.name}</span>
            </div>
          </div>
        )}

        {/* Smart Wallet Address Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-800 dark:text-blue-400">Smart Wallet Address</div>
              <code className="text-xs font-mono text-blue-700 dark:text-blue-300">
                {smartWalletAddress.slice(0, 8)}...{smartWalletAddress.slice(-6)}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyAddress(smartWalletAddress)}
              className="h-8 px-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chain Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>From Chain</Label>
            <select 
              value={sourceChain} 
              onChange={(e) => setSourceChain(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
              disabled={isProcessing}
            >
              {CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
            
            {/* Source Chain Balance */}
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                <TokenIcon symbol="USDC" size={16} />
                <span className="text-sm">
                  {isLoadingBalances ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `${availableUsdc.toFixed(6)} USDC`
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <Label>To Chain</Label>
            <select 
              value={destinationChain} 
              onChange={(e) => setDestinationChain(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg mt-2"
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

        {/* Amount */}
        <div>
          <Label>Amount (USDC)</Label>
          <div className="relative mt-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isProcessing}
              step="0.000001"
              min="0"
              max={availableUsdc.toString()}
              className="pr-16"
            />
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <TokenIcon symbol="USDC" size={16} />
              <span className="text-sm text-gray-500">USDC</span>
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-600 flex justify-between">
            <span>Available: {availableUsdc.toFixed(6)} USDC</span>
            {availableUsdc > 0 && (
              <button 
                onClick={() => setAmount(availableUsdc.toString())}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={isProcessing}
              >
                Max
              </button>
            )}
          </div>
        </div>

        {/* Recipient */}
        <div>
          <div className="flex items-center justify-between">
            <Label>Recipient Address</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCustomRecipient(false);
                  setRecipient(smartWalletAddress);
                }}
                className={`text-xs px-2 py-1 rounded ${
                  !customRecipient 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isProcessing}
              >
                My Wallet
              </button>
              <button
                onClick={() => {
                  setCustomRecipient(true);
                  setRecipient('');
                }}
                className={`text-xs px-2 py-1 rounded ${
                  customRecipient 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isProcessing}
              >
                Custom
              </button>
            </div>
          </div>
          <Input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={isProcessing || !customRecipient}
            className="mt-2"
          />
          {!customRecipient && (
            <div className="mt-1 text-xs text-gray-500">
              Sending to your smart wallet on destination chain
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || !amount || !recipient || !isDeployed || availableUsdc === 0}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Send {amount || '0'} USDC
            </span>
          )}
        </Button>

        {/* Reset Button */}
        {paymentStatus.status !== 'idle' && (
          <Button 
            onClick={resetStatus}
            variant="outline"
            className="w-full"
          >
            New Transfer
          </Button>
        )}

        {/* Contract Status */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">Contract Status</h4>
          <div className="space-y-2">
            {CHAINS.map(chain => {
              const config = GATEWAY_ADDRESSES[chain.id as keyof typeof GATEWAY_ADDRESSES];
              const deployed = config?.wallet && config?.minter;
              return (
                <div key={chain.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChainLogo chainId={chain.id} size={16} />
                    <span className="text-sm">{chain.name}</span>
                  </div>
                  <Badge variant={deployed ? "default" : "secondary"} className="text-xs">
                    {deployed ? '✅ Ready' : '❌ Deploy Needed'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}