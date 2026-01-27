# Research: Phase IV Kubernetes Containerization

**Feature**: Phase IV Kubernetes Containerization
**Date**: 2026-01-21
**Status**: Complete

## Research Summary

This document consolidates research findings for Phase IV implementation decisions. All NEEDS CLARIFICATION items from Technical Context have been resolved.

---

## 1. Docker Multi-Stage Build Best Practices

### Decision: Use 3-stage builds for both frontend and backend

### Rationale
- **Stage 1 (deps/builder)**: Install dependencies in isolation
- **Stage 2 (build)**: Compile/build the application
- **Stage 3 (runner)**: Minimal production image with only runtime requirements

### Research Findings

**Next.js Containerization (Frontend)**:
- Use `node:20-alpine` as base for smallest image size (~150MB vs ~900MB for node:20)
- Enable `output: 'standalone'` in next.config.ts for optimized production bundle
- Copy only `.next/standalone`, `.next/static`, and `public` folders
- Results in images typically 100-200MB

**FastAPI Containerization (Backend)**:
- Use `python:3.13-slim` (not alpine) for compatibility with compiled Python packages
- Alpine causes issues with psycopg2 and other C-extension packages
- Copy only site-packages and application code, not pip cache
- Results in images typically 150-250MB

### Alternatives Considered
| Option | Size | Build Time | Compatibility |
|--------|------|------------|---------------|
| python:3.13 (full) | ~1GB | Fast | Best |
| python:3.13-slim | ~200MB | Fast | Good |
| python:3.13-alpine | ~100MB | Slow | Poor (C extensions) |

**Selected**: python:3.13-slim for balance of size and compatibility

---

## 2. Minikube Configuration

### Decision: 4GB RAM, 4 CPUs, Docker driver

### Rationale
- 4GB RAM handles 2 frontend + 2 backend replicas comfortably
- 4 CPUs enable parallel builds and responsive deployments
- Docker driver integrates best with Docker Desktop on Windows

### Research Findings

**Minimum Requirements for Todo App**:
```
Pods: 4 (2 frontend + 2 backend)
Per-pod memory: 256-512MB
System overhead: ~1GB
Total recommended: 4GB
```

**Driver Comparison**:
| Driver | Windows Support | Performance | Setup Complexity |
|--------|-----------------|-------------|------------------|
| docker | Excellent | Good | Low |
| hyperv | Good | Better | Medium |
| virtualbox | Good | Moderate | Medium |

**Selected**: Docker driver (simplest, integrates with existing Docker Desktop)

### Startup Command
```bash
minikube start --driver=docker --cpus=4 --memory=4096 --disk-size=20g
minikube addons enable ingress
minikube addons enable metrics-server
```

---

## 3. Helm Chart Structure

### Decision: Single umbrella chart with subcharts for frontend/backend

### Rationale
- Single `helm install` deploys entire application
- Values files enable environment-specific configuration
- Follows Helm 3 best practices

### Research Findings

**Chart Structure Options**:

| Option | Pros | Cons |
|--------|------|------|
| Monolithic chart | Simple, single install | Harder to version components |
| Umbrella + subcharts | Modular, versioned | More complex |
| Separate charts | Maximum flexibility | Multiple installs needed |

**Selected**: Monolithic chart (simplest for hackathon scope)

**Required Templates**:
1. `frontend-deployment.yaml` - Next.js deployment
2. `frontend-service.yaml` - ClusterIP service
3. `backend-deployment.yaml` - FastAPI deployment
4. `backend-service.yaml` - ClusterIP service
5. `configmap.yaml` - Non-sensitive config
6. `secrets.yaml` - Sensitive credentials
7. `ingress.yaml` - External access
8. `_helpers.tpl` - Template functions
9. `NOTES.txt` - Post-install instructions

---

## 4. Health Check Implementation

### Decision: HTTP probes on /health (backend) and / (frontend)

### Rationale
- Backend already has `/health` endpoint (from Phase II main.py)
- Frontend uses root path as simple health indicator
- Startup probes prevent premature termination during init

### Research Findings

**Probe Types**:
| Probe | Purpose | Failure Action |
|-------|---------|----------------|
| Startup | Wait for app initialization | Keep waiting |
| Liveness | Detect deadlocks/hangs | Restart pod |
| Readiness | Check if ready for traffic | Remove from service |

**Recommended Configuration**:
```yaml
# Backend probes
startupProbe:
  httpGet:
    path: /health
    port: 8000
  failureThreshold: 30
  periodSeconds: 2

livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 15
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

---

## 5. Secrets Management

### Decision: Kubernetes native Secrets with base64 encoding

### Rationale
- Simplest approach for local Minikube deployment
- Meets hackathon requirements
- Production would use sealed-secrets or external secret management

### Research Findings

**Options Evaluated**:
| Option | Complexity | Security | Minikube Support |
|--------|------------|----------|------------------|
| K8s Secrets (base64) | Low | Basic | Native |
| Sealed Secrets | Medium | Good | Requires setup |
| External Secrets Operator | High | Best | Requires setup |
| Vault | High | Enterprise | Complex |

**Selected**: Native K8s Secrets (appropriate for local development)

**Secret Creation Flow**:
1. Developer creates `.env.k8s` with actual values
2. Script encodes values to base64
3. Values injected into Helm `--set` or values file
4. Never committed to git (`.gitignore`)

---

## 6. AI DevOps Tools Installation

### Decision: Document installation, make usage optional

### Rationale
- Tools are bonus points, not blocking requirements
- Installation varies by platform
- Provide fallback manual commands

### Research Findings

**Docker Gordon**:
- Comes with Docker Desktop 4.26+
- Enabled via Docker Desktop settings
- Usage: `docker ai "query"`

**kubectl-ai**:
```bash
# Installation
pip install kubectl-ai
# or
brew install kubectl-ai  # macOS

# Configuration
export OPENAI_API_KEY=<your-key>

# Usage
kubectl-ai "describe pods in default namespace"
```

**kagent**:
```bash
# Installation
pip install kagent

# Usage
kagent "analyze cluster health"
```

**Fallback Commands**:
| AI Command | Manual Equivalent |
|------------|-------------------|
| "show pod status" | `kubectl get pods -o wide` |
| "get logs" | `kubectl logs <pod-name>` |
| "scale deployment" | `kubectl scale deployment <name> --replicas=N` |

---

## 7. Container Registry Strategy

### Decision: Use Minikube's built-in registry

### Rationale
- No external registry setup required
- Images stay local for faster iteration
- Simple eval command makes images available

### Research Findings

**Options**:
| Option | Setup | Speed | Production-Ready |
|--------|-------|-------|------------------|
| Minikube registry | None | Fastest | No |
| Docker Hub | Account | Moderate | Yes |
| GitHub Container Registry | Account + PAT | Moderate | Yes |
| Local registry | Docker run | Fast | No |

**Selected**: Minikube built-in (eval $(minikube docker-env))

**Workflow**:
```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Build images (they're now in Minikube)
docker build -t todo-frontend:latest ./docker/frontend
docker build -t todo-backend:latest ./docker/backend

# Deploy (imagePullPolicy: Never or IfNotPresent)
helm install todo ./helm/todo-app
```

---

## 8. Ingress Configuration

### Decision: NGINX Ingress Controller with path-based routing

### Rationale
- NGINX is default Minikube ingress addon
- Path-based routing separates frontend (/) from API (/api)
- Simple configuration, widely documented

### Research Findings

**Path Routing Strategy**:
```
todo.local/        → frontend-service:3000
todo.local/api/*   → backend-service:8000
```

**Minikube Ingress Setup**:
```bash
minikube addons enable ingress
# Add to hosts file:
# <minikube-ip> todo.local
```

**Alternative**: NodePort services (simpler but less production-like)

---

## 9. Rolling Update Strategy

### Decision: RollingUpdate with 25% maxSurge, 25% maxUnavailable

### Rationale
- Zero-downtime updates
- Gradual rollout catches issues early
- Standard Kubernetes defaults work well

### Research Findings

**Strategy Comparison**:
| Strategy | Downtime | Resource Spike | Rollback |
|----------|----------|----------------|----------|
| RollingUpdate | None | +25% | Automatic |
| Recreate | Yes | None | Manual |
| Blue-Green | None | +100% | Instant |
| Canary | None | +10-20% | Gradual |

**Selected**: RollingUpdate (balance of safety and resources)

---

## 10. Next.js Standalone Output

### Decision: Enable standalone output mode in next.config.ts

### Rationale
- Dramatically reduces container size
- Includes only necessary dependencies
- Optimized for containerized deployment

### Research Findings

**Configuration Required**:
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  // ... other config
};
```

**Build Output**:
- `.next/standalone/` - Minimal Node.js server
- `.next/static/` - Static assets
- `public/` - Public files

**Container Copy Strategy**:
```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
```

---

## Research Completion Checklist

- [x] Docker multi-stage build best practices
- [x] Minikube configuration requirements
- [x] Helm chart structure and templates
- [x] Health check implementation
- [x] Secrets management approach
- [x] AI DevOps tools installation
- [x] Container registry strategy
- [x] Ingress configuration
- [x] Rolling update strategy
- [x] Next.js standalone output

**Status**: All NEEDS CLARIFICATION items resolved. Ready for Phase 1 artifacts.
