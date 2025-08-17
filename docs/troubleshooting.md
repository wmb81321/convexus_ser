# Troubleshooting Guide

> **Comprehensive troubleshooting guide for CCTP Gateway Protocol**

## 🚨 Quick Diagnostics

### Health Check Commands

```bash
# Check system status
npm run health:check

# Verify contract deployments
npm run verify:deployments

# Test connectivity to all chains
npm run test:connectivity

# Check Circle API status
npm run test:circle-api
```

## 🔧 Common Issues

### Deployment Issues

#### Issue: Contract Deployment Fails

**Symptoms:**
```
Error: transaction underpriced
Error: insufficient funds for intrinsic transaction cost
```

**Solutions:**

1. **Increase Gas Price**
```bash
npm run deploy:sepolia -- -k KEY --gas-price 30
```

2. **Check ETH Balance**
```bash
# Check deployer balance
cast balance 0xYOUR_ADDRESS --rpc-url $SEPOLIA_RPC
```

3. **Network Congestion**
```bash
# Wait and retry with higher gas
npm run deploy:sepolia -- -k KEY --gas-price 50 --timeout 300000
```

#### Issue: Contract Verification Fails

**Symptoms:**
```
Error: Contract source code already verified
Error: Compilation failed
```

**Solutions:**

1. **Check if Already Verified**
```bash
# Check on Etherscan
curl "https://api.etherscan.io/api?module=contract&action=getsourcecode&address=0xYOUR_CONTRACT"
```

2. **Flatten Contract for Manual Verification**
```bash
npx hardhat flatten contracts/GatewayWallet.sol > flattened.sol
```

3. **Use Correct Compiler Settings**
```typescript
// hardhat.config.ts
solidity: {
  version: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

### Frontend Integration Issues

#### Issue: Hook Not Working

**Symptoms:**
```typescript
Error: useCrossChainPayment must be used within a PrivyProvider
Error: No wallet found for chain 11155111
```

**Solutions:**

1. **Verify Privy Setup**
```typescript
// Ensure PrivyProvider wraps your app
import { PrivyProvider } from '@privy-io/react-auth';

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <YourComponent />
    </PrivyProvider>
  );
}
```

2. **Check Chain Configuration**
```typescript
// Verify supported chains in Privy config
const config = {
  supportedChains: [
    { id: 11155111, name: 'Ethereum Sepolia' },
    { id: 84532, name: 'Base Sepolia' },
    { id: 11155420, name: 'Optimism Sepolia' }
  ]
};
```

3. **Verify Wallet Connection**
```typescript
import { useWallets } from '@privy-io/react-auth';

function DiagnosticComponent() {
  const { wallets } = useWallets();
  
  console.log('Available wallets:', wallets);
  console.log('Wallet chains:', wallets.map(w => w.chainId));
  
  return null;
}
```

#### Issue: Transactions Failing

**Symptoms:**
```
Error: insufficient allowance
Error: execution reverted: ERC20: transfer amount exceeds balance
Error: user rejected transaction
```

**Solutions:**

1. **Check USDC Balance**
```typescript
const { checkUSDCBalance } = useCrossChainPayment();

const balance = await checkUSDCBalance(chainId, userAddress);
console.log('USDC Balance:', balance);
```

2. **Verify Allowance**
```typescript
const { checkAllowance } = useCrossChainPayment();

const allowance = await checkAllowance(chainId, userAddress, gatewayWallet);
console.log('Current allowance:', allowance);
```

3. **Handle User Rejection**
```typescript
try {
  await initiatePayment(params);
} catch (error) {
  if (error.code === 4001) {
    console.log('User rejected transaction');
  }
}
```

### Cross-Chain Transfer Issues

#### Issue: Transfer Stuck in "Waiting Attestation"

**Symptoms:**
- Transfer shows "waiting_attestation" status for > 30 minutes
- No error messages displayed

**Solutions:**

1. **Check Circle API Status**
```bash
curl "https://iris-api-sandbox.circle.com/health"
```

2. **Verify Transaction on Source Chain**
```bash
# Check if burn transaction succeeded
cast tx 0xYOUR_TX_HASH --rpc-url $SEPOLIA_RPC
```

3. **Manual Attestation Retrieval**
```typescript
// Debug attestation retrieval
const attestationUrl = `https://iris-api-sandbox.circle.com/attestations/${txHash}`;
const response = await fetch(attestationUrl);
const data = await response.json();
console.log('Attestation status:', data.status);
```

4. **Retry Mechanism**
```typescript
// Implement retry logic
const retryAttestation = async (txHash: string, maxRetries = 10) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const attestation = await getAttestation(txHash);
      if (attestation) return attestation;
    } catch (error) {
      console.log(`Retry ${i + 1} failed:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
  }
  throw new Error('Attestation timeout');
};
```

#### Issue: Minting Fails on Destination Chain

**Symptoms:**
```
Error: execution reverted: Invalid attestation
Error: execution reverted: Transfer already processed
```

**Solutions:**

1. **Check Attestation Validity**
```typescript
// Verify attestation format
const isValidAttestation = (attestation: string) => {
  return attestation.startsWith('0x') && attestation.length === 66;
};
```

2. **Verify Not Already Processed**
```solidity
// Check on-chain if transfer was processed
function isTransferProcessed(bytes32 transferId) external view returns (bool) {
    return processedTransfers[transferId];
}
```

3. **Check Minter Permissions**
```bash
# Verify minter has USDC mint permissions
cast call $USDC_ADDRESS "isMinter(address)" $GATEWAY_MINTER --rpc-url $BASE_RPC
```

### Network & RPC Issues

#### Issue: RPC Endpoint Errors

**Symptoms:**
```
Error: network does not support ENS
Error: could not detect network
Error: timeout exceeded
```

**Solutions:**

1. **Use Alchemy URLs**
```typescript
const rpcUrls = {
  11155111: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  84532: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  11155420: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
};
```

2. **Add Fallback RPCs**
```typescript
const providers = {
  11155111: new ethers.JsonRpcProvider(
    [
      `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      'https://sepolia.infura.io/v3/YOUR_KEY',
      'https://rpc.sepolia.org'
    ]
  )
};
```

3. **Increase Timeout**
```typescript
const provider = new ethers.JsonRpcProvider(rpcUrl, {
  timeout: 30000 // 30 seconds
});
```

## 🐛 Error Codes Reference

### Contract Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `UnsupportedToken()` | Token not supported by gateway | Add token support via governance |
| `InsufficientBalance()` | User has insufficient USDC | Check balance and top up |
| `ZeroAmount()` | Transfer amount is zero | Validate amount > 0 |
| `TransferAlreadyProcessed()` | Duplicate transfer attempt | Check transfer ID uniqueness |
| `Paused()` | Contract is paused | Wait for unpause or check status |

### Frontend Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `NETWORK_ERROR` | RPC connection failed | Check network and RPC URLs |
| `USER_REJECTED` | User cancelled transaction | Retry or provide better UX |
| `INSUFFICIENT_FUNDS` | Not enough ETH for gas | Fund wallet with ETH |
| `INVALID_ADDRESS` | Recipient address invalid | Validate address format |
| `CHAIN_NOT_SUPPORTED` | Chain not configured | Check chain configuration |

### Circle API Errors

| Status Code | Description | Solution |
|-------------|-------------|----------|
| `404` | Attestation not found | Wait longer or check transaction |
| `429` | Rate limit exceeded | Implement backoff strategy |
| `500` | Circle API error | Check Circle status page |
| `503` | Service unavailable | Retry with exponential backoff |

## 🔍 Debugging Tools

### Browser Console Debugging

```typescript
// Enable debug mode
window.localStorage.setItem('cctp-debug', 'true');

// Check wallet state
console.log('Privy wallets:', window.privy?.user?.linkedAccounts);

// Monitor contract calls
const originalCall = provider.call;
provider.call = function(...args) {
  console.log('Contract call:', args);
  return originalCall.apply(this, args);
};
```

### Network Debugging

```bash
# Test RPC connectivity
curl -X POST $SEPOLIA_RPC \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Check block number
curl -X POST $SEPOLIA_RPC \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Contract State Debugging

```bash
# Check contract balance
cast balance $GATEWAY_WALLET --rpc-url $SEPOLIA_RPC

# Check USDC balance in gateway
cast call $USDC_ADDRESS "balanceOf(address)" $GATEWAY_WALLET --rpc-url $SEPOLIA_RPC

# Check if contract is paused
cast call $GATEWAY_WALLET "paused()" --rpc-url $SEPOLIA_RPC
```

## 📊 Monitoring & Alerts

### Custom Monitoring Setup

```typescript
// Monitor transfer status
class TransferMonitor {
  private transfers = new Map<string, TransferStatus>();
  
  async monitorTransfer(transferId: string) {
    const status = await this.getTransferStatus(transferId);
    
    // Alert on stuck transfers
    if (status.duration > 30 * 60 * 1000) { // 30 minutes
      await this.alertStuckTransfer(transferId, status);
    }
    
    // Alert on failures
    if (status.status === 'error') {
      await this.alertFailedTransfer(transferId, status);
    }
  }
  
  private async alertStuckTransfer(transferId: string, status: TransferStatus) {
    console.warn(`Transfer ${transferId} stuck for ${status.duration}ms`);
    // Send alert to monitoring system
  }
}
```

### Health Check Endpoints

```typescript
// Express.js health checks
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: Date.now(),
    checks: {
      database: await checkDatabase(),
      rpc: await checkRPC(),
      circle: await checkCircleAPI(),
      contracts: await checkContracts()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## 📋 FAQ

### General Questions

**Q: How long do cross-chain transfers take?**
A: Typically 12-20 minutes due to Circle's attestation process. This is a Circle CCTP limitation, not our system.

**Q: What are the transfer limits?**
A: Currently no limits on testnets. Mainnet will have configurable limits based on risk assessment.

**Q: Which chains are supported?**
A: Currently Ethereum Sepolia, Base Sepolia, and Optimism Sepolia for testing. Mainnet support coming soon.

### Technical Questions

**Q: Can I use this with other wallets besides Privy?**
A: Yes, you can adapt the hooks to work with any ethers-compatible wallet provider.

**Q: How do I get testnet USDC?**
A: Use Circle's faucet at [faucet.circle.com](https://faucet.circle.com) for Sepolia USDC.

**Q: Can I customize the UI components?**
A: Yes, all components accept className props and can be styled with CSS or Tailwind.

### Troubleshooting Questions

**Q: Transfer shows "completed" but recipient didn't receive USDC?**
A: Check the transaction hash on the destination chain block explorer. The USDC might be minted to a different address than expected.

**Q: Getting "Contract not deployed" errors?**
A: Verify the contract addresses in your configuration match the actual deployed addresses.

**Q: Transactions are very slow?**
A: This is normal for testnets. Mainnet will be faster. You can increase gas prices for faster confirmation.

## 📞 Getting Help

### Support Channels

1. **GitHub Issues**: [Report bugs](https://github.com/your-org/cctp-gateway/issues)
2. **Discord Community**: [Join chat](https://discord.gg/your-org)
3. **Email Support**: [help@your-org.com](mailto:help@your-org.com)

### When Reporting Issues

Please include:

1. **Environment Details**
   - Operating system
   - Browser version
   - Node.js version
   - Network (testnet/mainnet)

2. **Error Information**
   - Full error message
   - Stack trace (if available)
   - Transaction hashes
   - Steps to reproduce

3. **Configuration**
   - Chain IDs involved
   - Contract addresses
   - Environment variables (redacted)

### Emergency Support

For critical issues affecting funds or security:

- **Emergency Email**: [emergency@your-org.com](mailto:emergency@your-org.com)
- **Security Issues**: [security@your-org.com](mailto:security@your-org.com)
- **24/7 Hotline**: +1-XXX-XXX-XXXX (enterprise customers)

---

## 🔄 Issue Resolution Process

1. **Identify**: Determine the root cause using debugging tools
2. **Isolate**: Reproduce the issue in a controlled environment  
3. **Resolve**: Apply the appropriate solution from this guide
4. **Verify**: Confirm the fix resolves the issue
5. **Document**: Update this guide if new solutions are discovered
