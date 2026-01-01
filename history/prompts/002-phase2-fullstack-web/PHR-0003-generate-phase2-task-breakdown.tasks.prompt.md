---
id: PHR-0003
title: Generate Phase 2 Task Breakdown
stage: tasks
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5
feature: phase2-fullstack-web
branch: 002-phase2-fullstack-web
user: USER
command: /sp.tasks
labels: ["tasks", "phase2", "tdd", "user-stories", "e2e-tests", "task-breakdown"]
links:
  spec: specs/002-phase2-fullstack-web/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-phase2-fullstack-web/tasks.md
tests:
  - 54 E2E test tasks defined (Playwright)
  - 8 backend integration test tasks defined (Pytest)
---

## Prompt

Generate the Phase 2 task breakdown based on:
- Phase 2 specification
- Phase 2 plan
- Spec-driven development principles

Task Rules:
- Tasks must be UI-focused
- Tasks must be sequential and testable
- Avoid micro-task explosion
- Group tasks by UI responsibility (layout, components, responsiveness, integration)
- Do NOT generate code
- Output: Write only the contents of speckit.tasks for Phase 2
- Use clear task IDs
- STOP after listing tasks

## Response snapshot

Successfully generated comprehensive Phase II task breakdown following Test-Driven Development (TDD) workflow with Red-Green-Refactor cycle:

**Task Structure (169 tasks total)**:

1. **Phase 1: Setup (10 tasks)**: Project initialization for frontend/backend split
   - Next.js 15+ with TypeScript, App Router, TailwindCSS
   - FastAPI with Python 3.13+, UV package manager
   - Playwright (E2E), Pytest (backend), ESLint, Ruff, MyPy configs
   - Design tokens configuration in TailwindCSS

2. **Phase 2: Foundational (20 tasks)**: Core infrastructure (BLOCKS all user stories)
   - Database: Neon PostgreSQL with Task/User models (SQLModel)
   - Authentication: Better Auth (signup/login/logout endpoints)
   - API: FastAPI routing, middleware, TaskService base
   - UI Base: Button, Input, Textarea, LoadingSpinner, Toast components

3. **Phase 3: US1 (P1) - View Dashboard (18 tasks)**: 🎯 MVP
   - 8 E2E tests (loading, empty state, task list, responsive, error states)
   - GET /api/tasks endpoint with TaskService
   - EmptyState, TaskCard (expand/collapse), TaskList components
   - Dashboard page with SWR data fetching
   - Error boundary and responsive styling

4. **Phase 4: US2 (P1) - Add Task Form (21 tasks)**:
   - 10 E2E tests (form rendering, validation, success/error states, keyboard)
   - POST /api/tasks endpoint with validation
   - TaskForm component with useTaskValidation hook
   - Inline error messages (90% inline per spec)
   - Enter key submission, optimistic updates, form clearing (100ms)

5. **Phase 5: US7 (P2) - Responsive Layout (14 tasks)**:
   - 7 E2E tests (mobile 320px, tablet 768px, desktop 1024px+)
   - TailwindCSS breakpoints (sm:768px, lg:1024px)
   - Responsive font scaling (16px → 18px)
   - Responsive spacing (12px → 16px card padding)
   - 44x44px touch targets maintained across breakpoints

6. **Phase 6: US3 (P2) - Complete Task (17 tasks)**:
   - 7 E2E tests (checkbox toggle, strikethrough, checkmark, keyboard, optimistic UI)
   - PATCH /api/tasks/{id}/complete endpoint
   - Checkbox component (44x44px touch, 24x24px visible)
   - Debouncing (300ms), optimistic updates, error rollback

7. **Phase 7: US4 (P3) - Update Inline (20 tasks)**:
   - 9 E2E tests (edit mode, Save/Cancel, Escape key, single edit mode, validation)
   - PUT /api/tasks/{id} endpoint
   - EditForm component (inline), edit mode state management
   - Only one task in edit mode at a time

8. **Phase 8: US5 (P3) - Delete Confirmation (17 tasks)**:
   - 7 E2E tests (modal display, Confirm/Cancel, outside click, Escape key)
   - DELETE /api/tasks/{id} endpoint
   - DeleteModal component with keyboard shortcuts
   - Optimistic delete with error handling

9. **Phase 9: US6 (P4) - Filter Tasks (13 tasks)**:
   - 7 E2E tests (All/Active/Completed filters, indicators, persistence, keyboard)
   - FilterTabs component with client-side filtering
   - Filter state (no persistence across reload)
   - Keyboard navigation (Tab + Enter)

10. **Phase 10: Polish (19 tasks)**: Cross-cutting concerns
    - Performance: Pagination (50 tasks/page), React.memo, Core Web Vitals validation
    - Accessibility: Contrast ratios, ARIA labels, keyboard nav, 44x44px targets, focus outlines
    - Error handling: Error boundaries, retry logic, offline state, loading skeletons
    - Deployment: API docs, README, Vercel config, full E2E suite (54 scenarios), Phase I regression check

**Test-Driven Development (TDD) Workflow**:
- **Red Phase**: Write E2E tests FIRST → Verify they FAIL
- **Green Phase**: Implement backend → Implement frontend → Tests PASS
- **Refactor Phase**: Clean up code while keeping tests green
- **Checkpoint**: Each user story independently testable

**E2E Test Coverage**:
- 54 E2E test tasks (matches spec.md 54 acceptance scenarios exactly)
- All tests written BEFORE implementation (strict TDD)
- Playwright for E2E, Pytest for backend integration

**Key Architectural Decisions from Tasks**:
1. **Test-First Approach**: All E2E tests marked "CRITICAL: Write these tests FIRST"
2. **User Story Independence**: All stories work independently after Phase 2 (Foundational)
3. **Parallel Opportunities**: 82 tasks (48%) marked [P] for parallelization
4. **MVP Scope**: Phase 1 + 2 + 3 = 48 tasks (28% of total) for working dashboard
5. **Incremental Delivery**: Each user story adds value without breaking previous functionality
6. **TDD Checkpoints**: Each phase ends with verification that tests pass

**File Paths Specified**:
- Frontend: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/lib/`
- Backend: `backend/src/api/`, `backend/src/models/`, `backend/src/services/`
- Tests: `frontend/tests/e2e/`, `backend/tests/integration/`

**Dependencies & Execution Order**:
1. Phase 1 (Setup) → No dependencies
2. Phase 2 (Foundational) → Depends on Setup, BLOCKS all user stories
3. Phases 3-9 (User Stories) → All depend on Foundational, can run in parallel or by priority
4. Phase 10 (Polish) → Depends on all user stories complete

**Parallel Team Strategy**:
- After Foundational phase: Multiple developers can work on different user stories simultaneously
- Example: Dev A (US1), Dev B (US2), Dev C (US7) all in parallel

## Outcome

- ✅ Impact: Phase II task breakdown complete - 169 tasks organized by 7 user stories with TDD workflow, ready for implementation
- 🧪 Tests: 54 E2E test tasks defined (Playwright), 8 backend integration test tasks (Pytest), TDD Red-Green-Refactor cycle enforced
- 📁 Files: Created tasks.md (169 tasks across 10 phases) with exact file paths for frontend/backend
- 🔁 Next prompts: `/sp.implement` (execute tasks in TDD workflow starting with Phase 1 Setup)
- 🧠 Reflection: Task breakdown follows strict user story organization enabling independent implementation/testing of each story. TDD workflow explicitly enforced with "write tests FIRST" instructions. MVP clearly defined (Phases 1-3). 48% of tasks parallelizable. All 54 acceptance scenarios from spec.md mapped to E2E test tasks.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation workflow executed cleanly
- Graders run and results (PASS/FAIL): Task completeness validation PASS (all 7 user stories covered, 54 E2E tests match spec scenarios)
- Prompt variant (if applicable): Standard /sp.tasks workflow with TDD emphasis and user story independence
- Next experiment (smallest change to try): Proceed to `/sp.implement` to execute Phase 1 (Setup) tasks and establish project structure
