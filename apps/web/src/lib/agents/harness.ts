import { kvSet, kvGet, logAppend, STREAMS, kvListByPrefix } from '../storage/zerog';
import { runMoAEngine } from './moa';
import { executeComputeTask } from '../compute/zerog-compute';

export type HarnessState = 'INITIALIZING' | 'DECOMPOSING' | 'RECRUITING' | 'EXECUTING' | 'AGGREGATING' | 'VALIDATING' | 'SYNTHESIZING' | 'DELIVERING' | 'COMPLETED';

export interface TaskNode {
  id: string;
  description: string;
  dependsOn: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  assignedAgent?: string;
  output?: string;
}

export async function advanceHarnessState(jobId: string, newState: HarnessState) {
  await logAppend(STREAMS.marketplaceIndex, { type: 'HARNESS_STATE_CHANGE', jobId, state: newState });
  await kvSet(`harness:${jobId}:state`, newState);
}

export async function executeHarness(jobId: string, requirement: string, blueprintHash?: string) {
  await advanceHarnessState(jobId, 'INITIALIZING');
  
  // 1. Decomposing (or loading blueprint)
  await advanceHarnessState(jobId, 'DECOMPOSING');
  let taskGraph: TaskNode[] = [];
  if (blueprintHash) {
    // Load visual builder JSON
    const bp = await kvGet<any>(`blueprint:${blueprintHash}`);
    if (bp && bp.nodes) {
      taskGraph = bp.nodes.map((n: any) => ({
        id: n.id,
        description: n.data?.role || 'Task',
        dependsOn: [], // simplified DAG parsing
        status: 'PENDING'
      }));
    }
  } else {
    // LLM Decomposition
    const decomp = await executeComputeTask(`Decompose into a DAG (JSON): ${requirement}`, { model: 'qwen3.6-plus' });
    try { taskGraph = JSON.parse(decomp); } catch (e) {
      taskGraph = [{ id: 'task_1', description: requirement, dependsOn: [], status: 'PENDING' }];
    }
  }
  await kvSet(`harness:${jobId}:graph`, taskGraph);

  // 2. Recruiting
  await advanceHarnessState(jobId, 'RECRUITING');
  const agentItems = await kvListByPrefix<any>('agents:');
  const availableAgents = agentItems.filter(item => item.key.endsWith(':profile')).map(item => item.value);

  for (let node of taskGraph) {
    await logAppend(STREAMS.marketplaceIndex, { type: 'AXL_BROADCAST', jobId, subtaskId: node.id });
    
    if (availableAgents.length > 0) {
      // Simple matchmaking: pick a random agent for now
      // A full implementation would match based on skills and node.description
      const selectedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      node.assignedAgent = selectedAgent.walletAddress;
    } else {
      // Fallback if no agents are registered yet
      node.assignedAgent = `0xFallbackWorker_${Math.random().toString(16).slice(2, 6)}`;
    }
  }
  await kvSet(`harness:${jobId}:graph`, taskGraph);

  // 3. Executing (Parallel DAG traversal simplified for demo)
  await advanceHarnessState(jobId, 'EXECUTING');
  for (let node of taskGraph) {
    node.status = 'RUNNING';
    await kvSet(`harness:${jobId}:graph`, taskGraph);
    
    // Simulate execution via 0G Compute
    const output = await executeComputeTask(`Perform task: ${node.description}`, { model: 'qwen3.6-plus' });
    node.output = output;
    node.status = 'COMPLETED';
    await kvSet(`harness:${jobId}:graph`, taskGraph);
  }

  // 4. Aggregating & Synthesizing
  await advanceHarnessState(jobId, 'AGGREGATING');
  const allOutputs = taskGraph.map(n => n.output).join('\n\n');
  
  await advanceHarnessState(jobId, 'VALIDATING');
  
  await advanceHarnessState(jobId, 'SYNTHESIZING');
  const finalResult = await executeComputeTask(`Synthesize final deliverable from: ${allOutputs}`, { model: 'qwen3.6-plus' });
  
  // 5. Delivering
  await advanceHarnessState(jobId, 'DELIVERING');
  await kvSet(`harness:${jobId}:delivery`, finalResult);
  
  // Queue evolution job (BullMQ stub)
  // queue.add('postExecutionAnalysis', { jobId });
  
  await advanceHarnessState(jobId, 'COMPLETED');
  
  return finalResult;
}
