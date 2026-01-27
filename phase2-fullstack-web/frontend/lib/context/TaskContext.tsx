/**
 * TaskContext - Hybrid task state management for Phase 2
 * - Authenticated users: Uses FastAPI backend with database persistence
 * - Guest users: Uses in-memory React state (cleared on refresh)
 * Phase 2 Complete: Backend integration with guest mode support
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Task } from '@/types';
import { useAuth } from './AuthContext';
import { api } from '../api';

interface TaskContextValue {
  // Data
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;

  // Operations
  createTask: (title: string, description: string) => Promise<Task>;
  updateTask: (id: string, title: string, description: string) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<Task>;

  // Filtering
  getFilteredTasks: (filter: 'all' | 'active' | 'completed') => Task[];

  // Refresh tasks from API (used by ChatContext after chatbot operations)
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // In-memory state for guest users
  const [guestTasks, setGuestTasks] = useState<Task[]>([]);

  // API-backed state for authenticated users
  const [apiTasks, setApiTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Determine which task list to use
  const tasks = isAuthenticated ? apiTasks : guestTasks;

  // Helper: Generate UUID locally (for guest mode)
  const generateId = useCallback((): string => {
    return crypto.randomUUID();
  }, []);

  // Helper: Generate ISO timestamp
  const generateTimestamp = useCallback((): string => {
    return new Date().toISOString();
  }, []);

  // Helper: Simulate API delay for realistic UX (guest mode only)
  const simulateDelay = useCallback((): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 50));
  }, []);

  // Load tasks from API when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      loadTasksFromAPI();
    } else if (!isAuthenticated) {
      // Clear API tasks when logged out
      setApiTasks([]);
    }
  }, [isAuthenticated, user, authLoading]);

  // Load tasks from backend API
  const loadTasksFromAPI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ tasks: Task[] }>('/api/tasks');
      setApiTasks(response.tasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to load tasks'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // CREATE: Add new task
  const createTask = useCallback(
    async (title: string, description: string): Promise<Task> => {
      if (isAuthenticated) {
        // Authenticated: Use API
        setIsLoading(true);
        setError(null);
        try {
          const newTask = await api.post<Task>('/api/tasks', { title, description });
          setApiTasks((prev) => [newTask, ...prev]);
          return newTask;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to create task');
          setError(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: Use in-memory
        await simulateDelay();
        const newTask: Task = {
          id: generateId(),
          title,
          description,
          status: 'pending',
          created_at: generateTimestamp(),
          updated_at: null,
          completed_at: null,
        };
        setGuestTasks((prev) => [newTask, ...prev]);
        return newTask;
      }
    },
    [isAuthenticated, generateId, generateTimestamp, simulateDelay]
  );

  // UPDATE: Modify task title/description
  const updateTask = useCallback(
    async (id: string, title: string, description: string): Promise<Task> => {
      if (isAuthenticated) {
        // Authenticated: Use API
        setIsLoading(true);
        setError(null);
        try {
          const updatedTask = await api.put<Task>(`/api/tasks/${id}`, { title, description });
          setApiTasks((prev) =>
            prev.map((task) => (task.id === id ? updatedTask : task))
          );
          return updatedTask;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to update task');
          setError(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: Use in-memory
        await simulateDelay();
        let updatedTask: Task | null = null;
        setGuestTasks((prev) =>
          prev.map((task) => {
            if (task.id === id) {
              updatedTask = {
                ...task,
                title,
                description,
                updated_at: generateTimestamp(),
              };
              return updatedTask;
            }
            return task;
          })
        );
        if (!updatedTask) {
          throw new Error('Task not found');
        }
        return updatedTask;
      }
    },
    [isAuthenticated, generateTimestamp, simulateDelay]
  );

  // DELETE: Remove task
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (isAuthenticated) {
        // Authenticated: Use API
        setIsLoading(true);
        setError(null);
        try {
          await api.delete(`/api/tasks/${id}`);
          setApiTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to delete task');
          setError(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: Use in-memory
        await simulateDelay();
        setGuestTasks((prev) => {
          const filtered = prev.filter((task) => task.id !== id);
          if (filtered.length === prev.length) {
            throw new Error('Task not found');
          }
          return filtered;
        });
      }
    },
    [isAuthenticated, simulateDelay]
  );

  // TOGGLE: Switch between pending/completed
  const toggleComplete = useCallback(
    async (id: string): Promise<Task> => {
      if (isAuthenticated) {
        // Authenticated: Use API
        setIsLoading(true);
        setError(null);
        try {
          const toggledTask = await api.patch<Task>(`/api/tasks/${id}/complete`, {});
          setApiTasks((prev) =>
            prev.map((task) => (task.id === id ? toggledTask : task))
          );
          return toggledTask;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to toggle task');
          setError(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: Use in-memory
        await simulateDelay();
        let toggledTask: Task | null = null;
        setGuestTasks((prev) =>
          prev.map((task) => {
            if (task.id === id) {
              const newStatus = task.status === 'completed' ? 'pending' : 'completed';
              toggledTask = {
                ...task,
                status: newStatus,
                completed_at: newStatus === 'completed' ? generateTimestamp() : null,
                updated_at: generateTimestamp(),
              };
              return toggledTask;
            }
            return task;
          })
        );
        if (!toggledTask) {
          throw new Error('Task not found');
        }
        return toggledTask;
      }
    },
    [isAuthenticated, generateTimestamp, simulateDelay]
  );

  // FILTER: Get tasks by status
  const getFilteredTasks = useCallback(
    (filter: 'all' | 'active' | 'completed'): Task[] => {
      if (filter === 'all') {
        return tasks;
      }
      if (filter === 'active') {
        return tasks.filter((task) => task.status === 'pending');
      }
      if (filter === 'completed') {
        return tasks.filter((task) => task.status === 'completed');
      }
      return tasks;
    },
    [tasks]
  );

  // T-CHATBOT-FIX: Expose refreshTasks for ChatContext to call after chatbot operations
  const refreshTasks = useCallback(async () => {
    if (isAuthenticated) {
      await loadTasksFromAPI();
    }
  }, [isAuthenticated, loadTasksFromAPI]);

  const value: TaskContextValue = {
    tasks,
    isLoading: isLoading || authLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    getFilteredTasks,
    refreshTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// Custom hook to consume TaskContext
export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
