# Phase IV Kubernetes - Backend Dockerfile
# Multi-stage build for optimized FastAPI production image
# Target: <300MB image size, non-root user

# =============================================================================
# Stage 1: Builder
# Install Python dependencies
# =============================================================================
FROM python:3.13-slim AS builder

WORKDIR /app

# Install build dependencies for psycopg2-binary and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheel for faster installs
RUN pip install --no-cache-dir --upgrade pip wheel

# Copy pyproject.toml for dependency installation
COPY pyproject.toml ./

# Install dependencies with optimizations:
# --no-compile: skip .pyc generation (saves space)
# --no-cache-dir: don't cache downloaded packages
RUN pip install --no-cache-dir --no-compile . \
    && pip cache purge \
    && find /usr/local/lib/python3.13/site-packages -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true \
    && find /usr/local/lib/python3.13/site-packages -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true \
    && find /usr/local/lib/python3.13/site-packages -type d -name "test" -exec rm -rf {} + 2>/dev/null || true \
    && find /usr/local/lib/python3.13/site-packages -name "*.pyo" -delete 2>/dev/null || true \
    && find /usr/local/lib/python3.13/site-packages -name "*.pyc" -delete 2>/dev/null || true

# =============================================================================
# Stage 2: Runner (Production)
# Minimal production image with non-root user
# =============================================================================
FROM python:3.13-slim AS runner

WORKDIR /app

# Install runtime dependencies only (libpq for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security (FR-005)
RUN groupadd --system --gid 1001 appgroup \
    && useradd --system --uid 1001 --gid appgroup appuser

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application source code
COPY src ./src

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONOPTIMIZE=2

# Expose port 8000 (FR-002)
EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Start uvicorn server (FR-002)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
