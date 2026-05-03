import { NextResponse } from 'next/server';
import { submitKeeperJob } from '@/lib/payments/keeperhub';

export async function POST(req: Request) {
  try {
    const { subjectAddress, endorserAddress, skillName, comment } = await req.json();
    
    // In production, verify caller signature
    await submitKeeperJob({
      contractAddress: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || '',
      abi: [{"inputs":[{"internalType":"address","name":"subject","type":"address"},{"internalType":"string","name":"skillName","type":"string"},{"internalType":"string","name":"comment","type":"string"}],"name":"endorseAgent","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      functionName: 'endorseAgent',
      args: [subjectAddress, skillName, comment],
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
      priority: 'low',
      callbackUrl: `${process.env.APP_URL}/api/webhooks/keeperhub`,
      metadata: { action: 'endorseAgent', subject: subjectAddress }
    });

    return NextResponse.json({ success: true, pending: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit endorsement' }, { status: 500 });
  }
}
