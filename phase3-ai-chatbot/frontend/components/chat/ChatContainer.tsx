/**
 * ChatContainer Component - TASK-055
 * Wrapper component for chat interface
 * FR-001, FR-002: Contains MessageList and MessageInput
 */
'use client';

import React, { useState, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationList, { ConversationSummary } from './ConversationList';
import { Message } from './MessageBubble';

export interface ChatContainerProps {
  // Messages
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
  onSendMessage: (message: string) => void;
  onRetry?: () => void;

  // Conversations (optional - for sidebar)
  conversations?: ConversationSummary[];
  activeConversationId?: number | null;
  onSelectConversation?: (id: number) => void;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: number) => void;
  conversationsLoading?: boolean;

  // Layout
  showSidebar?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading = false,
  error = null,
  onSendMessage,
  onRetry,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  conversationsLoading = false,
  showSidebar = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSend = useCallback((message: string) => {
    onSendMessage(message);
  }, [onSendMessage]);

  const handleSelectConversation = useCallback((id: number) => {
    onSelectConversation?.(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [onSelectConversation]);

  const handleNewConversation = useCallback(() => {
    onNewConversation?.();
    // Close sidebar on mobile after creating new
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [onNewConversation]);

  return (
    <div
      className="flex h-full bg-black"
      data-testid="chat-container"
    >
      {/* Sidebar toggle for mobile */}
      {showSidebar && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`
            fixed top-4 left-4 z-50
            md:hidden
            p-2 rounded-lg
            bg-gray-900 text-white
            border border-yellow-500/30
          `}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {/* Conversation sidebar */}
      {showSidebar && (
        <div
          className={`
            fixed md:relative
            inset-y-0 left-0
            w-72 md:w-64
            transform transition-transform duration-300 ease-in-out
            z-40
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'}
          `}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDelete={onDeleteConversation}
            isLoading={conversationsLoading}
          />
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {showSidebar && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Message list */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />

        {/* Message input */}
        <MessageInput
          onSend={handleSend}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
