"use client";

import Image from "next/image";

interface TokenIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function TokenIcon({ symbol, size = 24, className = "" }: TokenIconProps) {
  const getTokenLogoPath = (tokenSymbol: string): string => {
    switch (tokenSymbol.toUpperCase()) {
      case "ETH":
        return "/tokens/ether_crypto.png";
      case "USDC":
        return "/tokens/usdc_token.png";
      case "COPE":
      case "COPe":
        return "/tokens/ecop.png";
      case "EURC":
        return "/tokens/usdc_token.png"; // Using USDC as placeholder for EURC
      default:
        return "/tokens/ether_crypto.png"; // Default fallback
    }
  };

  const getTokenAlt = (tokenSymbol: string): string => {
    switch (tokenSymbol.toUpperCase()) {
      case "ETH":
        return "Ethereum";
      case "USDC":
        return "USD Coin";
      case "COPE":
      case "COPe":
        return "Electronic Colombian Peso";
      case "EURC":
        return "Euro Coin";
      default:
        return "Token";
    }
  };

  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Image
        src={getTokenLogoPath(symbol)}
        alt={getTokenAlt(symbol)}
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority={false}
      />
    </div>
  );
}

// Legacy function for backward compatibility - returns the component instead of emoji
export const getTokenIcon = (symbol: string, size: number = 24) => {
  return <TokenIcon symbol={symbol} size={size} />;
};