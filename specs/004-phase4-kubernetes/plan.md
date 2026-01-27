# Implementation Plan: Phase IV Kubernetes Containerization

**Branch**: `004-phase4-kubernetes` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-phase4-kubernetes/spec.md`

## Summary

Transform the Phase III AI-powered Todo application into a containerized, Kubernetes-ready deployment using Docker for containerization, Minikube for local orchestration, and Helm for package management. The implementation preserves all existing Phase I-III functionality while adding infrastructure-as-code capabilities and leveraging AI DevOps tools (Gordon, kubectl-ai, kagent) for intelligent operations.

## Technical Context

**Language/Version**:
- Backend: Python 3.13 (FastAPI)
- Frontend: Node.js 20 (Next.js 15)
- Infrastructure: YAML (Kubernetes manifests, Helm templates)

**Primary Dependencies**:
- Docker 24+ (containerization)
- Minikube 1.32+ (local Kubernetes)
- Helm 3.x (package management)
- kubectl 1.28+ (cluster management)
- Gordon (Docker AI Agent)
- kubectl-ai (AI-assisted kubectl)
- kagent (Kubernetes AI agent)

**Storage**: External Neon PostgreSQL (no containerized database)

**Testing**:
- Container: `docker run` smoke tests
- Kubernetes: `helm test` hooks
- E2E: Existing Playwright tests against K8s deployment
- Integration: Health check validation

**Target Platform**:
- Local: Minikube (Windows/Docker Desktop)
- Images: linux/amd64

**Project Type**: Web application (frontend + backend containers)

**Performance Goals**:
- Image build time: <5 minutes each
- Pod startup: <60 seconds
- Deployment time: <3 minutes via Helm
- Concurrent users: 50 on Minikube (4GB RAM)

**Constraints**:
- Frontend image: <500MB
- Backend image: <300MB
- Container startup: <30 seconds
- Health check response: <5 seconds
- Zero-downtime rolling updates

**Scale/Scope**:
- 2 frontend replicas
- 2 backend replicas
- Single Minikube cluster (4GB RAM, 4 CPUs)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Validation

| Principle | Check | Status | Notes |
|-----------|-------|--------|-------|
| I. SDD Workflow | Spec exists and approved | ✅ PASS | spec.md created 2026-01-20 |
| II. Phased Progression | Phase III complete | ✅ PASS | AI Chatbot merged to main |
| III. Test-First | Test strategy defined | ✅ PASS | E2E, integration, smoke tests planned |
| IV. Knowledge Capture | PHR routing configured | ✅ PASS | history/prompts/004-phase4-kubernetes/ |
| V. Multi-Agent | Phase IV agent available | ✅ PASS | .claude/agents/phase4-kubernetes.md |
| VI. Clean Architecture | Separation maintained | ✅ PASS | Frontend/Backend separate containers |
| VII. Security | Secrets management planned | ✅ PASS | K8s Secrets for credentials |
| VIII. Bonus Features | Cloud-Native Blueprints | ✅ PASS | Helm charts are IaC |

### Technology Stack Compliance

| Required | Planned | Status |
|----------|---------|--------|
| Docker | Docker 24+ | ✅ |
| Docker Gordon | Gordon AI Agent | ✅ |
| Minikube | Minikube 1.32+ | ✅ |
| Helm Charts | Helm 3.x | ✅ |
| kubectl-ai | kubectl-ai | ✅ |
| kagent | kagent | ✅ |

**Gate Status**: ✅ PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/004-phase4-kubernetes/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output - technology research
├── data-model.md        # Phase 1 output - K8s resource model
├── quickstart.md        # Phase 1 output - deployment guide
├── contracts/           # Phase 1 output - Helm values schema
│   ├── values-schema.json
│   └── helm-values.yaml
├── checklists/
│   └── requirements.md  # Specification checklist (complete)
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
# Infrastructure files (NEW for Phase IV)
docker/
├── frontend/
│   └── Dockerfile           # Next.js multi-stage build
├── backend/
│   └── Dockerfile           # FastAPI multi-stage build
└── docker-compose.yml       # Local multi-container testing

helm/
└── todo-app/
    ├── Chart.yaml           # Helm chart metadata
    ├── values.yaml          # Default configuration
    ├── values-dev.yaml      # Development overrides
    ├── values-prod.yaml     # Production overrides
    ├── templates/
    │   ├── _helpers.tpl     # Template helpers
    │   ├── frontend-deployment.yaml
    │   ├── frontend-service.yaml
    │   ├── backend-deployment.yaml
    │   ├── backend-service.yaml
    │   ├── configmap.yaml
    │   ├── secrets.yaml
    │   ├── ingress.yaml
    │   └── NOTES.txt        # Post-install instructions
    └── tests/
        └── test-connection.yaml

k8s/                          # Raw manifests (optional, for reference)
├── frontend-deployment.yaml
├── frontend-service.yaml
├── backend-deployment.yaml
├── backend-service.yaml
├── configmap.yaml
├── secrets.yaml
└── ingress.yaml

# Existing application code (Phase III - unchanged)
frontend/                     # Next.js 15 application
├── app/
├── components/
├── lib/
└── package.json

backend/                      # FastAPI application
├── src/
│   ├── main.py
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── mcp/                 # MCP Server (Phase III)
│   └── agent/               # OpenAI Agent (Phase III)
└── requirements.txt
```

**Structure Decision**: Web application with separate frontend/backend containers, Helm chart for Kubernetes deployment, and docker-compose for local development testing.

## Architecture Design

### Container Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MINIKUBE CLUSTER                             │
│                                                                      │
│  ┌─────────────────────┐     ┌─────────────────────┐                │
│  │  todo-frontend      │     │  todo-backend       │                │
│  │  Deployment         │     │  Deployment         │                │
│  │                     │     │                     │                │
│  │  ┌───────┐ ┌───────┐│     │  ┌───────┐ ┌───────┐│                │
│  │  │ Pod 1 │ │ Pod 2 ││     │  │ Pod 1 │ │ Pod 2 ││                │
│  │  │Next.js│ │Next.js││     │  │FastAPI│ │FastAPI││                │
│  │  └───────┘ └───────┘│     │  └───────┘ └───────┘│                │
│  │                     │     │                     │                │
│  │  Port: 3000         │     │  Port: 8000         │                │
│  └──────────┬──────────┘     └──────────┬──────────┘                │
│             │                           │                            │
│  ┌──────────▼──────────┐     ┌──────────▼──────────┐                │
│  │  frontend-service   │     │  backend-service    │                │
│  │  ClusterIP:3000     │     │  ClusterIP:8000     │                │
│  └──────────┬──────────┘     └──────────┬──────────┘                │
│             │                           │                            │
│  ┌──────────┴───────────────────────────┴──────────┐                │
│  │              todo-ingress                        │                │
│  │  /        → frontend-service:3000               │                │
│  │  /api/*   → backend-service:8000                │                │
│  └──────────────────────┬───────────────────────────┘                │
│                         │                                            │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │ External  │
                    │ Services  │
                    │           │
                    │ - Neon DB │
                    │ - OpenAI  │
                    └───────────┘
```

### Docker Image Strategy

#### Frontend (Next.js)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### Backend (FastAPI)

```dockerfile
# Stage 1: Build dependencies
FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.13-slim AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
USER appuser
EXPOSE 8000
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Helm Chart Design

#### Chart.yaml
```yaml
apiVersion: v2
name: todo-app
description: AI-Powered Todo Application - Phase IV Kubernetes Deployment
type: application
version: 1.0.0
appVersion: "0.1.0"
keywords:
  - todo
  - fastapi
  - nextjs
  - kubernetes
maintainers:
  - name: Hackathon Team
```

#### values.yaml (Default)
```yaml
global:
  namespace: default
  imageRegistry: ""

frontend:
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: IfNotPresent
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  service:
    type: ClusterIP
    port: 3000
  healthCheck:
    path: /
    initialDelaySeconds: 10
    periodSeconds: 10

backend:
  replicaCount: 2
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: IfNotPresent
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi
  service:
    type: ClusterIP
    port: 8000
  healthCheck:
    path: /health
    initialDelaySeconds: 15
    periodSeconds: 10

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend

secrets:
  databaseUrl: ""        # Base64 encoded
  openaiApiKey: ""       # Base64 encoded
  betterAuthSecret: ""   # Base64 encoded

configMap:
  apiUrl: "http://backend-service:8000"
  logLevel: "info"
  nodeEnv: "production"
```

### Security Design

| Secret | Source | K8s Storage | Access |
|--------|--------|-------------|--------|
| DATABASE_URL | .env | K8s Secret | Backend pods |
| OPENAI_API_KEY | .env | K8s Secret | Backend pods |
| BETTER_AUTH_SECRET | .env | K8s Secret | Backend pods |
| NEXT_PUBLIC_API_URL | ConfigMap | ConfigMap | Frontend pods |

**Secret Injection Strategy**:
1. Secrets stored in `secrets.yaml` template with base64 encoding
2. Referenced via `secretKeyRef` in deployment env vars
3. Never committed to git (use sealed secrets or external secret management in production)

### Health Check Strategy

| Component | Probe | Endpoint | Threshold |
|-----------|-------|----------|-----------|
| Frontend | Liveness | / | 3 failures |
| Frontend | Readiness | / | 3 failures |
| Frontend | Startup | / | 30 attempts |
| Backend | Liveness | /health | 3 failures |
| Backend | Readiness | /health | 3 failures |
| Backend | Startup | /health | 30 attempts |

### Deployment Strategy

| Setting | Value | Rationale |
|---------|-------|-----------|
| Strategy | RollingUpdate | Zero-downtime deployments |
| maxSurge | 25% | Allow extra pods during update |
| maxUnavailable | 25% | Maintain capacity |
| minReadySeconds | 5 | Stabilization period |

## AI DevOps Tools Integration

### Docker Gordon Usage

```bash
# Image optimization
docker ai "Analyze my frontend Dockerfile and suggest optimizations"
docker ai "What's the best base image for a Python 3.13 FastAPI app?"
docker ai "Help me reduce the image size of my Next.js container"

# Troubleshooting
docker ai "Why is my container exiting with code 137?"
docker ai "Debug why my container can't connect to the database"
```

### kubectl-ai Usage

```bash
# Deployment operations
kubectl-ai "Deploy the todo application with 2 replicas"
kubectl-ai "Show me the status of all todo pods"
kubectl-ai "Get logs from the failing backend pod"

# Debugging
kubectl-ai "Why are my pods in CrashLoopBackOff?"
kubectl-ai "Check resource usage of todo-backend deployment"
```

### kagent Usage

```bash
# Cluster analysis
kagent "Analyze the health of my minikube cluster"
kagent "Suggest resource optimizations for todo app"
kagent "Check for security issues in my deployments"

# Scaling
kagent "Scale backend to handle more load"
kagent "What's the optimal replica count for 50 users?"
```

## Complexity Tracking

> No violations requiring justification - design follows minimum viable complexity.

| Decision | Rationale | Simpler Alternative |
|----------|-----------|---------------------|
| Helm over raw manifests | Reusable, versioned, environment-specific | Raw K8s YAML (less maintainable) |
| Multi-stage Docker builds | Smaller images, security | Single-stage (larger, less secure) |
| External database (Neon) | Existing Phase II/III setup | Containerized DB (more complexity) |

## Post-Design Constitution Re-Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. SDD | ✅ | Plan created before tasks |
| II. Phased | ✅ | Building on Phase III |
| III. Test-First | ✅ | Health checks, E2E tests |
| IV. Knowledge | ✅ | PHR will be created |
| V. Multi-Agent | ✅ | Phase IV agent used |
| VI. Clean Arch | ✅ | Separation maintained |
| VII. Security | ✅ | K8s Secrets, non-root |
| VIII. Bonus | ✅ | Helm = Cloud-Native Blueprint |

**Final Gate Status**: ✅ PASS - Ready for Phase 1 artifacts and /sp.tasks

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | Claude Code | Initial implementation plan |
