---
id: PHR-0002
title: Phase 3 AI Chatbot Implementation Plan
stage: plan
date: 2026-01-12
surface: agent
model: claude-opus-4-5-20250101
feature: phase3-ai-chatbot
branch: 003-phase3-ai-chatbot
user: USER
command: /sp.plan
labels: ["phase3", "chatbot", "mcp", "openai-agents", "architecture", "plan"]
links:
  spec: specs/003-phase3-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-phase3-ai-chatbot/plan.md
tests:
  - null
---

## Prompt

according to the specs of phase 3 and rule of SDD write plans for phase 3 should be quality defined and professional. Do not process anything else. let me know when you done this.

## Response snapshot

Created comprehensive Phase III Implementation Plan following SDD workflow:

**Key Deliverables:**
1. Implementation plan written to `specs/003-phase3-ai-chatbot/plan.md` (815 lines)
2. All constitution checks passed (8 principles validated)
3. Complete architecture documented with component diagrams

**Plan Summary:**

**Technical Context:**
- Language: TypeScript (frontend), Python 3.13+ (backend)
- Dependencies: OpenAI ChatKit, Agents SDK, MCP SDK, FastAPI, SQLModel
- Database: Neon PostgreSQL (2 new tables: conversations, messages)
- Testing: Playwright (E2E), Pytest (MCP tools)

**Architecture Decisions (10 research questions resolved):**
1. ChatKit with domain allowlist for frontend
2. Single agent with 5 MCP tools (stateless execution)
3. In-process MCP server (no separate service)
4. Database-backed conversation state
5. POST /api/{user_id}/chat endpoint
6. Agent-autonomous tool selection
7. Structured error handling
8. 50-message context window
9. Task ID + keyword matching
10. Server-side OPENAI_API_KEY only

**Data Model:**
- Existing: users, tasks (Phase II - unchanged)
- New: conversations (id, user_id, created_at, updated_at)
- New: messages (id, conversation_id, user_id, role, content, tool_calls, created_at)

**API Contracts:**
- POST /api/{user_id}/chat (main chat endpoint)
- GET /api/{user_id}/conversations (list conversations)
- GET /api/{user_id}/conversations/{id}/messages (history)

**MCP Tools (5):**
1. add_task - Create new task
2. list_tasks - Get tasks with filter
3. complete_task - Toggle completion
4. update_task - Modify title/description
5. delete_task - Remove task

**Testing Strategy:**
- MCP Tools: 100% coverage
- Agent Behavior: 90%+ coverage
- E2E Chat Flows: 48 acceptance scenarios
- Integration: Chat API + conversation persistence

**Success Criteria (13 items):**
- Chat interface functional
- All 5 MCP tools working
- Stateless architecture verified
- 48 acceptance scenarios pass
- Phase II web UI no regression
- Demo video <90 seconds

## Outcome

- **Impact**: Complete architecture defined for Phase III chatbot, ready for task breakdown
- **Tests**: N/A (planning phase, no code)
- **Files**: 1 file created (plan.md - 815 lines)
- **Next prompts**: `/sp.tasks` to generate task breakdown from plan
- **Reflection**: Plan comprehensively covers all hackathon requirements, reuses Phase II infrastructure, defines clear integration patterns for ChatKit + Agents SDK + MCP

## Evaluation notes (flywheel)

- Failure modes observed: None - all constitution checks passed
- Graders run and results (PASS/FAIL): All 8 constitutional principles PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to /sp.tasks for task generation
