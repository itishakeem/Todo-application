# Hackathon Multi-Agent System

## Overview

This directory contains specialized AI agents for the 5-phase Hackathon Todo Application project. The system uses a hierarchical orchestration pattern with clear roles and delegation.

## Agent Directory Structure

```
.claude/agents/
├── README.md                      # This file
├── orchestrator.md                # 🎯 Master coordinator
├── speckit-architect.md           # 📋 SDD workflow manager
├── phase1-console-app.md          # 🐍 Python CLI specialist
├── phase2-fullstack-web.md        # 🌐 Web app specialist
├── phase3-ai-chatbot.md           # 🤖 AI chatbot specialist
├── phase4-kubernetes.md           # ☸️ K8s deployment specialist
└── phase5-cloud-deployment.md     # ☁️ Cloud & event-driven specialist
```

## Agent Hierarchy

```
                    🎯 ORCHESTRATOR
                    (Coordinator)
                          |
            ┌─────────────┴─────────────┐
            │                           │
     📋 SpecKit Architect        🛠️ Phase Agents
        (Process Guard)           (Specialists)
            │                           |
            │              ┌────────────┼────────────┐
            │              │            │            │
         Enforces      🐍 Phase I  🌐 Phase II  🤖 Phase III
         SDD Flow      Console     Full-Stack  AI Chatbot
            │              │            │            │
         Creates       ☸️ Phase IV  ☁️ Phase V
      Specs/Plans     Kubernetes    Cloud
```

## Agent Roles Summary

| Agent | Role | Delegates? | Reports To |
|-------|------|------------|------------|
| 🎯 **Orchestrator** | Master Coordinator | ✅ Yes (to all) | User |
| 📋 **SpecKit Architect** | Process Guardian | ❌ No | Orchestrator |
| 🐍 **Phase I** | Python CLI Specialist | ❌ No | Orchestrator |
| 🌐 **Phase II** | Web App Specialist | ❌ No | Orchestrator |
| 🤖 **Phase III** | AI Chatbot Specialist | ❌ No | Orchestrator |
| ☸️ **Phase IV** | K8s Specialist | ❌ No | Orchestrator |
| ☁️ **Phase V** | Cloud Specialist | ❌ No | Orchestrator |

## Orchestration Flow

### 1. User Request Arrives
```
User: "Let's start Phase II"
```

### 2. Orchestrator Analyzes
```
- Detects: Phase II request
- Checks: Phase I complete? ✓
- Determines: Need SpecKit + Phase II agents
```

### 3. Agent Loading
```
Orchestrator loads:
  ├── SpecKit Architect (for SDD workflow)
  └── Phase II Full-Stack Web Agent (for technical guidance)
```

### 4. Delegation
```
Orchestrator → SpecKit: "Create Phase II specification"
SpecKit → Creates spec.md
Orchestrator → User: "Review spec?"
User: "Approved"
Orchestrator → SpecKit: "Generate plan"
SpecKit → Creates plan.md
Orchestrator → SpecKit: "Break into tasks"
SpecKit → Creates tasks.md
Orchestrator → Phase II Agent: "Implement tasks"
Phase II Agent → Implements with task references
Orchestrator → SpecKit: "Validate completion"
SpecKit → ✓ Validates
Orchestrator → User: "Phase II complete!"
```

## Agent Capabilities

### 🎯 Orchestrator Agent
**Knows**:
- Current phase status
- All agent capabilities
- Prerequisites for each phase
- Delegation patterns

**Can Do**:
- Route user requests
- Load appropriate agents
- Enforce phase order
- Validate transitions
- Track progress

**Cannot Do**:
- Write specs directly
- Implement code
- Make architectural decisions (delegates these)

---

### 📋 SpecKit Architect Agent
**Knows**:
- SDD workflow (Specify → Plan → Tasks → Implement)
- Spec/plan/tasks templates
- PHR routing rules
- ADR significance criteria

**Can Do**:
- Create spec.md files
- Generate plan.md
- Break down tasks.md
- Create PHRs
- Suggest ADRs
- Validate completeness
- Block code without specs

**Cannot Do**:
- Implement code (delegates to phase agents)
- Deploy applications
- Make technology choices (advises, doesn't decide)

---

### 🐍 Phase I Console App Agent
**Knows**:
- Python 3.13+ best practices
- UV package management
- In-memory data structures
- Console UI patterns

**Can Do**:
- Implement CRUD operations
- Design CLI interfaces
- Write unit tests
- Create clean architecture

**Cannot Do**:
- Web development (not its phase)
- Database operations (in-memory only)
- Work without spec (SpecKit blocks this)

---

### 🌐 Phase II Full-Stack Web Agent
**Knows**:
- Next.js 16+ App Router
- FastAPI patterns
- SQLModel ORM
- Better Auth + JWT
- Neon PostgreSQL
- Monorepo structure

**Can Do**:
- Build frontend components
- Create REST APIs
- Design database schemas
- Implement authentication
- Integrate frontend/backend

**Cannot Do**:
- AI/MCP work (Phase III territory)
- Kubernetes deployment (Phase IV)
- Work without Phase I complete

---

### 🤖 Phase III AI Chatbot Agent
**Knows**:
- OpenAI Agents SDK
- Official MCP SDK
- ChatKit integration
- Stateless architecture patterns
- Conversation management

**Can Do**:
- Build MCP servers
- Implement MCP tools
- Design agent behaviors
- Create conversational interfaces
- Manage state in DB

**Cannot Do**:
- Containerization (Phase IV)
- Cloud deployment (Phase V)
- Work without Phase II complete

---

### ☸️ Phase IV Kubernetes Agent
**Knows**:
- Docker multi-stage builds
- Helm charts
- Minikube setup
- kubectl-ai usage
- kagent usage
- Gordon (Docker AI)
- K8s resources (Deployments, Services, Ingress)

**Can Do**:
- Create Dockerfiles
- Build Helm charts
- Deploy to Minikube
- Configure networking
- Use AI DevOps tools

**Cannot Do**:
- Cloud-specific features (Phase V)
- Event-driven architecture (Phase V)
- Work without Phase III complete

---

### ☁️ Phase V Cloud Deployment Agent
**Knows**:
- GKE/AKS/OKE deployment
- Kafka event streaming
- Dapr integration
- GitHub Actions
- Advanced features (recurring, reminders, priorities)
- Microservices patterns

**Can Do**:
- Implement advanced features
- Set up Kafka topics
- Configure Dapr components
- Deploy to cloud K8s
- Create CI/CD pipelines
- Design event-driven flows

**Cannot Do**:
- Work without Phase IV complete
- Skip prerequisites
- Bypass SDD workflow

## Common Workflows

### Starting Fresh
```
1. User: "Start hackathon project"
2. Orchestrator: Loads SpecKit
3. SpecKit: Creates constitution
4. Orchestrator: "Ready for Phase I"
5. User: "Begin Phase I"
6. Orchestrator: Loads Phase I + SpecKit
7. SDD workflow begins...
```

### Phase Transition
```
1. User: "Move to Phase III"
2. Orchestrator: Validates Phase II complete ✓
3. Orchestrator: Loads Phase III + SpecKit
4. SpecKit: Creates Phase III spec
5. Phase III Agent: Awaits implementation signal
```

### Architecture Question
```
1. User: "Should we use REST or GraphQL?"
2. Orchestrator: Detects architectural decision
3. Orchestrator: Delegates to SpecKit
4. SpecKit: Applies ADR significance test
5. SpecKit: Suggests ADR creation
6. User: Approves
7. SpecKit: Creates ADR
```

## Decision Authority

### Who Decides What?

| Decision Type | Authority | Consulted |
|---------------|-----------|-----------|
| Which agent to use | Orchestrator | - |
| Phase transitions | Orchestrator | SpecKit (validates) |
| Spec completeness | SpecKit Architect | Phase Agent (technical input) |
| Implementation approach | Phase Agent | SpecKit (validation) |
| Technology choices | User | Phase Agent (recommendations) |
| ADR creation | User | SpecKit (suggestions) |
| Code structure | Phase Agent | SpecKit (standards) |
| Task completion | SpecKit Architect | Phase Agent (reports) |

## Integration with CLAUDE.md

The CLAUDE.md file at project root automatically loads the Orchestrator context. When you start a conversation:

1. CLAUDE.md is read
2. Orchestrator patterns are loaded
3. All agent files are available for dynamic loading
4. System is ready to route your requests

## Benefits of This Architecture

✅ **Clear Separation of Concerns**: Each agent has specific expertise
✅ **Enforced Prerequisites**: Can't skip phases or bypass SDD
✅ **Automatic Delegation**: Orchestrator routes intelligently
✅ **Quality Assurance**: SpecKit acts as gateway
✅ **Traceability**: Every decision flows through hierarchy
✅ **Scalability**: Easy to add new phase agents
✅ **Bonus Points**: Demonstrates Reusable Intelligence (+200 points)

## Quick Reference

### To Start Phase I
```
@.claude/agents/orchestrator.md
User: "Start Phase I"
```

### To Continue to Next Phase
```
User: "Start Phase [N]"
Orchestrator validates prerequisites automatically
```

### To Create Spec
```
User: "Create spec for [feature]"
Orchestrator delegates to SpecKit
```

### To Implement
```
User: "Implement [feature]"
Orchestrator checks spec/plan/tasks
Delegates to appropriate Phase Agent
```

### To Get Help
```
User: "What phase am I in?"
User: "What agents are available?"
User: "What are the prerequisites for Phase IV?"
```

## File References

- **Orchestrator**: [orchestrator.md](orchestrator.md)
- **SpecKit Architect**: [speckit-architect.md](speckit-architect.md)
- **Phase I**: [phase1-console-app.md](phase1-console-app.md)
- **Phase II**: [phase2-fullstack-web.md](phase2-fullstack-web.md)
- **Phase III**: [phase3-ai-chatbot.md](phase3-ai-chatbot.md)
- **Phase IV**: [phase4-kubernetes.md](phase4-kubernetes.md)
- **Phase V**: [phase5-cloud-deployment.md](phase5-cloud-deployment.md)

## Success Metrics

This agent system is successful when:
- ✅ No manual code written (all via agents)
- ✅ Every phase has complete spec/plan/tasks
- ✅ All prerequisites enforced
- ✅ PHRs created for all major interactions
- ✅ ADRs created for significant decisions
- ✅ All 5 phases completed in order
- ✅ Bonus points earned: +200 for Reusable Intelligence

---

**Built for**: Hackathon II - Todo Spec-Driven Development
**Architecture**: Hierarchical Multi-Agent Orchestration
**Workflow**: Spec-Driven Development (SDD)
**Goal**: Excellence in AI-Native Software Development 🚀
