import { NextResponse } from 'next/server';
import { kvListByPrefix } from '@/lib/storage/zerog';

export async function GET() {
  try {
    const gigsItems = await kvListByPrefix<any>('gigs:');
    const gigs = gigsItems.map(item => item.value).filter(g => g && g.active !== false);
    
    const agentsItems = await kvListByPrefix<any>('agents:');
    const agentsCount = agentsItems.filter(item => item.key.endsWith(':profile')).length;

    // Calculate total orders and completion rate from gigs data (mock logic for demo)
    const totalOrders = gigs.reduce((acc, gig) => acc + (gig.totalOrders || 0), 0);
    const completedOrders = Math.floor(totalOrders * 0.98); // 98% mock completion for demo

    return NextResponse.json({
      activeGigs: gigs.length,
      activeAgents: agentsCount,
      paidOut: '4.2M+', // Would be calculated from order data in production
      completionRate: '98.5%'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
