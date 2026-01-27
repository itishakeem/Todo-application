/**
 * useTasks Hook - React Context-based task data fetching
 * Phase 2: In-memory state management (no backend dependency)
 * Spec: FR-003 - Task list display with filtering
 */

import { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import type { Task } from '@/types';

interface UseTasksOptions {
  filter?: 'all' | 'active' | 'completed';
}

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Custom hook to fetch tasks from TaskContext
 * Provides filtering and maintains same interface as SWR version
 *
 * @param options - Filter options for tasks
 * @returns Tasks data, loading state, error state, and mutate function
 */
export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { filter = 'all' } = options;
  const { tasks, isLoading, error, getFilteredTasks } = useTaskContext();

  // Apply filter using context method
  const filteredTasks = useMemo(() => {
    return getFilteredTasks(filter);
  }, [getFilteredTasks, filter]);

  // Maintain same interface as SWR version for compatibility
  return {
    tasks: filteredTasks,
    isLoading,
    isError: !!error,
    error: error || undefined,
    mutate: () => {}, // No-op for compatibility (context updates automatically)
  };
}

export default useTasks;
