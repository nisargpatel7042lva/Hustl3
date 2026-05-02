import { executeComputeTask } from '../compute/zerog';
import { kvSet, logAppend, STREAMS } from '../storage/zerog';

export interface MoAConfig {
  parallelWorkers: number;
  baseModel: string;
  aggregatorModel: string;
  aggregationStrategy: 'Synthesize' | 'Vote' | 'Best-of';
}

export async function runMoAEngine(
  jobId: string, 
  taskContext: string, 
  config: MoAConfig
) {
  // 1. Decompose
  const decompositionPrompt = `Decompose the following task into ${config.parallelWorkers} parallel distinct perspectives or subtasks. Return JSON array of instructions.\nTask: ${taskContext}`;
  const decompositionRaw = await executeComputeTask(decompositionPrompt, { model: config.baseModel });
  let workerTasks: string[] = [];
  try {
    workerTasks = JSON.parse(decompositionRaw);
  } catch(e) {
    // Fallback if unstructured
    workerTasks = Array(config.parallelWorkers).fill(taskContext);
  }

  // Record trace
  await logAppend(STREAMS.marketplaceIndex, { type: 'MOA_DECOMPOSED', jobId, tasks: workerTasks });

  // 2. Parallel Execution
  const workerPromises = workerTasks.map((workerTask, index) => {
    // Use slightly different temperatures for diversity
    const temp = 0.6 + (index * 0.1);
    return executeComputeTask(`You are a specialized worker in a MoA cluster. Task: ${workerTask}`, { model: config.baseModel, temperature: temp })
      .then(res => ({ workerId: index, output: res, success: true }))
      .catch(err => ({ workerId: index, error: err.message, success: false }));
  });

  const workerResults = await Promise.all(workerPromises);
  const successfulOutputs = workerResults.filter(r => r.success).map(r => r.output);
  
  await logAppend(STREAMS.marketplaceIndex, { type: 'MOA_PARALLEL_DONE', jobId, workerResults });

  if (successfulOutputs.length === 0) {
    throw new Error('All MoA workers failed.');
  }

  // 3. Aggregation
  let finalResult = '';
  if (config.aggregationStrategy === 'Synthesize') {
    const aggPrompt = `Synthesize the following distinct worker outputs into a single, cohesive, and superior final deliverable. Resolve contradictions intelligently.\n\nOutputs:\n${successfulOutputs.join('\n\n---\n\n')}`;
    finalResult = await executeComputeTask(aggPrompt, { model: config.aggregatorModel });
  } else if (config.aggregationStrategy === 'Vote') {
    // Simplified voting logic
    finalResult = successfulOutputs[0] || '';
  } else {
    finalResult = successfulOutputs[0] || '';
  }

  // 4. Validation
  const valPrompt = `Validate if this deliverable meets general quality standards. Output "PASS" or "FAIL: [reason]". Deliverable: ${finalResult}`;
  const validationRes = await executeComputeTask(valPrompt, { model: config.baseModel });

  await logAppend(STREAMS.marketplaceIndex, { type: 'MOA_AGGREGATED', jobId, validation: validationRes });

  // Save full trace to KV
  await kvSet(`moa:trace:${jobId}`, {
    jobId,
    decomposition: workerTasks,
    workerResults,
    finalResult,
    validation: validationRes
  });

  return {
    finalOutput: finalResult,
    traceId: `moa:trace:${jobId}`
  };
}
