"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function EnvDebug() {
  const envVars = {
    'NEXT_PUBLIC_PRIVY_APP_ID': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    'NEXT_PUBLIC_ALCHEMY_API_KEY': process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    'NEXT_PUBLIC_ALCHEMY_POLICY_ID': process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
    'NEXT_PUBLIC_ALCHEMY_APP_ID': process.env.NEXT_PUBLIC_ALCHEMY_APP_ID,
  };

  const getStatus = (value: string | undefined) => {
    if (!value) return { icon: <XCircle className="w-4 h-4 text-red-500" />, status: 'Missing', color: 'bg-red-50 text-red-700' };
    if (value.includes('your_') || value.includes('clzwgw5uj05wgm8bkjn5kw7kp')) return { icon: <AlertCircle className="w-4 h-4 text-yellow-500" />, status: 'Default/Test', color: 'bg-yellow-50 text-yellow-700' };
    return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, status: 'Configured', color: 'bg-green-50 text-green-700' };
  };

  // Check if gas sponsorship should work
  const hasPolicyId = envVars.NEXT_PUBLIC_ALCHEMY_POLICY_ID && !envVars.NEXT_PUBLIC_ALCHEMY_POLICY_ID.includes('your_');
  const hasAppId = envVars.NEXT_PUBLIC_ALCHEMY_APP_ID && !envVars.NEXT_PUBLIC_ALCHEMY_APP_ID.includes('your_');
  const gasSponsorship = hasPolicyId || hasAppId;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">🔧 Environment Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(envVars).map(([key, value]) => {
          const status = getStatus(value);
          return (
            <div key={key} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                {status.icon}
                <span className="text-sm font-medium">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={status.color}>
                  {status.status}
                </Badge>
                {value && (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {value.slice(0, 8)}...{value.slice(-4)}
                  </code>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 rounded-lg border-2 border-dashed">
          <div className="flex items-center gap-2">
            {gasSponsorship ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">
              Gas Sponsorship: {gasSponsorship ? 'ENABLED ✅' : 'DISABLED ❌'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {gasSponsorship 
              ? 'Smart wallet transactions will be sponsored by Alchemy Gas Manager'
              : 'Users will pay their own gas fees. Set NEXT_PUBLIC_ALCHEMY_POLICY_ID or NEXT_PUBLIC_ALCHEMY_APP_ID to enable sponsorship.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
