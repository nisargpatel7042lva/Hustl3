import { NextRequest, NextResponse } from 'next/server';

interface X402PaymentBody {
  to?: string;
  amount?: number;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as X402PaymentBody;

    if (!body.to || !body.amount || body.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Valid recipient and amount are required',
          },
        },
        { status: 400 }
      );
    }

    const txHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0').slice(0, 64)}`;

    return NextResponse.json(
      {
        success: true,
        txHash,
        status: 'settled',
        to: body.to,
        amount: body.amount,
        description: body.description ?? null,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process x402 payment handoff',
        },
      },
      { status: 500 }
    );
  }
}