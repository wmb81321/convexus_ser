"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import TokenIcon from "./token-icon";


export default function PrivySmartWallet() {


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TokenIcon symbol="COPE" size={32} />
            🎉 Welcome to Convexo - Smart Wallet Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 
                border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
              🚀 Welcome to the Future of Web3!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your smart wallet is ready for gasless transactions and cross-chain DeFi. 
              Experience seamless Web3 with account abstraction powered by Alchemy. 
              Access your detailed wallet information in <strong>Profile</strong> and 
              start sending tokens in <strong>Transfers</strong>.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-400">✅ Smart Features Active:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Gasless transactions (sponsored)</li>
                  <li>• Social & email authentication</li>
                  <li>• Multi-chain testnet support</li>
                  <li>• Account abstraction enabled</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">🔧 Infrastructure:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Bundler: Pimlico</li>
                  <li>• Paymaster: Alchemy</li>
                  <li>• Networks: ETH, UNI, OP, BASE Sepolia</li>
                  <li>• Provider: Privy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Smart Wallet Status & Features */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Multi-Chain Smart Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">🌐 Supported Networks:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Ethereum Sepolia (Default)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Unichain Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Optimism Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Base Sepolia</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">🪙 Supported Tokens:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>ETH (Native) - Ethereum Sepolia, Unichain Sepolia, Optimism Sepolia, Base Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>USDC - Ethereum Sepolia, Unichain Sepolia, Optimism Sepolia, Base Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>COPE - Ethereum Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">⏳</span>
                  <span>More tokens coming soon</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
} 