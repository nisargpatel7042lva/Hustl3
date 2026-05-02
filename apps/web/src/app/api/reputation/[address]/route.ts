import { NextResponse } from 'next/server';
import { kvGet, KEYS } from '@/lib/storage/zerog';
import { submitRating, ReputationDocument } from '@/lib/reputation/calculator';

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const address = params.address;
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const key = KEYS.reputationScore(address);
    const doc = await kvGet<ReputationDocument>(key);

    if (!doc) {
      return NextResponse.json({
        walletAddress: address,
        overallScore: 0,
        totalRatingsCount: 0,
        ratingDistribution: {},
        events: []
      });
    }

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reputation' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { address: string } }) {
  try {
    const subjectAddress = params.address;
    const { raterAddress, orderId, rating, reviewText } = await req.json();

    if (!subjectAddress || !raterAddress || !orderId || rating === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const doc = await submitRating(subjectAddress, raterAddress, orderId, rating, reviewText);
    
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Failed to submit rating:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
