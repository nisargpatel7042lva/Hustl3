import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/orders/service';
import { CreateOrderRequest } from '@/types';

const MOCK_SERVICES: Record<string, { title: string; price: number }> = {
  'svc_001': { title: 'Logo Design Package', price: 0.05 },
  'svc_002': { title: 'Smart Contract Development', price: 0.5 },
  'svc_003': { title: 'AI Content Writing', price: 0.02 },
};

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    const serviceInfo = MOCK_SERVICES[body.serviceId];
    const serviceTitle = serviceInfo?.title ?? `Service ${body.serviceId}`;

    const result = orderService.createOrder(body, serviceTitle);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create order',
        },
      },
      { status: 500 }
    );
  }
}