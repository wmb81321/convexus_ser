"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";

/**
 * Hook for smart wallet management
 */
export function useSmartWallet() {
  const { user, authenticated } = usePrivy();
  const { client } = useSmartWallets();

  const embeddedWallet = useMemo(() => {
    // Get embedded wallet (foundation for smart wallet functionality)
    return user?.linkedAccounts?.find(
      (account) => account.type === 'wallet'
    ) || null;
  }, [user]);

  const smartWalletAddress = useMemo(() => {
    // Get the actual smart wallet address from the client
    return client?.account?.address || null;
  }, [client]);

  return {
    wallet: embeddedWallet,
    client,
    isSmartWallet: !!smartWalletAddress,
    canUseGasSponsorship: !!smartWalletAddress,
    address: smartWalletAddress,
    embeddedWalletAddress: embeddedWallet?.address,
    smartWalletAddress,
    isLoading: authenticated && !client,
  };
}