# Phase IV Kubernetes - Frontend Dockerfile
# Multi-stage build for optimized Next.js production image
# Target: <500MB image size, non-root user

# =============================================================================
# Stage 1: Dependencies (deps)
# Install ALL dependencies for building (including devDependencies like TypeScript)
# =============================================================================
FROM node:20-alpine AS deps

# Add libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install ALL dependencies (needed for TypeScript build)
RUN npm ci && npm cache clean --force

# =============================================================================
# Stage 2: Builder
# Build the Next.js application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all dependencies from deps stage (includes TypeScript for next.config.ts)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application (standalone output enabled in next.config.ts)
RUN npm run build

# =============================================================================
# Stage 3: Runner (Production)
# Minimal production image with non-root user
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security (FR-005)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
# Standalone output includes all required dependencies
COPY --from=builder /app/public ./public

# Set proper ownership before copying standalone files
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000 (FR-001)
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server (FR-001)
CMD ["node", "server.js"]
