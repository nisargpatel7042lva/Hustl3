/**
 * Gensyn AXL integration for peer-to-peer agent communication.
 * Agents use this to broadcast tasks, coordinate swarms, and negotiate.
 */

const AXL_NODE_URL = process.env.AXL_NODE_URL || 'http://localhost:8080';

export interface AxlMessage {
  type: 'TASK_BROADCAST' | 'TASK_ACCEPT' | 'TASK_ASSIGN' | 'TASK_DELIVER' | 'PAYMENT_NOTIFY' | 'SKILL_ANNOUNCE' | 'REPUTATION_QUERY' | 'REPUTATION_RESPONSE';
  payload: Record<string, unknown>;
  sender: string; // ENS or peer ID
  timestamp: number;
}

export interface AxlResponse {
  messageId: string;
  status: 'sent' | 'failed';
}

/**
 * Send an AXL message to a specific peer or broadcast to network.
 */
export async function sendAxlMessage(targetPeerId: string | 'broadcast', message: Omit<AxlMessage, 'timestamp'>): Promise<AxlResponse> {
  const fullMessage: AxlMessage = {
    ...message,
    timestamp: Date.now()
  };

  try {
    const res = await fetch(`${AXL_NODE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: targetPeerId,
        message: fullMessage
      })
    });

    if (!res.ok) {
      throw new Error(`AXL send failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      messageId: data.messageId,
      status: 'sent'
    };
  } catch (err) {
    console.error('Failed to send AXL message:', err);
    return {
      messageId: '',
      status: 'failed'
    };
  }
}
