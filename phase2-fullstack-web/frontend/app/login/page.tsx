/**
 * Login Page
 * Professional authentication page using Better Auth
 * Clean, centered layout with smooth animations
 * Phase 3: Integrated with shared Navbar
 *
 * T186-T191: Authentication Error Handling (US8)
 * - Inline error messages instead of browser alerts
 * - Field-level validation errors
 * - Error clears when user starts typing
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/layout';
import { LoginErrorMessage, FieldError } from './components/LoginErrorMessage';

// T187: Email validation regex (basic format check)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// T186: Error state types
interface ValidationErrors {
  email: string | null;
  password: string | null;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // T186: Error state management
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    email: null,
    password: null,
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };

  // T187: Client-side form validation
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {
      email: null,
      password: null,
    };
    let isValid = true;

    // Email required check
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!EMAIL_REGEX.test(formData.email)) {
      // Email format validation
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password required check
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [formData.email, formData.password]);

  // T188: Updated handleSubmit with inline error display
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous API error
    setApiError(null);

    // T187: Validate form before API call
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: unknown) {
      // T188: Display inline error instead of alert
      if (error instanceof Error) {
        // Check if it's a network error
        if (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('Network') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('Unable to connect')
        ) {
          setApiError('Unable to connect. Please check your internet connection and try again.');
        } else if (
          error.message.includes('401') ||
          error.message.includes('Invalid') ||
          error.message.includes('Unauthorized') ||
          error.message.toLowerCase().includes('password') ||
          error.message.toLowerCase().includes('credentials')
        ) {
          // 401 Unauthorized - Invalid credentials
          setApiError('Invalid email or password');
        } else {
          // Generic error - show invalid credentials for security
          setApiError('Invalid email or password');
        }
      } else {
        setApiError('Invalid email or password');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // T189: Clear error messages when user starts typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // T189: Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }

    // Clear field-level validation error when user starts typing in that field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });

    // T187: Validate email format on blur
    if (field === 'email' && formData.email.trim() && !EMAIL_REGEX.test(formData.email)) {
      setValidationErrors({
        ...validationErrors,
        email: 'Please enter a valid email address',
      });
    }
  };

  // T191: Helper function for input border styling with error state
  const getInputClassName = (field: 'email' | 'password') => {
    const hasError = validationErrors[field];
    const focused = isFocused[field];

    if (hasError) {
      // Error state - red border
      return 'w-full px-4 py-3 bg-black border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300';
    }

    if (focused) {
      // Focused state - yellow glow
      return 'w-full px-4 py-3 bg-black border border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.2)] rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300';
    }

    // Default state
    return 'w-full px-4 py-3 bg-black border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300';
  };

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{ background: '#0B0B0B' }}>
      {/* Shared Navbar */}
      <Navbar />

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Welcome Back
            </h1>
            <p className="text-base text-gray-400">
              Sign in to continue to TaskFlow
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            variants={fadeInUp}
            className="bg-black border border-yellow-500/30 rounded-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  className={getInputClassName('email')}
                  placeholder="your.email@example.com"
                />
                {/* T190: Field-level validation error */}
                <div id="email-error">
                  <FieldError message={validationErrors.email} />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  className={getInputClassName('password')}
                  placeholder="••••••••"
                />
                {/* T190: Field-level validation error */}
                <div id="password-error">
                  <FieldError message={validationErrors.password} />
                </div>
              </div>

              {/* T186: API Error Message - displayed below form inputs */}
              <LoginErrorMessage message={apiError} />

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(234,179,8,0.35)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2026 TaskFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
