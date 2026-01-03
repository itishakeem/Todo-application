/**
 * Dashboard Page - Main application view
 * T045: Create Dashboard page layout
 * T132: Modal state management
 * Spec: User Story 1 - View Todo Dashboard
 * Spec: User Story 5 - Task deletion with modal
 */

'use client';

import React, { useState } from 'react';
import TaskList from '../components/task/TaskList';
import TaskListErrorBoundary from '../components/task/TaskListErrorBoundary';
import TaskForm from '../components/task/TaskForm';
import DeleteModal from '../components/task/DeleteModal';
import FilterTabs from '../components/task/FilterTabs';
import { useToast } from '../components/ui/Toast';
import { useTaskContext } from '../lib/context/TaskContext';
import useTasks from '../lib/hooks/useTasks';
import type { Task } from '../types';

export default function Home() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { tasks, isLoading, isError, error, mutate } = useTasks({ filter });

  // T132: Modal state management
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const { deleteTask } = useTaskContext();

  const handleComplete = (taskId: string) => {
    // Trigger SWR revalidation after completion
    mutate();
  };

  const handleEdit = (taskId: string) => {
    // Trigger SWR revalidation after edit
    mutate();
  };

  const handleDelete = (taskId: string) => {
    // Find the task to show in modal
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);

    try {
      // Phase 2: Use TaskContext instead of API call
      await deleteTask(taskToDelete.id);

      // Success - revalidate and show toast
      mutate();
      showToast('success', 'Task deleted successfully');
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Failed to delete task'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleRetry = () => {
    mutate();
  };

  const handleTaskCreated = (_newTask: Task) => {
    // Optimistic update - mutate triggers SWR to revalidation
    mutate();
  };

  return (
    <main className="min-h-screen">
      {/* Header - Glassmorphism */}
      <header className="bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-2xl sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            ✨ Todo Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Task Form - User Story 2 (EXEC-UI-04) */}
        <div className="mb-6">
          <TaskForm onTaskCreated={handleTaskCreated} />
        </div>

        {/* Filter Tabs - T145-T150 */}
        <div className="mb-6">
          <FilterTabs
            currentFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Task List */}
        <TaskListErrorBoundary>
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            error={isError ? error : null}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRetry={handleRetry}
          />
        </TaskListErrorBoundary>
      </div>

      {/* Delete Modal - T131-T137 */}
      <DeleteModal
        isOpen={deleteModalOpen}
        taskTitle={taskToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </main>
  );
}
