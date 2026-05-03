import { NextResponse } from 'next/server';
import { submitKeeperJob, getKeeperJobStatus } from '@/lib/payments/keeperhub';

/**
 * Test KeeperHub Direct Execution API
 *
 * GET  — verify connectivity, show KeeperHub wallet address + balance
 * POST — submit a real test read-only contract call
 */

export async function GET() {
  try {
    const apiKey = process.env.KEEPERHUB_API_KEY;
    const apiUrl = process.env.KEEPERHUB_API_URL;

    if (!apiKey || apiKey === 'your_keeperhub_api_key') {
      return NextResponse.json(
        { error: 'KeeperHub API key not configured', status: 'unconfigured' },
        { status: 401 }
      );
    }

    // Fetch wallet info — GET /api/user/wallet returns address + balances per chain
    const walletRes = await fetch(`${apiUrl}/api/user/wallet`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    // Fetch supported chains
    const chainsRes = await fetch(`${apiUrl}/api/chains`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const walletData = walletRes.ok ? await walletRes.json() : null;
    const chainsData = chainsRes.ok ? await chainsRes.json() : null;

    const keeperHubWallet   = walletData?.walletAddress || null;
    const sepoliaBalance    = walletData?.balances?.['11155111'] || '0';
    const walletFunded      = parseFloat(sepoliaBalance) > 0;

    return NextResponse.json({
      status: 'connected',
      apiUrl,
      apiKeyPrefix: apiKey.slice(0, 10) + '***',
      keeperHubWallet,
      walletFunded,
      walletBalanceSepolia: sepoliaBalance + ' ETH',
      supportedChains: chainsData,
      contracts: {
        escrow:     process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
        reputation: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS,
        registry:   process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
        chainId:    process.env.NEXT_PUBLIC_CHAIN_ID,
      },
      nextSteps: keeperHubWallet
        ? walletFunded
          ? [
              '✅ Wallet funded — ready to authorize contracts',
              `Run: PRIVATE_KEY=0x... KEEPERHUB_WALLET=${keeperHubWallet} npx hardhat run scripts/authorize-keeperhub.ts --network sepolia`,
              'Then POST to this endpoint to test a live contract call',
            ]
          : [
              `⚠️  Fund KeeperHub wallet with Sepolia ETH: ${keeperHubWallet}`,
              'Get free ETH: https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
              `Then run: PRIVATE_KEY=0x... KEEPERHUB_WALLET=${keeperHubWallet} npx hardhat run scripts/authorize-keeperhub.ts --network sepolia`,
            ]
        : ['Could not fetch KeeperHub wallet — check API key'],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        status: 'error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const apiKey = process.env.KEEPERHUB_API_KEY;
    const apiUrl = process.env.KEEPERHUB_API_URL;

    // Call the direct execution endpoint and capture raw response
    const res = await fetch(`${apiUrl}/api/execute/contract-call`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC Sepolia
        network:         'sepolia',
        functionName:    'balanceOf',
        functionArgs:    JSON.stringify(['0x0000000000000000000000000000000000000000']),
        abi:             JSON.stringify([{
          type: 'function',
          name: 'balanceOf',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
        }]),
      }),
    });

    const rawBody = await res.text();
    let parsed: any = null;
    try { parsed = JSON.parse(rawBody); } catch {}

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        httpStatus: res.status,
        rawResponse: rawBody,
        hint: 'KeeperHub rejected the request — see rawResponse for details',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      httpStatus: res.status,
      response: parsed,
      message: 'KeeperHub Direct Execution API is working ✓',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        status: 'failed',
      },
      { status: 500 }
    );
  }
}
