/**
 * ChatContext - Global chat state management for AI Chatbot
 * Provides chat drawer state and message management across all pages
 * Phase 3: Half-screen chatbot accessible from navbar
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { api, ApiError } from '../api';
import type { Message } from '@/components/chat/MessageBubble';
import type { ConversationSummary } from '@/components/chat/ConversationList';

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

interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

interface ChatContextValue {
  // Drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Messages
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: number | null;
  sendMessage: (text: string) => Promise<void>;
  loadHistory: (conversationId: number) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;

  // Conversations
  conversations: ConversationSummary[];
  conversationsLoading: boolean;
  activeConversationId: number | null;
  selectConversation: (id: number) => void;
  createNewConversation: () => void;
  deleteConversation: (id: number) => Promise<boolean>;
  refreshConversations: () => Promise<void>;

  // Task refresh callback (set by TaskContext)
  onTasksChanged: (() => void) | null;
  setOnTasksChanged: (callback: (() => void) | null) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Conversations state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Callback for task refresh
  const [onTasksChanged, setOnTasksChanged] = useState<(() => void) | null>(null);

  // Drawer controls
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  // Fetch conversations
  const refreshConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const response = await api.get<ConversationListResponse>(
        '/api/chat/conversations?limit=50'
      );
      setConversations(response.conversations);
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        console.error('Failed to load conversations:', err);
      }
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Load conversations when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      refreshConversations();
    }
  }, [isDrawerOpen, refreshConversations]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
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
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await api.post<ChatResponse>('/api/chat', {
        conversation_id: activeConversationId ?? conversationId,
        message: text,
      });

      // Update conversation ID if new
      if (!conversationId && !activeConversationId) {
        setConversationId(response.conversation_id);
        setActiveConversationId(response.conversation_id);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
        tool_calls: response.tool_calls,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Refresh conversations list to show new/updated conversation
      refreshConversations();

      // Check if any task-related tools were called and trigger refresh
      const taskTools = ['add_task', 'update_task', 'delete_task', 'complete_task'];
      const hasTaskChanges = response.tool_calls?.some(tc => taskTools.includes(tc.tool));
      if (hasTaskChanges && onTasksChanged) {
        onTasksChanged();
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessageId));

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Please log in to use the chat.');
        } else if (err.status === 404) {
          setError('Conversation not found. Starting a new one.');
          setConversationId(null);
          setActiveConversationId(null);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, activeConversationId, refreshConversations, onTasksChanged]);

  // Load message history
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

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Select conversation
  const selectConversation = useCallback((id: number) => {
    setActiveConversationId(id);
    loadHistory(id);
  }, [loadHistory]);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    clearMessages();
    setActiveConversationId(null);
  }, [clearMessages]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/api/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));

      if (activeConversationId === id) {
        clearMessages();
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
  }, [activeConversationId, clearMessages]);

  const value: ChatContextValue = {
    // Drawer
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,

    // Messages
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    loadHistory,
    clearMessages,
    clearError,

    // Conversations
    conversations,
    conversationsLoading,
    activeConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    refreshConversations,

    // Task callback
    onTasksChanged,
    setOnTasksChanged,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Custom hook to use ChatContext
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;
