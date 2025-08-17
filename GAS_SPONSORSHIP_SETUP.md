# 🚀 Gas Sponsorship Setup Guide

## Current Issue
Your app has gas sponsorship configured but it's using a placeholder Policy ID instead of a real one from Alchemy. This is why transactions appear to work but gas sponsorship isn't actually functioning.

## Quick Fix

### Step 1: Get Your Alchemy Gas Manager Policy ID

1. **Go to Alchemy Dashboard**: https://dashboard.alchemy.com
2. **Navigate to "Gas Manager"** in the left sidebar
3. **Create a New Policy**:
   - Click "Create Policy"
   - Choose "Sponsorship Policy"
   - Set up rules for your policy (spending limits, etc.)
   - Select networks: **Ethereum Sepolia**, **Base Sepolia**, **Optimism Sepolia**
   - Save the policy and **copy the Policy ID**

### Step 2: Update Your Environment

Replace the placeholder in your `.env.local` file:

```bash
# CURRENT (placeholder - doesn't work):
NEXT_PUBLIC_ALCHEMY_POLICY_ID=eb98cd1a-4c00-4fe3-8e36-b3eedd6818de
# REPLACE WITH (your real policy ID):
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_actual_policy_id_from_alchemy
```

### Step 3: Restart Your Development Server

```bash
npm run dev
```

## How to Test Gas Sponsorship

1. **Connect your smart wallet** in the app
2. **Go to the Transfers module**
3. **Send a small amount** (like 0.001 ETH or 1 USDC)
4. **Check the transaction** - if gas sponsorship is working:
   - The transaction should be sent without prompting for gas fees
   - You'll see "Gas Sponsored" badge in the UI
   - Console logs will show "Transaction was sponsored: true"

## Alternative: Disable Gas Sponsorship Temporarily

If you don't want to set up gas sponsorship right now, you can disable it:

```bash
# Comment out or remove the policy ID:
# NEXT_PUBLIC_ALCHEMY_POLICY_ID=

# Or set it to empty:
NEXT_PUBLIC_ALCHEMY_POLICY_ID=
```

## Troubleshooting

### "Paymaster not available" errors
- Check that your Policy ID is correct
- Ensure the policy covers the networks you're using (Sepolia testnets)
- Verify the policy has sufficient spending limits

### Transactions still require gas fees
- Restart your development server after changing environment variables
- Check browser console for paymaster-related errors
- Ensure you're using a smart wallet (not embedded wallet) for gas sponsorship

## Production Deployment

For production, make sure to:
1. Create a production Policy ID in Alchemy
2. Set appropriate spending limits
3. Configure for mainnet networks (Ethereum, Base, Optimism)
4. Update your production environment variables
