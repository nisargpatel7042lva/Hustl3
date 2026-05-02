/**
 * Event bus for inter-agent communication
 */

import type { AgentMessage } from './types';

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;
export type MessageHandler = EventHandler<AgentMessage>;

/**
 * Central event bus for agent communication
 * Provides publish-subscribe pattern for agents to communicate
 */
export class EventBus {
  private subscribers = new Map<string, Set<EventHandler>>();
  private messageHistory: AgentMessage[] = [];
  private maxHistory = 1000;

  /**
   * Subscribe to an event type
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        handlers.delete(handler as EventHandler);
      }
    };
  }

  /**
   * Subscribe to messages with filtering
   */
  onMessage(
    handler: MessageHandler,
    filter?: (msg: AgentMessage) => boolean
  ): () => void {
    return this.subscribe('message', (msg: AgentMessage) => {
      if (!filter || filter(msg)) {
        return handler(msg);
      }
    });
  }

  /**
   * Publish an event
   */
  async publish<T>(eventType: string, data: T): Promise<void> {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      const promises = Array.from(handlers).map(handler =>
        Promise.resolve().then(() => handler(data))
      );
      await Promise.all(promises);
    }
  }

  /**
   * Publish a message between agents
   */
  async publishMessage(message: AgentMessage): Promise<void> {
    this.addToHistory(message);
    await this.publish('message', message);

    // Also publish to agent-specific topic
    await this.publish(`message:${message.to}`, message);

    // Broadcast messages get published to all
    if (message.type === 'broadcast') {
      await this.publish('broadcast', message);
    }
  }

  /**
   * Get message history with optional filtering
   */
  getMessageHistory(
    filter?: (msg: AgentMessage) => boolean
  ): AgentMessage[] {
    return filter ? this.messageHistory.filter(filter) : [...this.messageHistory];
  }

  /**
   * Get conversation history between two agents
   */
  getConversation(agent1: string, agent2: string): AgentMessage[] {
    return this.messageHistory.filter(
      msg =>
        (msg.from === agent1 && msg.to === agent2) ||
        (msg.from === agent2 && msg.to === agent1)
    );
  }

  /**
   * Clear all subscribers (for testing)
   */
  clear(): void {
    this.subscribers.clear();
    this.messageHistory = [];
  }

  /**
   * Add message to history with size limit
   */
  private addToHistory(message: AgentMessage): void {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }
  }
}
