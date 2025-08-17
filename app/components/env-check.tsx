"use client";

/**
 * Simple environment variables check component
 * This helps debug environment variable access issues
 */
export function EnvCheck() {
  const envVars = {
    'NEXT_PUBLIC_PRIVY_APP_ID': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    'NEXT_PUBLIC_ALCHEMY_API_KEY': process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    'NEXT_PUBLIC_ALCHEMY_POLICY_ID': process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
    'NEXT_PUBLIC_ALCHEMY_APP_ID': process.env.NEXT_PUBLIC_ALCHEMY_APP_ID,
  };

  // Check if we have a valid policy ID (not a placeholder)
  const policyId = envVars.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
  const isValidPolicyId = policyId && 
    policyId !== 'your_alchemy_policy_id' && 
    policyId !== 'your_alchemy_app_id' &&
    policyId !== 'd6a1b0a4-4f71-4a92-bb4c-5e5f1b8c9d7e' && 
    policyId !== 'your_real_policy_id_from_alchemy_dashboard';

  // Log to console for debugging
  console.log('🔧 Environment Variables Check:', {
    privyAppId: !!envVars.NEXT_PUBLIC_PRIVY_APP_ID,
    alchemyApiKey: !!envVars.NEXT_PUBLIC_ALCHEMY_API_KEY,
    alchemyPolicyId: policyId,
    isValidPolicyId,
    gasSponsorshipEnabled: isValidPolicyId
  });

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">🔧 Environment Check</h3>
      <div className="space-y-1 text-blue-700">
        <div>Privy App ID: {envVars.NEXT_PUBLIC_PRIVY_APP_ID ? '✅ Set' : '❌ Missing'}</div>
        <div>Alchemy API Key: {envVars.NEXT_PUBLIC_ALCHEMY_API_KEY ? '✅ Set' : '❌ Missing'}</div>
        <div>Alchemy Policy ID: {isValidPolicyId ? '✅ Valid' : '❌ Invalid/Placeholder'}</div>
        <div>Gas Sponsorship: {isValidPolicyId ? '✅ Enabled' : '❌ Disabled'}</div>
      </div>
      {!isValidPolicyId && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          ⚠️ Replace placeholder Policy ID with real one from Alchemy Dashboard
        </div>
      )}
    </div>
  );
}
