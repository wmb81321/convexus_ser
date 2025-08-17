"use client";

import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { usePrivy } from '@privy-io/react-auth';
import { Badge } from '@/components/ui/badge';

export function SponsorshipDebug() {
  const { client } = useSmartWallets();
  const { user } = usePrivy();
  
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const alchemyPolicyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
  
  const hasValidPaymaster = alchemyApiKey && alchemyPolicyId && 
    alchemyPolicyId !== 'your_alchemy_policy_id' && 
    alchemyPolicyId !== 'your_alchemy_app_id';
    
  const smartWalletConnected = !!client?.account?.address;
  // Check if paymaster is available through the client configuration
  const paymasterContext = (client as any)?.paymasterContext;
  
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sponsorship Debug Info</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between">
          <span>Alchemy API Key:</span>
          <Badge variant={alchemyApiKey ? 'default' : 'destructive'}>
            {alchemyApiKey ? '✓ Set' : '✗ Missing'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Policy ID:</span>
          <Badge variant={hasValidPaymaster ? 'default' : 'destructive'}>
            {hasValidPaymaster ? '✓ Valid' : '✗ Invalid'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Smart Wallet:</span>
          <Badge variant={smartWalletConnected ? 'default' : 'destructive'}>
            {smartWalletConnected ? '✓ Connected' : '✗ Not Connected'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Paymaster Context:</span>
          <Badge variant={paymasterContext ? 'default' : 'destructive'}>
            {paymasterContext ? '✓ Available' : '✗ Not Available'}
          </Badge>
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-white dark:bg-gray-900 rounded text-xs">
        <div><strong>Policy ID:</strong> {alchemyPolicyId || 'Not set'}</div>
        <div><strong>Smart Wallet:</strong> {client?.account?.address || 'Not connected'}</div>
        <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
        <div><strong>Paymaster:</strong> {paymasterContext ? 'Configured' : 'Not configured'}</div>
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {hasValidPaymaster && smartWalletConnected && paymasterContext 
          ? "🎉 Gas sponsorship should be working!" 
          : "⚠️ Gas sponsorship may not be working. Check configuration above."
        }
      </div>
    </div>
  );
}
