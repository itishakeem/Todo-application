/**
 * TaskChatBridge Component
 * Bridges TaskContext and ChatContext for real-time task updates
 * When AI chatbot modifies tasks, this triggers a task list refresh
 */

'use client';

import { useEffect } from 'react';
import { useChatContext } from '@/lib/context/ChatContext';

interface TaskChatBridgeProps {
  onTasksChanged: () => void;
}

export function TaskChatBridge({ onTasksChanged }: TaskChatBridgeProps) {
  const { setOnTasksChanged } = useChatContext();

  useEffect(() => {
    setOnTasksChanged(() => onTasksChanged);
    return () => setOnTasksChanged(null);
  }, [onTasksChanged, setOnTasksChanged]);

  return null;
}

export default TaskChatBridge;
