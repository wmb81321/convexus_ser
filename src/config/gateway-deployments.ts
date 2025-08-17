/**
 * Configuration for CCTP Gateway deployments across different chains
 */

export interface GatewayDeploymentConfig {
  usdcAddress: string;
  domain: number;
  owner: string;
  pauser: string;
  denylister: string;
  burnSigner: string;
  feeRecipient: string;
  attestationSigner: string;
  withdrawalDelay: number;
}

export interface ChainDeployment {
  usdc: string;
  domain: number;
  gatewayWallet?: string;
  gatewayMinter?: string;
  create2Factory?: string;
}

// USDC addresses and domains for each supported chain
export const GATEWAY_DEPLOYMENTS: Record<number, ChainDeployment> = {
  // Ethereum Sepolia (testnet)
  11155111: {
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    domain: 0,
  },
  // Base Sepolia (testnet) 
  84532: {
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    domain: 6,
  },
  // Optimism Sepolia (testnet)
  11155420: {
    usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7', // Update with correct Sepolia address
    domain: 2,
  },
  // Ethereum Mainnet
  1: {
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    domain: 0,
  },
  // Base Mainnet
  8453: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    domain: 6,
  },
  // Optimism Mainnet
  10: {
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    domain: 2,
  },
  // Unichain (when available)
  // TBD: {
  //   usdc: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
  //   domain: TBD, // Needs Circle confirmation
  // }
};

// Default configuration for deployments
export const DEFAULT_DEPLOYMENT_CONFIG: Omit<GatewayDeploymentConfig, 'usdcAddress' | 'domain'> = {
  owner: process.env.NEXT_PUBLIC_GATEWAY_OWNER || '',
  pauser: process.env.NEXT_PUBLIC_GATEWAY_PAUSER || '',
  denylister: process.env.NEXT_PUBLIC_GATEWAY_DENYLISTER || '',
  burnSigner: process.env.NEXT_PUBLIC_GATEWAY_BURN_SIGNER || '',
  feeRecipient: process.env.NEXT_PUBLIC_GATEWAY_FEE_RECIPIENT || '',
  attestationSigner: process.env.NEXT_PUBLIC_GATEWAY_ATTESTATION_SIGNER || '',
  withdrawalDelay: 1000, // blocks
};

export function getDeploymentConfig(chainId: number): GatewayDeploymentConfig {
  const chainConfig = GATEWAY_DEPLOYMENTS[chainId];
  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return {
    ...DEFAULT_DEPLOYMENT_CONFIG,
    usdcAddress: chainConfig.usdc,
    domain: chainConfig.domain,
  };
}

export function updateDeploymentAddresses(
  chainId: number,
  addresses: {
    gatewayWallet?: string;
    gatewayMinter?: string;
    create2Factory?: string;
  }
) {
  const config = GATEWAY_DEPLOYMENTS[chainId];
  if (config) {
    Object.assign(config, addresses);
  }
}
