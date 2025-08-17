"use client";

import { useState } from "react";
import { ChevronDown, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
// Using custom dropdown instead of shadcn dropdown-menu
import { getAllChains, getChainById, ChainConfig } from "@/lib/chains";
import ChainLogo from "./chain-logo";

interface ChainSelectorProps {
  currentChainId: number;
  onChainChange: (chainId: number) => void;
  disabled?: boolean;
}

export default function ChainSelector({ 
  currentChainId, 
  onChainChange, 
  disabled = false 
}: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chains = getAllChains();
  const currentChain = getChainById(currentChainId);

  const handleChainSelect = (chainId: number) => {
    onChainChange(chainId);
    setIsOpen(false);
  };



  const getChainColor = (chain: ChainConfig) => {
    switch (chain.chainId) {
      case 11155111: return "bg-blue-100 text-blue-800"; // Ethereum
      case 1301: return "bg-purple-100 text-purple-800"; // Unichain
      case 11155420: return "bg-red-100 text-red-800"; // Optimism
      case 84532: return "bg-indigo-100 text-indigo-800"; // Base
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!currentChain) {
    return (
      <div className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm">
        ⚠️ Unknown Chain
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[200px] justify-between bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <ChainLogo chainId={currentChain.chainId} size={20} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{currentChain.shortName}</span>
            {currentChain.isDefault && (
              <span className="text-xs text-gray-500">Default</span>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-[250px] p-1">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Select Testnet
          </div>
          
          {chains.map((chain) => (
            <div
              key={chain.chainId}
              onClick={() => handleChainSelect(chain.chainId)}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded-sm"
            >
              <ChainLogo chainId={chain.chainId} size={24} />
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{chain.name}</span>
                  {chain.isDefault && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    Chain ID: {chain.chainId}
                  </span>
                  {chain.tokens.usdc && chain.tokens.ecop && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">Tokens Available</span>
                    </div>
                  )}
                </div>
              </div>
              
              {currentChainId === chain.chainId && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
          ))}
          
          <div className="border-t mt-1 pt-2 px-2">
            <div className="text-xs text-gray-500">
              💡 More testnets coming soon
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 