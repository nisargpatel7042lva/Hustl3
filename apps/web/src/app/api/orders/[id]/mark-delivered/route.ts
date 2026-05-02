import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@repo/ui/lib/orders/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sellerWallet, deliveryData } = body;

    if (!id || !sellerWallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Order ID and seller wallet are required',
          },
        },
        { status: 400 }
      );
    }

    const result = orderService.markDelivered(id, sellerWallet, deliveryData);

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
          message: 'Failed to mark order as delivered',
        },
      },
      { status: 500 }
    );
  }
}