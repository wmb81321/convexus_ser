# Getting Started

> **Quick start guide for CCTP Gateway Protocol**

## 🚀 Quick Start (5 Minutes)

Get up and running with cross-chain USDC transfers in minutes.

### Prerequisites

- **Node.js 18+** and npm
- **Wallet with testnet ETH** on supported chains
- **Alchemy API key** ([Get one free](https://alchemy.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cctp-gateway
cd cctp-gateway

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your configuration:

```bash
# Required - Alchemy API key for RPC access
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Required - Deployer private key (for contract deployment)
DEPLOYER_PRIVATE_KEY=your_private_key_with_testnet_eth

# Gateway Configuration (use your addresses or defaults)
NEXT_PUBLIC_GATEWAY_OWNER=0x...
NEXT_PUBLIC_GATEWAY_PAUSER=0x...
NEXT_PUBLIC_GATEWAY_DENYLISTER=0x...
NEXT_PUBLIC_GATEWAY_BURN_SIGNER=0x...
NEXT_PUBLIC_GATEWAY_FEE_RECIPIENT=0x...
NEXT_PUBLIC_GATEWAY_ATTESTATION_SIGNER=0x...
```

### Deploy & Run

```bash
# Deploy contracts to all testnets (2-3 minutes)
npm run deploy:all

# Start development server
npm run dev
```

Visit `http://localhost:3000` and you're ready to test cross-chain USDC transfers!

## 🌐 Supported Networks

| Network | Chain ID | USDC Address | Status |
|---------|----------|--------------|---------|
| **Ethereum Sepolia** | 11155111 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | ✅ Active |
| **Base Sepolia** | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | ✅ Active |
| **Optimism Sepolia** | 11155420 | `0x5fd84259d66Cd46123540766Be93DFE6D43130D7` | ✅ Active |

## 🎯 First Cross-Chain Transfer

### Step 1: Get Testnet USDC

1. Visit [Circle's USDC Faucet](https://faucet.circle.com)
2. Connect your wallet
3. Request USDC on Ethereum Sepolia
4. Wait for confirmation (~1 minute)

### Step 2: Connect Your Wallet

1. Open your application at `http://localhost:3000`
2. Click "Connect Wallet"
3. Choose your preferred login method (email, social, or wallet)
4. Complete authentication

### Step 3: Make a Transfer

1. **Select Source Chain**: Choose "Ethereum Sepolia"
2. **Select Destination Chain**: Choose "Base Sepolia"
3. **Enter Amount**: Start with 10 USDC for testing
4. **Enter Recipient**: Use your own address for testing
5. **Click "Send Cross-Chain Payment"**

### Step 4: Monitor Progress

Watch the status updates:
- ✅ **Approving**: USDC spending approval (gasless)
- ✅ **Depositing**: USDC deposited to gateway
- ⏳ **Waiting Attestation**: Circle processing (12-20 minutes)
- ✅ **Minting**: USDC minted on destination chain
- 🎉 **Completed**: Transfer successful!

## 💻 Integration Examples

### React Hook Usage

```typescript
import { useCrossChainPayment } from './hooks/useCrossChainPayment';

function PaymentComponent() {
  const { initiatePayment, paymentStatus } = useCrossChainPayment();

  const handlePayment = async () => {
    await initiatePayment({
      sourceChainId: 11155111,      // Ethereum Sepolia
      destinationChainId: 84532,    // Base Sepolia  
      amount: '25.50',              // 25.5 USDC
      recipient: '0x...'            // Recipient address
    });
  };

  return (
    <div>
      <button onClick={handlePayment}>
        Send Cross-Chain USDC
      </button>
      <p>Status: {paymentStatus.status}</p>
      {paymentStatus.txHash && (
        <p>Transaction: {paymentStatus.txHash}</p>
      )}
    </div>
  );
}
```

### React Component Usage

```typescript
import { CrossChainPayment } from './components/ui/CrossChainPayment';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Cross-Chain USDC Transfers
      </h1>
      <CrossChainPayment 
        defaultAmount="10"
        showBalance={true}
        onTransferComplete={(txHash) => {
          console.log('Transfer completed:', txHash);
        }}
      />
    </div>
  );
}
```

## 🔧 Development Setup

### Project Structure

```
cctp-gateway/
├── components/ui/          # React UI components
├── hooks/                  # React hooks for cross-chain logic
├── contracts/             # Smart contracts
├── config/                # Configuration files
├── scripts/               # Deployment scripts
├── docs/                  # Documentation
└── tests/                 # Test suites
```

### Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run lint               # Run linter
npm run type-check         # TypeScript validation

# Deployment
npm run deploy:all         # Deploy to all testnets
npm run deploy:sepolia     # Deploy to Ethereum Sepolia only
npm run deploy:base        # Deploy to Base Sepolia only
npm run deploy:optimism    # Deploy to Optimism Sepolia only

# Testing
npm run test               # Run all tests
npm run test:contracts     # Smart contract tests only
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
```

### Environment Variables Reference

```bash
# Core Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=           # Required: Alchemy API key
DEPLOYER_PRIVATE_KEY=                  # Required: Deployment wallet key

# Gateway Roles (Optional - defaults provided)
NEXT_PUBLIC_GATEWAY_OWNER=             # Contract owner (multi-sig recommended)
NEXT_PUBLIC_GATEWAY_PAUSER=            # Emergency pause authority
NEXT_PUBLIC_GATEWAY_DENYLISTER=        # Address blocking authority  
NEXT_PUBLIC_GATEWAY_BURN_SIGNER=       # Burn authorization signer
NEXT_PUBLIC_GATEWAY_FEE_RECIPIENT=     # Fee collection address
NEXT_PUBLIC_GATEWAY_ATTESTATION_SIGNER= # Circle attestation signer

# Optional Configuration
NEXT_PUBLIC_CIRCLE_ATTESTATION_URL=    # Circle API URL (defaults to sandbox)
NEXT_PUBLIC_MAX_TRANSFER_AMOUNT=       # Maximum transfer amount
NEXT_PUBLIC_DEFAULT_SLIPPAGE=          # Default slippage tolerance
```

## 🧪 Testing Your Integration

### Unit Tests

```bash
# Run component tests
npm run test -- --testPathPattern=components

# Run hook tests  
npm run test -- --testPathPattern=hooks

# Run with coverage
npm run test:coverage
```

### Integration Testing

```bash
# Test full cross-chain flow
npm run test:integration

# Test specific chain combinations
npm run test:integration -- --chains=sepolia,base
```

### Manual Testing Checklist

- [ ] **Wallet Connection**: Can connect via Privy
- [ ] **Balance Display**: Shows correct USDC balance
- [ ] **Chain Selection**: Can switch between chains
- [ ] **Transfer Initiation**: Can start cross-chain transfer
- [ ] **Status Updates**: Shows real-time progress
- [ ] **Error Handling**: Graceful error messages
- [ ] **Transfer Completion**: USDC appears on destination

## 🎨 Customization

### Styling Components

```typescript
// Custom CSS classes
<CrossChainPayment 
  className="custom-payment-widget bg-gray-100 rounded-lg p-6"
/>

// Tailwind CSS styling
<CrossChainPayment 
  className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8"
/>
```

### Custom Configuration

```typescript
// Custom chain configuration
const customChainConfig = {
  11155111: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'your-custom-rpc-url',
    blockExplorer: 'https://sepolia.etherscan.io',
    // ... other config
  }
};
```

### Event Handling

```typescript
function CustomPaymentComponent() {
  const handleTransferStart = (params) => {
    // Custom analytics tracking
    analytics.track('transfer_started', params);
  };

  const handleTransferComplete = (txHash) => {
    // Custom success handling
    showSuccessNotification(`Transfer completed: ${txHash}`);
  };

  return (
    <CrossChainPayment
      onTransferStart={handleTransferStart}
      onTransferComplete={handleTransferComplete}
      onTransferError={(error) => showErrorNotification(error)}
    />
  );
}
```

## 🔍 Debugging & Troubleshooting

### Common Issues

#### "Contract not deployed" Error
```bash
# Check if contracts are deployed
npm run verify:deployments

# Redeploy if needed
npm run deploy:sepolia
```

#### "Insufficient allowance" Error
```typescript
// Check USDC allowance
const { checkAllowance } = useCrossChainPayment();
const allowance = await checkAllowance(chainId, userAddress, gatewayAddress);
console.log('Current allowance:', allowance);
```

#### Transfer Stuck in "Waiting Attestation"
- This is normal! Circle attestations take 12-20 minutes
- Check [Circle's status page](https://status.circle.com) for issues
- Verify transaction succeeded on source chain

### Debug Mode

```bash
# Enable debug logging
export DEBUG=cctp:*
npm run dev

# Or in browser console
localStorage.setItem('cctp-debug', 'true');
```

### Getting Help

- **Documentation**: [docs/troubleshooting.md](./troubleshooting.md)
- **GitHub Issues**: [Report bugs](https://github.com/your-org/cctp-gateway/issues)
- **Discord**: [Join community](https://discord.gg/your-org)

## 📚 Next Steps

Now that you have the basics working:

1. **[Architecture Guide](./architecture.md)** - Understand the system design
2. **[Integration Guide](./integration.md)** - Advanced integration patterns  
3. **[Deployment Guide](./deployment.md)** - Production deployment
4. **[Security Guide](./security.md)** - Security best practices

## 🎉 You're Ready!

You now have a fully functional cross-chain USDC transfer system! 

**Key capabilities you've unlocked:**
- ✅ Gasless cross-chain USDC transfers
- ✅ Social login via Privy smart wallets
- ✅ Support for multiple chains (Ethereum, Base, Optimism)
- ✅ Real-time transfer status tracking
- ✅ Production-ready smart contracts
- ✅ Comprehensive error handling

**What's next?**
- Test different transfer amounts and chains
- Integrate into your existing application
- Customize the UI to match your brand
- Deploy to mainnet when ready

Happy building! 🚀