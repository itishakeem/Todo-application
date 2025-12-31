---
id: PHR-0003
title: Generate Phase1 Task Breakdown
stage: tasks
date: 2025-12-30
surface: agent
model: claude-sonnet-4-5
feature: 001-phase1-console-app
branch: 001-phase1-console-app
user: Abdul Hakeem
command: /sp.tasks
labels: ["tasks", "tdd", "phase1", "console-app", "test-driven-development", "implementation-plan"]
links:
  spec: specs/001-phase1-console-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-phase1-console-app/tasks.md
tests:
  - none
---

## Prompt

/sp.task Generate the task breakdown for Phase I based on:
- speckit.constitution
- Phase I specification
- Phase I plan

Rules:
- Tasks must be small, sequential, and testable
- Each task should result in a meaningful increment
- No task should mix responsibilities
- Do NOT generate code

Output:
- Write only the contents of speckit.tasks for Phase I
- Use clear task IDs (TASK-01, TASK-02, etc.)
- Stop after listing tasks

## Response snapshot

Created comprehensive task breakdown for Phase I Console Todo Application with 113 atomic, testable tasks organized by user story priority following strict Test-Driven Development (TDD) workflow.

**Task Organization (11 Phases)**:

**Phase 1: Setup (6 tasks)**
- Project structure creation (TASK-001)
- UV initialization and pyproject.toml (TASK-002)
- Dev dependencies: pytest, pytest-cov, mypy, ruff (TASK-003)
- Tool configuration in pyproject.toml (TASK-004 to TASK-006)

**Phase 2: Foundational (5 tasks, CRITICAL BLOCKER)**
- Todo model test stubs (TASK-007)
- Todo dataclass implementation (TASK-008 to TASK-010)
- Todo model validation (TASK-011)
- Blocks ALL user stories until complete

**Phase 3: US1 - Add New Todo (18 tasks, P1 Priority, MVP)**
- Red Phase: Storage tests for add() with validation (TASK-012 to TASK-015)
- Green Phase: TodoStorage.add() implementation (TASK-016 to TASK-019)
- UI Layer: ConsoleUI display and prompt methods (TASK-020 to TASK-024)
- Integration: Main app menu option 1 handler (TASK-025 to TASK-029)

**Phase 4: US2 - View All Todos (12 tasks, P2 Priority)**
- Red Phase: Storage tests for get_all() with sorting (TASK-030 to TASK-032)
- Green Phase: TodoStorage.get_all() implementation (TASK-033 to TASK-034)
- UI Layer: ConsoleUI.display_todos() with formatting (TASK-035 to TASK-038)
- Integration: Menu option 2 handler (TASK-039 to TASK-041)

**Phase 5: US3 - Mark Complete (14 tasks, P3 Priority)**
- Red Phase: Storage tests for mark_complete() with partial UUID (TASK-042 to TASK-046)
- Green Phase: TodoStorage.get_by_id() + mark_complete() (TASK-047 to TASK-049)
- UI Layer: ConsoleUI.prompt_todo_id() validation (TASK-050 to TASK-052)
- Integration: Menu option 3 handler (TASK-053 to TASK-055)

**Phase 6: US4 - Update Text (10 tasks, P4 Priority)**
- Red Phase: Storage tests for update_text() with validation (TASK-056 to TASK-060)
- Green Phase: TodoStorage.update_text() implementation (TASK-061 to TASK-062)
- Integration: Menu option 4 handler (TASK-063 to TASK-065)

**Phase 7: US5 - Delete Todo (9 tasks, P5 Priority)**
- Red Phase: Storage tests for delete() with idempotency (TASK-066 to TASK-069)
- Green Phase: TodoStorage.delete() implementation (TASK-070 to TASK-071)
- Integration: Menu option 5 handler (TASK-072 to TASK-074)

**Phase 8: US6 - Exit Application (15 tasks, P1 Priority)**
- Red Phase: UI tests for menu display and exit (TASK-075 to TASK-078)
- Green Phase: ConsoleUI menu methods (TASK-079 to TASK-082)
- Main Loop: Infinite menu loop with routing (TASK-083 to TASK-086)
- Integration: Exit and Ctrl+C handling tests (TASK-087 to TASK-089)

**Phase 9: Edge Cases (6 tasks)**
- Integration tests for all spec edge cases (TASK-090 to TASK-095)
- Empty text, >200 chars, invalid menu, invalid ID, 100 todos

**Phase 10: Code Quality (9 tasks)**
- Docstrings: Google style for all modules (TASK-096 to TASK-099)
- Quality gates: mypy, ruff check, ruff format (TASK-100 to TASK-102)
- Coverage: pytest with 100% target (TASK-103 to TASK-104)

**Phase 11: Final Validation (9 tasks)**
- Manual testing: All CRUD operations (TASK-105 to TASK-111)
- Demo video recording <90 seconds (TASK-112)
- Phase transition validation (TASK-113)

**TDD Workflow Enforcement**:
- All test tasks explicitly marked as "Red Phase - Write First, Ensure FAIL"
- Implementation tasks marked as "Green Phase" following test creation
- Clear Red → Green → Refactor sequence for each user story
- Tests must be written and verified to fail before any implementation begins

**Parallel Execution Opportunities**:
- Phase 1 Setup: Tasks 003-006 (different config files)
- Within user stories: Test file creation, model creation (marked with [P])
- Across user stories: After Phase 2, US1-US5 can be parallel (multi-dev teams)
- Phase 10 Quality: Tasks 096-099 (different files)

**Dependencies**:
- Phase 2 (Foundational) blocks ALL user stories
- User stories can proceed sequentially (P1→P2→P3→P4→P5) or in parallel after Phase 2
- Edge cases depend on all user stories complete
- Quality and validation phases must be last

**Task Characteristics**:
- Atomic: Each task is independently committable
- Testable: Each task has clear pass/fail criteria
- File-isolated: [P] tasks modify different files (true parallelism)
- Traceable: [US1-US6] labels map tasks to user stories
- Sequential: Dependencies explicit, execution order clear

## Outcome

- ✅ Impact: Created complete task breakdown (tasks.md, 500+ lines) with 113 atomic tasks organized in 11 phases following TDD Red-Green-Refactor workflow. All 6 user stories mapped to task sequences with clear test-first approach. Setup (6), Foundation (5), User Stories (83), Edge Cases (6), Quality (9), Validation (9).
- 🧪 Tests: 68+ test tasks defined across unit and integration test files, all marked for Red phase execution before implementation
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: Begin implementation with /sp.implement, or create ADRs first with /sp.adr for architectural decisions
- 🧠 Reflection: Task breakdown successfully translates plan.md architecture into executable work units while maintaining strict TDD discipline. Each user story has independent test/implement/integrate sequence enabling incremental delivery. Phase 2 (Foundational) correctly identified as blocker for all user stories. Parallel opportunities marked where tasks touch different files. All 113 tasks are atomic, testable, and traceable to spec requirements.

## Evaluation notes (flywheel)

- Failure modes observed: None - tasks template followed correctly, all user stories covered, TDD workflow enforced
- Graders run and results (PASS/FAIL): PASS - All 6 user stories from spec mapped to task phases, TDD Red-Green-Refactor sequence clear, no code included (tasks only), test-first approach explicit, sequential dependencies identified, parallel opportunities marked with [P], file paths match plan.md structure
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor task execution during implementation to identify if any tasks are too large (>1 hour work) or too granular (<15 min work). Adjust task granularity in future iterations based on actual implementation time. Track whether Red phase verification (tests must fail) is consistently enforced.
