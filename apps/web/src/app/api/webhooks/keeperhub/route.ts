import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const signature = req.headers.get('x-keeperhub-signature');
    
    // In production, verify the webhook signature to ensure it came from KeeperHub
    console.log('Received KeeperHub Webhook:', payload);

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
