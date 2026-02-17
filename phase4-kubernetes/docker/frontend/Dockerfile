# =============================================================================
# Multi-stage Dockerfile for Next.js Frontend
# Base image: node:20-alpine for minimal size
# Build context: phase2-fullstack-web/frontend/
# =============================================================================

# =============================================================================
# Stage 1: Dependencies
# Install ALL dependencies (needed for build stage)
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# =============================================================================
# Stage 2: Builder
# Build the Next.js application with all dependencies
# =============================================================================
FROM node:20-alpine AS builder

# Build argument for API URL (defaults to localhost for local dev)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Build Next.js application (creates .next/standalone)
RUN npm run build

# =============================================================================
# Stage 3: Runner
# Create minimal production image with non-root user
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create system group and user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set to production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
