/**
 * TaskPreview Component - Real-time task display alongside chat
 * Shows recently added/modified tasks when chatbot makes changes
 * Phase 3: Visual feedback for task operations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/types';

interface TaskPreviewProps {
  tasks: Task[];
  maxTasks?: number;
  title?: string;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({
  tasks,
  maxTasks = 5,
  title = 'Recent Tasks',
}) => {
  // Track which tasks were recently added for highlight effect
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [prevTaskIds, setPrevTaskIds] = useState<Set<string>>(new Set());

  // Detect newly added tasks
  useEffect(() => {
    const currentIds = new Set(tasks.map(t => t.id));
    const newIds = new Set<string>();

    currentIds.forEach(id => {
      if (!prevTaskIds.has(id)) {
        newIds.add(id);
      }
    });

    if (newIds.size > 0) {
      setHighlightedIds(newIds);
      // Clear highlight after animation
      setTimeout(() => setHighlightedIds(new Set()), 2000);
    }

    setPrevTaskIds(currentIds);
  }, [tasks]);

  const displayTasks = tasks.slice(0, maxTasks);

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Done
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Active
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No tasks yet</p>
        <p className="text-xs text-gray-500 mt-1">
          Ask the AI to add some tasks!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-yellow-500/20 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {title}
        </h3>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
          {tasks.length} total
        </span>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {displayTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundColor: highlightedIds.has(task.id)
                  ? 'rgba(234, 179, 8, 0.1)'
                  : 'transparent'
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`px-4 py-3 border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors ${
                highlightedIds.has(task.id) ? 'ring-1 ring-yellow-500/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'
                  }`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                {/* New task indicator */}
                {highlightedIds.has(task.id) && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more indicator */}
      {tasks.length > maxTasks && (
        <div className="px-4 py-2 border-t border-gray-800/50 text-center">
          <span className="text-xs text-gray-500">
            +{tasks.length - maxTasks} more tasks
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskPreview;
