import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/orders/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Order ID is required',
          },
        },
        { status: 400 }
      );
    }

    const result = orderService.getOrder(id);

    if (!result.success) {
      const statusCode = result.error?.code === 'ORDER_NOT_FOUND' ? 404 : 400;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve order',
        },
      },
      { status: 500 }
    );
  }
}