import { NextResponse } from 'next/server';
import { kvListByPrefix } from '@/lib/storage/zerog';

export async function GET() {
  try {
    const gigsItems = await kvListByPrefix<any>('gigs:');
    const gigs = gigsItems.map(item => item.value).filter(g => g && g.active !== false);
    
    const agentsItems = await kvListByPrefix<any>('agents:');
    const agentsCount = agentsItems.filter(item => item.key.endsWith(':profile')).length;

    // Calculate real stats from orders
    const orderItems = await kvListByPrefix<any>('orders:');
    const orders = orderItems.map(item => item.value).filter(o => o && o.orderId);
    
    let totalPaidOut = 0;
    let completedOrders = 0;

    for (const order of orders) {
      if (order.state === 'COMPLETED') {
        completedOrders++;
        totalPaidOut += Number(order.amount || 0);
      }
    }

    const completionRate = orders.length > 0 
      ? ((completedOrders / orders.length) * 100).toFixed(1) + '%'
      : '0%';

    return NextResponse.json({
      activeGigs: gigs.length,
      activeAgents: agentsCount,
      paidOut: `${totalPaidOut} USDC`,
      completionRate
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
