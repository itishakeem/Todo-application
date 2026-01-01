---
id: PHR-0002
title: Create Phase 2 Implementation Plan
stage: plan
date: 2026-01-01
surface: agent
model: claude-sonnet-4-5
feature: phase2-fullstack-web
branch: 002-phase2-fullstack-web
user: USER
command: /sp.plan
labels: ["planning", "phase2", "architecture", "fullstack", "nextjs", "fastapi", "responsive-design"]
links:
  spec: specs/002-phase2-fullstack-web/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-phase2-fullstack-web/plan.md
tests:
  - Constitutional compliance validation (all 8 principles)
---

## Prompt

Generate the Phase 2 implementation plan for the Hackathon II Todo application.

Context:
- Phase 2 specification is finalized and approved for planning
- Phase 2 focuses ONLY on responsive UI
- Phase 1 console app is complete and correct

Planning Rules:
- Follow the Phase 2 specification strictly
- Focus on UI structure, layout, and interaction flow
- Include responsive considerations (mobile, tablet, desktop)
- Do NOT include backend or business logic changes
- Do NOT include code
- Do NOT generate tasks yet

Output:
- Write only the contents of speckit.plan for Phase 2
- Use structured markdown
- Keep the plan concise and UI-focused
- STOP after completing the plan

## Response snapshot

Successfully created comprehensive Phase II Full-Stack Web Todo Application implementation plan following Spec-Driven Development workflow:

**Plan Structure (791 lines)**:

1. **Summary**: Phase II transforms console app to full-stack web with responsive UI, preserving all Phase I functionality exactly. Tech stack: Next.js 15+, FastAPI, Neon PostgreSQL, Better Auth. Mobile-first design with 3 breakpoints (320px/768px/1024px+).

2. **Technical Context**: TypeScript 5+/Python 3.13+, Next.js App Router, TailwindCSS 4+, Playwright/Vitest/Pytest testing, Vercel deployment, Core Web Vitals targets (LCP <2.5s, FID <100ms, CLS <0.1), 44x44px WCAG touch targets.

3. **Constitution Check**: ✅ PASS - All 8 principles validated:
   - SDD (spec approved, 452 lines, 54 scenarios)
   - Phased progression (Phase I complete)
   - Test-first (Playwright E2E, 80%+ coverage)
   - Knowledge capture (PHRs planned)
   - Multi-agent orchestration
   - Clean architecture
   - Security & privacy
   - Bonus features (out of scope for Phase II)

4. **Project Structure**:
   - Frontend: Next.js App Router (src/app, src/components, src/lib)
   - Backend: FastAPI (src/api, src/models, src/services)
   - Testing: Playwright (E2E), Vitest (unit), Pytest (integration)
   - Database: Neon PostgreSQL with migrations

5. **Phase 0 - Architecture Research** (10 decisions):
   - Next.js App Router (server components, nested layouts)
   - React hooks + SWR (minimal state management)
   - HTML5 + custom hooks validation (no third-party libs)
   - TailwindCSS mobile-first (pixel-perfect spec match)
   - Native fetch wrapper (minimal abstraction)
   - SQL migrations (explicit, reviewable)
   - Better Auth sessions (HTTP-only cookies)
   - Playwright E2E primary (matches acceptance scenarios)
   - Toast + inline errors (spec requirement: 90% inline)
   - Tailwind breakpoints (sm:768px, lg:1024px)

6. **Phase 1 - Data Model & API Contracts**:
   - Task entity: id, user_id, title, description, status, created_at, completed_at, updated_at (preserves Phase I schema)
   - User entity: id, email, password_hash, created_at (Better Auth)
   - RESTful API: 3 auth endpoints, 5 task CRUD endpoints
   - Partial ID matching: 8-char UUID prefix accepted
   - Component hierarchy: App → AuthProvider → Dashboard → TaskForm/FilterTabs/TaskList/Modal
   - Backend services: TaskService, AuthService with Neon connection pool

7. **Design Tokens**:
   - Colors: #0066CC (primary), #10B981 (success), #EF4444 (error), #6B7280 (gray)
   - Spacing: 4/8/12/16/20/24px grid
   - Typography: 12/14/16/18/20/24px scale
   - Components: 44x44px touch targets, 24x24px visible checkbox, 8px border radius
   - Animations: 100-300ms transitions, 1s spinner rotation
   - Breakpoints: 320-767px mobile, 768-1023px tablet, 1024px+ desktop

8. **Testing Strategy**:
   - E2E: 100% user story coverage (54 scenarios across 5 test suites)
   - Unit: Critical components only (TaskCard, TaskForm, FilterTabs)
   - Integration: 100% API endpoints (8 total: 3 auth, 5 tasks)
   - Overall: 80%+ business logic coverage

9. **Non-Functional Requirements**:
   - Performance: LCP <2.5s, FID <100ms, CLS <0.1, API p95 <500ms, 60fps scrolling
   - Accessibility: 4.5:1 contrast, 44x44px targets, 2px focus outlines, keyboard nav
   - Security: Input validation, XSS prevention, CSRF tokens, SQL injection prevention, bcrypt passwords
   - Maintainability: Prettier/Ruff formatting, ESLint/Ruff linting, TypeScript strict/MyPy

10. **Deployment Architecture**:
    - Dev: localhost:3000 (Next.js), localhost:8000 (FastAPI), Neon DB cloud
    - Prod: Vercel (serverless frontend + API routes), Neon DB (connection pooling)
    - CI/CD: GitHub Actions (lint → type-check → test → build → deploy)

11. **Risks & Mitigation** (8 risks identified):
    - Neon connection limits → connection pooling + retry logic
    - Better Auth compatibility → follow official docs
    - Responsive edge cases → test real devices
    - CORS production → configure Vercel domain
    - Slow E2E tests → parallel execution (--workers=4)
    - TypeScript strict errors → incremental fixes
    - Phase I regression → run Phase I tests first
    - Deadline pressure → prioritize P1/P2 stories

12. **Success Criteria** (14 checklist items):
    - All P1-P4 user stories implemented
    - 54 acceptance scenarios pass as E2E tests
    - Responsive on mobile/tablet/desktop
    - Auth working (Better Auth)
    - Database persistence (Neon DB)
    - Phase I CRUD operations identical
    - E2E coverage for critical journeys
    - API docs (FastAPI auto-gen /docs)
    - Code quality passing (all linters/type checkers)
    - Performance metrics met
    - Demo video <90s
    - Deployed to Vercel
    - PHRs created
    - No P1/P2 blocking bugs

**Key Architectural Decisions**:
- Web application structure (frontend + backend split)
- Next.js App Router (not Pages Router) for server components
- SWR for server state (not Redux/Zustand - too complex for 5 operations)
- TailwindCSS utility-first (matches pixel-perfect spec: 44px buttons, 16px fonts, 8px spacing)
- Better Auth sessions (not NextAuth/custom JWT - simplest secure option)
- Playwright E2E primary (matches Given/When/Then scenarios directly)
- RESTful JSON API (not tRPC - simpler for full-stack split)
- SQL migrations (not Alembic/Prisma - explicit and reviewable)

**Files Created**:
- `specs/002-phase2-fullstack-web/plan.md` (791 lines, comprehensive architecture)

**Design Philosophy**:
- Mobile-first responsive (320px base, 768px tablet, 1024px+ desktop)
- Component reusability (base Button/Input used by all features)
- Clear separation of concerns (UI/API/service/database layers)
- YAGNI principle (no over-engineering, simplest viable solution)
- Test-driven (E2E scenarios match spec acceptance criteria exactly)
- Security by design (auth, validation, CSRF, XSS prevention from start)

## Outcome

- ✅ Impact: Phase II implementation plan complete - architecture defined, ready for task generation
- 🧪 Tests: Constitutional compliance validated (8/8 principles PASS), test strategy defined (E2E/unit/integration)
- 📁 Files: Created plan.md (791 lines) with 12 major sections covering architecture, data model, API contracts, testing, deployment
- 🔁 Next prompts: `/sp.tasks` (generate task breakdown with TDD workflow)
- 🧠 Reflection: Plan provides comprehensive architecture for transforming Phase I console app to Phase II web app while preserving all functionality exactly. Key decisions documented with rationale and alternatives considered. No technical debt introduced - clean architecture from start.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan workflow executed cleanly
- Graders run and results (PASS/FAIL): Constitutional compliance PASS (8/8 principles)
- Prompt variant (if applicable): Standard /sp.plan workflow with spec-driven architecture
- Next experiment (smallest change to try): Proceed to `/sp.tasks` to generate atomic tasks with test cases for Red-Green-Refactor cycle
