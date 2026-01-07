/**
 * Contact Us Page
 * Simple, accessible contact form for users to reach out
 * Polished with premium micro-animations
 * UI-only implementation (no backend logic)
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    message: false,
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI-only: Show success message (no backend)
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
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
              className="relative text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200 group"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/contact"
              className="relative text-sm text-white transition-colors duration-200 group"
            >
              Contact Us
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Page Title - Soft fade-in */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-bold text-white mb-4 text-center"
          >
            Contact Us
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-lg text-gray-400 mb-12 text-center leading-relaxed"
          >
            Have questions or feedback? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </motion.p>

          {/* Contact Form */}
          <motion.div
            variants={fadeInUp}
            className="bg-black border border-yellow-500/30 rounded-xl p-8 sm:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
                  required
                  className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                    isFocused.name
                      ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                      : 'border-yellow-500/30 hover:border-yellow-500/50'
                  }`}
                  placeholder="Your name"
                />
              </div>

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
                  required
                  className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                    isFocused.email
                      ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                      : 'border-yellow-500/30 hover:border-yellow-500/50'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-300 resize-none ${
                    isFocused.message
                      ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                      : 'border-yellow-500/30 hover:border-yellow-500/50'
                  }`}
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              {/* Submit Button - Gentle hover + press animation */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(234,179,8,0.35)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Additional Contact Info */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 text-sm">
              You can also reach us at{' '}
              <a
                href="mailto:hello@taskflow.app"
                className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 underline decoration-yellow-400/40 hover:decoration-yellow-400/70"
              >
                hello@taskflow.app
              </a>
            </p>
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
