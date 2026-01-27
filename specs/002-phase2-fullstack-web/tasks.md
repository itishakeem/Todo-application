---
description: "Phase II Full-Stack Web Todo Application - Task Breakdown"
---

# Tasks: Phase II Full-Stack Web Todo Application

**Input**: Design documents from `/specs/002-phase2-fullstack-web/`
**Prerequisites**: plan.md ✅, spec.md ✅

**Tests**: TDD approach with Playwright E2E tests (Red-Green-Refactor workflow)

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/`
- **Tests**: `frontend/tests/e2e/`, `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure for frontend/backend split

- [ ] T001 Create project directory structure (frontend/, backend/, shared configs)
- [ ] T002 Initialize Next.js 15+ project in frontend/ with TypeScript, App Router, TailwindCSS
- [ ] T003 Initialize FastAPI project in backend/ with Python 3.13+, UV package manager
- [ ] T004 [P] Configure ESLint, Prettier for frontend in frontend/.eslintrc.json
- [ ] T005 [P] Configure Ruff, MyPy for backend in backend/pyproject.toml
- [ ] T006 [P] Setup Playwright in frontend/tests/e2e/playwright.config.ts
- [ ] T007 [P] Setup Pytest in backend/tests/pytest.ini
- [ ] T008 Create .env.example files for frontend and backend with required variables
- [ ] T009 [P] Configure TailwindCSS with design tokens in frontend/tailwind.config.ts
- [ ] T010 Create shared type definitions in frontend/src/types/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Models

- [ ] T011 Setup Neon PostgreSQL database connection in backend/src/db/connection.py
- [ ] T012 Create SQL migration for tasks table in backend/migrations/001_create_tasks.sql
- [ ] T013 Create SQL migration for users table in backend/migrations/002_create_users.sql
- [ ] T014 [P] Implement Task model with SQLModel in backend/src/models/task.py
- [ ] T015 [P] Implement User model with SQLModel in backend/src/models/user.py

### Authentication Framework

- [ ] T016 Setup Better Auth configuration in frontend/src/lib/auth.ts
- [ ] T017 Implement signup endpoint in backend/src/api/auth.py (POST /api/auth/signup)
- [ ] T018 Implement login endpoint in backend/src/api/auth.py (POST /api/auth/login)
- [ ] T019 Implement logout endpoint in backend/src/api/auth.py (POST /api/auth/logout)
- [ ] T020 Create authentication middleware in backend/src/middleware/auth.py
- [ ] T021 Create AuthProvider context in frontend/src/lib/AuthProvider.tsx

### API Foundation

- [ ] T022 Setup FastAPI app with CORS in backend/src/main.py
- [ ] T023 Create API client wrapper with fetch in frontend/src/lib/api.ts
- [ ] T024 Implement TaskService base class in backend/src/services/task_service.py
- [ ] T025 Implement error handling middleware in backend/src/middleware/errors.py

### Base UI Components

- [ ] T026 [P] Create Button component (primary/secondary/danger) in frontend/src/components/ui/Button.tsx
- [ ] T027 [P] Create Input component with validation states in frontend/src/components/ui/Input.tsx
- [ ] T028 [P] Create Textarea component in frontend/src/components/ui/Textarea.tsx
- [ ] T029 [P] Create LoadingSpinner component (inline/centered) in frontend/src/components/ui/LoadingSpinner.tsx
- [ ] T030 [P] Create Toast notification system in frontend/src/components/ui/Toast.tsx

**Checkpoint**: Foundation ready - user story implementation can begin in parallel

---

## Phase 3: User Story 1 - View Todo Dashboard (Priority: P1) 🎯 MVP

**Goal**: Display dashboard with all tasks, empty state, and loading states

**Independent Test**: User can navigate to / and see their task list or empty state

### E2E Tests for User Story 1 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T031 [P] [US1] E2E test: Dashboard renders with loading spinner in frontend/tests/e2e/dashboard.spec.ts
- [ ] T032 [P] [US1] E2E test: Dashboard shows empty state when no tasks in frontend/tests/e2e/dashboard.spec.ts
- [ ] T033 [P] [US1] E2E test: Dashboard displays task list with tasks in frontend/tests/e2e/dashboard.spec.ts
- [ ] T034 [P] [US1] E2E test: Task card shows title, description, status in frontend/tests/e2e/dashboard.spec.ts
- [ ] T035 [P] [US1] E2E test: Task ID displayed in bottom-left (12px gray) in frontend/tests/e2e/dashboard.spec.ts
- [ ] T036 [P] [US1] E2E test: Responsive layout mobile (320px) in frontend/tests/e2e/dashboard.spec.ts
- [ ] T037 [P] [US1] E2E test: Responsive layout desktop (1024px+) in frontend/tests/e2e/dashboard.spec.ts
- [ ] T038 [P] [US1] E2E test: Error state with toast notification in frontend/tests/e2e/dashboard.spec.ts

### Backend Implementation for User Story 1

- [ ] T039 [US1] Implement GET /api/tasks endpoint with filter param in backend/src/api/tasks.py
- [ ] T040 [US1] Add TaskService.get_all_tasks() method in backend/src/services/task_service.py
- [ ] T041 [US1] Add integration test for GET /api/tasks in backend/tests/integration/test_tasks.py

### Frontend Implementation for User Story 1

- [ ] T042 [P] [US1] Create EmptyState component in frontend/src/components/task/EmptyState.tsx
- [ ] T043 [P] [US1] Create TaskCard component with expand/collapse in frontend/src/components/task/TaskCard.tsx
- [ ] T044 [US1] Create TaskList component in frontend/src/components/task/TaskList.tsx
- [ ] T045 [US1] Create Dashboard page layout in frontend/src/app/page.tsx
- [ ] T046 [US1] Implement SWR data fetching hook in frontend/src/lib/hooks/useTasks.ts
- [ ] T047 [US1] Add error boundary for task list in frontend/src/components/task/TaskListErrorBoundary.tsx
- [ ] T048 [US1] Style TaskCard with TailwindCSS (8px radius, shadow, hover states)

**Checkpoint**: User Story 1 complete - dashboard displays tasks with responsive layout

---

## Phase 4: User Story 2 - Add Task via Web Form (Priority: P1)

**Goal**: User can add new tasks with title (required) and description (optional)

**Independent Test**: User can fill form, submit, and see new task appear within 500ms

### E2E Tests for User Story 2 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T049 [P] [US2] E2E test: Form renders with title and description fields in frontend/tests/e2e/add-task.spec.ts
- [ ] T050 [P] [US2] E2E test: Submit with valid title creates task in frontend/tests/e2e/add-task.spec.ts
- [ ] T051 [P] [US2] E2E test: Form clears within 100ms after success in frontend/tests/e2e/add-task.spec.ts
- [ ] T052 [P] [US2] E2E test: Success toast auto-dismisses after 3s in frontend/tests/e2e/add-task.spec.ts
- [ ] T053 [P] [US2] E2E test: Empty title shows inline error in frontend/tests/e2e/add-task.spec.ts
- [ ] T054 [P] [US2] E2E test: Title >100 chars shows inline error in frontend/tests/e2e/add-task.spec.ts
- [ ] T055 [P] [US2] E2E test: Description >500 chars shows inline error in frontend/tests/e2e/add-task.spec.ts
- [ ] T056 [P] [US2] E2E test: Enter key in title field submits form in frontend/tests/e2e/add-task.spec.ts
- [ ] T057 [P] [US2] E2E test: Loading state shows inline spinner on button in frontend/tests/e2e/add-task.spec.ts
- [ ] T058 [P] [US2] E2E test: API error shows toast with 5s duration in frontend/tests/e2e/add-task.spec.ts

### Backend Implementation for User Story 2

- [ ] T059 [US2] Implement POST /api/tasks endpoint in backend/src/api/tasks.py
- [ ] T060 [US2] Add TaskService.create_task() method in backend/src/services/task_service.py
- [ ] T061 [US2] Add validation for title (1-100 chars) and description (0-500 chars)
- [ ] T062 [US2] Add integration test for POST /api/tasks in backend/tests/integration/test_tasks.py

### Frontend Implementation for User Story 2

- [ ] T063 [P] [US2] Create TaskForm component in frontend/src/components/task/TaskForm.tsx
- [ ] T064 [P] [US2] Create validation hook useTaskValidation in frontend/src/lib/hooks/useTaskValidation.ts
- [ ] T065 [US2] Implement form submission with optimistic updates in TaskForm
- [ ] T066 [US2] Add inline error messages (90% errors inline per spec)
- [ ] T067 [US2] Add Enter key handler for title field (submit on Enter)
- [ ] T068 [US2] Add form clearing logic (within 100ms after API 200)
- [ ] T069 [US2] Style form with TailwindCSS (44px inputs, 16px font, 8px spacing)

**Checkpoint**: User Story 2 complete - users can add tasks via form with validation

---

## Phase 5: User Story 7 - Responsive Task Card Layout (Priority: P2)

**Goal**: Task cards adapt layout across mobile (320px+), tablet (768px+), desktop (1024px+)

**Independent Test**: Task card displays correctly on 320px, 768px, and 1280px viewports

### E2E Tests for User Story 7 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T070 [P] [US7] E2E test: Mobile layout (320px width, single column) in frontend/tests/e2e/responsive.spec.ts
- [ ] T071 [P] [US7] E2E test: Tablet layout (768px width, 100% - 32px padding) in frontend/tests/e2e/responsive.spec.ts
- [ ] T072 [P] [US7] E2E test: Desktop layout (1280px width, 800px max-width) in frontend/tests/e2e/responsive.spec.ts
- [ ] T073 [P] [US7] E2E test: Touch targets 44x44px with 8px spacing on mobile in frontend/tests/e2e/responsive.spec.ts
- [ ] T074 [P] [US7] E2E test: Font scales 16px mobile → 18px desktop in frontend/tests/e2e/responsive.spec.ts
- [ ] T075 [P] [US7] E2E test: Card padding 12px mobile → 16px desktop in frontend/tests/e2e/responsive.spec.ts
- [ ] T076 [P] [US7] E2E test: Action buttons horizontal on tablet/desktop in frontend/tests/e2e/responsive.spec.ts

### Frontend Implementation for User Story 7

- [ ] T077 [US7] Add TailwindCSS breakpoints (sm:768px, lg:1024px) to TaskCard
- [ ] T078 [US7] Implement mobile styles (320-767px) in TaskCard component
- [ ] T079 [US7] Implement tablet styles (768-1023px) in TaskCard component
- [ ] T080 [US7] Implement desktop styles (1024px+) in TaskCard component
- [ ] T081 [US7] Add responsive font sizing (16px → 18px body, 20px → 24px heading)
- [ ] T082 [US7] Add responsive spacing (12px → 16px card padding)
- [ ] T083 [US7] Ensure 44x44px touch targets maintained across all breakpoints

**Checkpoint**: User Story 7 complete - responsive layouts working on all device sizes

---

## Phase 6: User Story 3 - Mark Task Complete (Priority: P2)

**Goal**: User can toggle task completion status via checkbox with visual feedback

**Independent Test**: Click checkbox to complete task, verify strikethrough + green checkmark appear

### E2E Tests for User Story 3 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T084 [P] [US3] E2E test: Click checkbox completes task with strikethrough in frontend/tests/e2e/complete-task.spec.ts
- [ ] T085 [P] [US3] E2E test: Completed task shows green checkmark icon in frontend/tests/e2e/complete-task.spec.ts
- [ ] T086 [P] [US3] E2E test: Click checkbox again uncompletes task in frontend/tests/e2e/complete-task.spec.ts
- [ ] T087 [P] [US3] E2E test: Optimistic UI updates within 300ms in frontend/tests/e2e/complete-task.spec.ts
- [ ] T088 [P] [US3] E2E test: Debouncing prevents double-click issues in frontend/tests/e2e/complete-task.spec.ts
- [ ] T089 [P] [US3] E2E test: Keyboard space key toggles completion in frontend/tests/e2e/complete-task.spec.ts
- [ ] T090 [P] [US3] E2E test: API error reverts optimistic update in frontend/tests/e2e/complete-task.spec.ts

### Backend Implementation for User Story 3

- [ ] T091 [US3] Implement PATCH /api/tasks/{id}/complete endpoint in backend/src/api/tasks.py
- [ ] T092 [US3] Add TaskService.toggle_completion() method in backend/src/services/task_service.py
- [ ] T093 [US3] Add logic to set completed_at timestamp or null
- [ ] T094 [US3] Add integration test for PATCH /api/tasks/{id}/complete in backend/tests/integration/test_tasks.py

### Frontend Implementation for User Story 3

- [ ] T095 [P] [US3] Create Checkbox component (44x44px touch, 24x24px visible) in frontend/src/components/ui/Checkbox.tsx
- [ ] T096 [US3] Add debounce logic (300ms) to checkbox toggle handler
- [ ] T097 [US3] Implement optimistic UI updates with SWR mutate
- [ ] T098 [US3] Add strikethrough + green checkmark styling for completed state
- [ ] T099 [US3] Add keyboard handler for Space key toggle
- [ ] T100 [US3] Add error rollback logic if API fails

**Checkpoint**: User Story 3 complete - task completion toggle working with visual feedback

---

## Phase 7: User Story 4 - Update Task Inline (Priority: P3)

**Goal**: User can edit task title/description inline via Edit button

**Independent Test**: Click Edit, modify fields, press Enter or click Save to update task

### E2E Tests for User Story 4 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T101 [P] [US4] E2E test: Click Edit button enters edit mode in frontend/tests/e2e/update-task.spec.ts
- [ ] T102 [P] [US4] E2E test: Edit mode shows title and description inputs in frontend/tests/e2e/update-task.spec.ts
- [ ] T103 [P] [US4] E2E test: Save button updates task and exits edit mode in frontend/tests/e2e/update-task.spec.ts
- [ ] T104 [P] [US4] E2E test: Cancel button discards changes in frontend/tests/e2e/update-task.spec.ts
- [ ] T105 [P] [US4] E2E test: Escape key cancels edit mode in frontend/tests/e2e/update-task.spec.ts
- [ ] T106 [P] [US4] E2E test: Only one task in edit mode at a time in frontend/tests/e2e/update-task.spec.ts
- [ ] T107 [P] [US4] E2E test: Validation shows inline errors in edit mode in frontend/tests/e2e/update-task.spec.ts
- [ ] T108 [P] [US4] E2E test: Loading state on Save button during API call in frontend/tests/e2e/update-task.spec.ts
- [ ] T109 [P] [US4] E2E test: API error shows toast notification in frontend/tests/e2e/update-task.spec.ts

### Backend Implementation for User Story 4

- [ ] T110 [US4] Implement PUT /api/tasks/{id} endpoint in backend/src/api/tasks.py
- [ ] T111 [US4] Add TaskService.update_task() method in backend/src/services/task_service.py
- [ ] T112 [US4] Add validation for title/description updates
- [ ] T113 [US4] Add integration test for PUT /api/tasks/{id} in backend/tests/integration/test_tasks.py

### Frontend Implementation for User Story 4

- [ ] T114 [P] [US4] Create EditForm component (inline) in frontend/src/components/task/EditForm.tsx
- [ ] T115 [US4] Add edit mode state management to TaskCard
- [ ] T116 [US4] Add logic to allow only one task in edit mode at a time
- [ ] T117 [US4] Add Escape key handler to cancel edit mode
- [ ] T118 [US4] Implement Save handler with validation
- [ ] T119 [US4] Implement Cancel handler with state reset
- [ ] T120 [US4] Style edit mode with TailwindCSS (same inputs as TaskForm)

**Checkpoint**: User Story 4 complete - inline editing working with keyboard shortcuts

---

## Phase 8: User Story 5 - Delete Task with Confirmation (Priority: P3)

**Goal**: User can delete tasks with confirmation modal to prevent accidents

**Independent Test**: Click Delete, confirm in modal, verify task disappears

### E2E Tests for User Story 5 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T121 [P] [US5] E2E test: Click Delete button opens modal in frontend/tests/e2e/delete-task.spec.ts
- [ ] T122 [P] [US5] E2E test: Modal shows task title and confirmation message in frontend/tests/e2e/delete-task.spec.ts
- [ ] T123 [P] [US5] E2E test: Confirm button deletes task and closes modal in frontend/tests/e2e/delete-task.spec.ts
- [ ] T124 [P] [US5] E2E test: Cancel button closes modal without deleting in frontend/tests/e2e/delete-task.spec.ts
- [ ] T125 [P] [US5] E2E test: Click outside modal closes without deleting in frontend/tests/e2e/delete-task.spec.ts
- [ ] T126 [P] [US5] E2E test: Escape key closes modal without deleting in frontend/tests/e2e/delete-task.spec.ts
- [ ] T127 [P] [US5] E2E test: API error shows toast notification in frontend/tests/e2e/delete-task.spec.ts

### Backend Implementation for User Story 5

- [ ] T128 [US5] Implement DELETE /api/tasks/{id} endpoint in backend/src/api/tasks.py
- [ ] T129 [US5] Add TaskService.delete_task() method in backend/src/services/task_service.py
- [ ] T130 [US5] Add integration test for DELETE /api/tasks/{id} in backend/tests/integration/test_tasks.py

### Frontend Implementation for User Story 5

- [ ] T131 [P] [US5] Create DeleteModal component in frontend/src/components/task/DeleteModal.tsx
- [ ] T132 [US5] Add modal state management to Dashboard
- [ ] T133 [US5] Add outside click handler to close modal
- [ ] T134 [US5] Add Escape key handler to close modal
- [ ] T135 [US5] Implement Confirm handler with optimistic delete
- [ ] T136 [US5] Implement Cancel handler
- [ ] T137 [US5] Style modal with TailwindCSS (overlay, 400px desktop, 90% mobile)

**Checkpoint**: User Story 5 complete - task deletion with confirmation modal working

---

## Phase 9: User Story 6 - Filter Tasks by Status (Priority: P4)

**Goal**: User can filter tasks by All, Active, or Completed status

**Independent Test**: Click filter tabs, verify correct tasks shown

### E2E Tests for User Story 6 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T138 [P] [US6] E2E test: All filter shows all tasks (default) in frontend/tests/e2e/filter-tasks.spec.ts
- [ ] T139 [P] [US6] E2E test: Active filter shows only pending tasks in frontend/tests/e2e/filter-tasks.spec.ts
- [ ] T140 [P] [US6] E2E test: Completed filter shows only completed tasks in frontend/tests/e2e/filter-tasks.spec.ts
- [ ] T141 [P] [US6] E2E test: Active tab has blue underline indicator in frontend/tests/e2e/filter-tasks.spec.ts
- [ ] T142 [P] [US6] E2E test: Filter resets to All on page reload in frontend/tests/e2e/filter-tasks.spec.ts
- [ ] T143 [P] [US6] E2E test: Empty state shows when filtered list empty in frontend/tests/e2e/filter-tasks.spec.ts
- [ ] T144 [P] [US6] E2E test: Filter tabs keyboard accessible (Tab + Enter) in frontend/tests/e2e/filter-tasks.spec.ts

### Frontend Implementation for User Story 6

- [ ] T145 [P] [US6] Create FilterTabs component in frontend/src/components/task/FilterTabs.tsx
- [ ] T146 [US6] Add filter state management to Dashboard (local state, no persistence)
- [ ] T147 [US6] Implement client-side filtering logic in TaskList
- [ ] T148 [US6] Add keyboard navigation for filter tabs (Tab, Enter)
- [ ] T149 [US6] Style tabs with TailwindCSS (44px height, blue underline for active)
- [ ] T150 [US6] Add empty state handling for filtered lists

**Checkpoint**: User Story 6 complete - task filtering working with keyboard navigation

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

### Performance Optimization

- [ ] T151 [P] Add pagination (50 tasks/page) to TaskList component
- [ ] T152 [P] Optimize re-renders with React.memo on TaskCard
- [ ] T153 [P] Add image optimization for logo/icons
- [ ] T154 Validate Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

### Accessibility Audit

- [ ] T155 [P] Verify 4.5:1 contrast ratios on all text
- [ ] T156 [P] Add ARIA labels to interactive elements
- [ ] T157 [P] Test keyboard navigation flow (Tab order logical)
- [ ] T158 Verify 44x44px touch targets across all components
- [ ] T159 Add 2px focus outlines to all focusable elements

### Error Handling & Edge Cases

- [ ] T160 [P] Add error boundary to Dashboard page
- [ ] T161 [P] Add retry logic for failed API calls (3 retries with exponential backoff)
- [ ] T162 [P] Handle network offline state with toast notification
- [ ] T163 Add loading skeletons for better perceived performance

### Documentation & Deployment

- [ ] T164 [P] Create API documentation with FastAPI /docs endpoint
- [ ] T165 [P] Update README.md with setup instructions
- [ ] T166 [P] Create .env.example with all required variables
- [ ] T167 Setup Vercel deployment configuration in vercel.json
- [ ] T168 Run full E2E test suite (all 54 scenarios)
- [ ] T169 Validate Phase 1 console app still works (no regression)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - Can proceed in parallel (if team capacity allows)
  - Or sequentially in priority order: US1 (P1) → US2 (P1) → US7 (P2) → US3 (P2) → US4 (P3) → US5 (P3) → US6 (P4)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

All user stories are **independent** after Foundational phase completes:

- **US1 (P1) - View Dashboard**: Can start after Phase 2 - **MVP candidate**
- **US2 (P1) - Add Task Form**: Can start after Phase 2 - Integrates with US1 TaskList
- **US7 (P2) - Responsive Layout**: Can start after Phase 2 - Enhances TaskCard from US1
- **US3 (P2) - Complete Task**: Can start after Phase 2 - Adds checkbox to US1 TaskCard
- **US4 (P3) - Update Inline**: Can start after Phase 2 - Adds edit mode to US1 TaskCard
- **US5 (P3) - Delete Task**: Can start after Phase 2 - Adds delete to US1 TaskCard
- **US6 (P4) - Filter Tasks**: Can start after Phase 2 - Adds filtering to US1 TaskList

### Within Each User Story (TDD Workflow)

1. **Red**: Write E2E tests FIRST → Verify they FAIL
2. **Green**: Implement backend → Implement frontend → Tests PASS
3. **Refactor**: Clean up code while keeping tests green
4. **Checkpoint**: Story independently testable and complete

### Parallel Opportunities

#### Phase 1 (Setup)
```bash
# Can run in parallel:
T004 (ESLint), T005 (Ruff), T006 (Playwright), T007 (Pytest), T009 (Tailwind), T010 (Types)
```

#### Phase 2 (Foundational)
```bash
# Models can run in parallel:
T014 (Task model), T015 (User model)

# Base UI components can run in parallel:
T026 (Button), T027 (Input), T028 (Textarea), T029 (Spinner), T030 (Toast)
```

#### Within User Stories
```bash
# Example: User Story 1 - All E2E tests can run in parallel:
T031, T032, T033, T034, T035, T036, T037, T038

# Frontend components can run in parallel:
T042 (EmptyState), T043 (TaskCard)
```

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch all E2E tests together (Red phase):
Task T031: "E2E test: Dashboard loading spinner"
Task T032: "E2E test: Empty state display"
Task T033: "E2E test: Task list display"
Task T034: "E2E test: Task card content"
Task T035: "E2E test: Task ID display"
Task T036: "E2E test: Mobile responsive"
Task T037: "E2E test: Desktop responsive"
Task T038: "E2E test: Error state toast"

# Step 2: Verify all tests FAIL (Red)

# Step 3: Launch parallel frontend components (Green phase):
Task T042: "Create EmptyState component"
Task T043: "Create TaskCard component"

# Step 4: Sequential tasks (dependencies):
Task T044: "Create TaskList" (depends on T042, T043)
Task T045: "Create Dashboard page" (depends on T044)

# Step 5: Verify all tests PASS (Green)

# Step 6: Refactor while keeping tests green
```

---

## Implementation Strategy

### MVP First (Recommended)

1. **Phase 1**: Setup → 10 tasks
2. **Phase 2**: Foundational → 20 tasks (CRITICAL - blocks all stories)
3. **Phase 3**: User Story 1 (View Dashboard) → 18 tasks
4. **STOP and VALIDATE**: Test US1 independently, deploy to Vercel
5. **Result**: Working MVP with task display

### Incremental Delivery

After MVP:

1. **Phase 4**: User Story 2 (Add Task) → 21 tasks → Deploy
2. **Phase 5**: User Story 7 (Responsive) → 14 tasks → Deploy
3. **Phase 6**: User Story 3 (Complete) → 17 tasks → Deploy
4. **Phase 7**: User Story 4 (Update) → 20 tasks → Deploy
5. **Phase 8**: User Story 5 (Delete) → 17 tasks → Deploy
6. **Phase 9**: User Story 6 (Filter) → 13 tasks → Deploy
7. **Phase 10**: Polish → 19 tasks → Final deploy

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: Phase 3 (US1 - View Dashboard)
- **Developer B**: Phase 4 (US2 - Add Task)
- **Developer C**: Phase 5 (US7 - Responsive)

Then merge and continue with remaining stories.

---

## Phase 11: Post-Implementation Refinements (Completed)

**Purpose**: UX and authentication improvements identified during implementation

**Status**: All tasks completed as part of implementation hardening

### Authentication & Welcome Messages

- [x] T170 [Refinement] Fix welcome message to use stored user name instead of email
  - **Issue**: Dashboard was falling back to email instead of persisted name
  - **Fix**: Updated AuthContext to properly store and retrieve `user.name` from both signup and login responses
  - **Files**: `frontend/lib/context/AuthContext.tsx`, `frontend/app/dashboard/page.tsx`
  - **Validation**: Verified name appears in welcome message after signup and login

- [x] T171 [Refinement] Ensure "Welcome back" message only shows on returning login
  - **Issue**: Welcome message needed to differentiate first-time signup from returning login
  - **Fix**: Implemented `isNewUser` flag in localStorage, set during signup, cleared after 5 seconds
  - **Files**: `frontend/app/dashboard/page.tsx`, `frontend/lib/context/AuthContext.tsx`
  - **Validation**: "Welcome, {name}!" shows after signup, "Welcome back, {name}!" shows on login

### Navigation & Authentication UX

- [x] T172 [Refinement] Fix "Start Free" button to redirect authenticated users to dashboard
  - **Issue**: "Start Free" always redirected to login, even for authenticated users
  - **Fix**: Added authentication check in landing page, conditional redirect logic
  - **Files**: `frontend/app/page.tsx`
  - **Validation**: Authenticated users redirected to `/dashboard`, unauthenticated to `/login`

- [x] T173 [Refinement] Add loading state to "Start Free" button
  - **Issue**: Button appeared unresponsive during auth check
  - **Fix**: Added `isLoading` state from `useAuth()`, disabled button during auth loading
  - **Files**: `frontend/app/page.tsx`
  - **Validation**: Button disabled while auth context initializes

### Backend Authentication Improvements

- [x] T174 [Refinement] Ensure user name field is stored and returned by signup endpoint
  - **Issue**: Backend needed to confirm name persistence
  - **Fix**: Verified User model includes `name` field, signup endpoint stores and returns it
  - **Files**: `backend/src/api/auth.py`, `backend/src/models/user.py`
  - **Validation**: API returns `user.name` in both signup and login responses

- [x] T175 [Refinement] Verify login endpoint returns user name from database
  - **Issue**: Login endpoint needed to return persisted name
  - **Fix**: Confirmed login query retrieves `user.name` from database and includes in response
  - **Files**: `backend/src/api/auth.py`
  - **Validation**: User name persists across sessions, returned correctly on login

### UI/UX Polish

- [x] T176 [Refinement] Add exclamation marks to dashboard welcome messages for consistency
  - **Issue**: Welcome messages had inconsistent punctuation
  - **Fix**: Added exclamation marks to all welcome message variants (guest, new user, returning user)
  - **Files**: `frontend/app/dashboard/page.tsx`
  - **Validation**: All welcome messages end with "!" for friendly, consistent tone

---

## Phase 12: User Story 8 - Authentication Error Handling (Priority: P2)

**Purpose**: Display inline error messages for login failures instead of browser alerts

**Goal**: User sees clear, styled inline error messages when entering wrong credentials

**Independent Test**: Enter wrong credentials, verify inline red error message appears (not alert)

### E2E Tests for User Story 8 (Red-Green-Refactor)

> **CRITICAL: Write these tests FIRST, verify they FAIL before implementation**

- [ ] T177 [P] [US8] E2E test: Login with unregistered email shows inline error "Invalid email or password" in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T178 [P] [US8] E2E test: Login with wrong password shows inline error "Invalid email or password" in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T179 [P] [US8] E2E test: Error message clears when user starts typing in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T180 [P] [US8] E2E test: Empty email shows inline validation "Email is required" in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T181 [P] [US8] E2E test: Empty password shows inline validation "Password is required" in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T182 [P] [US8] E2E test: Invalid email format shows "Please enter a valid email address" in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T183 [P] [US8] E2E test: Network error shows "Unable to connect..." message in frontend/tests/e2e/auth-errors.spec.ts
- [ ] T184 [P] [US8] E2E test: Error message is 14px red (#EF4444), centered below form in frontend/tests/e2e/auth-errors.spec.ts

### Frontend Implementation for User Story 8

- [x] T185 [US8] Create LoginErrorMessage component in frontend/app/login/components/LoginErrorMessage.tsx
  - Red (#EF4444) 14px text, centered, 8px top margin
  - Fade-in animation (150ms ease)
  - Max-width matches form width
- [x] T186 [US8] Add error state management to login page in frontend/app/login/page.tsx
  - Replace `alert()` with inline error state
  - Track error type (validation vs API error)
- [x] T187 [US8] Implement client-side form validation before API call
  - Email required check
  - Password required check
  - Email format validation (basic regex)
- [x] T188 [US8] Update handleSubmit to catch API errors and display inline
  - 401 → "Invalid email or password"
  - Network error → "Unable to connect. Please check your internet connection and try again."
- [x] T189 [US8] Add input onChange handler to clear error message
  - Error clears within 100ms when user starts typing
- [x] T190 [US8] Add field-level validation error display below inputs
  - 4px top margin below input
  - Red (#EF4444) 14px text
- [x] T191 [US8] Style error states with TailwindCSS
  - Input border red when field has error
  - Error text animation (fade-in 150ms)

**Checkpoint**: User Story 8 complete - login page shows inline errors instead of alerts

---

## Notes

- **Total Tasks**: 191 tasks across 12 phases
- **Critical Path**: Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 MVP)
- **Test Strategy**: TDD with Playwright E2E tests (Red-Green-Refactor)
- **E2E Test Coverage**: 62 scenarios (54 original + 8 authentication error handling)
- **[P] Markers**: 90 tasks can run in parallel (47% parallelizable)
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 = 48 tasks (25% of total)
- **Tech Stack**: Next.js 15+, FastAPI, Neon PostgreSQL, Better Auth, TailwindCSS
- **Design System**: All spacing/colors/animations defined in plan.md design tokens
- **Accessibility**: WCAG 2.1 Level AA compliance built into all components
- **Performance**: Core Web Vitals targets enforced in Phase 10
- **User Stories**: US1-US8 (8 total, including authentication error handling)

**🎯 Recommended Start**: Complete Phases 1-3 for MVP, then iterate with Phases 4-12
