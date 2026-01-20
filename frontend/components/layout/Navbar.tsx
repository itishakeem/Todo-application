/**
 * Navbar Component - Shared navigation bar for all pages
 * Includes AI Chat button that opens the half-screen drawer
 * Phase 3: Consistent navigation across the application
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { useChatContext } from '@/lib/context/ChatContext';

interface NavbarProps {
  onLogout?: () => void;
  showDashboardLink?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLogout,
  showDashboardLink = true,
}) => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { openDrawer } = useChatContext();

  const handleLogout = async () => {
    await logout();
    onLogout?.();
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-yellow-500/20 bg-black/80 backdrop-blur-sm sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - hide title on mobile to save space */}
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.span
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="text-xl"
          >
            ⚡
          </motion.span>
          <span className="hidden sm:inline text-lg font-bold text-yellow-400">TaskFlow</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          {/* Main nav links */}
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-2 sm:px-3 py-2 text-sm transition-colors duration-200 group ${
                isActive(href)
                  ? 'text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-0.5 left-2 right-2 h-0.5 bg-yellow-400 transition-all duration-300 ${
                  isActive(href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </Link>
          ))}

          {/* Dashboard link (if authenticated and enabled) */}
          {isAuthenticated && showDashboardLink && (
            <Link
              href="/dashboard"
              className={`relative px-2 sm:px-3 py-2 text-sm transition-colors duration-200 group ${
                isActive('/dashboard')
                  ? 'text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              Dashboard
              <span
                className={`absolute -bottom-0.5 left-2 right-2 h-0.5 bg-yellow-400 transition-all duration-300 ${
                  isActive('/dashboard') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </Link>
          )}

          {/* AI Chat Button - Always visible when authenticated */}
          {isAuthenticated && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openDrawer}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-400 rounded-lg transition-colors duration-200 shadow-lg shadow-yellow-500/20"
              aria-label="Open AI Chat"
            >
              {/* Robot icon for mobile - more recognizable */}
              <span className="sm:hidden text-base">🤖</span>
              {/* Chat icon for desktop */}
              <svg
                className="hidden sm:block w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="hidden sm:inline">AI Chat</span>
            </motion.button>
          )}

          {/* Auth buttons - Logout moved to Footer */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              {/* User indicator - logout is in footer */}
              <span className="hidden md:inline text-xs text-gray-500 px-2 py-1 bg-gray-800/50 rounded-md border border-gray-700/50">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/login"
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  isActive('/login')
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
