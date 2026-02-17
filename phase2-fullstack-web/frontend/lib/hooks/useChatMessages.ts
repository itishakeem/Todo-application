/**
 * useChatMessages Hook - TASK-064
 * Manages message state for chat interface
 * FR-001, FR-003: Send messages and load history
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '../api';
import type { Message } from '@/components/chat/MessageBubble';

interface ToolCallInfo {
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCallInfo[];
}

interface MessageListResponse {
  messages: Message[];
  total: number;
  has_more: boolean;
}

interface UseChatMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: number | null;
  sendMessage: (text: string, convId?: number | null) => Promise<void>;
  loadHistory: (conversationId: number) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing chat messages
 *
 * @returns Messages data, loading state, error state, and functions
 */
export function useChatMessages(): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Send a message to the AI
  const sendMessage = useCallback(async (text: string, convId?: number | null) => {
    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const tempUserMessageId = Date.now();
    const userMessage: Message = {
      id: tempUserMessageId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.post<ChatResponse>('/api/chat', {
        conversation_id: convId ?? conversationId,
        message: text,
      });

      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
        tool_calls: response.tool_calls,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessageId));

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Please log in to use the chat.');
        } else if (err.status === 404) {
          setError('Conversation not found. Starting a new one.');
          setConversationId(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Load message history for a conversation
  const loadHistory = useCallback(async (convId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<MessageListResponse>(
        `/api/chat/conversations/${convId}/messages?limit=50`
      );

      setMessages(response.messages);
      setConversationId(convId);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Please log in to view chat history.');
        } else if (err.status === 404) {
          setError('Conversation not found.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load chat history.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all messages (for new conversation)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    loadHistory,
    clearMessages,
    clearError,
  };
}

export default useChatMessages;
