'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { motion } from 'framer-motion';

export default function Footer() {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <footer className="w-full border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Copyright / Brand */}
        <div className="text-xs text-gray-500">
          <span className="hidden sm:inline">© 2024 TaskFlow. </span>
          <span>Built with ⚡</span>
        </div>

        {/* Authenticated user section with logout */}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {user?.name || user?.email?.split('@')[0]}
            </span>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-300
                hover:bg-gray-700 hover:text-white transition-all duration-200
                border border-gray-700 hover:border-gray-600"
            >
              Logout
            </motion.button>
          </div>
        )}
      </div>
    </footer>
  );
}