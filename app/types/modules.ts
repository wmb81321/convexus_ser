export type ModuleType = 'home' | 'profile' | 'transfers' | 'crosschain' | 'defi' | 'funding' | 'clients';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  walletAddress: string;
  createdAt: Date;
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contract?: string;
  usdValue?: number;
  icon?: string;
}

export interface LiquidityPool {
  address: string;
  token0: {
    symbol: string;
    address: string;
    decimals: number;
  };
  token1: {
    symbol: string;
    address: string;
    decimals: number;
  };
  tvl: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  price: number;
  priceChange24h: number;
}

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  minimumAmountOut: string;
  route: string[];
  gasEstimate: string;
}

export interface ClientSupplier {
  id: string;
  name: string;
  taxId: string;
  country: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  bankAccount: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
    swift?: string;
  };
  walletAddress?: string;
  type: 'client' | 'supplier';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientSupplierId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
} 