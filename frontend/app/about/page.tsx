/**
 * About Us Page
 * Professional, product-focused explanation of TaskFlow's mission and values
 * Polished with premium micro-animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  // Refined animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const sectionFadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div className="min-h-screen bg-black" style={{ background: '#0B0B0B' }}>
      {/* Simple Top Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 border-b border-yellow-500/20 bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Product Name */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl transition-transform group-hover:scale-110 duration-200">⚡</span>
            <span className="text-lg font-bold text-yellow-400">TaskFlow</span>
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="relative text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200 group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="relative text-sm text-white transition-colors duration-200 group"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400"></span>
            </Link>
            <Link
              href="/contact"
              className="relative text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200 group"
            >
              Contact Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Page Title - Soft fade-in with upward motion */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-bold text-white mb-6 text-center"
          >
            About Us
          </motion.h1>

          {/* Mission Statement */}
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed"
          >
            We believe productivity should be simple, not overwhelming.
            TaskFlow helps you organize your work and life with clarity and focus.
          </motion.p>

          {/* Content Sections - Staggered fade-in on scroll */}
          <div className="space-y-12">
            {/* Problem We Solve */}
            <motion.section
              {...sectionFadeIn}
              className="bg-black border border-yellow-500/30 rounded-xl p-8 sm:p-10 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                The Problem We Solve
              </h2>
              <p className="text-gray-400 leading-relaxed text-base mb-4">
                Most task management tools are bloated with features you don't need. They try to do everything
                and end up making simple tasks complicated.
              </p>
              <p className="text-gray-400 leading-relaxed text-base">
                We saw people struggling with overcomplicated systems when all they needed was a clear,
                straightforward way to track what matters. That's why we built TaskFlow.
              </p>
            </motion.section>

            {/* How We Help */}
            <motion.section
              {...sectionFadeIn}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black border border-yellow-500/30 rounded-xl p-8 sm:p-10 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                How TaskFlow Helps You
              </h2>
              <p className="text-gray-400 leading-relaxed text-base mb-4">
                TaskFlow strips away the complexity and gives you exactly what you need: a beautiful,
                fast interface to capture tasks, organize priorities, and get things done.
              </p>
              <p className="text-gray-400 leading-relaxed text-base mb-4">
                No learning curve. No feature overload. Just open it and start working.
              </p>
              <p className="text-gray-400 leading-relaxed text-base">
                Whether you're managing personal projects, work deadlines, or daily routines,
                TaskFlow adapts to your workflow without getting in your way.
              </p>
            </motion.section>

            {/* Vision & Values */}
            <motion.section
              {...sectionFadeIn}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black border border-yellow-500/30 rounded-xl p-8 sm:p-10 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                Our Vision & Values
              </h2>
              <div className="space-y-4">
                <div className="group">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-200">
                    Focus
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-base">
                    We design for clarity. Every feature exists to help you focus on what matters,
                    not to impress you with options.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-200">
                    Simplicity
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-base">
                    Complexity is easy. True simplicity requires discipline. We say no to features
                    that don't serve your core workflow.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-200">
                    Productivity
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-base">
                    Your time is valuable. TaskFlow is built to be fast, reliable, and respectful
                    of your attention. No distractions, no friction.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 text-center"
          >
            <p className="text-gray-400 mb-6 text-lg">
              Ready to simplify your workflow?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/login"
                className="inline-block bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(234,179,8,0.35)] hover:scale-105 active:scale-100 transition-all duration-300"
              >
                Start Free
              </Link>
              <Link
                href="/dashboard"
                className="inline-block bg-black border-2 border-yellow-500/50 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500/10 hover:border-yellow-500 hover:scale-105 active:scale-100 transition-all duration-300"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 py-8 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2026 TaskFlow. All rights reserved. Built with Next.js and Claude Code.
          </p>
        </div>
      </footer>
    </div>
  );
}
