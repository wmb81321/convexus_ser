import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4B66F3",
};

export const metadata: Metadata = {
  title: "Convexo Wallet - Next-Generation Smart Web3 Wallet",
  description: "Experience the future of Web3 with Convexo's smart wallet. Gasless transactions, social login, " +
    "and seamless onchain interactions on Ethereum mainnet.",
  keywords: [
    "Web3 wallet",
    "Smart wallet", 
    "Gasless transactions",
    "Account abstraction",
    "Ethereum",
    "DeFi",
    "Social login",
    "Convexo"
  ],
  authors: [{ name: "Convexo Team" }],
  creator: "Convexo",
  publisher: "Convexo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://convexus.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Convexo Wallet - Smart Web3 Wallet",
    description: "Next-generation smart wallet with gasless transactions and social authentication",
    url: "https://convexus.vercel.app",
    siteName: "Convexo Wallet",
    images: [
      {
        url: "/convexo-logo.png",
        width: 1200,
        height: 630,
        alt: "Convexo Wallet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convexo Wallet - Smart Web3 Wallet",
    description: "Next-generation smart wallet with gasless transactions",
    images: ["/convexo-logo.png"],
    creator: "@ConvexoFinance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Convexo",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Convexo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Primary Favicon - Using Convexo Logo */}
        <link rel="icon" href="/convexo-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/convexo-logo.png" type="image/png" />
        
        {/* Multiple sizes for different devices */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon_io/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon_io/android-chrome-512x512.png" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        
        {/* Fallback ICO */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* PWA and Mobile Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Convexo" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4B66F3" />
        <meta name="msapplication-TileColor" content="#4B66F3" />
        <meta name="msapplication-navbutton-color" content="#4B66F3" />
        
        {/* Professional Brand Meta */}
        <meta name="application-name" content="Convexo Wallet" />
        <meta name="apple-mobile-web-app-title" content="Convexo Wallet" />
      </head>
      <body className={`${inter.className} institutional-bg`}>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered: ', registration))
                    .catch(registrationError => console.log('SW registration failed: ', registrationError));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
