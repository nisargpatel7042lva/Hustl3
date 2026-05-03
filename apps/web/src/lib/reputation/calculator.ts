import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { submitKeeperJob } from '@/lib/payments/keeperhub';
import crypto from 'crypto';

export interface ReputationEvent {
  orderId: string;
  raterAddress: string;
  rating: number; // 1-5
  timestamp: number;
  reviewText: string;
}

export interface ReputationDocument {
  walletAddress: string;
  ensName: string;
  overallScore: number; // 0.0 to 5.0
  totalRatingsCount: number;
  ratingDistribution: Record<number, number>; // 1: count, 2: count...
  events: ReputationEvent[];
  // Endorsements skipped for brevity
}

export async function submitRating(
  subjectAddress: string,
  raterAddress: string,
  orderId: string,
  rating: number,
  reviewText: string
) {
  const key = KEYS.reputationScore(subjectAddress);
  let doc = await kvGet<ReputationDocument>(key);
  
  if (!doc) {
    doc = {
      walletAddress: subjectAddress,
      ensName: '', // Would resolve in real flow
      overallScore: 0,
      totalRatingsCount: 0,
      ratingDistribution: { 1:0, 2:0, 3:0, 4:0, 5:0 },
      events: []
    };
  }

  // Add new event
  doc.events.push({
    orderId,
    raterAddress,
    rating,
    timestamp: Date.now(),
    reviewText
  });
  doc.totalRatingsCount++;
  doc.ratingDistribution[rating] = (doc.ratingDistribution[rating] || 0) + 1;

  // Calculate weighted score (most recent 10 weighted 2x)
  let weightedSum = 0;
  let totalWeight = 0;
  const recentCutoff = Math.max(0, doc.events.length - 10);
  
  doc.events.forEach((ev, idx) => {
    const weight = idx >= recentCutoff ? 2 : 1;
    weightedSum += ev.rating * weight;
    totalWeight += weight;
  });
  
  doc.overallScore = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;

  // Save back to 0G KV
  await kvSet(key, doc);

  // Submit on-chain via KeeperHub
  const metadataString = JSON.stringify({ reviewText, rating, orderId, timestamp: Date.now() });
  const metadataHash = '0x' + crypto.createHash('sha256').update(metadataString).digest('hex');

  await submitKeeperJob({
    contractAddress: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || '',
    abi: [{"inputs":[{"internalType":"address","name":"subject","type":"address"},{"internalType":"address","name":"rater","type":"address"},{"internalType":"string","name":"orderId","type":"string"},{"internalType":"uint8","name":"rating","type":"uint8"},{"internalType":"bytes32","name":"metadataHash","type":"bytes32"}],"name":"recordReputation","outputs":[],"stateMutability":"nonpayable","type":"function"}],
    functionName: 'recordReputation',
    args: [subjectAddress, raterAddress, orderId, rating, metadataHash],
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
    priority: 'low',
    callbackUrl: `${process.env.APP_URL}/api/webhooks/keeperhub`,
    metadata: { orderId, action: 'recordReputation', subject: subjectAddress }
  });

  return doc;
}
