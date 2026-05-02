import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@repo/ui/lib/orders/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Wallet address is required',
          },
        },
        { status: 400 }
      );
    }

    const result = orderService.getOrdersByWallet(wallet);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve orders',
        },
      },
      { status: 500 }
    );
  }
}