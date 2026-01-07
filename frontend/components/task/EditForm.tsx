/**
 * EditForm Component - T114
 * Inline edit form for updating tasks
 * Spec: User Story 4 - Update task title and description
 */

'use client';

import React, { useState, useEffect, KeyboardEvent } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useTaskValidation } from '@/lib/hooks/useTaskValidation';
import { useToast } from '../ui/Toast';
import type { Task } from '@/types';

interface EditFormProps {
  task: Task;
  onSave: (taskId: string, title: string, description: string) => Promise<void>;
  onCancel: () => void;
}

export default function EditForm({ task, onSave, onCancel }: EditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [isSaving, setIsSaving] = useState(false);

  const { errors, validateForm, validateField, clearErrors } =
    useTaskValidation();
  const { showToast } = useToast();

  // T117: Escape key handler to cancel edit mode
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  // Inline validation on blur
  const handleTitleBlur = () => {
    validateField('title', title);
  };

  const handleDescriptionBlur = () => {
    validateField('description', description);
  };

  // T118: Save handler with validation
  const handleSave = async () => {
    // Validate form
    const isValid = validateForm({ title, description });
    if (!isValid) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(task.id, title.trim(), description.trim());
      clearErrors();
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Failed to update task'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // T119: Cancel handler with state reset
  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description);
    clearErrors();
    onCancel();
  };

  return (
    <div
      className="bg-black/40 rounded-lg p-12 sm:p-16"
      data-testid="edit-form"
    >
      <div className="space-y-12">
        {/* T114: Title input */}
        <Input
          label="Title"
          name="edit-title"
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          error={errors.title}
          disabled={isSaving}
          required
          maxLength={100}
        />

        {/* T114: Description textarea */}
        <Textarea
          label="Description"
          name="edit-description"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          error={errors.description}
          disabled={isSaving}
          maxLength={500}
        />

        {/* T120: Action buttons */}
        <div className="flex gap-8 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
