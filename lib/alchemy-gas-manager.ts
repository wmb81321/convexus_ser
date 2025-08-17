/**
 * Alchemy Gas Manager Service
 * Implements gas sponsorship following official Alchemy documentation:
 * https://www.alchemy.com/docs/reference/how-to-sponsor-gas-on-evm
 */

export interface GasManagerPolicy {
  policyId: string;
  appId: string;
  networks: string[];
  rules: {
    maxSpendUsd?: string;
    maxSpendPerSenderUsd?: string;
    maxSpendPerUoUsd?: string;
    maxCount?: number;
    maxCountPerSender?: number;
    senderAllowlist?: string[];
    senderBlocklist?: string[];
    sponsorshipExpiryMs?: string;
  };
}

export interface UserOp {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData?: string;
  signature: string;
}

export interface PaymasterData {
  paymaster: string;
  paymasterData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

export class AlchemyGasManager {
  private apiKey: string;
  private policyId: string;
  private baseUrl: string;

  constructor(apiKey: string, policyId: string) {
    this.apiKey = apiKey;
    this.policyId = policyId;
    this.baseUrl = 'https://manage.g.alchemy.com/api';
  }

  /**
   * Create a new gas sponsorship policy
   * POST /api/gasManager/policy
   */
  async createPolicy(policyData: {
    policyName: string;
    policyType: 'sponsorship' | 'erc20' | 'solana';
    appId: string;
    networks: string[];
    rules?: any;
  }): Promise<GasManagerPolicy> {
    const response = await fetch(`${this.baseUrl}/gasManager/policy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(policyData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create policy: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.policy;
  }

  /**
   * Get Gas Manager's signature for sponsorship
   * This is step 2 in the official documentation
   */
  async requestGasAndPaymasterAndData(
    userOp: Partial<UserOp>,
    entryPoint: string,
    chainId: number
  ): Promise<PaymasterData> {
    // Use the appropriate Alchemy RPC endpoint for the chain
    const rpcUrl = this.getAlchemyRpcUrl(chainId);
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_requestGasAndPaymasterAndData',
        params: [
          {
            policyId: this.policyId,
            entryPoint,
            userOp,
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get paymaster data: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Alchemy error: ${result.error.message}`);
    }

    return result.result;
  }

  /**
   * Send sponsored user operation
   * This is step 3 in the official documentation  
   */
  async sendUserOperation(
    userOp: UserOp,
    entryPoint: string,
    chainId: number
  ): Promise<string> {
    const rpcUrl = this.getAlchemyRpcUrl(chainId);
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [userOp, entryPoint],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send user operation: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Failed to send user operation: ${result.error.message}`);
    }

    return result.result; // Returns userOpHash
  }

  /**
   * Get the appropriate Alchemy RPC URL for a given chain ID
   */
  private getAlchemyRpcUrl(chainId: number): string {
    const baseUrl = `https://`;
    
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `${baseUrl}eth-mainnet.g.alchemy.com/v2/${this.apiKey}`;
      case 11155111: // Ethereum Sepolia
        return `${baseUrl}eth-sepolia.g.alchemy.com/v2/${this.apiKey}`;
      case 10: // Optimism Mainnet
        return `${baseUrl}opt-mainnet.g.alchemy.com/v2/${this.apiKey}`;
      case 11155420: // OP Sepolia
        return `${baseUrl}opt-sepolia.g.alchemy.com/v2/${this.apiKey}`;
      case 8453: // Base Mainnet
        return `${baseUrl}base-mainnet.g.alchemy.com/v2/${this.apiKey}`;
      case 84532: // Base Sepolia
        return `${baseUrl}base-sepolia.g.alchemy.com/v2/${this.apiKey}`;
      case 137: // Polygon Mainnet
        return `${baseUrl}polygon-mainnet.g.alchemy.com/v2/${this.apiKey}`;
      case 80002: // Polygon Amoy
        return `${baseUrl}polygon-amoy.g.alchemy.com/v2/${this.apiKey}`;
      case 1301: // Unichain Sepolia
        return `${baseUrl}unichain-sepolia.g.alchemy.com/v2/${this.apiKey}`;
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

  /**
   * Check if a transaction is eligible for sponsorship
   */
  async isEligibleForSponsorship(
    userOp: Partial<UserOp>,
    chainId: number
  ): Promise<boolean> {
    try {
      await this.requestGasAndPaymasterAndData(userOp, '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', chainId);
      return true;
    } catch (error) {
      console.warn('Transaction not eligible for sponsorship:', error);
      return false;
    }
  }
}

// Singleton instance
let gasManager: AlchemyGasManager | null = null;

export function getGasManager(): AlchemyGasManager {
  if (!gasManager) {
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    const policyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
    
    if (!apiKey || !policyId) {
      throw new Error('Alchemy API key and policy ID must be configured');
    }
    
    gasManager = new AlchemyGasManager(apiKey, policyId);
  }
  
  return gasManager;
}

export default AlchemyGasManager; 