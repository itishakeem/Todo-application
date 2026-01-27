/**
 * Landing Page - Professional Home Page for Todo Application
 * Polished, premium design with calm animations
 * Focus on clarity, simplicity, and professionalism
 * Phase 3: Integrated with AI Chatbot via shared Navbar
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { Navbar } from '@/components/layout';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleStartFree = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };
  // Calm, professional animation variants
  const fadeInSubtle = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div className="min-h-screen bg-black" style={{ background: '#0B0B0B' }}>
      {/* Shared Navbar with AI Chat button */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-center"
          >
            {/* Main Heading */}
            <motion.h1
              variants={fadeInSubtle}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight"
            >
              Organize Your Life,
              <br />
              <span className="text-yellow-400">
                One Task at a Time
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInSubtle}
              className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              A beautiful, intuitive todo application designed to help you stay productive
              and focused on what matters most.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInSubtle}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <Button
                variant="primary"
                onClick={handleStartFree}
                disabled={isLoading}
                className="text-base px-8 py-3 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 transition-all duration-300"
              >
                Start Free
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  className="text-base px-8 py-3 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-300"
                >
                  View Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Powerful features designed with simplicity in mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-3xl mb-3 opacity-90">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Simple & Intuitive
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Clean interface that lets you focus on your tasks without distractions
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-3xl mb-3 opacity-90">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Built with Next.js for instant page loads and smooth interactions
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-3xl mb-3 opacity-90">📱</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Fully Responsive
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Works seamlessly across desktop, tablet, and mobile devices
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-3xl mb-3 opacity-90">✨</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Beautiful Design
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Modern glassmorphism UI with smooth animations and transitions
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="text-3xl mb-3 opacity-90">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Instant feedback and synchronization for all your task operations
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-black border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">NEW</div>
              <div className="text-3xl mb-3 opacity-90">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Assistant
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Intelligent chatbot to help manage your tasks via natural language
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics/Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-black border border-yellow-500/30 rounded-xl p-10 sm:p-12 hover:border-yellow-500/40 transition-colors duration-300"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Trusted by Thousands
              </h2>
              <p className="text-base text-gray-400">
                Join productive people who organize their lives with TaskFlow
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="text-center p-5 rounded-lg bg-black border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300"
              >
                <div className="text-4xl font-bold text-yellow-400 mb-1">12,000+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-center p-5 rounded-lg bg-black border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300"
              >
                <div className="text-4xl font-bold text-yellow-400 mb-1">1.2M+</div>
                <div className="text-sm text-gray-400">Tasks Completed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-center p-5 rounded-lg bg-black border border-yellow-500/20 hover:border-yellow-500/40 transition-colors duration-300"
              >
                <div className="text-4xl font-bold text-yellow-400 mb-1">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Start managing your tasks effectively today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              variant="primary"
              onClick={handleStartFree}
              disabled={isLoading}
              className="text-lg px-10 py-3 hover:shadow-[0_0_35px_rgba(234,179,8,0.35)] hover:scale-105 transition-all duration-300"
            >
              Start Free
            </Button>
            <Link href="/dashboard">
              <Button
                variant="secondary"
                className="text-lg px-10 py-3 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-300"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-yellow-500/20 py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-yellow-400">TaskFlow</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Simple, beautiful task management for everyone.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-base font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#stats" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    About
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-base font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-base font-semibold text-white mb-3">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-yellow-500/20 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 TaskFlow. All rights reserved. Built with Next.js and Claude Code.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
