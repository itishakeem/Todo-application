/**
 * TaskCard Component
 * T043: Display individual task with expand/collapse, checkboxes, and action buttons
 * T095-T100: Task completion toggle with optimistic updates
 * T115-T116: Edit mode state management
 * Spec: FR-003 - Task card display requirements
 * Spec: User Story 3 - Task completion toggle
 * Spec: User Story 4 - Inline editing
 * Spec: User Story 7 - Responsive layout requirements
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Checkbox from '../ui/Checkbox';
import EditForm from './EditForm';
import { useToast } from '../ui/Toast';
import { useTaskContext } from '@/lib/context/TaskContext';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isEditing?: boolean;
  onEditStart?: (taskId: string) => void;
  onEditEnd?: () => void;
}

// T152: Optimize re-renders with React.memo
const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  isEditing = false,
  onEditStart,
  onEditEnd,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTogglingCompletion, setIsTogglingCompletion] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<
    'pending' | 'completed'
  >(task.status);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const { updateTask, toggleComplete } = useTaskContext();

  const isCompleted = optimisticStatus === 'completed';
  const showExpandButton = task.description && task.description.length > 200;

  // T115: Edit mode state management
  const handleEditStart = () => {
    if (onEditStart) {
      onEditStart(task.id);
    }
  };

  // T118: Save handler with TaskContext
  const handleSave = async (
    _taskId: string,
    title: string,
    description: string
  ) => {
    try {
      // Phase 2: Use TaskContext instead of API call
      await updateTask(task.id, title, description);

      // Call parent onEdit for revalidation
      if (onEdit) {
        onEdit(task.id);
      }

      // Exit edit mode
      if (onEditEnd) {
        onEditEnd();
      }

      showToast('success', 'Task updated successfully');
    } catch (error) {
      throw error; // Re-throw to be caught by EditForm
    }
  };

  // T119: Cancel handler
  const handleCancel = () => {
    if (onEditEnd) {
      onEditEnd();
    }
  };

  // T096-T100: Handle completion toggle with debouncing and optimistic updates
  const handleToggleCompletion = useCallback(async () => {
    // T096: Debounce - prevent rapid clicking
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // T097: Optimistic UI update
    const previousStatus = optimisticStatus;
    const newStatus = optimisticStatus === 'completed' ? 'pending' : 'completed';
    setOptimisticStatus(newStatus);

    debounceTimerRef.current = setTimeout(async () => {
      setIsTogglingCompletion(true);

      try {
        // Phase 2: Use TaskContext instead of API call
        await toggleComplete(task.id);

        // Call parent handler for revalidation
        if (onComplete) {
          onComplete(task.id);
        }
      } catch (error) {
        // T100: Error rollback - revert optimistic update
        setOptimisticStatus(previousStatus);
        showToast(
          'error',
          error instanceof Error
            ? error.message
            : 'Failed to update task status'
        );
      } finally {
        setIsTogglingCompletion(false);
      }
    }, 300); // T096: 300ms debounce
  }, [task.id, optimisticStatus, onComplete, showToast]);

  // Format timestamp to display format - American style
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    // Format: "Jan 3, 2026"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    // Format: "Jan 3, 2026 · 11:07 AM"
    return `${dateStr} · ${timeStr}`;
  };

  // Truncate description if needed
  const displayDescription =
    !isExpanded && task.description && task.description.length > 200
      ? task.description.substring(0, 200) + '...'
      : task.description || '-';

  // Get first 8 characters of task ID
  const shortId = task.id.substring(0, 8);

  // T114: Render edit form if in edit mode
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl shadow-2xl p-12 sm:p-16 lg:p-16"
        data-testid="task-card"
      >
        <EditForm task={task} onSave={handleSave} onCancel={handleCancel} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-black/60 backdrop-blur-md border border-yellow-500/30 rounded-2xl shadow-xl hover:shadow-2xl hover:border-yellow-500/50 hover:scale-[1.02] transition-all duration-300 p-12 sm:p-16 lg:p-16 group"
      data-testid="task-card"
    >
      <div className="flex items-start gap-8">
        {/* Checkbox - left side - T095 */}
        <Checkbox
          checked={isCompleted}
          onToggle={handleToggleCompletion}
          disabled={isTogglingCompletion}
          label={
            isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'
          }
          data-testid="task-checkbox"
        />

        {/* Content - center */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base lg:text-lg font-semibold mb-1 leading-snug ${
              isCompleted ? 'line-through text-gray-400' : 'text-white'
            }`}
            data-testid="task-title"
          >
            {task.title}
          </h3>

          <div
            className={`text-base text-gray-300 mb-2 leading-relaxed ${
              showExpandButton && !isExpanded ? 'cursor-pointer' : ''
            }`}
            onClick={
              showExpandButton ? () => setIsExpanded(!isExpanded) : undefined
            }
            data-testid="task-description"
          >
            {displayDescription}
          </div>

          {showExpandButton && (
            <button
              className="text-sm text-yellow-400 hover:text-yellow-300 font-medium mb-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}

          {/* Timestamps */}
          <div className="text-sm text-gray-400 space-y-1">
            <div>Created: {formatDate(task.created_at)}</div>
            {task.completed_at && (
              <div>Completed: {formatDateTime(task.completed_at)}</div>
            )}
            {task.updated_at && (
              <div>Updated: {formatDateTime(task.updated_at)}</div>
            )}
          </div>

          {/* Task ID - bottom left */}
          <div
            className="mt-2 text-xs text-gray-400"
            style={{ fontSize: '12px' }}
            data-testid="task-id"
          >
            {shortId}
          </div>
        </div>

        {/* Action buttons - right side */}
        <div className="flex flex-col sm:flex-row gap-8">
          <button
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg bg-black border border-yellow-500/30 hover:border-yellow-500 text-yellow-400 hover:text-yellow-300 transition-colors"
            onClick={handleEditStart}
            aria-label="Edit task"
            data-testid="edit-button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg bg-black border border-red-500/30 hover:border-red-500 text-red-500 hover:text-red-400 transition-colors"
            onClick={() => onDelete?.(task.id)}
            aria-label="Delete task"
            data-testid="delete-button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// T152: Export memoized component for performance
export const TaskCard = React.memo(TaskCardComponent);
export default TaskCard;
