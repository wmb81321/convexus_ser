"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginCard() {
  const { login, ready } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!ready) return;
    
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card hover-lift transition-institutional">
      <CardHeader className="text-center pb-6">
        {/* Professional Convexo Logo */}
        <div className="mx-auto mb-6 relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-2 shadow-lg">
            <Image
              src="/convexo-logo.png"
              alt="Convexo Logo"
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        
        <CardTitle className="text-3xl font-bold heading-institutional mb-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Convexo Wallet
          </span>
        </CardTitle>
        
        <CardDescription className="text-base text-institutional-light leading-relaxed">
          Experience next-generation smart wallets with gasless transactions and institutional-grade security
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Professional Features List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center heading-institutional text-lg">
            🏛️ Institutional Features
          </h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-200/30">
              <span className="text-green-600 text-lg">✅</span>
              <span className="text-sm font-medium text-institutional">
                Gas-sponsored transactions
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/30">
              <span className="text-blue-600 text-lg">🔐</span>
              <span className="text-sm font-medium text-institutional">
                Enterprise-grade security
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200/30">
              <span className="text-purple-600 text-lg">🌐</span>
              <span className="text-sm font-medium text-institutional">
                Multi-chain support
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200/30">
              <span className="text-orange-600 text-lg">📱</span>
              <span className="text-sm font-medium text-institutional">
                Social & email authentication
              </span>
            </div>
          </div>
        </div>

        {/* Professional Call to Action */}
        <div className="space-y-4 pt-2">
          <Button
            onClick={handleLogin}
            disabled={!ready || isLoggingIn}
            className="w-full btn-institutional h-12 text-base font-semibold transition-institutional rounded-xl"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Connecting Wallet...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>🚀</span>
                Connect Smart Wallet
              </div>
            )}
          </Button>
          
          <p className="text-xs text-center text-institutional-light">
            Powered by Alchemy Gas Manager & Privy Smart Wallets
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
