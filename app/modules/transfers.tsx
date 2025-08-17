"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Download, ArrowUpDown, ExternalLink, Copy, Key } from "lucide-react";
import TokenBalances from "@/app/components/token-balances";
import SendModal from "@/app/components/send-modal";
import ReceiveModal from "@/app/components/receive-modal";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";
import { DEFAULT_CHAIN, getChainById } from "@/lib/chains";
import TokenIcon from "@/app/components/token-icon";
import { usePrivy } from "@privy-io/react-auth";


type WalletType = 'smart' | 'embedded';

export default function Transfers() {
  const { 
    wallet: embeddedWallet, 
    smartWalletAddress, 
    embeddedWalletAddress,
    client 
  } = useSmartWallet();
  
  const { exportWallet } = usePrivy();
  
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('smart');
  const [selectedChainId, setSelectedChainId] = useState(DEFAULT_CHAIN.chainId);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get current wallet address based on selection
  const currentWalletAddress = selectedWalletType === 'smart' 
    ? smartWalletAddress 
    : embeddedWalletAddress;

  const isSmartWalletSelected = selectedWalletType === 'smart';
  const selectedChain = getChainById(selectedChainId);

  // Export private key for embedded wallets
  const handleExportPrivateKey = async () => {
    if (!embeddedWallet || selectedWalletType !== 'embedded') return;
    
    setIsExporting(true);
    try {
      await exportWallet();
    } catch (error) {
      console.error('Failed to export wallet:', error);
      alert('Failed to export wallet. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Open wallet in block explorer
  const openInExplorer = () => {
    if (!currentWalletAddress || !selectedChain) return;
    
    const explorerUrl = `${selectedChain.blockExplorer}/address/${currentWalletAddress}`;
    window.open(explorerUrl, '_blank');
  };

  // Copy address to clipboard
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Transfers</h1>
        <p className="text-lg text-white">
          Send and receive tokens with your smart wallet or embedded wallet
        </p>
      </div>

      {/* Wallet Selection with Integrated Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Wallet Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Wallet Option */}
            <div 
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedWalletType === 'smart' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedWalletType('smart')}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <TokenIcon symbol="COPE" size={32} />
                  <div>
                    <h3 className="font-semibold text-lg">Smart Wallet</h3>
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      ✨ Gasless Transactions
                    </Badge>
                  </div>
                </div>

                {/* Address */}
                {smartWalletAddress && (
                  <div className="space-y-2">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-300 block truncate bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {smartWalletAddress}
                    </code>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(smartWalletAddress);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInExplorer();
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Explorer
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions - Only show if this wallet is selected */}
                {selectedWalletType === 'smart' && smartWalletAddress && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSendModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReceiveModal(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Receive
                      </Button>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-xs text-green-800 dark:text-green-200">
                        <strong>✨ Gasless transactions</strong> - No ETH needed for gas fees!
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Embedded Wallet Option */}
            <div 
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedWalletType === 'embedded' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedWalletType('embedded')}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <h3 className="font-semibold text-lg">Embedded Wallet</h3>
                    <Badge variant="outline" className="text-xs">
                      Direct Control
                    </Badge>
                  </div>
                </div>

                {/* Address */}
                {embeddedWalletAddress && (
                  <div className="space-y-2">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-300 block truncate bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {embeddedWalletAddress}
                    </code>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(embeddedWalletAddress);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInExplorer();
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Explorer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPrivateKey();
                        }}
                        disabled={isExporting}
                        className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700"
                      >
                        <Key className="w-3 h-3 mr-1" />
                        {isExporting ? 'Exporting...' : 'Export'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions - Only show if this wallet is selected */}
                {selectedWalletType === 'embedded' && embeddedWalletAddress && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSendModal(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReceiveModal(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Receive
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                          <strong>⚠️ Gas fees required</strong> - You pay transaction costs
                        </div>
                      </div>
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="text-xs text-orange-800 dark:text-orange-200">
                          <strong>🔑 Exportable</strong> - Use in MetaMask and other wallets
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      {currentWalletAddress && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Token Balances</CardTitle>
              
              {/* Wallet Type Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Active:</span>
                <Button
                  variant={isSmartWalletSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedWalletType('smart')}
                  className="h-8 px-3 text-xs"
                  disabled={!smartWalletAddress}
                >
                  🚀 Smart Wallet
                </Button>
                <Button
                  variant={!isSmartWalletSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedWalletType('embedded')}
                  className="h-8 px-3 text-xs"
                  disabled={!embeddedWalletAddress}
                >
                  🔐 Embedded
                </Button>
              </div>
            </div>
            
            {/* Active Wallet Info */}
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {isSmartWalletSelected ? 'Smart Wallet' : 'Embedded Wallet'}
                  </span>
                  <Badge variant={isSmartWalletSelected ? "default" : "secondary"} className="text-xs">
                    {isSmartWalletSelected ? 'Gas Sponsored' : 'User Pays Gas'}
                  </Badge>
                </div>
                <code className="text-xs font-mono text-gray-600 dark:text-gray-300">
                  {currentWalletAddress.slice(0, 6)}...{currentWalletAddress.slice(-4)}
                </code>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TokenBalances walletAddress={currentWalletAddress} />
          </CardContent>
        </Card>
      )}

      {/* Send Modal */}
      {showSendModal && currentWalletAddress && (
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          walletAddress={currentWalletAddress}
          chainId={selectedChainId}
          balances={[]} // Will be fetched by the modal
          walletType={selectedWalletType}
          isSmartWallet={isSmartWalletSelected}
        />
      )}

      {/* Receive Modal */}
      {showReceiveModal && currentWalletAddress && (
        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          walletAddress={currentWalletAddress}
          chainId={selectedChainId}
          walletType={selectedWalletType}
        />
      )}
    </div>
  );
}