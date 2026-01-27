/**
 * Task Validation Hook
 * T064: Client-side validation for task form
 * Spec: User Story 2 - Form validation
 */

import { useState, useCallback } from 'react';

export interface TaskFormData {
  title: string;
  description: string;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
}

export function useTaskValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateTitle = useCallback((title: string): string | undefined => {
    if (!title || title.trim().length === 0) {
      return 'Title is required';
    }
    if (title.length > 100) {
      return 'Title must be 100 characters or less';
    }
    return undefined;
  }, []);

  const validateDescription = useCallback(
    (description: string): string | undefined => {
      if (description.length > 500) {
        return 'Description must be 500 characters or less';
      }
      return undefined;
    },
    []
  );

  const validateForm = useCallback(
    (formData: TaskFormData): boolean => {
      const newErrors: ValidationErrors = {};

      const titleError = validateTitle(formData.title);
      const descriptionError = validateDescription(formData.description);

      if (titleError) {
        newErrors.title = titleError;
      }
      if (descriptionError) {
        newErrors.description = descriptionError;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [validateTitle, validateDescription]
  );

  const validateField = useCallback(
    (field: keyof TaskFormData, value: string) => {
      let error: string | undefined;

      if (field === 'title') {
        error = validateTitle(value);
      } else if (field === 'description') {
        error = validateDescription(value);
      }

      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));

      return error === undefined;
    },
    [validateTitle, validateDescription]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    validateField,
    clearErrors,
  };
}
