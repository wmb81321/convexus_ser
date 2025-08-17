import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Environment variables for on-ramp providers
const MOONPAY_PUBLIC_KEY = process.env.MOONPAY_PUBLIC_KEY;
const MOONPAY_SECRET_KEY = process.env.MOONPAY_SECRET_KEY;
const COINBASE_APP_ID = process.env.COINBASE_APP_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, email, redirectUrl, provider = 'coinbase', currencyCode = 'USDC', amount, network = 'ethereum' } = body;

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    let onrampUrl: string;

    switch (provider) {
      case 'coinbase':
        onrampUrl = constructCoinbaseOnrampUrl({
          address,
          email,
          redirectUrl,
          currencyCode,
          amount,
          network
        });
        break;
      
      case 'moonpay':
        if (!MOONPAY_PUBLIC_KEY || !MOONPAY_SECRET_KEY) {
          return NextResponse.json({ error: 'Moonpay credentials not configured' }, { status: 500 });
        }
        onrampUrl = await constructMoonpayOnrampUrl({
          address,
          email,
          redirectUrl,
          currencyCode,
          amount,
          network
        });
        break;
      
      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    return NextResponse.json({ url: onrampUrl });
  } catch (error) {
    console.error('On-ramp API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function constructCoinbaseOnrampUrl({
  address,
  email,
  redirectUrl,
  currencyCode,
  amount,
  network
}: {
  address: string;
  email?: string;
  redirectUrl?: string;
  currencyCode: string;
  amount?: string;
  network: string;
}): string {
  const baseUrl = 'https://pay.coinbase.com/buy/select-asset';
  const url = new URL(baseUrl);
  
  // Configure Coinbase Onramp parameters
  if (COINBASE_APP_ID) {
    url.searchParams.set('appId', COINBASE_APP_ID);
  }
  
  url.searchParams.set('destinationWallets', JSON.stringify([{
    address,
    blockchains: [network === 'ethereum' ? 'ethereum' : network],
  }]));
  
  if (currencyCode) {
    url.searchParams.set('presetCryptoAmount', amount || '10');
    url.searchParams.set('defaultAsset', currencyCode);
  }
  
  if (redirectUrl) {
    url.searchParams.set('redirectUrl', redirectUrl);
  }

  return url.toString();
}

async function constructMoonpayOnrampUrl({
  address,
  email,
  redirectUrl,
  currencyCode,
  amount,
  network
}: {
  address: string;
  email?: string;
  redirectUrl?: string;
  currencyCode: string;
  amount?: string;
  network: string;
}): Promise<string> {
  const baseUrl = 'https://buy-sandbox.moonpay.com';
  const url = new URL(baseUrl);
  
  // Configure Moonpay parameters
  url.searchParams.set('apiKey', MOONPAY_PUBLIC_KEY!);
  url.searchParams.set('walletAddress', address);
  
  if (email) {
    url.searchParams.set('email', email);
  }
  
  if (redirectUrl) {
    url.searchParams.set('redirectURL', redirectUrl);
  }
  
  if (currencyCode) {
    url.searchParams.set('currencyCode', currencyCode.toLowerCase());
  }
  
  if (amount) {
    url.searchParams.set('baseCurrencyAmount', amount);
  }

  // Map network to Moonpay's network format
  const networkMapping: { [key: string]: string } = {
    'ethereum': 'ethereum',
    'base': 'base',
    'optimism': 'optimism',
    'polygon': 'polygon'
  };
  
  if (networkMapping[network]) {
    url.searchParams.set('defaultCurrencyCode', `${currencyCode.toLowerCase()}_${networkMapping[network]}`);
  }

  // Sign the URL with Moonpay secret key
  const signature = crypto
    .createHmac('sha256', MOONPAY_SECRET_KEY!)
    .update(url.search)
    .digest('base64');
  
  url.searchParams.set('signature', signature);

  return url.toString();
}
