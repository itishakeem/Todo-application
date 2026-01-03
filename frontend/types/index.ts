/**
 * Task entity type matching Phase I schema
 * Preserves existing business logic from console app
 */
export interface Task {
  id: string; // UUID v4
  title: string; // 1-100 characters
  description: string; // 0-500 characters
  status: 'pending' | 'completed';
  created_at: string; // ISO 8601 timestamp
  completed_at: string | null; // ISO 8601 timestamp or null
  updated_at: string | null; // ISO 8601 timestamp or null
}

/**
 * User entity type for authentication
 */
export interface User {
  id: string; // UUID v4
  email: string; // 255 characters max
  created_at: string; // ISO 8601 timestamp
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Filter options for task list
 */
export type TaskFilter = 'all' | 'active' | 'completed';

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
}
