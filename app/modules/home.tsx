"use client";

import { usePrivy } from "@privy-io/react-auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Shield, 
  Zap, 
  Globe 
} from "lucide-react";
import PrivySmartWallet from "../components/privy-smart-wallet";

export default function Home() {
  const { user, authenticated } = usePrivy();

  // Show smart wallet interface when authenticated
  // (smart wallets are created automatically)
  if (authenticated && user) {
    return (
      <div className="space-y-6">
        {/* Smart Wallet Dashboard - Clean Interface */}
        <PrivySmartWallet />
      </div>
    );
  }

  // This should rarely show now since login 
  // creates smart wallets automatically
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Convexo Smart Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Your gateway to gasless transactions and cross-chain DeFi
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
              🚀 Smart wallets are created automatically when you connect!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 