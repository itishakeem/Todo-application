/**
 * ChatDrawer Component - Half-screen AI Chatbot Drawer
 * Split layout: Chat on left, Real-time Task Updates on right
 * Phase 3: Accessible from navbar on all pages
 */

'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '@/lib/context/ChatContext';
import { useTaskContext } from '@/lib/context/TaskContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';
import TaskPreview from './TaskPreview';

export const ChatDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
    conversations,
    conversationsLoading,
    activeConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    setOnTasksChanged,
  } = useChatContext();

  const { tasks, refreshTasks } = useTaskContext();
  const [showConversations, setShowConversations] = useState(false);

  // T-CHATBOT-FIX: Register task refresh callback so tasks update when chatbot makes changes
  useEffect(() => {
    setOnTasksChanged(() => refreshTasks);
    return () => setOnTasksChanged(null);
  }, [setOnTasksChanged, refreshTasks]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleSend = useCallback((message: string) => {
    sendMessage(message);
  }, [sendMessage]);

  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleSelectConversation = useCallback((id: number) => {
    selectConversation(id);
    setShowConversations(false);
  }, [selectConversation]);

  const handleNewConversation = useCallback(() => {
    createNewConversation();
    setShowConversations(false);
  }, [createNewConversation]);

  const handleDeleteConversation = useCallback(async (id: number) => {
    await deleteConversation(id);
  }, [deleteConversation]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer container - wider to accommodate split view */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[75vw] lg:w-[70vw] xl:w-[60vw] bg-black border-l border-yellow-500/30 shadow-2xl shadow-yellow-500/10 z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="AI Chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-500/20 bg-black/90 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <h2 className="text-lg font-semibold text-yellow-400">AI Task Assistant</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile: Toggle conversations */}
                <button
                  onClick={() => setShowConversations(!showConversations)}
                  className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  aria-label="Toggle conversations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main content - Split into Chat (left) and Tasks (right) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Mobile: Conversation drawer overlay */}
              <AnimatePresence>
                {showConversations && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="md:hidden absolute inset-y-0 left-0 w-72 z-10 bg-gray-900 border-r border-yellow-500/20"
                  >
                    <ConversationList
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                      onSelect={handleSelectConversation}
                      onNewConversation={handleNewConversation}
                      onDelete={handleDeleteConversation}
                      isLoading={conversationsLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LEFT PANEL: Chat Area */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-yellow-500/20">
                {/* Desktop: Conversation sidebar */}
                <div className="hidden md:flex h-full">
                  {/* Conversation list */}
                  <div className="w-48 lg:w-56 border-r border-yellow-500/20 flex-shrink-0">
                    <ConversationList
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                      onSelect={handleSelectConversation}
                      onNewConversation={handleNewConversation}
                      onDelete={handleDeleteConversation}
                      isLoading={conversationsLoading}
                    />
                  </div>

                  {/* Chat messages and input */}
                  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                      <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
                      />
                    </div>
                    <div className="border-t border-yellow-500/20 flex-shrink-0">
                      <MessageInput
                        onSend={handleSend}
                        disabled={isLoading}
                        placeholder="Ask me to manage your tasks..."
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile: Full width chat */}
                <div className="md:hidden flex flex-col h-full overflow-hidden">
                  {/* Mobile new chat button */}
                  <div className="px-3 py-2 border-b border-yellow-500/20 flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleNewConversation}
                      className="flex-1 px-3 py-2 text-sm bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      + New Chat
                    </button>
                    <button
                      onClick={() => setShowConversations(true)}
                      className="px-3 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      History ({conversations.length})
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <MessageList
                      messages={messages}
                      isLoading={isLoading}
                      error={error}
                      onRetry={handleRetry}
                    />
                  </div>
                  <div className="border-t border-yellow-500/20 flex-shrink-0">
                    <MessageInput
                      onSend={handleSend}
                      disabled={isLoading}
                      placeholder="Ask me to manage your tasks..."
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL: Real-time Task Updates */}
              <div className="hidden md:flex w-64 lg:w-72 xl:w-80 flex-col bg-gray-900/30">
                <TaskPreview
                  tasks={tasks}
                  maxTasks={10}
                  title="Your Tasks"
                />
              </div>
            </div>

            {/* Footer with keyboard hint */}
            <div className="px-4 py-2 border-t border-yellow-500/20 bg-black/50 flex-shrink-0">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono">Esc</kbd> to close • Tasks update in real-time
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer;
