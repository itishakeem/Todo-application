/**
 * useConversations Hook - TASK-065
 * Manages conversation list for chat
 * FR-004: Conversation history management
 */

import { useState, useCallback, useEffect } from 'react';
import { api, ApiError } from '../api';
import type { ConversationSummary } from '@/components/chat/ConversationList';

interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

interface UseConversationsReturn {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
  activeConversationId: number | null;
  selectConversation: (id: number) => void;
  createConversation: () => void;
  deleteConversation: (id: number) => Promise<boolean>;
  refreshConversations: () => Promise<void>;
}

/**
 * Custom hook for managing chat conversations
 *
 * @returns Conversations data, loading state, and functions
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Fetch conversations from API
  const refreshConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ConversationListResponse>(
        '/api/chat/conversations?limit=50'
      );
      setConversations(response.conversations);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Please log in to view conversations.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load conversations.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Select a conversation
  const selectConversation = useCallback((id: number) => {
    setActiveConversationId(id);
  }, []);

  // Create new conversation (clears active)
  const createConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/api/chat/conversations/${id}`);

      // Remove from local state
      setConversations((prev) => prev.filter((c) => c.id !== id));

      // Clear active if deleted conversation was active
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }

      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete conversation.');
      }
      return false;
    }
  }, [activeConversationId]);

  return {
    conversations,
    isLoading,
    error,
    activeConversationId,
    selectConversation,
    createConversation,
    deleteConversation,
    refreshConversations,
  };
}

export default useConversations;
