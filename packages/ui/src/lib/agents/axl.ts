import { AxlMessageEnvelope, AxlSendResult } from '@repo/ui/types';

type MessageHandler = (message: AxlMessageEnvelope) => void | Promise<void>;

class AxlStubTransport {
  private handlers = new Set<MessageHandler>();
  private history: AxlMessageEnvelope[] = [];

  async send(to: string, payload: string, from: string): Promise<AxlSendResult> {
    const message: AxlMessageEnvelope = {
      id: `axl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      from,
      to,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.history.push(message);

    queueMicrotask(() => {
      for (const handler of this.handlers) {
        void handler(message);
      }
    });

    return {
      messageId: message.id,
      status: 'sent',
    };
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  getHistory(): AxlMessageEnvelope[] {
    return [...this.history];
  }
}

export const axl = new AxlStubTransport();