export interface TokenContract {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer: string;
  pimlicoBundlerUrl: string;
  tokens: {
    usdc?: TokenContract;
    ecop?: TokenContract; // Electronic Colombian Peso (COPe)
    eurc?: TokenContract; // Euro Coin (EURC)
  };
  isDefault?: boolean;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // Ethereum Sepolia (Default)
  11155111: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    shortName: "ETH Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0",
    blockExplorer: "https://sepolia.etherscan.io",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/11155111/rpc",
    tokens: {
      usdc: {
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      ecop: {
        address: "0x19ac2612e560b2bbedf88660a2566ef53c0a15a1", // Electronic Colombian Peso (COPe)
        symbol: "COPe",
        name: "Electronic Colombian Peso",
        decimals: 18,
      },
      eurc: {
        address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4", // Euro Coin (EURC)
        symbol: "EURC",
        name: "Euro Coin",
        decimals: 6,
      },
    },
    isDefault: true,
  },
  
  // Unichain Sepolia
  1301: {
    chainId: 1301,
    name: "Unichain Sepolia",
    shortName: "UNI Sepolia",
    nativeCurrency: {
      name: "Unichain Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://unichain-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0",
    blockExplorer: "https://unichain-sepolia.blockscout.com",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/1301/rpc",
    tokens: {
      usdc: {
        address: "0x31d0220469e10c4E71834a79b1f276d740d3768F",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      ecop: {
        address: "0xbb0d7c4141ee1fed53db766e1ffcb9c618df8260", // Electronic Colombian Peso (COPe)
        symbol: "COPe",
        name: "Electronic Colombian Peso",
        decimals: 18,
      },
    },
  },
  
  // Optimism Sepolia
  11155420: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    shortName: "OP Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://opt-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/11155420/rpc",
    tokens: {
      usdc: {
        address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      ecop: {
        address: "0xa5bfe574ac515c14f37c25a92202fa5a58d8e723", // Electronic Colombian Peso (COPe)
        symbol: "COPe",
        name: "Electronic Colombian Peso",
        decimals: 18,
      },
    },
  },
  
  // Base Sepolia
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    shortName: "BASE Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: "https://base-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0",
    blockExplorer: "https://sepolia.basescan.org",
    pimlicoBundlerUrl: "https://public.pimlico.io/v2/84532/rpc",
    tokens: {
      usdc: {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
      },
      ecop: {
        address: "0xb934dcb57fb0673b7bc0fca590c5508f1cde955d", // Electronic Colombian Peso (COPe)
        symbol: "COPe",
        name: "Electronic Colombian Peso",
        decimals: 18,
      },
      eurc: {
        address: "0x808456652fdb597867f38412077A9182bf77359F", // Euro Coin (EURC)
        symbol: "EURC",
        name: "Euro Coin",
        decimals: 6,
      },
    },
  },
};

export const DEFAULT_CHAIN = SUPPORTED_CHAINS[11155111]; // Ethereum Sepolia

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId];
}

export function getAllChains(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS);
}

export function getChainTokens(chainId: number): TokenContract[] {
  const chain = getChainById(chainId);
  if (!chain) return [];
  
  const tokens: TokenContract[] = [];
  if (chain.tokens.usdc) tokens.push(chain.tokens.usdc);
  if (chain.tokens.ecop) tokens.push(chain.tokens.ecop);
  if (chain.tokens.eurc) tokens.push(chain.tokens.eurc);
  
  return tokens;
} 