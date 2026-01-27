/**
 * TaskForm Component
 * T063-T069: Task creation form with validation
 * Spec: User Story 2 - Create new todo items
 */

'use client';

import React, { useState, FormEvent, KeyboardEvent } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useTaskValidation } from '@/lib/hooks/useTaskValidation';
import { useToast } from '../ui/Toast';
import { useTaskContext } from '@/lib/context/TaskContext';
import type { Task } from '@/types';

interface TaskFormProps {
  onTaskCreated?: (task: Task) => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errors, validateForm, validateField, clearErrors } =
    useTaskValidation();
  const { showToast } = useToast();
  const { createTask } = useTaskContext();

  // T065: Clear form within 100ms after successful API 200 response
  const clearForm = () => {
    setTitle('');
    setDescription('');
    clearErrors();
  };

  // T066: Inline validation on blur
  const handleTitleBlur = () => {
    validateField('title', title);
  };

  const handleDescriptionBlur = () => {
    validateField('description', description);
  };

  // T067: Enter key in title field submits form
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // T063: Form submission with validation and API call
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    const isValid = validateForm({ title, description });
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Phase 2: Use TaskContext instead of API call
      const createdTask = await createTask(title.trim(), description.trim());

      // T065: Clear form after successful submission
      clearForm();

      // Show success toast (3s duration as per Toast component)
      showToast('success', 'Task created successfully');

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }
    } catch (error) {
      // T068: Show error toast (5s duration as per Toast component)
      const message =
        error instanceof Error ? error.message : 'Failed to create task';
      showToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-yellow-500/30 p-4 sm:p-6 hover:shadow-3xl hover:border-yellow-500/50 transition-all duration-300"
      data-testid="task-form"
    >
      <h2 className="text-xl font-semibold text-white drop-shadow-md mb-4">
        ➕ Create New Task
      </h2>

      <div className="space-y-4">
        {/* T063: Title input (required) */}
        <Input
          label="Title"
          name="title"
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          error={errors.title}
          disabled={isSubmitting}
          required
          maxLength={100}
        />

        {/* T063: Description textarea (optional) */}
        <Textarea
          label="Description (optional)"
          name="description"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          error={errors.description}
          disabled={isSubmitting}
          maxLength={500}
        />

        {/* T069: Submit button with loading state */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Add Task
          </Button>
        </div>
      </div>
    </form>
  );
}
