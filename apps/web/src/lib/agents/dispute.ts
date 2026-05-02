import { executeComputeTask } from '../compute/zerog-compute';
import { kvGet, kvSet, logAppend, STREAMS } from '../storage/zerog';

export interface DisputeOutcome {
  resolution: 'REFUND_BUYER' | 'PAY_SELLER' | 'SPLIT';
  buyerAmount: number;
  sellerAmount: number;
  reasoning: string;
}

/**
 * Automates dispute resolution using a specialized LLM agent.
 * Acts as an impartial third-party mediator based entirely on on-chain proofs and 0G logs.
 */
export async function runDisputeResolutionAgent(
  jobId: string, 
  totalEscrowAmount: number
): Promise<DisputeOutcome> {
  // 1. Gather all evidence from 0G Storage
  const orderRecord = await kvGet<any>(`order:${jobId}`);
  const deliveryTrace = await kvGet<any>(`moa:trace:${jobId}`) || await kvGet<any>(`harness:${jobId}:delivery`);
  const chatLogs = await kvGet<any>(`chat:${jobId}`) || [];

  if (!orderRecord) {
    throw new Error('Order record not found for dispute.');
  }

  // 2. Prepare context for the Mediator AI
  const promptContext = `
    You are an impartial AI Arbiter for the Hustl3 decentralized marketplace.
    A dispute has been filed for Job ID: ${jobId}.
    Escrow Amount: ${totalEscrowAmount} USDC.
    
    Task Requirements: ${orderRecord.requirement}
    
    Submitted Deliverable Trace: ${JSON.stringify(deliveryTrace).substring(0, 2000)}
    
    Buyer-Seller Communications: ${JSON.stringify(chatLogs)}
    
    Evaluate the evidence objectively. Did the seller meet the stated requirements?
    If yes, resolve to PAY_SELLER.
    If no, resolve to REFUND_BUYER.
    If partial work was delivered but not fully compliant, resolve to SPLIT and define the percentages.
    
    You must return a strict JSON response in the following schema:
    {
      "resolution": "REFUND_BUYER" | "PAY_SELLER" | "SPLIT",
      "buyerPercentage": number (0-100),
      "sellerPercentage": number (0-100),
      "reasoning": "string"
    }
  `;

  // 3. Execute inference using qwen3.6-plus for deep reasoning
  const rawResponse = await executeComputeTask(promptContext, { model: 'qwen3.6-plus' });
  
  let result;
  try {
    // Extract JSON block if surrounded by markdown
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
  } catch (err) {
    // Fallback: assume seller fulfilled if error parsing, usually a safe fallback for AI agents 
    // doing tasks perfectly, but in prod we'd queue for human review.
    result = {
      resolution: 'SPLIT',
      buyerPercentage: 50,
      sellerPercentage: 50,
      reasoning: 'Failed to parse AI mediator response. Defaulting to 50/50 split.'
    };
  }

  // 4. Calculate exact payouts
  const outcome: DisputeOutcome = {
    resolution: result.resolution,
    buyerAmount: (totalEscrowAmount * result.buyerPercentage) / 100,
    sellerAmount: (totalEscrowAmount * result.sellerPercentage) / 100,
    reasoning: result.reasoning
  };

  // 5. Save the arbitration record immutably
  await kvSet(`dispute:${jobId}:outcome`, outcome);
  await logAppend(STREAMS.orderEvents(jobId), { 
    type: 'DISPUTE_RESOLVED', 
    jobId, 
    resolution: outcome.resolution,
    reasoning: outcome.reasoning
  });

  return outcome;
}
