'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useCrossChainPayment } from '@/src/hooks/useCrossChainPayment';

const CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', symbol: 'ETH' },
  { id: 84532, name: 'Base Sepolia', symbol: 'BASE' },
  { id: 11155420, name: 'Optimism Sepolia', symbol: 'OP' }
];

export function CrossChainPayment() {
  const { authenticated, user } = usePrivy();
  const { paymentStatus, executePayment, checkBalance, resetStatus, GATEWAY_ADDRESSES } = useCrossChainPayment();

  const [amount, setAmount] = useState('10'); // Default 10 USDC for demo
  const [recipient, setRecipient] = useState('');
  const [sourceChain, setSourceChain] = useState(11155111); // Sepolia
  const [destinationChain, setDestinationChain] = useState(84532); // Base
  const [sourceBalance, setSourceBalance] = useState('0');

  // Load balance when chain changes
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      checkBalance(sourceChain, user.wallet.address)
        .then(setSourceBalance)
        .catch(() => setSourceBalance('0'));
    }
  }, [sourceChain, authenticated, user?.wallet?.address, checkBalance]);

  // Set recipient to user's address by default
  useEffect(() => {
    if (user?.wallet?.address && !recipient) {
      setRecipient(user.wallet.address);
    }
  }, [user?.wallet?.address, recipient]);

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

  const isProcessing = ['approving', 'depositing', 'minting'].includes(paymentStatus.status);
  const isDeployed = GATEWAY_ADDRESSES[sourceChain as keyof typeof GATEWAY_ADDRESSES]?.wallet;

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold mb-4 text-center">Cross-Chain USDC</h2>
        <p className="text-center text-gray-600">Connect your wallet to send USDC across chains</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center">Cross-Chain USDC</h2>
      
      {/* Status Display */}
      {paymentStatus.status !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg text-center ${
          paymentStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
          paymentStatus.status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {getStatusMessage()}
          {paymentStatus.txHash && (
            <div className="mt-2 text-xs">
              Tx: {paymentStatus.txHash.slice(0, 10)}...
            </div>
          )}
        </div>
      )}

      {/* Deployment Warning */}
      {!isDeployed && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center text-sm">
          ⚠️ Contracts not deployed yet. Deploy first!
        </div>
      )}

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={isProcessing}
            step="0.000001"
            min="0"
          />
          <div className="mt-1 text-sm text-gray-600">
            Available: {sourceBalance} USDC
          </div>
        </div>

        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium mb-2">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            disabled={isProcessing}
          />
        </div>

        {/* Chain Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <select 
              value={sourceChain} 
              onChange={(e) => setSourceChain(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium mb-2">To</label>
            <select 
              value={destinationChain} 
              onChange={(e) => setDestinationChain(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg"
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

        {/* Send Button */}
        <button 
          onClick={handlePayment}
          disabled={isProcessing || !amount || !recipient || !isDeployed}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isProcessing || !amount || !recipient || !isDeployed
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Send Cross-Chain'}
        </button>

        {/* Reset Button */}
        {paymentStatus.status !== 'idle' && (
          <button 
            onClick={resetStatus}
            className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            New Payment
          </button>
        )}
      </div>

      {/* Contract Status */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Contract Status</h3>
        <div className="text-xs space-y-1">
          {CHAINS.map(chain => {
            const config = GATEWAY_ADDRESSES[chain.id as keyof typeof GATEWAY_ADDRESSES];
            const deployed = config?.wallet && config?.minter;
            return (
              <div key={chain.id} className="flex justify-between">
                <span>{chain.name}:</span>
                <span className={deployed ? 'text-green-600' : 'text-red-600'}>
                  {deployed ? '✅ Ready' : '❌ Deploy Needed'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
