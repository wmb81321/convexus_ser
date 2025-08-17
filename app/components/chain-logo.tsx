"use client";

import Image from "next/image";

interface ChainLogoProps {
  chainId: number;
  size?: number;
  className?: string;
}

export default function ChainLogo({ chainId, size = 24, className = "" }: ChainLogoProps) {
  const getChainLogo = (chainId: number) => {
    switch (chainId) {
      case 11155111: // Ethereum Sepolia
        return {
          src: "/chains_logos/ethereum.svg",
          alt: "Ethereum",
          name: "Ethereum"
        };
      case 1301: // Unichain Sepolia
        return {
          src: "/chains_logos/unichain_testnet.svg", 
          alt: "Unichain",
          name: "Unichain"
        };
      case 11155420: // OP Sepolia
        return {
          src: "/chains_logos/op_mainnet.svg",
          alt: "Optimism",
          name: "Optimism"
        };
      case 84532: // Base Sepolia
        return {
          src: "/chains_logos/base_square_blue.svg",
          alt: "Base",
          name: "Base"
        };
      default:
        return {
          src: "/chains_logos/ethereum.svg", // Default fallback
          alt: "Unknown Chain",
          name: "Unknown"
        };
    }
  };

  const logo = getChainLogo(chainId);

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        objectFit: "contain"
      }}
    />
  );
}

// Export a simple function version for places that just need the logo info
export function getChainLogoInfo(chainId: number) {
  switch (chainId) {
    case 11155111: // Ethereum Sepolia
      return {
        src: "/chains_logos/ethereum.svg",
        alt: "Ethereum",
        name: "Ethereum"
      };
    case 1301: // Unichain Sepolia
      return {
        src: "/chains_logos/unichain_testnet.svg", 
        alt: "Unichain",
        name: "Unichain"
      };
    case 11155420: // OP Sepolia
      return {
        src: "/chains_logos/op_mainnet.svg",
        alt: "Optimism",
        name: "Optimism"
      };
    case 84532: // Base Sepolia
      return {
        src: "/chains_logos/base_square_blue.svg",
        alt: "Base",
        name: "Base"
      };
    default:
      return {
        src: "/chains_logos/ethereum.svg", // Default fallback
        alt: "Unknown Chain",
        name: "Unknown"
      };
  }
}