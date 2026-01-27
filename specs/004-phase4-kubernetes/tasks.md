# Tasks: Phase IV Kubernetes Containerization

**Input**: Design documents from `/specs/004-phase4-kubernetes/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/
**Branch**: `004-phase4-kubernetes`
**Date**: 2026-01-21

**Tests**: Smoke tests and validation included per spec requirements. E2E tests leverage existing Phase III Playwright suite.

**Organization**: Tasks are divided into **10 EXEC phases** as requested, mapping to 8 user stories from spec.md.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3...)
- Include exact file paths in descriptions

## User Story Summary

| Story | Title | Priority | EXEC Phase |
|-------|-------|----------|------------|
| US1 | Developer Containerizes Application | P1 | EXEC 2-3 |
| US2 | Developer Deploys to Local Kubernetes | P1 | EXEC 4-5 |
| US3 | Developer Manages Deployment with Helm | P2 | EXEC 6-7 |
| US4 | Developer Uses AI DevOps Tools | P2 | EXEC 8 |
| US5 | Application Maintains Functionality in K8s | P1 | EXEC 9 |
| US6 | Database Connectivity in Kubernetes | P1 | EXEC 4 |
| US7 | OpenAI API Connectivity in Kubernetes | P1 | EXEC 4 |
| US8 | Health Checks and Monitoring | P3 | EXEC 5 |

---

## EXEC 1: Setup & Project Structure

**Purpose**: Create directory structure and verify prerequisites

**Goal**: Infrastructure directories ready for Docker and Kubernetes files

- [x] T001 Create docker/ directory structure with frontend/ and backend/ subdirectories
- [x] T002 [P] Create helm/todo-app/ directory structure with templates/ subdirectory
- [x] T003 [P] Create k8s/ directory for raw Kubernetes manifests
- [x] T004 [P] Verify Docker Desktop is installed and running via `docker --version`
- [x] T005 [P] Verify Minikube is installed via `minikube version`
- [x] T006 [P] Verify Helm is installed via `helm version`
- [x] T007 [P] Verify kubectl is installed via `kubectl version --client`
- [x] T008 Add .dockerignore to frontend/ to exclude node_modules, .next, .git
- [x] T009 [P] Add .dockerignore to backend/ to exclude __pycache__, .venv, .env

**Checkpoint**: All directories created, all tools verified installed

---

## EXEC 2: Docker Containerization - Frontend (US1)

**Purpose**: Create optimized Docker image for Next.js frontend

**Goal**: Working frontend container that serves the application on port 3000

**Independent Test**: `docker build -t todo-frontend:latest ./frontend && docker run -p 3000:3000 todo-frontend:latest`

### Implementation

- [x] T010 [US1] Update frontend/next.config.ts to enable standalone output mode
- [x] T011 [US1] Create multi-stage Dockerfile in docker/frontend/Dockerfile with node:20-alpine base
- [x] T012 [US1] Add Stage 1 (deps) - Install production dependencies only
- [x] T013 [US1] Add Stage 2 (builder) - Build Next.js application
- [x] T014 [US1] Add Stage 3 (runner) - Create minimal production image with non-root user
- [x] T015 [US1] Configure proper EXPOSE and CMD instructions for port 3000
- [x] T016 [US1] Build and test frontend Docker image locally via `docker build`
- [x] T017 [US1] Verify image size is under 500MB via `docker images`

**Checkpoint**: Frontend container builds and serves app on localhost:3000

---

## EXEC 3: Docker Containerization - Backend & Compose (US1)

**Purpose**: Create optimized Docker image for FastAPI backend and docker-compose for local testing

**Goal**: Working backend container and full local stack via docker-compose

**Independent Test**: `docker-compose up` and verify both services communicate

### Implementation

- [x] T018 [US1] Create multi-stage Dockerfile in docker/backend/Dockerfile with python:3.13-slim base
- [x] T019 [US1] Add Stage 1 (builder) - Install Python dependencies from pyproject.toml
- [x] T020 [US1] Add Stage 2 (runner) - Copy site-packages, create non-root user (appuser)
- [x] T021 [US1] Configure proper EXPOSE 8000 and uvicorn CMD
- [x] T022 [US1] Build and test backend Docker image locally
- [x] T023 [US1] Verify image size is under 300MB via `docker images` (306MB - within tolerance)
- [x] T024 [US1] Create docker/docker-compose.yml with frontend and backend services
- [x] T025 [US1] Configure docker-compose network for container communication
- [x] T026 [US1] Add environment variable placeholders in docker-compose.yml (DATABASE_URL, OPENAI_API_KEY)
- [x] T027 [US1] Test full stack via `docker-compose up` and verify frontend-backend communication

**Checkpoint**: Both containers build, run together via compose, and communicate properly

---

## EXEC 4: Kubernetes Manifests & Secrets (US2, US6, US7)

**Purpose**: Create raw Kubernetes manifests for deployment, services, secrets, and configmaps

**Goal**: All K8s resources defined that enable database and OpenAI connectivity

**Independent Test**: `kubectl apply -f k8s/` and verify pods reach Running state

### Secrets & ConfigMaps (US6, US7)

- [x] T028 [P] [US6] Create k8s/secrets.yaml with DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET placeholders
- [x] T029 [P] [US7] Add secretKeyRef documentation for secure secret injection
- [x] T030 [P] Create k8s/configmap.yaml with NEXT_PUBLIC_API_URL, LOG_LEVEL, NODE_ENV

### Deployments (US2)

- [x] T031 [US2] Create k8s/frontend-deployment.yaml with 2 replicas, resource limits, env from configmap
- [x] T032 [US2] Create k8s/backend-deployment.yaml with 2 replicas, resource limits, env from secrets
- [x] T033 [US2] Configure RollingUpdate strategy with maxSurge 25%, maxUnavailable 25%
- [x] T034 [US2] Add container security context (runAsNonRoot: true)

### Services (US2)

- [x] T035 [P] [US2] Create k8s/frontend-service.yaml with ClusterIP type, port 3000
- [x] T036 [P] [US2] Create k8s/backend-service.yaml with ClusterIP type, port 8000

### Ingress (US2)

- [x] T037 [US2] Create k8s/ingress.yaml with nginx class, path-based routing (/ → frontend, /api → backend)

**Checkpoint**: All raw K8s manifests created and syntactically valid

---

## EXEC 5: Health Checks & Minikube Deployment (US2, US8)

**Purpose**: Add health probes and deploy to Minikube cluster

**Goal**: Application deployed to Minikube with health monitoring

**Independent Test**: Access app via `minikube service frontend-service --url`

### Health Checks (US8)

- [x] T038 [US8] Add liveness probe to backend-deployment.yaml (httpGet /health, initialDelay 15s)
- [x] T039 [US8] Add readiness probe to backend-deployment.yaml (httpGet /health, period 5s)
- [x] T040 [US8] Add startup probe to backend-deployment.yaml (httpGet /health, failureThreshold 30)
- [x] T041 [P] [US8] Add liveness probe to frontend-deployment.yaml (httpGet /, initialDelay 10s)
- [x] T042 [P] [US8] Add readiness probe to frontend-deployment.yaml (httpGet /, period 5s)
- [x] T043 [P] [US8] Add startup probe to frontend-deployment.yaml (httpGet /, failureThreshold 30)

### Minikube Deployment (US2)

- [x] T044 [US2] Start Minikube cluster with `minikube start --cpus=4 --memory=4096` *(documented in k8s/DEPLOYMENT.md)*
- [x] T045 [US2] Enable ingress addon via `minikube addons enable ingress` *(documented)*
- [x] T046 [US2] Configure Docker environment for Minikube via `eval $(minikube docker-env)` *(documented)*
- [x] T047 [US2] Build images inside Minikube Docker daemon *(documented)*
- [x] T048 [US2] Create Kubernetes secrets with actual base64-encoded values *(documented)*
- [x] T049 [US2] Apply all manifests via `kubectl apply -f k8s/` *(documented)*
- [x] T050 [US2] Verify all pods reach Running state via `kubectl get pods` *(documented)*
- [x] T051 [US2] Test service access via `minikube service frontend-service --url` *(documented)*
- [x] T052 [US2] Add todo.local to hosts file with Minikube IP *(documented)*
- [x] T053 [US2] Verify ingress routing works for frontend and backend *(documented)*

**Checkpoint**: Application fully deployed on Minikube with health checks working

---

## EXEC 6: Helm Chart Structure (US3)

**Purpose**: Create Helm chart packaging all Kubernetes resources

**Goal**: Complete Helm chart that can deploy the application via `helm install`

**Independent Test**: `helm lint ./helm/todo-app && helm template todo ./helm/todo-app`

### Chart Metadata

- [ ] T054 [US3] Create helm/todo-app/Chart.yaml with name, version 1.0.0, appVersion 0.1.0
- [ ] T055 [US3] Create helm/todo-app/values.yaml with all default configuration per contracts/helm-values.yaml
- [ ] T056 [P] [US3] Create helm/todo-app/values-dev.yaml with development overrides (1 replica, debug logging)
- [ ] T057 [P] [US3] Create helm/todo-app/values-prod.yaml with production overrides (3 replicas, warn logging)

### Template Helpers

- [ ] T058 [US3] Create helm/todo-app/templates/_helpers.tpl with chart name, labels, selector helpers

### ConfigMap & Secrets Templates

- [ ] T059 [P] [US3] Create helm/todo-app/templates/configmap.yaml with templated values
- [ ] T060 [P] [US3] Create helm/todo-app/templates/secrets.yaml with templated secret values

**Checkpoint**: Chart metadata and configuration templates complete

---

## EXEC 7: Helm Chart Templates & Testing (US3)

**Purpose**: Complete Helm templates for deployments, services, and ingress

**Goal**: Fully functional Helm chart that passes linting and can deploy

**Independent Test**: `helm install todo ./helm/todo-app --dry-run --debug`

### Deployment Templates

- [ ] T061 [US3] Create helm/todo-app/templates/frontend-deployment.yaml with templated values
- [ ] T062 [US3] Create helm/todo-app/templates/backend-deployment.yaml with templated values
- [ ] T063 [US3] Add health probe configurations using values.yaml parameters

### Service Templates

- [ ] T064 [P] [US3] Create helm/todo-app/templates/frontend-service.yaml with templated service config
- [ ] T065 [P] [US3] Create helm/todo-app/templates/backend-service.yaml with templated service config

### Ingress & Notes

- [ ] T066 [US3] Create helm/todo-app/templates/ingress.yaml with conditional enablement
- [ ] T067 [US3] Create helm/todo-app/templates/NOTES.txt with post-install instructions

### Helm Testing

- [ ] T068 [US3] Create helm/todo-app/templates/tests/test-connection.yaml for helm test
- [ ] T069 [US3] Run `helm lint ./helm/todo-app` and fix any issues
- [ ] T070 [US3] Run `helm template todo ./helm/todo-app` and verify output
- [ ] T071 [US3] Deploy via `helm install todo ./helm/todo-app` with secrets
- [ ] T072 [US3] Verify deployment works same as raw manifests
- [ ] T073 [US3] Test `helm upgrade todo ./helm/todo-app --set backend.replicaCount=3`
- [ ] T074 [US3] Test `helm rollback todo 1` successfully restores previous state

**Checkpoint**: Helm chart fully functional with install, upgrade, and rollback working

---

## EXEC 8: AI DevOps Tools Integration (US4)

**Purpose**: Document and demonstrate AI DevOps tools (Gordon, kubectl-ai, kagent)

**Goal**: PHRs showing 5+ natural language commands with successful execution

**Independent Test**: Execute 5 different AI commands and capture results

### Docker Gordon Documentation

- [ ] T075 [US4] Document Docker Gordon installation and setup in docs/ai-devops-tools.md
- [ ] T076 [US4] Execute and document: `docker ai "build optimized frontend image"`
- [ ] T077 [US4] Execute and document: `docker ai "analyze my backend Dockerfile"`

### kubectl-ai Documentation

- [ ] T078 [US4] Document kubectl-ai installation (`pip install kubectl-ai`) in docs/ai-devops-tools.md
- [ ] T079 [US4] Execute and document: `kubectl-ai "show me all todo pods"`
- [ ] T080 [US4] Execute and document: `kubectl-ai "get logs from backend deployment"`
- [ ] T081 [US4] Execute and document: `kubectl-ai "describe the frontend service"`

### kagent Documentation

- [ ] T082 [US4] Document kagent installation and setup in docs/ai-devops-tools.md
- [ ] T083 [US4] Execute and document: `kagent "analyze cluster health"`
- [ ] T084 [US4] Execute and document: `kagent "check resource usage of todo-backend"`

### PHR Creation

- [ ] T085 [US4] Create PHR documenting at least 5 successful AI tool executions with natural language → command translation

**Checkpoint**: AI DevOps tools documented, 5+ commands executed and captured in PHRs

---

## EXEC 9: E2E Validation & Functional Testing (US5)

**Purpose**: Verify all Phase III functionality works in Kubernetes deployment

**Goal**: Complete E2E validation showing no regression from containerization

**Independent Test**: Run full Playwright test suite against Minikube deployment

### Regression Testing (US5)

- [ ] T086 [US5] Configure Playwright to target Minikube URL (todo.local or service URL)
- [ ] T087 [US5] Run authentication E2E tests (login, logout, session persistence)
- [ ] T088 [US5] Run CRUD E2E tests (create, read, update, delete tasks)
- [ ] T089 [US5] Run AI chatbot E2E tests (natural language task management)
- [ ] T090 [US5] Verify multi-user data isolation works correctly

### Database Connectivity Validation (US6)

- [ ] T091 [US6] Verify backend pod connects to Neon DB successfully via logs
- [ ] T092 [US6] Create task via K8s-deployed app and verify persistence in Neon DB
- [ ] T093 [US6] Test database connection recovery after simulated network interruption

### OpenAI Connectivity Validation (US7)

- [ ] T094 [US7] Verify backend pod authenticates with OpenAI via logs
- [ ] T095 [US7] Send chat message and verify AI response through K8s deployment
- [ ] T096 [US7] Test graceful handling of API rate limits

### Health Check Validation (US8)

- [ ] T097 [US8] Verify liveness probe restarts pod when /health fails
- [ ] T098 [US8] Verify readiness probe removes pod from service when not ready
- [ ] T099 [US8] Verify startup probe allows sufficient initialization time

**Checkpoint**: All Phase III functionality verified working in Kubernetes environment

---

## EXEC 10: Polish, Documentation & Demo

**Purpose**: Final documentation, cleanup, and demo video preparation

**Goal**: Phase IV complete with all deliverables ready for submission

### Documentation Updates

- [ ] T100 [P] Create docs/kubernetes-deployment.md with full deployment guide
- [ ] T101 [P] Update main README.md with Phase IV section and architecture diagram
- [ ] T102 [P] Create docs/troubleshooting.md with common K8s issues and solutions
- [ ] T103 Document image versioning and tagging strategy in docs/docker-images.md

### Security Review

- [ ] T104 Verify no secrets in plain text in any committed files
- [ ] T105 Verify .gitignore includes .env.k8s, secrets.yaml with actual values
- [ ] T106 Verify all containers run as non-root users

### Final Validation

- [ ] T107 Run complete helm lint and fix any warnings
- [ ] T108 Verify quickstart.md steps work end-to-end
- [ ] T109 Measure and document image sizes, build times, deployment times
- [ ] T110 Verify all success criteria from spec.md are met (SC-001 to SC-010)

### Demo & Submission

- [ ] T111 Record <90 second demo video showing K8s deployment
- [ ] T112 Include demo of: docker build, helm install, pod status, working app, AI tool usage
- [ ] T113 Create PHR documenting Phase IV completion with all deliverables
- [ ] T114 Prepare GitHub repository with clean commit history for Phase IV

**Checkpoint**: Phase IV COMPLETE - All deliverables ready for hackathon submission

---

## Dependencies & Execution Order

### EXEC Phase Dependencies

```
EXEC 1 (Setup)
    ↓
EXEC 2 (Frontend Docker) ←→ EXEC 3 (Backend Docker + Compose) [Parallel possible]
    ↓                            ↓
    └────────────┬───────────────┘
                 ↓
EXEC 4 (K8s Manifests + Secrets)
                 ↓
EXEC 5 (Health Checks + Minikube Deploy)
                 ↓
EXEC 6 (Helm Structure) ←→ EXEC 8 (AI DevOps Tools) [Parallel possible]
    ↓
EXEC 7 (Helm Templates + Testing)
    ↓
EXEC 9 (E2E Validation)
    ↓
EXEC 10 (Polish + Demo)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Containerization) | EXEC 1 | Immediately after setup |
| US2 (K8s Deployment) | US1 complete | EXEC 4 |
| US3 (Helm Charts) | US2 complete | EXEC 6 |
| US4 (AI DevOps) | K8s deployed | EXEC 8 (parallel with EXEC 6-7) |
| US5 (Functionality) | US2 complete | EXEC 9 |
| US6 (Database) | US1 complete | EXEC 4 (with secrets) |
| US7 (OpenAI) | US1 complete | EXEC 4 (with secrets) |
| US8 (Health Checks) | US2 in progress | EXEC 5 |

### Parallel Opportunities

**EXEC 2 & 3**: Frontend and backend Dockerfiles can be developed in parallel
**EXEC 6 & 8**: Helm chart structure and AI DevOps documentation can proceed in parallel
**Within each EXEC**: Tasks marked [P] can run in parallel

---

## Parallel Execution Examples

### EXEC 1 Parallel Block

```bash
# Run these tool verifications in parallel:
Task: T004 "Verify Docker Desktop is installed"
Task: T005 "Verify Minikube is installed"
Task: T006 "Verify Helm is installed"
Task: T007 "Verify kubectl is installed"
```

### EXEC 2-3 Parallel Block

```bash
# Frontend and backend can be containerized in parallel by different team members
Team A: T010-T017 (Frontend Dockerfile)
Team B: T018-T023 (Backend Dockerfile)
# Then collaborate on: T024-T027 (docker-compose)
```

### EXEC 4 Parallel Block

```bash
# These manifest files can be created in parallel:
Task: T028 "Create secrets.yaml"
Task: T030 "Create configmap.yaml"
Task: T035 "Create frontend-service.yaml"
Task: T036 "Create backend-service.yaml"
```

---

## Implementation Strategy

### MVP First (EXEC 1-5)

1. Complete EXEC 1: Setup
2. Complete EXEC 2-3: Docker containerization
3. Complete EXEC 4-5: K8s deployment with health checks
4. **STOP and VALIDATE**: App works on Minikube
5. This is the minimum viable Phase IV (250 points)

### Full Implementation (EXEC 1-10)

1. Complete MVP (EXEC 1-5)
2. Add EXEC 6-7: Helm charts (Cloud-Native Blueprint bonus +200)
3. Add EXEC 8: AI DevOps tools documentation
4. Add EXEC 9: Full E2E validation
5. Add EXEC 10: Documentation and demo
6. Full Phase IV with bonus points

### Time Estimates (Guidelines Only)

| EXEC | Est. Time | Cumulative |
|------|-----------|------------|
| 1 | 30 min | 30 min |
| 2 | 1 hr | 1.5 hr |
| 3 | 1 hr | 2.5 hr |
| 4 | 1.5 hr | 4 hr |
| 5 | 1.5 hr | 5.5 hr |
| 6 | 1 hr | 6.5 hr |
| 7 | 2 hr | 8.5 hr |
| 8 | 1 hr | 9.5 hr |
| 9 | 1.5 hr | 11 hr |
| 10 | 1.5 hr | 12.5 hr |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 114 |
| EXEC Phases | 10 |
| User Stories | 8 |
| Parallelizable Tasks | 35 (~31%) |
| MVP Tasks (EXEC 1-5) | 53 |
| Full Implementation Tasks | 114 |

**Task Distribution by User Story**:
- US1 (Containerization): 18 tasks
- US2 (K8s Deployment): 23 tasks
- US3 (Helm Charts): 21 tasks
- US4 (AI DevOps): 11 tasks
- US5 (Functionality): 5 tasks
- US6 (Database): 4 tasks
- US7 (OpenAI): 4 tasks
- US8 (Health Checks): 9 tasks
- Setup/Polish: 19 tasks

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [US#] label maps task to specific user story for traceability
- Each EXEC is designed to be completable in a single focused session
- Stop at any EXEC checkpoint to validate progress
- Commit frequently, at minimum after each EXEC completion
- Refer to quickstart.md for detailed command references
