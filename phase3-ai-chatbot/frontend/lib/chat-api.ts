/**
 * Chat API Client - EXEC-08-T002
 * Dedicated API client for chat endpoints
 * Provides typed interfaces for chat operations
 */

import { api, ApiError } from './api';

// Request/Response Types
export interface ChatRequest {
  conversation_id?: number | null;
  message: string;
}

export interface ToolCallInfo {
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCallInfo[];
}

export interface ConversationSummary {
  id: number;
  created_at?: string | null;
  updated_at?: string | null;
  message_count: number;
  last_message_preview: string;
}

export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

export interface MessageResponse {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCallInfo[] | null;
  created_at?: string | null;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total: number;
  has_more: boolean;
}

// Chat API Error Types
export class ChatApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ChatApiError';
  }

  static fromApiError(error: ApiError): ChatApiError {
    let code = 'UNKNOWN_ERROR';
    if (error.status === 401) code = 'UNAUTHORIZED';
    else if (error.status === 404) code = 'NOT_FOUND';
    else if (error.status === 400) code = 'VALIDATION_ERROR';
    else if (error.status >= 500) code = 'SERVER_ERROR';
    return new ChatApiError(code, error.status, error.message);
  }
}

/**
 * Chat API Client
 * Provides methods for interacting with the chat backend
 */
export const chatApi = {
  /**
   * Send a message to the AI chatbot
   * Creates a new conversation if conversation_id is not provided
   */
  async sendMessage(
    message: string,
    conversationId?: number | null
  ): Promise<ChatResponse> {
    try {
      return await api.post<ChatResponse>('/api/chat', {
        message,
        conversation_id: conversationId,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw ChatApiError.fromApiError(error);
      }
      throw new ChatApiError('NETWORK_ERROR', 0, 'Network error or server unavailable');
    }
  },

  /**
   * Get list of user's conversations
   * Ordered by most recently updated
   */
  async getConversations(
    limit: number = 50,
    offset: number = 0
  ): Promise<ConversationListResponse> {
    try {
      return await api.get<ConversationListResponse>(
        `/api/chat/conversations?limit=${limit}&offset=${offset}`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw ChatApiError.fromApiError(error);
      }
      throw new ChatApiError('NETWORK_ERROR', 0, 'Network error or server unavailable');
    }
  },

  /**
   * Get messages for a specific conversation
   * Returns paginated messages with total count
   */
  async getMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageListResponse> {
    try {
      return await api.get<MessageListResponse>(
        `/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw ChatApiError.fromApiError(error);
      }
      throw new ChatApiError('NETWORK_ERROR', 0, 'Network error or server unavailable');
    }
  },

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: number): Promise<void> {
    try {
      await api.delete(`/api/chat/conversations/${conversationId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw ChatApiError.fromApiError(error);
      }
      throw new ChatApiError('NETWORK_ERROR', 0, 'Network error or server unavailable');
    }
  },
};

export default chatApi;
