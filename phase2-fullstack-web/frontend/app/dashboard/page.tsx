/**
 * Dashboard Page - Black & Yellow Theme
 * Enhanced with lightweight animations and premium feel
 * Phase 2: Database-backed for authenticated users, in-memory for guests
 * Phase 3: Integrated with AI Chatbot via shared Navbar
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TaskList from '@/components/task/TaskList';
import TaskListErrorBoundary from '@/components/task/TaskListErrorBoundary';
import TaskForm from '@/components/task/TaskForm';
import DeleteModal from '@/components/task/DeleteModal';
import FilterTabs from '@/components/task/FilterTabs';
import { useToast } from '@/components/ui/Toast';
import { useTaskContext } from '@/lib/context/TaskContext';
import { useAuth } from '@/lib/context/AuthContext';
import useTasks from '@/lib/hooks/useTasks';
import { Navbar, TaskChatBridge } from '@/components/layout';
import type { Task } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { tasks, isLoading, isError, error, mutate } = useTasks({ filter });
  const [isNewUser, setIsNewUser] = useState(false);

  // Modal state management
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const { deleteTask } = useTaskContext();

  // Task refresh callback for chat integration
  const handleTasksChanged = useCallback(() => {
    mutate();
  }, [mutate]);

  // Check if user is new (just signed up)
  React.useEffect(() => {
    const newUserFlag = localStorage.getItem('isNewUser');
    if (newUserFlag === 'true') {
      setIsNewUser(true);
      // Clear the flag after showing the welcome message
      setTimeout(() => {
        localStorage.removeItem('isNewUser');
        setIsNewUser(false);
      }, 5000); // Clear after 5 seconds
    }
  }, []);

  // Calculate task analytics
  const analytics = useMemo(() => {
    const allTasks = tasks;
    return {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      active: allTasks.filter(t => t.status === 'pending').length,
    };
  }, [tasks]);

  const handleLogout = () => {
    router.push('/');
  };

  const handleComplete = (taskId: string) => {
    mutate();
  };

  const handleEdit = (taskId: string) => {
    mutate();
  };

  const handleDelete = (taskId: string) => {
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
      await deleteTask(taskToDelete.id);
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
    mutate();
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col">
      {/* Task-Chat Bridge for real-time sync */}
      <TaskChatBridge onTasksChanged={handleTasksChanged} />

      {/* Shared Navbar with AI Chat button */}
      <Navbar onLogout={handleLogout} showDashboardLink={false} />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {isAuthenticated ? (
                isNewUser ? (
                  <>Welcome, <span className="text-yellow-400">{user?.name || user?.email?.split('@')[0] || 'User'}</span>!</>
                ) : (
                  <>Welcome back, <span className="text-yellow-400">{user?.name || user?.email?.split('@')[0] || 'User'}</span>!</>
                )
              ) : (
                <>Welcome, <span className="text-yellow-400">Guest</span>!</>
              )}
            </h1>
            <p className="text-gray-400 text-base">
              {isAuthenticated ? (
                <>Your tasks are <span className="text-yellow-400 font-medium">securely saved</span> in the database.</>
              ) : (
                <>You're in guest mode. <span className="text-yellow-400 font-medium">Login to save</span> your tasks!</>
              )}
            </p>
          </motion.div>

          {/* Task Analytics - Black & Yellow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {/* Total Tasks */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-black border border-yellow-500/30 rounded-xl p-5 hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Tasks</p>
                  <motion.p
                    key={analytics.total}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-3xl font-bold"
                  >
                    {analytics.total}
                  </motion.p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Active Tasks */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-black border border-yellow-500/30 rounded-xl p-5 hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Active</p>
                  <motion.p
                    key={analytics.active}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-3xl font-bold"
                  >
                    {analytics.active}
                  </motion.p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30"
                >
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Completed Tasks */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-black border border-yellow-500/30 rounded-xl p-5 hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Completed</p>
                  <motion.p
                    key={analytics.completed}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-3xl font-bold"
                  >
                    {analytics.completed}
                  </motion.p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Task Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <TaskForm onTaskCreated={handleTaskCreated} />
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <FilterTabs
              currentFilter={filter}
              onFilterChange={setFilter}
            />
          </motion.div>

          {/* Task List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
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
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 py-6 px-4 sm:px-6 lg:px-8 bg-black/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2026 <span className="text-yellow-400">TaskFlow</span>. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        taskTitle={taskToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
