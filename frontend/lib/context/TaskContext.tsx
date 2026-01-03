/**
 * TaskContext - In-memory task state management for Phase 2
 * Replaces external API calls with React Context + local state
 * Phase 2 Rule: UI-focused only, no backend dependency
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Task } from '@/types';

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
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  // Initialize with empty array (or optionally add sample tasks for demo)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  // Helper: Generate UUID locally
  const generateId = useCallback((): string => {
    return crypto.randomUUID();
  }, []);

  // Helper: Generate ISO timestamp
  const generateTimestamp = useCallback((): string => {
    return new Date().toISOString();
  }, []);

  // Helper: Simulate API delay for realistic UX
  const simulateDelay = useCallback((): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 50));
  }, []);

  // CREATE: Add new task
  const createTask = useCallback(
    async (title: string, description: string): Promise<Task> => {
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

      setTasks((prev) => [newTask, ...prev]); // Add to beginning (newest first)
      return newTask;
    },
    [generateId, generateTimestamp, simulateDelay]
  );

  // UPDATE: Modify task title/description
  const updateTask = useCallback(
    async (id: string, title: string, description: string): Promise<Task> => {
      await simulateDelay();

      let updatedTask: Task | null = null;

      setTasks((prev) =>
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
    },
    [generateTimestamp, simulateDelay]
  );

  // DELETE: Remove task
  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      await simulateDelay();

      setTasks((prev) => {
        const filtered = prev.filter((task) => task.id !== id);
        if (filtered.length === prev.length) {
          throw new Error('Task not found');
        }
        return filtered;
      });
    },
    [simulateDelay]
  );

  // TOGGLE: Switch between pending/completed
  const toggleComplete = useCallback(
    async (id: string): Promise<Task> => {
      await simulateDelay();

      let toggledTask: Task | null = null;

      setTasks((prev) =>
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
    },
    [generateTimestamp, simulateDelay]
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

  const value: TaskContextValue = {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    getFilteredTasks,
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
