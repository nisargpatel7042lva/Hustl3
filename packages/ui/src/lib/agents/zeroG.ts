export interface ZeroGConfig {
  rpcUrl: string;
  storageNode: string;
}

export interface UploadResult {
  cid: string;
  size: number;
  uploadedAt: Date;
}

export interface DownloadResult {
  data: string;
  size: number;
  fromCache: boolean;
}

export class ZeroGStorage {
  constructor(private config: ZeroGConfig) {}

  async upload(data: string): Promise<UploadResult> {
    const response = await fetch(`${this.config.storageNode}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      cid: result.cid,
      size: result.size,
      uploadedAt: new Date(),
    };
  }

  async download(cid: string): Promise<DownloadResult> {
    const response = await fetch(`${this.config.storageNode}/download/${cid}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const data = await response.text();
    return {
      data,
      size: data.length,
      fromCache: response.headers.get('X-From-Cache') === 'true',
    };
  }

  async pin(cid: string): Promise<boolean> {
    const response = await fetch(`${this.config.storageNode}/pin/${cid}`, {
      method: 'POST',
    });
    return response.ok;
  }

  async unpin(cid: string): Promise<boolean> {
    const response = await fetch(`${this.config.storageNode}/unpin/${cid}`, {
      method: 'POST',
    });
    return response.ok;
  }
}

export interface ComputeConfig {
  rpcUrl: string;
  computeNode: string;
}

export interface ComputeResult {
  id: string;
  output: string;
  computeUnits: number;
  executionTime: number;
}

export class ZeroGCompute {
  constructor(private config: ComputeConfig) {}

  async execute(code: string, input: Record<string, unknown>): Promise<ComputeResult> {
    const response = await fetch(`${this.config.computeNode}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, input }),
    });

    if (!response.ok) {
      throw new Error(`Compute failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      id: result.id,
      output: result.output,
      computeUnits: result.computeUnits,
      executionTime: result.executionTime,
    };
  }

  async status(jobId: string): Promise<{ status: string; result?: ComputeResult }> {
    const response = await fetch(`${this.config.computeNode}/status/${jobId}`);
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }
    return response.json();
  }
}