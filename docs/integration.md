# Integration Guide

> **Complete integration guide for CCTP Gateway Protocol**

## 🎯 Integration Overview

The CCTP Gateway Protocol provides multiple integration options to suit different application architectures and requirements.

## 🚀 Quick Integration

### React Application

For React applications using Privy for authentication:

```typescript
// 1. Install dependencies
npm install @privy-io/react-auth ethers

// 2. Add the component
import { CrossChainPayment } from './components/ui/CrossChainPayment';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1>My DApp</h1>
      <CrossChainPayment />
    </div>
  );
}
```

### Custom Hook Integration

For more control over the UI:

```typescript
import { useCrossChainPayment } from './hooks/useCrossChainPayment';

function CustomPaymentComponent() {
  const { 
    paymentStatus, 
    initiatePayment, 
    checkUSDCBalance 
  } = useCrossChainPayment();

  const handlePayment = async () => {
    try {
      await initiatePayment({
        sourceChainId: 11155111,
        destinationChainId: 84532,
        amount: '100.00',
        recipient: '0x...'
      });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePayment}>
        Send Cross-Chain USDC
      </button>
      <div>Status: {paymentStatus.status}</div>
    </div>
  );
}
```

## 📦 SDK Reference

### Core Hook: useCrossChainPayment

#### Interface

```typescript
interface CrossChainPaymentHook {
  // State
  paymentStatus: PaymentStatus;
  
  // Primary Actions
  initiatePayment: (params: CrossChainPaymentParams) => Promise<void>;
  resetPaymentStatus: () => void;
  
  // Utility Functions
  checkUSDCBalance: (chainId: number, address: string) => Promise<string>;
  checkAllowance: (chainId: number, owner: string, spender: string) => Promise<string>;
  
  // Advanced Functions
  approveUSDC: (chainId: number, spender: string, amount: string) => Promise<string>;
  depositToGateway: (chainId: number, amount: string) => Promise<string>;
  initiateCrossChainTransfer: (
    sourceChainId: number,
    destinationChainId: number, 
    amount: string,
    recipient: string
  ) => Promise<string>;
}
```

#### Types

```typescript
interface CrossChainPaymentParams {
  sourceChainId: number;      // Source chain ID (e.g., 11155111 for Sepolia)
  destinationChainId: number; // Destination chain ID (e.g., 84532 for Base)
  amount: string;             // Amount in USDC (e.g., "100.50")
  recipient: string;          // Recipient address (0x...)
}

interface PaymentStatus {
  status: 'idle' | 'approving' | 'depositing' | 'waiting_attestation' | 'minting' | 'completed' | 'error';
  txHash?: string;            // Transaction hash
  error?: string;             // Error message if failed
  attestation?: string;       // Circle attestation (internal)
  progress?: number;          // Progress percentage (0-100)
}
```

#### Usage Examples

##### Basic Transfer

```typescript
const { initiatePayment, paymentStatus } = useCrossChainPayment();

// Transfer 50 USDC from Ethereum Sepolia to Base Sepolia
await initiatePayment({
  sourceChainId: 11155111,
  destinationChainId: 84532,
  amount: '50.00',
  recipient: '0x1234567890123456789012345678901234567890'
});
```

##### Check Balance Before Transfer

```typescript
const { checkUSDCBalance, initiatePayment } = useCrossChainPayment();

const handleTransfer = async () => {
  // Check user's USDC balance
  const balance = await checkUSDCBalance(11155111, userAddress);
  
  if (parseFloat(balance) < 50) {
    alert('Insufficient USDC balance');
    return;
  }
  
  // Proceed with transfer
  await initiatePayment({
    sourceChainId: 11155111,
    destinationChainId: 84532,
    amount: '50.00',
    recipient: recipientAddress
  });
};
```

##### Monitor Transfer Progress

```typescript
const { paymentStatus } = useCrossChainPayment();

useEffect(() => {
  switch (paymentStatus.status) {
    case 'approving':
      console.log('Approving USDC spending...');
      break;
    case 'depositing':
      console.log('Depositing USDC to gateway...');
      break;
    case 'waiting_attestation':
      console.log('Waiting for Circle attestation...');
      break;
    case 'minting':
      console.log('Minting USDC on destination chain...');
      break;
    case 'completed':
      console.log('Transfer completed!');
      break;
    case 'error':
      console.error('Transfer failed:', paymentStatus.error);
      break;
  }
}, [paymentStatus]);
```

## 🎨 UI Components

### CrossChainPayment Component

#### Props

```typescript
interface CrossChainPaymentProps {
  // Styling
  className?: string;
  theme?: 'light' | 'dark';
  
  // Configuration
  defaultSourceChain?: number;
  defaultDestinationChain?: number;
  defaultAmount?: string;
  
  // Callbacks
  onTransferStart?: (params: CrossChainPaymentParams) => void;
  onTransferComplete?: (txHash: string) => void;
  onTransferError?: (error: string) => void;
  
  // Feature flags
  showBalance?: boolean;
  showHistory?: boolean;
  enableCustomRecipient?: boolean;
}
```

#### Custom Styling

```typescript
// With Tailwind CSS
<CrossChainPayment 
  className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6"
  theme="light"
  showBalance={true}
  showHistory={false}
/>

// With custom CSS
<CrossChainPayment 
  className="custom-payment-widget"
  theme="dark"
/>
```

#### Event Handling

```typescript
function MyApp() {
  const handleTransferStart = (params: CrossChainPaymentParams) => {
    console.log('Transfer started:', params);
    // Analytics tracking
    analytics.track('cross_chain_transfer_started', params);
  };

  const handleTransferComplete = (txHash: string) => {
    console.log('Transfer completed:', txHash);
    // Success notification
    toast.success('Transfer completed successfully!');
  };

  const handleTransferError = (error: string) => {
    console.error('Transfer failed:', error);
    // Error notification
    toast.error(`Transfer failed: ${error}`);
  };

  return (
    <CrossChainPayment
      onTransferStart={handleTransferStart}
      onTransferComplete={handleTransferComplete}
      onTransferError={handleTransferError}
    />
  );
}
```

## 🔧 Configuration

### Gateway Deployments

Configure contract addresses for each supported chain:

```typescript
// config/gateway-deployments.ts
export const GATEWAY_DEPLOYMENTS: Record<number, ChainDeployment> = {
  // Ethereum Sepolia
  11155111: {
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    domain: 0,
    gatewayWallet: '0x...',    // Your deployed GatewayWallet
    gatewayMinter: '0x...',    // Your deployed GatewayMinter
    create2Factory: '0x...',   // Your deployed Create2Factory
  },
  // Base Sepolia
  84532: {
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    domain: 6,
    gatewayWallet: '0x...',
    gatewayMinter: '0x...',
    create2Factory: '0x...',
  },
  // Optimism Sepolia
  11155420: {
    usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
    domain: 2,
    gatewayWallet: '0x...',
    gatewayMinter: '0x...',
    create2Factory: '0x...',
  },
};
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Optional (for custom configuration)
NEXT_PUBLIC_CIRCLE_ATTESTATION_URL=https://iris-api-sandbox.circle.com
NEXT_PUBLIC_DEFAULT_SLIPPAGE=0.5
NEXT_PUBLIC_MAX_TRANSFER_AMOUNT=1000000
```

## 🔗 Advanced Integrations

### Backend Integration

For server-side applications:

```typescript
// Node.js backend integration
import { ethers } from 'ethers';
import { GATEWAY_DEPLOYMENTS } from './config/gateway-deployments';

class CCTPGatewayService {
  private providers: Record<number, ethers.Provider> = {};

  constructor(alchemyApiKey: string) {
    // Initialize providers for each chain
    Object.keys(GATEWAY_DEPLOYMENTS).forEach(chainId => {
      this.providers[Number(chainId)] = new ethers.JsonRpcProvider(
        `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
      );
    });
  }

  async getUSDCBalance(chainId: number, address: string): Promise<string> {
    const provider = this.providers[chainId];
    const deployment = GATEWAY_DEPLOYMENTS[chainId];
    
    const usdcContract = new ethers.Contract(
      deployment.usdc,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    
    const balance = await usdcContract.balanceOf(address);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }

  async monitorTransfer(txHash: string, chainId: number): Promise<void> {
    const provider = this.providers[chainId];
    
    // Wait for transaction confirmation
    const receipt = await provider.waitForTransaction(txHash);
    
    // Process transfer events
    console.log('Transfer confirmed:', receipt);
  }
}
```

### Mobile Integration (React Native)

```typescript
// React Native with Privy
import { PrivyProvider } from '@privy-io/expo';
import { CrossChainPayment } from './components/CrossChainPayment';

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <View style={styles.container}>
        <Text style={styles.title}>Cross-Chain USDC</Text>
        <CrossChainPayment />
      </View>
    </PrivyProvider>
  );
}
```

### API Integration

Create REST API endpoints for cross-chain transfers:

```typescript
// Express.js API
import express from 'express';
import { CCTPGatewayService } from './services/cctp-gateway';

const app = express();
const gatewayService = new CCTPGatewayService(process.env.ALCHEMY_API_KEY);

// Get USDC balance
app.get('/api/balance/:chainId/:address', async (req, res) => {
  try {
    const { chainId, address } = req.params;
    const balance = await gatewayService.getUSDCBalance(
      Number(chainId), 
      address
    );
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate transfer (requires authentication)
app.post('/api/transfer', authenticateUser, async (req, res) => {
  try {
    const { sourceChainId, destinationChainId, amount, recipient } = req.body;
    
    // Validate request
    if (!sourceChainId || !destinationChainId || !amount || !recipient) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Process transfer
    const result = await gatewayService.initiateTransfer({
      sourceChainId,
      destinationChainId,
      amount,
      recipient,
      user: req.user
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 Testing Integration

### Unit Testing

```typescript
// Jest test example
import { renderHook, act } from '@testing-library/react-hooks';
import { useCrossChainPayment } from '../hooks/useCrossChainPayment';

describe('useCrossChainPayment', () => {
  test('initiates payment successfully', async () => {
    const { result } = renderHook(() => useCrossChainPayment());
    
    await act(async () => {
      await result.current.initiatePayment({
        sourceChainId: 11155111,
        destinationChainId: 84532,
        amount: '10.00',
        recipient: '0x1234567890123456789012345678901234567890'
      });
    });
    
    expect(result.current.paymentStatus.status).toBe('completed');
  });
});
```

### Integration Testing

```typescript
// Cypress E2E test
describe('Cross-Chain Payment', () => {
  it('completes full payment flow', () => {
    cy.visit('/');
    
    // Connect wallet
    cy.get('[data-testid=connect-wallet]').click();
    cy.get('[data-testid=email-login]').type('test@example.com');
    
    // Set up payment
    cy.get('[data-testid=amount-input]').type('10');
    cy.get('[data-testid=recipient-input]').type('0x1234...');
    cy.get('[data-testid=source-chain]').select('Ethereum Sepolia');
    cy.get('[data-testid=destination-chain]').select('Base Sepolia');
    
    // Execute payment
    cy.get('[data-testid=send-payment]').click();
    
    // Verify completion
    cy.get('[data-testid=payment-status]').should('contain', 'completed');
  });
});
```

## 📊 Analytics Integration

### Event Tracking

```typescript
// Analytics integration
import { useCrossChainPayment } from './hooks/useCrossChainPayment';
import { analytics } from './services/analytics';

function PaymentAnalytics() {
  const { paymentStatus } = useCrossChainPayment();

  useEffect(() => {
    // Track payment status changes
    analytics.track('payment_status_changed', {
      status: paymentStatus.status,
      txHash: paymentStatus.txHash,
      timestamp: Date.now()
    });
  }, [paymentStatus]);

  return null;
}
```

### Performance Monitoring

```typescript
// Performance monitoring
import { useEffect } from 'react';
import { useCrossChainPayment } from './hooks/useCrossChainPayment';

function PerformanceMonitor() {
  const { paymentStatus } = useCrossChainPayment();
  
  useEffect(() => {
    if (paymentStatus.status === 'completed') {
      // Calculate transfer time
      const transferTime = Date.now() - paymentStartTime;
      
      // Report metrics
      analytics.track('transfer_completed', {
        duration: transferTime,
        sourceChain: sourceChainId,
        destinationChain: destinationChainId,
        amount: amount
      });
    }
  }, [paymentStatus.status]);

  return null;
}
```

## 🔒 Security Best Practices

### Input Validation

```typescript
// Validate transfer parameters
function validateTransferParams(params: CrossChainPaymentParams): boolean {
  // Validate chain IDs
  if (!SUPPORTED_CHAIN_IDS.includes(params.sourceChainId) ||
      !SUPPORTED_CHAIN_IDS.includes(params.destinationChainId)) {
    throw new Error('Unsupported chain ID');
  }
  
  // Validate amount
  const amount = parseFloat(params.amount);
  if (isNaN(amount) || amount <= 0 || amount > MAX_TRANSFER_AMOUNT) {
    throw new Error('Invalid transfer amount');
  }
  
  // Validate recipient address
  if (!ethers.isAddress(params.recipient)) {
    throw new Error('Invalid recipient address');
  }
  
  return true;
}
```

### Error Handling

```typescript
// Comprehensive error handling
try {
  await initiatePayment(params);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    showError('Insufficient USDC balance');
  } else if (error.code === 'NETWORK_ERROR') {
    showError('Network error. Please try again.');
  } else if (error.code === 'USER_REJECTED') {
    showError('Transaction cancelled by user');
  } else {
    showError('An unexpected error occurred');
    // Log error for debugging
    console.error('Transfer error:', error);
  }
}
```

## 📞 Support & Resources

### Documentation Links
- [API Reference](./api-reference.md)
- [Troubleshooting](./troubleshooting.md)
- [Security Guide](./security.md)

### Community Support
- **GitHub Issues**: [Report bugs](https://github.com/your-org/cctp-gateway/issues)
- **Discord**: [Join community](https://discord.gg/your-org)
- **Documentation**: [Full docs](https://docs.your-org.com)

### Professional Support
- **Enterprise Support**: [enterprise@your-org.com](mailto:enterprise@your-org.com)
- **Integration Help**: [integrations@your-org.com](mailto:integrations@your-org.com)
- **Security Issues**: [security@your-org.com](mailto:security@your-org.com)
