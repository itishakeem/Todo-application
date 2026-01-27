/**
 * T185: Login Error Message Component
 * Displays inline error messages for authentication failures
 *
 * Features:
 * - Red (#EF4444) 14px text, centered
 * - 8px top margin
 * - Fade-in animation (150ms ease)
 * - Max-width matches form width
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginErrorMessageProps {
  /** Error message to display */
  message: string | null;
  /** Optional CSS class name */
  className?: string;
}

export function LoginErrorMessage({ message, className = '' }: LoginErrorMessageProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`mt-2 text-center ${className}`}
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm text-red-500" style={{ color: '#EF4444', fontSize: '14px' }}>
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * T190: Field-level validation error component
 * Displays inline validation errors below input fields
 */
interface FieldErrorProps {
  /** Error message to display */
  message: string | null;
}

export function FieldError({ message }: FieldErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="mt-1 text-sm"
          style={{ color: '#EF4444', fontSize: '14px', marginTop: '4px' }}
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default LoginErrorMessage;
