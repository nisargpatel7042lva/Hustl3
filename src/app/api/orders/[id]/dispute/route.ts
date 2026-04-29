import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/orders/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { wallet, reason } = body;

    if (!id || !wallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Order ID and wallet are required',
          },
        },
        { status: 400 }
      );
    }

    const result = orderService.disputeOrder(id, wallet, reason);

    if (!result.success) {
      const statusCode =
        result.error?.code === 'ORDER_NOT_FOUND'
          ? 404
          : result.error?.code === 'UNAUTHORIZED'
          ? 403
          : 400;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to dispute order',
        },
      },
      { status: 500 }
    );
  }
}