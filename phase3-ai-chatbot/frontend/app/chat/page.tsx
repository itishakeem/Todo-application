/**
 * Chat Page - EXEC-08
 * AI-powered chatbot interface for task management
 * EXEC-08-T001: Create chat page at /chat route with URL state
 * Phase 3: Integrated with shared Navbar
 */
'use client';

import React, { Suspense, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatContainer } from '@/components/chat';
import { useChatMessages } from '@/lib/hooks/useChatMessages';
import { useConversations } from '@/lib/hooks/useConversations';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/layout';

/**
 * Loading fallback for Suspense boundary
 */
function ChatLoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex gap-1">
        <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
        <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

/**
 * Inner chat page component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    conversationId,
    sendMessage,
    loadHistory,
    clearMessages,
    clearError,
  } = useChatMessages();

  const {
    conversations,
    isLoading: convLoading,
    activeConversationId,
    selectConversation,
    createConversation,
    deleteConversation,
    refreshConversations,
  } = useConversations();

  // Load conversation from URL on mount
  useEffect(() => {
    const urlConversationId = searchParams.get('conversation');
    if (urlConversationId && !activeConversationId) {
      selectConversation(parseInt(urlConversationId, 10));
    }
  }, [searchParams, activeConversationId, selectConversation]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load conversation history when selection changes
  useEffect(() => {
    if (activeConversationId) {
      loadHistory(activeConversationId);
    }
  }, [activeConversationId, loadHistory]);

  // Update URL when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      router.replace(`/chat?conversation=${activeConversationId}`, { scroll: false });
    } else {
      router.replace('/chat', { scroll: false });
    }
  }, [activeConversationId, router]);

  // Refresh conversations after sending a message
  useEffect(() => {
    if (conversationId) {
      refreshConversations();
    }
  }, [conversationId, refreshConversations]);

  const handleSendMessage = useCallback(async (text: string) => {
    await sendMessage(text, activeConversationId);
  }, [sendMessage, activeConversationId]);

  const handleNewConversation = useCallback(() => {
    // Clear messages first
    clearMessages();
    // Then clear active conversation (this triggers URL update via useEffect)
    createConversation();
  }, [clearMessages, createConversation]);

  const handleSelectConversation = useCallback((id: number) => {
    selectConversation(id);
  }, [selectConversation]);

  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleDeleteConversation = useCallback(async (id: number) => {
    const deleted = await deleteConversation(id);
    if (deleted) {
      // Clear messages if deleted conversation was active
      if (activeConversationId === id) {
        clearMessages();
      }
    }
  }, [deleteConversation, activeConversationId, clearMessages]);

  // Show loading while checking auth
  if (authLoading) {
    return <ChatLoadingFallback />;
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer
          messages={messages}
          isLoading={chatLoading}
          error={chatError}
          onSendMessage={handleSendMessage}
          onRetry={handleRetry}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          conversationsLoading={convLoading}
          showSidebar={true}
        />
      </div>
    </div>
  );
}

/**
 * Chat Page with Suspense boundary for useSearchParams
 */
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatPageContent />
    </Suspense>
  );
}
