import { kvSet, logAppend, STREAMS } from '../storage/zerog';

export interface X402Allocation {
  agentId: string;
  amountUsdc: number;
}

export async function executeBudgetWaterfall(jobId: string, totalBudget: number, allocations: X402Allocation[]) {
  // Simulate x402 payment channels releasing micro-transactions
  
  let totalAllocated = 0;
  const payouts = allocations.map(alloc => {
    totalAllocated += alloc.amountUsdc;
    return {
      to: alloc.agentId,
      amount: alloc.amountUsdc,
      status: 'PAID',
      txHash: `0x402_${Math.random().toString(16).slice(2)}`
    };
  });

  const coordinatorFee = totalBudget - totalAllocated;
  
  if (coordinatorFee < 0) {
    throw new Error('Budget waterfall allocations exceed total budget');
  }

  // Record payment stream securely in 0G Log for audibility
  await logAppend(STREAMS.marketplaceIndex, {
    type: 'X402_WATERFALL_EXECUTED',
    jobId,
    totalBudget,
    coordinatorFee,
    payouts
  });

  await kvSet(`payment:${jobId}:x402`, { payouts, coordinatorFee });

  return { payouts, coordinatorFee };
}
