import { executeComputeTask } from '../compute/zerog-compute';
import { kvGet, kvSet, logAppend, STREAMS } from '../storage/zerog';
import { getAgentReputationScore } from '../blockchain/reputation';

/**
 * Autonomous AI Agent Bidding System
 * Agents listen to a stream of new gigs and autonomously submit proposals
 * based on their configured persona, skills, and current market rates.
 */
export async function runAutonomousBiddingDaemon(agentId: string) {
  console.log(`[Bidding Daemon] Starting autonomous bidding for agent: ${agentId}`);
  
  // 1. Fetch agent profile and skills from 0G Storage
  const agentProfile = await kvGet<any>(`agent:${agentId}:profile`);
  if (!agentProfile) {
    console.warn(`[Bidding Daemon] Agent profile not found for ${agentId}.`);
    return;
  }

  // 2. Fetch the latest open gigs from the marketplace stream
  // In production, this would be a WebSocket listener on the AXL network.
  const recentGigs = await kvGet<any[]>('marketplace:open_gigs') || [];
  
  const myReputation = await getAgentReputationScore(agentId);

  for (const gig of recentGigs) {
    // 3. Check if we already bid on this gig
    const existingBids = await kvGet<string[]>(`gig:${gig.id}:bidders`) || [];
    if (existingBids.includes(agentId)) continue;

    // 4. Determine if the gig matches our skill set using fast LLM evaluation
    const evaluationPrompt = `
      You are an autonomous AI freelancer named "${agentProfile.name}".
      Your skills are: ${agentProfile.skills.join(', ')}.
      Your hourly rate is ~$${agentProfile.baseRate}/hr.
      
      Evaluate this new gig:
      Title: ${gig.title}
      Description: ${gig.description}
      Budget: $${gig.budget}
      
      Should you bid on this gig?
      Output EXACTLY "YES" or "NO".
    `;

    const decision = await executeComputeTask(evaluationPrompt, { model: 'GLM-5-FP8' });

    if (decision.trim().toUpperCase() === 'YES') {
      // 5. Generate a tailored proposal using deep reasoning
      const proposalPrompt = `
        You are "${agentProfile.name}". Write a highly professional, concise, and compelling 
        bid proposal for this gig: "${gig.title}". 
        Highlight why your specific skills make you the best AI agent for the job.
        Mention your on-chain reputation score of ${myReputation}/100.
      `;
      const proposalText = await executeComputeTask(proposalPrompt, { model: 'qwen3.6-plus' });

      // 6. Submit the bid on-chain or to 0G Storage
      const bidPayload = {
        agentId,
        gigId: gig.id,
        proposal: proposalText,
        bidAmount: gig.budget, // Accepting budget for now
        reputationScore: myReputation,
        timestamp: Date.now()
      };

      await logAppend(STREAMS.marketplaceIndex, { type: 'AGENT_BID_SUBMITTED', payload: bidPayload });
      
      existingBids.push(agentId);
      await kvSet(`gig:${gig.id}:bidders`, existingBids);

      console.log(`[Bidding Daemon] Agent ${agentId} successfully bid on Gig ${gig.id}.`);
    }
  }
}
