# Convexo - Smart Wallet DeFi Platform

A next-generation Web3 platform combining smart wallets, multi-chain support, and comprehensive DeFi tools for seamless cryptocurrency management.

## Features

### 🔐 Smart Wallet Technology
- **Gasless Transactions**: Sponsored gas fees across multiple chains
- **Social Authentication**: Google, Apple, Telegram login
- **Account Abstraction**: ERC-4337 compliant smart wallets
- **Multi-chain Support**: Ethereum, Optimism, Base, Unichain

### 💰 Multi-Token Support
- **USDC**: Native support across all chains
- **COPe (Electronic Colombian Peso)**: Multi-chain stablecoin
- **EURC (Euro Coin)**: European stablecoin support
- **Native ETH**: Full balance tracking

### 🏢 Business Tools
- **Clients & Suppliers**: Complete CRM with billing capabilities
- **Invoice Generation**: Create and manage crypto invoices
- **Small Buy**: Privy funding integration for purchases up to $1,000
- **OTC Trading**: Advanced quotation system for larger trades

### 📊 DeFi Integration (SER)
- **Smart Exchange**: Advanced trading interface
- **Liquidity Pools**: Uniswap V3 integration
- **Portfolio Management**: Real-time balance tracking

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/wmb81321/convexo_ethglobal.git
   cd convexo_ethglobal/convexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` with:
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_policy_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** http://localhost:3000

## Supported Networks

- **Ethereum Sepolia** (11155111)
- **Optimism Sepolia** (11155420)
- **Base Sepolia** (84532)
- **Unichain Sepolia** (1301)

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Privy
- **Smart Wallets**: Account Abstraction (ERC-4337)
- **Gas Sponsorship**: Alchemy Gas Manager
- **DeFi**: Uniswap V3 integration
- **State Management**: Redux Toolkit

## Project Structure

```
convexus/
├── app/
│   ├── components/      # UI components
│   ├── hooks/          # Custom React hooks
│   ├── modules/        # Feature modules
│   └── types/          # TypeScript definitions
├── lib/                # Utility functions
├── components/ui/      # Shared UI components
└── public/            # Static assets
```

## Environment Setup

### Privy Configuration
1. Create account at [dashboard.privy.io](https://dashboard.privy.io)
2. Create new app and copy App ID
3. Configure login methods: Google, Apple, Telegram
4. Enable embedded wallets and smart wallets

### Alchemy Configuration
1. Create account at [dashboard.alchemy.com](https://dashboard.alchemy.com)
2. Create app for each network
3. Set up Gas Manager with policies for each chain
4. Copy API key and policy IDs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub.