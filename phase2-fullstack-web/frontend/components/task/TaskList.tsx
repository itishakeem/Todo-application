/**
 * TaskList Component
 * T044: Display list of tasks with empty state handling
 * T116: Only one task in edit mode at a time
 * Spec: FR-003 - Task list display
 * Spec: FR-020 - Empty state handling
 */

import React, { useState } from 'react';
import TaskCard from './TaskCard';
import type { Task } from '@/types';
import EmptyState from './EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  error?: Error | null;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onRetry?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  error = null,
  onComplete,
  onEdit,
  onDelete,
  onRetry,
}) => {
  // T116: Track which task is currently being edited (only one at a time)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleEditStart = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleEditEnd = () => {
    setEditingTaskId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="centered" text="Loading tasks..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[300px] py-12"
        data-testid="error-state"
      >
        <svg
          className="w-16 h-16 mb-4 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg text-gray-700 text-center font-medium mb-4">
          Unable to load tasks. Please check your connection.
        </p>
        {onRetry && (
          <button
            className="min-w-[44px] min-h-[44px] px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={onRetry}
            data-testid="retry-button"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Task list
  return (
    <div className="space-y-4" data-testid="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          isEditing={editingTaskId === task.id}
          onEditStart={handleEditStart}
          onEditEnd={handleEditEnd}
        />
      ))}
    </div>
  );
};

export default TaskList;
