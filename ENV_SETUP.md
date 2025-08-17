# 🔧 Environment Setup Guide

## 🚨 CRITICAL: Fix the Paymaster Error

The error you're seeing is because the Alchemy Gas Manager policy ID needs to be properly configured. Here's how to fix it:

### 1. **Get Your Alchemy Gas Manager Policy ID**

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
2. Navigate to "Gas Manager" 
3. Create a new policy or copy existing policy ID
4. Make sure the policy is configured for Ethereum Sepolia testnet

### 2. **Update Your Environment Variables**

Replace the placeholder in your `.env.local`:

```bash
# REPLACE THIS PLACEHOLDER:
NEXT_PUBLIC_ALCHEMY_POLICY_ID=d6a1b0a4-4f71-4a92-bb4c-5e5f1b8c9d7e

# WITH YOUR REAL POLICY ID:
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_real_policy_id_from_alchemy
```

### 3. **Alternative: Disable Gas Sponsorship (Temporary)**

If you don't have an Alchemy Gas Manager policy yet, you can disable it temporarily:

```bash
# Comment out or remove the policy ID:
# NEXT_PUBLIC_ALCHEMY_POLICY_ID=

# Or set it to empty:
NEXT_PUBLIC_ALCHEMY_POLICY_ID=
```

## 📋 Complete Environment Setup

### Required Variables
```bash
# Privy App ID (Get from dashboard.privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=clzwgw5uj05wgm8bkjn5kw7kp

# Alchemy API Key (Get from dashboard.alchemy.com)
NEXT_PUBLIC_ALCHEMY_API_KEY=wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0

# Alchemy Gas Manager Policy ID (Get from dashboard.alchemy.com > Gas Manager)
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_real_policy_id_here

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
NODE_ENV=development
```

### Optional Variables
```bash
# The Graph API Key (for advanced DeFi analytics)
NEXT_PUBLIC_GRAPH_API_KEY=your_graph_api_key_here
```

## 🔍 Troubleshooting

### Paymaster Error (HTTP 400)
- **Cause**: Invalid or missing Alchemy Gas Manager policy ID
- **Solution**: Get a real policy ID from Alchemy dashboard or disable gas sponsorship

### Smart Wallet Not Working
- **Cause**: Missing Privy App ID or incorrect configuration
- **Solution**: Verify Privy App ID in dashboard.privy.io

### Balance Loading Issues
- **Cause**: Alchemy API key rate limits or network issues
- **Solution**: Check API key permissions and network connectivity

## 🚀 Quick Fix Commands

```bash
# Stop all servers
pkill -f "next dev" || true

# Clear Next.js cache
rm -rf .next

# Restart with clean environment
npm run dev
```

## ✅ Success Indicators

When everything is working correctly, you should see:
- ✅ App loads without errors
- ✅ Smart wallet connects successfully
- ✅ Real USDC balances display
- ✅ Cross-chain transfers work (with valid policy ID)
- ✅ No paymaster errors in console

---

**Need help?** The app will work without gas sponsorship if you don't have an Alchemy Gas Manager policy yet. Users will just pay their own gas fees.
