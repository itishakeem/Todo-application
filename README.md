# Todo Application - 5-Phase Hackathon Project

A full-featured Todo application built progressively through 5 phases, from a simple console app to a cloud-native Kubernetes deployment with AI-powered chatbot assistance.

## Project Structure

```
Todo-application/
├── phase1-console-app/            # Phase I: Python Console Application
│   ├── src/                       # Python source code
│   ├── tests/                     # Unit & integration tests
│   └── README.md
│
├── phase2-fullstack-web/          # Phase II: Full-Stack Web Application
│   ├── frontend/                  # Next.js 16+ application
│   │   ├── app/                   # App router pages
│   │   ├── components/            # React components
│   │   └── lib/                   # Utilities & hooks
│   └── backend/                   # FastAPI application
│       ├── src/
│       │   ├── api/               # REST endpoints
│       │   ├── models/            # Database models
│       │   ├── services/          # Business logic
│       │   ├── agent/             # AI Agent (Phase III)
│       │   └── mcp/               # MCP Server (Phase III)
│       └── README.md
│
├── phase3-ai-chatbot/             # Phase III: AI-Powered Chatbot
│   └── README.md                  # (Code integrated in Phase II backend)
│
├── phase4-kubernetes/             # Phase IV: Kubernetes Containerization
│   ├── docker/                    # Dockerfiles & docker-compose
│   ├── k8s/                       # Kubernetes manifests
│   ├── helm/                      # Helm charts
│   ├── docs/                      # Deployment documentation
│   ├── start-port-forward.ps1     # Access helper script
│   └── README.md                  # Phase IV documentation
│
├── phase5-cloud-deployment/       # Phase V: Cloud-Native Deployment
│   └── README.md                  # (Future work)
│
├── specs/                         # SDD Specifications (all phases)
│   ├── 001-phase1-console-app/
│   ├── 002-phase2-fullstack-web/
│   ├── 003-phase3-ai-chatbot/
│   ├── 004-phase4-kubernetes/
│   └── 005-phase5-cloud-deployment/
│
├── history/                       # Prompt History Records
│   └── prompts/
│
├── .claude/                       # Agent definitions & commands
├── .specify/                      # SpecKit+ templates & scripts
├── CLAUDE.md                      # Project instructions for Claude
└── README.md                      # This file
```

## Phases Overview

### Phase I: Console Application ✅
**Technology**: Python 3.13+, UV package manager

A simple command-line todo application with in-memory storage.

**Features**:
- CRUD operations (Create, Read, Update, Delete)
- Interactive console interface
- Clean architecture patterns

**Location**: [phase1-console-app/](phase1-console-app/)

---

### Phase II: Full-Stack Web Application ✅
**Technology**: Next.js 16+, FastAPI, SQLModel, Neon DB, Better Auth

Modern web application with authentication and persistent storage.

**Features**:
- React frontend with Next.js App Router
- FastAPI RESTful backend
- User authentication (signup/login)
- PostgreSQL database (Neon)
- Task management (CRUD operations)
- Responsive UI design

**Location**: [phase2-fullstack-web/](phase2-fullstack-web/)

---

### Phase III: AI-Powered Chatbot ✅
**Technology**: OpenAI Agents SDK, Model Context Protocol (MCP)

Natural language interface for task management powered by AI.

**Features**:
- Conversational task management
- MCP Server for tool integration
- OpenAI Agents SDK
- Natural language processing
- Stateless architecture
- Integrated into Phase II backend

**Location**: Code in [phase2-fullstack-web/backend/src/agent/](phase2-fullstack-web/backend/src/agent/) and [phase2-fullstack-web/backend/src/mcp/](phase2-fullstack-web/backend/src/mcp/)
**Docs**: [phase3-ai-chatbot/](phase3-ai-chatbot/)

---

### Phase IV: Kubernetes Containerization ✅
**Technology**: Docker, Minikube, Helm, kubectl

Container orchestration and local Kubernetes deployment.

**Features**:
- Multi-stage Docker builds
- Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets, Ingress)
- Helm charts for deployment automation
- Health checks (liveness, readiness, startup probes)
- Resource management and scaling
- Non-root container security
- Local deployment on Minikube

**Location**: [phase4-kubernetes/](phase4-kubernetes/)
**Quick Start**: See [phase4-kubernetes/README.md](phase4-kubernetes/README.md)

---

### Phase V: Cloud-Native Deployment 🚧
**Technology**: GKE/AKS/OKE, Kafka, Dapr, GitHub Actions

Cloud deployment with event-driven architecture (planned).

**Features** (Planned):
- Advanced features (recurring tasks, reminders, priorities)
- Event-driven architecture (Kafka + Dapr)
- Cloud deployment (GKE/AKS/OKE)
- CI/CD pipelines (GitHub Actions)
- Auto-scaling and monitoring

**Location**: [phase5-cloud-deployment/](phase5-cloud-deployment/)

---

## Quick Start

### Phase IV Kubernetes Deployment (Current)

**Prerequisites**:
- Docker Desktop with Kubernetes enabled OR Minikube
- kubectl installed
- Helm installed (optional)

**Steps**:

1. **Start Minikube** (if using Minikube):
   ```bash
   minikube start
   ```

2. **Navigate to Phase IV directory**:
   ```bash
   cd phase4-kubernetes
   ```

3. **Build Docker images**:
   ```bash
   eval $(minikube docker-env)

   docker build -t todo-backend:latest \
     -f docker/backend/Dockerfile \
     ../phase2-fullstack-web/backend/

   docker build -t todo-frontend:latest \
     --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
     -f docker/frontend/Dockerfile \
     ../phase2-fullstack-web/frontend/
   ```

4. **Deploy to Kubernetes**:
   ```bash
   # Create secrets
   kubectl create secret generic todo-secrets \
     --from-literal=DATABASE_URL='sqlite:///./todo_app.db' \
     --from-literal=SECRET_KEY='your-secret-key-min-32-chars' \
     --from-literal=OPENAI_API_KEY='your-openai-api-key'

   # Deploy resources
   kubectl apply -f k8s/
   ```

5. **Access the application**:
   ```powershell
   # Windows PowerShell
   cd phase4-kubernetes
   .\start-port-forward.ps1
   ```

6. **Open browser**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

See [phase4-kubernetes/README.md](phase4-kubernetes/README.md) for detailed instructions.

---

## Development Methodology

This project follows **Spec-Driven Development (SDD)** using the SpecKit+ framework:

1. **Specification** (spec.md) - Requirements and user stories
2. **Planning** (plan.md) - Architecture and design decisions
3. **Tasks** (tasks.md) - Executable task breakdown
4. **Implementation** - Code with task references
5. **Validation** - Tests and acceptance criteria

All specifications are in the [specs/](specs/) directory, organized by phase.

---

## Key Features

### Phase II Features
- ✅ User authentication (signup, login, logout)
- ✅ Task CRUD operations
- ✅ Task filtering and search
- ✅ Persistent storage (PostgreSQL)
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling

### Phase III Features
- ✅ Natural language task creation
- ✅ AI-powered task queries
- ✅ Conversational interface
- ✅ MCP tool integration
- ✅ OpenAI Agents SDK integration

### Phase IV Features
- ✅ Docker containerization
- ✅ Kubernetes orchestration
- ✅ Helm chart deployment
- ✅ Health monitoring
- ✅ Resource management
- ✅ Security hardening
- ✅ Local development setup

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16+, React 19, TypeScript, TailwindCSS |
| **Backend** | FastAPI, Python 3.13+, SQLModel, Pydantic |
| **Database** | PostgreSQL (Neon), SQLite (local) |
| **Auth** | Better Auth, JWT tokens |
| **AI** | OpenAI Agents SDK, MCP (Model Context Protocol) |
| **Container** | Docker multi-stage builds |
| **Orchestration** | Kubernetes, Helm, Minikube |
| **Deployment** | kubectl, Helm charts |

---

## Documentation

### General
- [CLAUDE.md](CLAUDE.md) - Claude Code agent instructions
- [Hackathon Spec](Hackathon%20II%20-%20Todo%20Spec-Driven%20Development.md) - Original hackathon requirements

### Phase-Specific
- [Phase I README](phase1-console-app/README.md) - Console app documentation
- [Phase II README](phase2-fullstack-web/README.md) - Full-stack web documentation
- [Phase III README](phase3-ai-chatbot/README.md) - AI chatbot documentation
- [Phase IV README](phase4-kubernetes/README.md) - Kubernetes deployment guide

### Kubernetes (Phase IV)
- [Kubernetes Deployment Guide](phase4-kubernetes/docs/kubernetes-deployment.md)
- [Troubleshooting Guide](phase4-kubernetes/docs/troubleshooting.md)
- [Docker Images Guide](phase4-kubernetes/docs/docker-images.md)
- [Minikube Access Guide](phase4-kubernetes/MINIKUBE_ACCESS.md)

---

## Common Issues

### "Network error or server unavailable" (Phase IV)

**Solution**: Use port-forwarding with fixed ports (3000 and 8000)

See [phase4-kubernetes/QUICK_FIX.md](phase4-kubernetes/QUICK_FIX.md) for detailed fix.

### Pod CrashLoopBackOff

Check logs: `kubectl logs <pod-name>`

Common causes:
- Missing secrets
- Wrong environment variables
- Database connection issues

See [phase4-kubernetes/docs/troubleshooting.md](phase4-kubernetes/docs/troubleshooting.md)

---

## Project Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase I | ✅ Complete | 100% |
| Phase II | ✅ Complete | 100% |
| Phase III | ✅ Complete | 100% |
| Phase IV | ✅ Complete | 100% |
| Phase V | 🚧 Planned | 0% |

---

## Demo

Each phase includes a demo video (<90 seconds) showcasing the functionality.

---

## Contributing

This is a hackathon project demonstrating Spec-Driven Development with Claude Code. The project follows strict SDD methodology:

1. All features start with a specification
2. Implementation follows the generated plan and tasks
3. All code references task IDs for traceability

---

## License

Educational project for hackathon demonstration.

---

## Contact

For questions about this hackathon project, see the documentation in each phase directory.
