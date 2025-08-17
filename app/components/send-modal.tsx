"use client";

import { useState, useEffect } from "react";
import { X, QrCode, Send, AlertCircle, ArrowRight, Network, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getChainById, SUPPORTED_CHAINS, getChainTokens } from "@/lib/chains";
import { TokenBalance, fetchAllBalances } from "@/lib/blockchain";
import { useSendTransaction } from "@privy-io/react-auth";
import { parseEther, parseUnits } from "viem";
import { useSponsoredTransactions } from "@/app/hooks/useSponsoredTransactions";
import ChainSelector from "./chain-selector";
import ChainLogo from "./chain-logo";
import TokenIcon from "./token-icon";
import QRScannerComponent from "./qr-scanner";
import { useCrossChainPayment, GATEWAY_ADDRESSES } from "../../src/hooks/useCrossChainPayment";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  chainId: number;
  balances: TokenBalance[];
  walletType?: 'smart' | 'embedded';
  isSmartWallet?: boolean;
}

export default function SendModal({
  isOpen,
  onClose,
  walletAddress,
  chainId,
  balances,
  walletType = 'smart',
  isSmartWallet = true,
}: SendModalProps) {
  const [step, setStep] = useState<'network' | 'token' | 'details' | 'confirm'>('network');
  const [selectedChainId, setSelectedChainId] = useState(chainId);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [networkTokens, setNetworkTokens] = useState<TokenBalance[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Cross-chain specific state
  const [isCrossChain, setIsCrossChain] = useState(false);
  const [destinationChainId, setDestinationChainId] = useState<number | null>(null);
  
  // Cross-chain payment hook
  const { executePayment, paymentStatus, resetStatus } = useCrossChainPayment();

  const selectedChain = getChainById(selectedChainId);
  const { sendTransaction } = useSendTransaction();
  const { sendSponsoredTransaction, status: sponsorshipStatus, reset: resetSponsorship } = useSponsoredTransactions();

  useEffect(() => {
    // Validate Ethereum address
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    setIsValidAddress(ethereumAddressRegex.test(recipientAddress));
  }, [recipientAddress]);

  // Fetch tokens for selected network
  useEffect(() => {
    const fetchNetworkTokens = async () => {
      if (!walletAddress) return;
      
      setIsLoadingTokens(true);
      try {
        // Fetch balances for the selected chain
        const chainBalances = await fetchAllBalances(walletAddress, selectedChainId);
        setNetworkTokens(chainBalances);
      } catch (error) {
        console.error('Error fetching network tokens:', error);
        setNetworkTokens([]);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchNetworkTokens();
  }, [selectedChainId, walletAddress]);

  const resetModal = () => {
    setStep('network');
    setSelectedChainId(chainId);
    setSelectedToken(null);
    setNetworkTokens([]);
    setRecipientAddress("");
    setAmount("");
    setShowQrScanner(false);
    setIsValidAddress(false);
    setIsLoading(false);
    setIsLoadingTokens(false);
    setTxHash(null);
    setShowSuccess(false);
    setIsCrossChain(false);
    setDestinationChainId(null);
    resetStatus();
  };

  // Check if selected token is USDC and cross-chain is available
  const isUSDCSelected = selectedToken?.symbol === 'USDC';
  const isCrossChainAvailable = isUSDCSelected && GATEWAY_ADDRESSES[selectedChainId as keyof typeof GATEWAY_ADDRESSES];
  
  // Get available destination chains for cross-chain USDC transfers
  const getAvailableDestinationChains = () => {
    if (!isUSDCSelected) return [];
    return Object.values(SUPPORTED_CHAINS).filter(chain => 
      chain.chainId !== selectedChainId && 
      GATEWAY_ADDRESSES[chain.chainId as keyof typeof GATEWAY_ADDRESSES]
    );
  };

  const handleClose = () => {
    resetModal();
    resetSponsorship();
    onClose();
  };

  const handleTokenSelect = (token: TokenBalance) => {
    setSelectedToken(token);
    setStep('details');
  };

  const handleQrScan = (result: string) => {
    // Extract address from QR code (handle ethereum: URIs)
    let address = result;
    if (result.startsWith('ethereum:')) {
      address = result.split('ethereum:')[1].split('?')[0];
    }
    setRecipientAddress(address);
    setShowQrScanner(false);
  };

  const handleSendTransaction = async () => {
    if (!selectedToken || !recipientAddress || !amount) return;
    
    setIsLoading(true);
    setTxHash(null);
    resetSponsorship();
    resetStatus();
    
    try {
      // Handle cross-chain USDC transfers
      if (isCrossChain && isUSDCSelected && destinationChainId) {
        console.log('🌉 Initiating cross-chain USDC transfer:', {
          sourceChain: selectedChainId,
          destinationChain: destinationChainId,
          amount: amount,
          recipient: recipientAddress,
        });

        await executePayment({
          sourceChain: selectedChainId,
          destinationChain: destinationChainId,
          amount: amount,
          recipient: recipientAddress,
        });

        // Cross-chain payment hook will handle the status updates
        if (paymentStatus.status === 'completed' && paymentStatus.txHash) {
          setTxHash(paymentStatus.txHash);
          setShowSuccess(true);
        }
        return;
      }

      console.log(`🚀 Attempting ${isSmartWallet ? 'sponsored' : 'regular'} transaction:`, {
        token: selectedToken.symbol,
        to: recipientAddress,
        amount: amount,
        chain: selectedChainId,
        walletType: walletType,
      });

      // Determine decimals for the token
      let decimals = 18; // Default for ETH
      if (selectedToken.symbol === 'USDC') decimals = 6;
      if (selectedToken.symbol === 'COPE') decimals = 6;

      let transactionHash: string;

      if (isSmartWallet) {
        // Use sponsored transaction flow for smart wallets
        await sendSponsoredTransaction({
          recipient: recipientAddress,
          amount: amount,
          tokenAddress: selectedToken.symbol === 'ETH' ? undefined : selectedToken.contract,
          decimals: decimals,
          chainId: selectedChainId,
        });

        // Get transaction hash from sponsorship status
        transactionHash = sponsorshipStatus.transactionHash || '';
      } else {
        // Use regular transaction flow for embedded wallets
        console.log('📝 Using embedded wallet transaction flow');
        
        if (selectedToken.symbol === 'ETH') {
          // Native ETH transfer
          const txResponse = await sendTransaction({
            to: recipientAddress as `0x${string}`,
            value: parseEther(amount),
            chainId: selectedChainId,
          });
          transactionHash = txResponse.hash;
        } else {
          // ERC-20 token transfer
          const tokenAmount = parseUnits(amount, decimals);
          
          // ERC-20 transfer function call data
          const transferSelector = '0xa9059cbb';
          const recipientPadded = recipientAddress.slice(2).padStart(64, '0');
          const amountPadded = tokenAmount.toString(16).padStart(64, '0');
          const callData = `${transferSelector}${recipientPadded}${amountPadded}`;

          const txResponse = await sendTransaction({
            to: selectedToken.contract as `0x${string}`,
            data: callData as `0x${string}`,
            chainId: selectedChainId,
          });
          transactionHash = txResponse.hash;
        }
      }

      if (transactionHash) {
        setTxHash(transactionHash);
        setShowSuccess(true);
      }
      
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // More specific error handling
      let userMessage = 'Transaction failed. Please try again.';
      if (errorMessage.includes('insufficient funds')) {
        userMessage = 'Insufficient balance to complete this transaction.';
      } else if (errorMessage.includes('gas')) {
        userMessage = 'Gas estimation failed. The network may be congested.';
      } else if (errorMessage.includes('rejected')) {
        userMessage = 'Transaction was rejected by user.';
      } else if (errorMessage.includes('No smart wallet connected')) {
        userMessage = 'Smart wallet not available. Try using embedded wallet instead.';
      }
      
      alert(`❌ ${userMessage}\n\nError details: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };



  const isAmountValid = () => {
    if (!amount || !selectedToken) return false;
    const numAmount = parseFloat(amount);
    const balance = parseFloat(selectedToken.balance);
    return numAmount > 0 && numAmount <= balance;
  };

  const canProceed = () => {
    switch (step) {
      case 'network':
        return selectedChain !== null;
      case 'token':
        return selectedToken !== null;
      case 'details':
        return isValidAddress && isAmountValid();
      case 'confirm':
        return selectedToken && isValidAddress && isAmountValid();
      default:
        return false;
    }
  };

  const getStepNumber = (stepName: string) => {
    switch (stepName) {
      case 'network': return 1;
      case 'token': return 2;
      case 'details': return 3;
      case 'confirm': return 4;
      default: return 1;
    }
  };

  const StepIndicator = () => {
    const steps = [
      { number: 1, name: 'network', label: 'Network' },
      { number: 2, name: 'token', label: 'Token' },
      { number: 3, name: 'details', label: 'Details' },
      { number: 4, name: 'confirm', label: 'Confirm' }
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((stepItem, index) => (
          <div key={stepItem.name} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber(step) >= stepItem.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {getStepNumber(step) > stepItem.number ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  stepItem.number
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {stepItem.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-4 ${
                  getStepNumber(step) > stepItem.number
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Crypto
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <StepIndicator />

          {/* Chain Info */}
          {(step === 'token' || step === 'details' || step === 'confirm') && (
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sending from
              </div>
              <div className="font-semibold flex items-center justify-center gap-2">
                <ChainLogo chainId={selectedChainId} size={20} />
                {selectedChain?.name}
              </div>
            </div>
          )}

          {/* Step 1: Network Selection */}
          {step === 'network' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Choose Network</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select the blockchain network where you want to send tokens.
              </p>
              <div className="space-y-3">
                <ChainSelector
                  currentChainId={selectedChainId}
                  onChainChange={setSelectedChainId}
                />
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Selected Network
                  </div>
                  <div className="font-semibold flex items-center justify-center gap-2">
                    <ChainLogo chainId={selectedChainId} size={20} />
                    {selectedChain?.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Token */}
          {step === 'token' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('network')}
                  className="p-0 h-auto text-blue-600"
                >
                  ← Back
                </Button>
                <span className="text-lg font-semibold">Choose Token</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select the token you want to send on {selectedChain?.name}.
              </p>
              
              {isLoadingTokens ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500">Loading tokens...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {networkTokens.length > 0 ? (
                    networkTokens.map((token, index) => (
                      <div
                        key={`${token.symbol}-${index}`}
                        onClick={() => !token.error && handleTokenSelect(token)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          token.error 
                            ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TokenIcon symbol={token.symbol} size={40} />
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-sm text-gray-500">{token.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{token.formattedBalance}</div>
                            {token.usdValue && (
                              <div className="text-sm text-gray-500">{token.usdValue}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        No tokens available on {selectedChain?.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Enter Details */}
          {step === 'details' && selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('token')}
                  className="p-0 h-auto text-blue-600"
                >
                  ← Back
                </Button>
                <span className="text-lg font-semibold">Send {selectedToken.symbol}</span>
              </div>
              
              {/* Selected Token Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <TokenIcon symbol={selectedToken.symbol} size={40} />
                  <div>
                    <div className="font-medium">{selectedToken.symbol}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Balance: {selectedToken.formattedBalance}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cross-Chain Toggle for USDC */}
              {isCrossChainAvailable && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-purple-900 dark:text-purple-100">
                        🌉 Cross-Chain Transfer
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        Send USDC to a different blockchain
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={isCrossChain ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setIsCrossChain(!isCrossChain);
                        if (!isCrossChain) {
                          // Set first available destination chain as default
                          const availableChains = getAvailableDestinationChains();
                          if (availableChains.length > 0) {
                            setDestinationChainId(availableChains[0].chainId);
                          }
                        } else {
                          setDestinationChainId(null);
                        }
                      }}
                      className="h-8"
                    >
                      {isCrossChain ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Destination Chain Selection */}
              {isCrossChain && isCrossChainAvailable && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Destination Chain
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {getAvailableDestinationChains().map((chain) => (
                      <div
                        key={chain.chainId}
                        onClick={() => setDestinationChainId(chain.chainId)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          destinationChainId === chain.chainId
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ChainLogo chainId={chain.chainId} size={24} />
                          <div>
                            <div className="font-medium">{chain.name}</div>
                            <div className="text-sm text-gray-500">
                              Native USDC on {chain.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {destinationChainId && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-xs text-green-800 dark:text-green-200">
                        ✨ <strong>Cross-chain transfer powered by Circle CCTP</strong> - Native USDC will be minted on destination chain
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQrScanner(!showQrScanner)}
                      className="px-3"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {recipientAddress && !isValidAddress && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle className="h-3 w-3" />
                      Invalid Ethereum address
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg pr-20"
                      step="any"
                      min="0"
                      max={selectedToken.balance}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {selectedToken.symbol}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Balance: {selectedToken.formattedBalance} {selectedToken.symbol}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAmount(selectedToken.balance)}
                      className="h-auto p-0 text-blue-600"
                    >
                      Max
                    </Button>
                  </div>
                  
                  {amount && selectedToken.usdValue && (
                    <div className="text-sm text-gray-500">
                      ≈ ${(parseFloat(amount) * parseFloat(selectedToken.usdValue.replace('$', ''))).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Cross-Chain Status Display */}
              {isCrossChain && paymentStatus.status !== 'idle' && (
                <div className={`p-3 rounded-lg text-center ${
                  paymentStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                  paymentStatus.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <div className="font-medium">
                    {paymentStatus.status === 'approving' && '🔄 Approving USDC...'}
                    {paymentStatus.status === 'depositing' && '📦 Depositing to Gateway...'}
                    {paymentStatus.status === 'minting' && '🪙 Minting on destination chain...'}
                    {paymentStatus.status === 'completed' && '✅ Cross-chain transfer completed!'}
                    {paymentStatus.status === 'error' && `❌ Error: ${paymentStatus.error}`}
                  </div>
                  {paymentStatus.txHash && (
                    <div className="text-xs mt-1">
                      Tx: {paymentStatus.txHash.slice(0, 10)}...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}



          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {step === 'network' && (
              <Button
                onClick={() => setStep('token')}
                disabled={!selectedChain}
                className="flex-1"
              >
                Continue to Tokens
              </Button>
            )}
            
            {step === 'token' && (
              <Button
                onClick={() => setStep('details')}
                disabled={!selectedToken}
                className="flex-1"
              >
                Continue to Details
              </Button>
            )}
            
            {step === 'details' && (
              <Button
                onClick={handleSendTransaction}
                disabled={isLoading || !canProceed() || (isCrossChain && !destinationChainId) || (isCrossChain && ['approving', 'depositing', 'minting'].includes(paymentStatus.status))}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                {isLoading || (isCrossChain && ['approving', 'depositing', 'minting'].includes(paymentStatus.status)) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isCrossChain ? 'Cross-Chain Transfer...' : 'Sending...'}
                  </div>
                ) : (
                  isCrossChain ? "🌉 SEND CROSS-CHAIN" : "🚀 SEND IT"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner */}
      <QRScannerComponent
        isOpen={showQrScanner}
        onScan={handleQrScan}
        onClose={() => setShowQrScanner(false)}
      />
    </div>
  );
} 