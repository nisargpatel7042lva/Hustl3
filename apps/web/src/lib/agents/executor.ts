import { deepInfer, fastInfer } from '@/lib/compute/zerog-compute';
import { loadAgentKVMemory, saveAgentKVMemory, appendAgentLog, LogEntryType } from './memory';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { submitKeeperJob } from '@/lib/payments/keeperhub';

export interface OrderRequirements {
  orderId: string;
  gigId: string;
  buyerAddress: string;
  requirements: string;
  formatInstructions: string;
}

/**
 * The core execution loop for an agent handling an order.
 */
export async function executeAgentTask(agentWallet: string, orderData: OrderRequirements) {
  try {
    // 1. Load memory
    const memory = await loadAgentKVMemory(agentWallet);
    
    // 2. Load gig definition
    const gigDef = await kvGet<any>(KEYS.gigData(orderData.gigId));
    if (!gigDef) throw new Error(`Gig ${orderData.gigId} not found`);

    // 3. Construct system prompt
    const systemPrompt = `
      You are an autonomous AI agent on Hustl3.
      Agent Address: ${agentWallet}
      Personality: ${memory.personality}
      Capabilities: ${JSON.stringify(memory.skills)}
      Gig Context: ${JSON.stringify(gigDef)}
      Buyer Preferences: ${JSON.stringify(memory.preferences[orderData.buyerAddress] || {})}
      
      Your goal is to execute the buyer's task perfectly and return the exact required format.
      Return ONLY the final deliverable as described in formatInstructions. Do not include conversational filler.
    `;

    const userPrompt = `
      Order ID: ${orderData.orderId}
      Requirements: ${orderData.requirements}
      Format Instructions: ${orderData.formatInstructions}
    `;

    // 4. Submit to 0G Compute
    // For complex tasks, we use qwen3.6-plus via deepInfer
    const result = await deepInfer(systemPrompt, userPrompt);
    
    // 5. Store deliverable to 0G Storage
    const deliveryKey = KEYS.orderDelivery(orderData.orderId);
    await kvSet(deliveryKey, {
      content: result.content,
      deliveredAt: Date.now(),
      computeCostTokens: result.totalCost,
      latency: result.latencyMs
    });

    // 6. Update KV Memory
    memory.metrics.tasksCompleted += 1;
    memory.recentContext.push({ role: 'user', content: orderData.requirements });
    memory.recentContext.push({ role: 'agent', content: 'Task completed successfully.' });
    if (memory.recentContext.length > 10) memory.recentContext.shift(); // Keep last 10
    await saveAgentKVMemory(agentWallet, memory);

    // 7. Append to Log Memory
    await appendAgentLog(agentWallet, {
      type: LogEntryType.TASK_COMPLETED,
      payload: {
        orderId: orderData.orderId,
        gigId: orderData.gigId,
        buyer: orderData.buyerAddress,
        computeUsed: result.promptTokens + result.outputTokens
      },
      references: [deliveryKey]
    });

    // 8. Trigger on-chain delivery recording via KeeperHub
    // Update order status in KV
    const orderKey = KEYS.orderData(orderData.orderId);
    const orderRecord = await kvGet<any>(orderKey);
    if (orderRecord) {
      orderRecord.state = 'DELIVERED';
      orderRecord.deliveryContentURI = `0g-kv://${deliveryKey}`;
      await kvSet(orderKey, orderRecord);
    }

    await submitKeeperJob({
      contractAddress: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '',
      abi: [{ "inputs": [{"internalType": "string","name": "orderId","type": "string"}],"name": "markDelivered","outputs": [],"stateMutability": "nonpayable","type": "function"}],
      functionName: 'markDelivered',
      args: [orderData.orderId],
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
      priority: 'high'
    });

    return { success: true, deliverableKey: deliveryKey };
  } catch (error) {
    console.error(`Agent execution failed for order ${orderData.orderId}:`, error);
    // Ideally enqueue a retry here depending on the error type
    throw error;
  }
}
