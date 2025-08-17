# Deployment Guide

> **Production-ready deployment guide for CCTP Gateway Protocol**

## 🎯 Deployment Overview

The CCTP Gateway requires deployment across multiple chains with proper configuration, monitoring, and security measures. This guide covers testnet and mainnet deployment strategies.

## 📋 Pre-Deployment Checklist

### Environment Setup

- [ ] **Node.js 18+** installed
- [ ] **Git** repository access
- [ ] **Alchemy API key** obtained
- [ ] **Deployer wallet** funded with ETH on target chains
- [ ] **Multi-signature wallet** configured for governance
- [ ] **Environment variables** configured

### Required Accounts & Keys

```bash
# Core Configuration
DEPLOYER_PRIVATE_KEY=0x...              # Deployment account
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key    # RPC access

# Governance Roles
NEXT_PUBLIC_GATEWAY_OWNER=0x...         # Multi-sig wallet
NEXT_PUBLIC_GATEWAY_PAUSER=0x...        # Emergency pause authority
NEXT_PUBLIC_GATEWAY_DENYLISTER=0x...    # Address blocking authority
NEXT_PUBLIC_GATEWAY_BURN_SIGNER=0x...   # Burn authorization
NEXT_PUBLIC_GATEWAY_FEE_RECIPIENT=0x... # Fee collection
NEXT_PUBLIC_GATEWAY_ATTESTATION_SIGNER=0x... # Circle attestation
```

### Funding Requirements

| Chain | Deployment Cost | Buffer | Total Required |
|-------|----------------|---------|----------------|
| **Ethereum Sepolia** | ~0.05 ETH | 0.05 ETH | **0.1 ETH** |
| **Base Sepolia** | ~0.005 ETH | 0.005 ETH | **0.01 ETH** |
| **Optimism Sepolia** | ~0.005 ETH | 0.005 ETH | **0.01 ETH** |
| **Ethereum Mainnet** | ~0.2 ETH | 0.3 ETH | **0.5 ETH** |
| **Base Mainnet** | ~0.02 ETH | 0.03 ETH | **0.05 ETH** |
| **Optimism Mainnet** | ~0.02 ETH | 0.03 ETH | **0.05 ETH** |

## 🚀 Testnet Deployment

### Quick Deployment (All Chains)

```bash
# Clone and setup
git clone https://github.com/your-org/cctp-gateway
cd cctp-gateway
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Deploy to all testnets
npm run deploy:all -- -k YOUR_PRIVATE_KEY
```

### Step-by-Step Deployment

#### 1. Ethereum Sepolia

```bash
npm run deploy:sepolia -- -k YOUR_PRIVATE_KEY
```

**Expected Output:**
```
🚀 Deploying CCTP Gateway on chain 11155111
📦 Deploying Create2Factory...
✅ Create2Factory deployed: 0x1234...
📦 Deploying UpgradeablePlaceholder...
✅ UpgradeablePlaceholder deployed: 0x5678...
📦 Deploying GatewayWallet implementation...
✅ GatewayWallet implementation: 0x9abc...
📦 Deploying GatewayMinter implementation...
✅ GatewayMinter implementation: 0xdef0...
📦 Deploying GatewayWallet Proxy...
🔄 Upgrading wallet proxy to actual implementation...
✅ GatewayWallet proxy: 0x1111...
📦 Deploying GatewayMinter Proxy...
🔄 Upgrading minter proxy to actual implementation...
✅ GatewayMinter proxy: 0x2222...

🎉 Deployment completed successfully!
```

#### 2. Base Sepolia

```bash
npm run deploy:base -- -k YOUR_PRIVATE_KEY
```

#### 3. Optimism Sepolia

```bash
npm run deploy:optimism -- -k YOUR_PRIVATE_KEY
```

### Post-Deployment Configuration

#### Update Configuration File

```typescript
// config/gateway-deployments.ts
export const GATEWAY_DEPLOYMENTS: Record<number, ChainDeployment> = {
  11155111: {
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    domain: 0,
    gatewayWallet: '0x1111...', // From deployment output
    gatewayMinter: '0x2222...', // From deployment output
    create2Factory: '0x1234...', // From deployment output
  },
  // ... other chains
};
```

#### Verify Deployments

```bash
# Verify on Etherscan
npx hardhat verify --network sepolia 0x1111... "constructor" "args"

# Test basic functionality
npm run test:deployment
```

## 🏭 Mainnet Deployment

> ⚠️ **Warning**: Mainnet deployment requires Circle partnership and additional security measures.

### Pre-Mainnet Requirements

1. **Circle Partnership**
   - Apply for CCTP partnership
   - Request minter permissions
   - Obtain production API keys

2. **Security Audit**
   - Complete smart contract audit
   - Penetration testing
   - Security review of deployment process

3. **Insurance & Legal**
   - Smart contract insurance
   - Legal compliance review
   - Terms of service and privacy policy

### Mainnet Deployment Process

#### 1. Staging Environment

```bash
# Deploy to staging environment first
npm run deploy:staging -- -k STAGING_PRIVATE_KEY

# Run comprehensive tests
npm run test:staging
npm run test:integration:staging
```

#### 2. Production Deployment

```bash
# Deploy to mainnet (requires additional confirmation)
npm run deploy:mainnet -- -k PRODUCTION_PRIVATE_KEY --confirm-mainnet

# Verify immediately
npm run verify:mainnet
```

#### 3. Gradual Rollout

1. **Alpha Release** (Internal testing)
   - Limited user access
   - Small transfer limits
   - Comprehensive monitoring

2. **Beta Release** (Trusted users)
   - Expanded user base
   - Increased limits
   - Performance optimization

3. **Production Release** (Public)
   - Full feature set
   - Normal limits
   - Marketing and promotion

## 🔧 Configuration Management

### Environment Variables

```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development

# Staging
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=staging

# Production
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

### Chain-Specific Configuration

```typescript
interface DeploymentConfig {
  // Network settings
  rpcUrl: string;
  blockExplorer: string;
  
  // Contract addresses
  usdc: string;
  gatewayWallet: string;
  gatewayMinter: string;
  
  // Circle settings
  domain: number;
  attestationUrl: string;
  
  // Governance
  owner: string;
  pauser: string;
  denylister: string;
}
```

## 📊 Monitoring Setup

### Contract Event Monitoring

```typescript
// Monitor critical events
const events = [
  'Deposited',
  'CrossChainTransferInitiated', 
  'CrossChainTransferCompleted',
  'EmergencyPause',
  'OwnershipTransferred'
];

// Set up alerts for anomalies
const alerts = {
  largeTransfers: { threshold: 100000 }, // $100k+ transfers
  failedTransfers: { threshold: 5 },     // 5+ failures per hour
  pauseEvents: { immediate: true },      // Immediate alerts
};
```

### Health Checks

```bash
# Automated health checks
npm run health:check:all

# Manual verification
npm run verify:contracts
npm run test:integration:live
```

## 🔒 Security Measures

### Access Control Setup

```typescript
// Multi-signature setup
const multiSigConfig = {
  owners: [
    '0x1111...', // Technical lead
    '0x2222...', // Security officer  
    '0x3333...', // Business lead
  ],
  threshold: 2, // 2 of 3 signatures required
};

// Role assignments
const roles = {
  owner: multiSigWallet,
  pauser: emergencyPauseWallet,
  denylister: complianceWallet,
};
```

### Emergency Procedures

#### Emergency Pause

```bash
# Pause all contracts (emergency only)
npm run emergency:pause -- --network mainnet --reason "security incident"

# Resume operations (after investigation)
npm run emergency:unpause -- --network mainnet
```

#### Upgrade Process

```bash
# Prepare upgrade
npm run upgrade:prepare -- --contract GatewayWallet --version 1.1.0

# Execute upgrade (requires multi-sig)
npm run upgrade:execute -- --contract GatewayWallet --proxy 0x1111...
```

## 📈 Performance Optimization

### Gas Optimization

```solidity
// Optimized contract patterns
contract OptimizedGateway {
    // Pack structs to save storage
    struct Transfer {
        uint128 amount;    // Instead of uint256
        uint32 chainId;    // Instead of uint256
        uint96 timestamp;  // Instead of uint256
    }
    
    // Use mappings efficiently
    mapping(bytes32 => bool) public processedTransfers;
}
```

### RPC Optimization

```typescript
// Connection pooling
const providers = {
  ethereum: new ethers.JsonRpcProvider(ETHEREUM_RPC, {
    staticNetwork: true,
    batchMaxCount: 100,
  }),
  base: new ethers.JsonRpcProvider(BASE_RPC, {
    staticNetwork: true, 
    batchMaxCount: 100,
  }),
};
```

## 🧪 Testing Strategy

### Automated Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Load testing
npm run test:load
```

### Manual Testing Checklist

- [ ] **Basic Flow**: Deposit → Attestation → Mint
- [ ] **Error Handling**: Insufficient funds, network errors
- [ ] **Edge Cases**: Maximum amounts, minimum amounts
- [ ] **Security**: Unauthorized access attempts
- [ ] **Performance**: High load scenarios

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Deployer accounts funded
- [ ] Multi-sig wallets configured
- [ ] Monitoring systems ready
- [ ] Emergency procedures documented

### During Deployment

- [ ] Deploy contracts in correct order
- [ ] Verify all deployments
- [ ] Configure role assignments
- [ ] Test basic functionality
- [ ] Update configuration files

### Post-Deployment

- [ ] Contract verification on block explorers
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team notifications sent
- [ ] User communications prepared

## 🆘 Troubleshooting

### Common Issues

#### Deployment Failures

```bash
# Insufficient gas
Error: transaction underpriced

# Solution: Increase gas price
npm run deploy:sepolia -- -k KEY --gas-price 20

# Network congestion
Error: timeout waiting for transaction

# Solution: Increase timeout
npm run deploy:sepolia -- -k KEY --timeout 300000
```

#### Configuration Issues

```bash
# Missing environment variable
Error: NEXT_PUBLIC_GATEWAY_OWNER is required

# Solution: Check .env.local file
cat .env.local | grep GATEWAY_OWNER
```

### Recovery Procedures

#### Failed Deployment

1. Check transaction status on block explorer
2. Identify failed step in deployment
3. Resume from failed step
4. Verify all previous steps completed

#### Contract Issues

1. Pause affected contracts
2. Investigate root cause
3. Prepare fix or upgrade
4. Execute via governance process
5. Resume operations

---

## 📞 Support

For deployment issues:
- **Technical Support**: [tech-support@your-org.com](mailto:tech-support@your-org.com)
- **Emergency Contact**: [emergency@your-org.com](mailto:emergency@your-org.com)
- **Documentation**: [docs/troubleshooting.md](./troubleshooting.md)
