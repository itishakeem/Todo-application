/**
 * Component Demo Page
 * For development and testing of base UI components
 * NOT part of production app - for verification only
 */
'use client';

import {
  Button,
  Input,
  Textarea,
  LoadingSpinner,
  useToast,
} from '@/components/ui';
import { useState } from 'react';

export default function ComponentsDemo() {
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleTestSuccess = () => {
    showToast('success', 'Task added successfully!');
  };

  const handleTestError = () => {
    showToast('error', 'Failed to delete task. Please try again.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.length > 100) {
      setInputError('Title must be 100 characters or less');
    } else if (value.length === 0) {
      setInputError('Title is required');
    } else {
      setInputError('');
    }
  };

  return (
    <main className="min-h-screen p-24 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-24">Base UI Components Demo</h1>

      {/* Buttons */}
      <section className="mb-24">
        <h2 className="text-xl font-semibold mb-12">Buttons</h2>
        <div className="flex flex-wrap gap-12">
          <Button variant="primary">Add Task</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="primary" isLoading>
            Saving...
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* Input */}
      <section className="mb-24">
        <h2 className="text-xl font-semibold mb-12">Input</h2>
        <div className="space-y-12">
          <Input
            label="Task Title"
            placeholder="Enter task title (max 100 characters)"
            value={inputValue}
            onChange={handleInputChange}
            error={inputError}
          />
          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            helperText="We'll never share your email"
          />
          <Input label="Disabled Input" disabled value="Cannot edit" />
        </div>
      </section>

      {/* Textarea */}
      <section className="mb-24">
        <h2 className="text-xl font-semibold mb-12">Textarea</h2>
        <div className="space-y-12">
          <Textarea
            label="Task Description"
            placeholder="Enter task description (max 500 characters)"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            helperText={`${textareaValue.length}/500 characters`}
          />
          <Textarea
            label="Error State"
            error="Description is too long"
            value="This is an example of an error state"
          />
        </div>
      </section>

      {/* Loading Spinner */}
      <section className="mb-24">
        <h2 className="text-xl font-semibold mb-12">Loading Spinner</h2>
        <div className="space-y-16">
          <div>
            <p className="text-sm mb-8">Inline Spinner:</p>
            <div className="flex items-center gap-8">
              <LoadingSpinner size="inline" />
              <span>Loading...</span>
            </div>
          </div>
          <div>
            <p className="text-sm mb-8">Centered Spinner:</p>
            <div className="border border-border rounded p-24">
              <LoadingSpinner size="centered" text="Loading tasks..." />
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notifications */}
      <section className="mb-24">
        <h2 className="text-xl font-semibold mb-12">Toast Notifications</h2>
        <div className="flex flex-wrap gap-12">
          <Button variant="primary" onClick={handleTestSuccess}>
            Show Success Toast
          </Button>
          <Button variant="danger" onClick={handleTestError}>
            Show Error Toast
          </Button>
        </div>
        <p className="text-sm text-gray-text mt-8">
          Toasts appear in the top-right corner and auto-dismiss after 3s
          (success) or 5s (error)
        </p>
      </section>
    </main>
  );
}
