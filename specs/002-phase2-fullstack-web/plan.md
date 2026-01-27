# Implementation Plan: Phase II Full-Stack Web Todo Application

**Branch**: `002-phase2-fullstack-web` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-phase2-fullstack-web/spec.md`

## Summary

Phase II transforms the Phase I console Todo application into a full-stack web application with responsive UI while preserving all Phase I functionality exactly (add, list, update, mark complete, delete tasks). The technical approach focuses on creating a clean separation between frontend (Next.js), backend API (FastAPI), and database (Neon PostgreSQL) with user authentication (Better Auth). The UI implements a mobile-first responsive design with three breakpoints (320px mobile, 768px tablet, 1024px+ desktop) and pixel-perfect component specifications for task cards, forms, modals, and notifications.

## Technical Context

**Language/Version**: TypeScript 5+ (frontend), Python 3.13+ (backend)
**Primary Dependencies**: Next.js 15+ (App Router), React 19+, TailwindCSS 4+, FastAPI, SQLModel, Better Auth
**Storage**: Neon DB (PostgreSQL 16+) with connection pooling
**Testing**: Playwright (E2E tests), Vitest (frontend unit tests), Pytest (backend tests)
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), deployed on Vercel (frontend + API routes)
**Project Type**: Web application (frontend + backend split)
**Performance Goals**:
- LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals)
- API p95 < 500ms for all endpoints
- 60fps scrolling with 100 tasks loaded
- Time to Interactive < 2s on 3G mobile
**Constraints**:
- No horizontal scrolling at any width (320px-2560px)
- All interactive elements 44x44px minimum (WCAG 2.1 Level AA)
- 90% validation errors shown inline (not toasts)
- All Phase I validation rules preserved exactly
**Scale/Scope**: Single-user MVP, 100 tasks supported without pagination lag, 5 CRUD operations (add, list, update, complete, delete)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development ✅ PASS
- ✅ Specification complete and approved ([spec.md](./spec.md) - Hardened Revision 2, 452 lines)
- ✅ All requirements testable and unambiguous (54 acceptance scenarios, zero [NEEDS CLARIFICATION])
- ✅ Plan being created before tasks
- ✅ No manual coding constraint acknowledged
- ✅ PHR will be created for planning session

### Principle II: Phased Progression ✅ PASS
- ✅ Phase I complete (console app working with all CRUD operations)
- ✅ Phase II builds on Phase I foundation (preserves all behaviors)
- ✅ No features beyond Phase I scope (strictly UI transformation)
- ✅ Phase transition criteria defined in spec

### Principle III: Test-First Development ✅ PASS
- ✅ TDD approach planned: E2E tests (Playwright), unit tests (Vitest/Pytest)
- ✅ Test coverage target: 80%+ for business logic
- ✅ Tests will be written before implementation (Red-Green-Refactor)
- ✅ All acceptance scenarios will be automated as E2E tests

### Principle IV: Knowledge Capture & Traceability ✅ PASS
- ✅ PHR will be created for planning session (stage: plan, feature: phase2-fullstack-web)
- ✅ All tasks will reference task IDs
- ✅ ADRs will be suggested for significant architectural decisions

### Principle V: Multi-Agent Orchestration ✅ PASS
- ✅ Orchestrator routing to SpecKit Architect and Phase II agent
- ✅ SpecKit validated spec before planning
- ✅ Phase I prerequisite validated (console app complete)

### Principle VI: Clean Architecture & Code Quality ✅ PASS
- ✅ Clear separation planned: UI components, API client, state management, utilities
- ✅ TypeScript strict mode required
- ✅ Environment variables for secrets (DATABASE_URL, AUTH_SECRET)
- ✅ YAGNI principle applied (no over-engineering)

### Principle VII: Security & Data Privacy ✅ PASS
- ✅ Better Auth for user authentication
- ✅ User data isolation (user_id foreign key)
- ✅ Input validation on all forms
- ✅ SQL injection prevention (SQLModel parameterized queries)
- ✅ No secrets in code (.env.local for config)
- ✅ HTTPS in production, HTTP acceptable for local dev

### Principle VIII: Bonus Features & Innovation ⚠️ NOT IN SCOPE
- ⚠️ No bonus features in Phase II (deferred to later phases)
- ⚠️ Voice commands, multi-language support, advanced features all out of scope

**Gate Decision**: ✅ **PASS** - All applicable constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-phase2-fullstack-web/
├── spec.md              # Feature specification (approved, 452 lines)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (architecture decisions)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (API contracts)
│   └── api-spec.openapi.json
├── checklists/
│   └── requirements.md  # Spec quality validation (passed)
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Frontend (Next.js App Router)
frontend/
├── src/
│   ├── app/              # App Router pages and layouts
│   │   ├── (auth)/       # Auth group: login, signup
│   │   ├── dashboard/    # Protected dashboard route
│   │   ├── layout.tsx    # Root layout with providers
│   │   └── page.tsx      # Home/landing page
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Base components (Button, Input, Modal, Toast)
│   │   ├── task/         # Task-specific (TaskCard, TaskForm, TaskList, FilterTabs)
│   │   └── layout/       # Layout components (Header, EmptyState, LoadingSpinner)
│   ├── lib/              # Utilities and services
│   │   ├── api.ts        # API client for backend calls
│   │   ├── auth.ts       # Better Auth client configuration
│   │   ├── hooks/        # Custom React hooks (useTask, useAuth, useDebounce)
│   │   └── utils.ts      # Helpers (formatDate, validateTitle, etc.)
│   └── styles/
│       └── globals.css   # TailwindCSS imports and custom styles
├── public/               # Static assets (icons, images)
├── tests/
│   ├── e2e/              # Playwright E2E tests
│   └── unit/             # Vitest unit tests for components
├── .env.local.example    # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # TailwindCSS configuration (design tokens)
├── tsconfig.json         # TypeScript configuration (strict mode)
└── package.json          # Dependencies and scripts

# Backend (FastAPI)
backend/
├── src/
│   ├── api/              # API routes
│   │   ├── tasks.py      # Task CRUD endpoints
│   │   └── auth.py       # Authentication endpoints
│   ├── models/           # SQLModel database models
│   │   ├── task.py       # Task model (preserves Phase I schema)
│   │   └── user.py       # User model (Better Auth integration)
│   ├── services/         # Business logic layer
│   │   ├── task_service.py
│   │   └── auth_service.py
│   ├── db/               # Database configuration
│   │   └── connection.py # Neon DB connection setup
│   └── main.py           # FastAPI app initialization
├── tests/
│   ├── integration/      # API endpoint tests
│   └── unit/             # Service layer unit tests
├── migrations/           # SQL migration files
│   └── 001_initial.sql   # Initial schema
├── .env.example          # Environment variables template
├── pyproject.toml        # UV/Ruff configuration
└── requirements.txt      # Python dependencies

# Shared Configuration
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CD pipeline (lint, test, deploy)
└── docker-compose.yml    # Local development environment (optional)
```

**Structure Decision**: Web application architecture selected due to frontend + backend split required by spec. Frontend uses Next.js App Router for client-side routing and API routes. Backend uses FastAPI for RESTful API. Database uses Neon PostgreSQL for persistent storage. Clear separation of concerns maintained across all layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected - all constitutional principles satisfied.*

---

## Phase 0: Architecture Research & Decisions

### Research Questions

1. **Next.js App Router vs Pages Router**
   - **Decision**: Use App Router (Next.js 13+)
   - **Rationale**: Server Components reduce client bundle size, better data fetching patterns, nested layouts simplify auth protection
   - **Alternatives Considered**: Pages Router (stable but older pattern), SPA without SSR (worse SEO and performance)

2. **State Management Strategy**
   - **Decision**: React hooks + SWR for server state
   - **Rationale**: Minimal complexity for Phase II scope, automatic revalidation, cache invalidation built-in
   - **Alternatives Considered**: Redux (too complex for 5 operations), Zustand (unnecessary for server-driven state), React Query (similar to SWR but SWR simpler)

3. **Form Validation Approach**
   - **Decision**: HTML5 + custom React hooks for inline validation
   - **Rationale**: Native browser validation with progressive enhancement, no third-party library needed
   - **Alternatives Considered**: Yup (extra dependency), Zod (TypeScript overhead), React Hook Form (over-engineered for 2 forms)

4. **Responsive CSS Strategy**
   - **Decision**: TailwindCSS with mobile-first breakpoints
   - **Rationale**: Utility-first matches pixel-perfect spec requirements (44x44px, 16px fonts, 8px spacing), no custom CSS needed
   - **Alternatives Considered**: CSS Modules (verbose for responsive), Styled Components (runtime cost), vanilla CSS (maintainability issues)

5. **API Client Architecture**
   - **Decision**: Native fetch with custom wrapper for auth headers
   - **Rationale**: Minimal abstraction, native browser API, easy to add auth tokens
   - **Alternatives Considered**: Axios (extra dependency, more features than needed), tRPC (requires monorepo setup)

6. **Database Migration Strategy**
   - **Decision**: SQL files with manual versioning
   - **Rationale**: Simple, explicit, no ORM magic, easy to review
   - **Alternatives Considered**: Alembic (Python complexity), Prisma (Node.js only), Drizzle (adds complexity)

7. **Authentication Flow**
   - **Decision**: Better Auth with session cookies
   - **Rationale**: Built-in session management, HTTP-only cookies (secure), email/password ready out-of-box
   - **Alternatives Considered**: NextAuth (heavier, OAuth complexity), custom JWT (reinventing wheel), Auth0 (third-party dependency)

8. **Component Testing Strategy**
   - **Decision**: Playwright for E2E (primary), Vitest for critical components only
   - **Rationale**: E2E tests catch more bugs, match acceptance scenarios directly, less mocking needed
   - **Alternatives Considered**: Jest (Vitest faster), Cypress (Playwright better for Next.js), Testing Library alone (insufficient for full flows)

9. **Error Handling Pattern**
   - **Decision**: Toast notifications (top-right) + inline form errors
   - **Rationale**: Matches spec exactly (90% inline validation), non-blocking UX
   - **Alternatives Considered**: Global error boundary (too aggressive), inline only (misses API errors), modal alerts (blocking)

11. **Authentication Error Display**
    - **Decision**: Inline error messages on login page (not browser alerts or toasts)
    - **Rationale**: Authentication errors need immediate, visible feedback in context. Browser `alert()` is disruptive and non-styled. Inline errors provide better UX by keeping user on the form with clear guidance.
    - **Alternatives Considered**: Browser alert (poor UX, breaks flow), toast notification (too transient for auth errors, user might miss it), modal dialog (too heavy for simple error)

10. **Responsive Breakpoint Implementation**
    - **Decision**: TailwindCSS default breakpoints customized (sm:768px, lg:1024px)
    - **Rationale**: Matches spec requirements (mobile 320-767px, tablet 768-1023px, desktop 1024px+)
    - **Alternatives Considered**: Custom media queries (duplicates Tailwind), CSS container queries (browser support issues)

### Technology Choices

| Technology | Version | Justification |
|------------|---------|---------------|
| Next.js | 15+ | App Router for server components, API routes, Vercel deployment |
| React | 19+ | Required by Next.js 15, concurrent rendering |
| TypeScript | 5+ | Strict mode for type safety, catches errors early |
| TailwindCSS | 4+ | Utility-first for responsive design, design tokens |
| FastAPI | Latest | High-performance async Python, automatic OpenAPI docs |
| SQLModel | Latest | Pydantic + SQLAlchemy, type-safe ORM |
| Neon DB | PostgreSQL 16+ | Serverless PostgreSQL, connection pooling, free tier |
| Better Auth | Latest | Simple session auth, bcrypt hashing, CSRF protection |
| Playwright | Latest | E2E testing, browser automation, parallel execution |
| Vitest | Latest | Vite-powered unit tests, fast, ESM native |
| Pytest | Latest | Python testing standard, fixtures, parametrized tests |

### Integration Patterns

1. **Frontend ↔ Backend Communication**
   - **Pattern**: RESTful JSON API with fetch + SWR
   - **Auth**: Session cookies (HTTP-only, Secure, SameSite=Lax)
   - **Error Handling**: HTTP status codes (200/201/400/401/404/500) with JSON error bodies

2. **Database Access**
   - **Pattern**: Repository pattern (service layer wraps SQLModel queries)
   - **Connection**: Neon connection pool (max 10 connections, auto-scaling)
   - **Transactions**: Explicit for multi-step operations (currently none in Phase II)

3. **Authentication Flow**
   - **Pattern**: Better Auth middleware validates session on protected routes
   - **Storage**: PostgreSQL (users table with bcrypt passwords)
   - **Session**: HTTP-only cookie, 7-day expiry, auto-refresh

4. **Responsive UI Rendering**
   - **Pattern**: Mobile-first CSS (base styles for 320px, media queries for tablet/desktop)
   - **Touch Targets**: 44x44px clickable areas with visual elements sized 24-44px
   - **Typography**: Fluid scaling (16px mobile → 18px desktop via Tailwind classes)

---

## Phase 1: Data Model & API Contracts

### Data Model

**Task Entity** (preserves Phase I schema exactly):

```text
Table: tasks
├── id: UUID (primary key, generated as UUID v4)
├── user_id: UUID (foreign key → users.id, NOT NULL)
├── title: VARCHAR(100) (NOT NULL, CHECK length 1-100)
├── description: VARCHAR(500) (NULL, default '', CHECK length 0-500)
├── status: ENUM('pending', 'completed') (NOT NULL, default 'pending')
├── created_at: TIMESTAMP WITH TIME ZONE (NOT NULL, default NOW())
├── completed_at: TIMESTAMP WITH TIME ZONE (NULL)
├── updated_at: TIMESTAMP WITH TIME ZONE (NULL)
└── INDEX idx_user_created (user_id, created_at DESC)
```

**User Entity** (Better Auth integration):

```text
Table: users
├── id: UUID (primary key, generated as UUID v4)
├── email: VARCHAR(255) (UNIQUE, NOT NULL)
├── password_hash: VARCHAR(255) (NOT NULL, bcrypt with salt rounds 10)
├── created_at: TIMESTAMP WITH TIME ZONE (NOT NULL, default NOW())
└── INDEX idx_email (email)
```

**Relationships**:
- User 1:N Task (one user has many tasks)
- Foreign key constraint: tasks.user_id REFERENCES users(id) ON DELETE CASCADE

**Validation Rules** (enforced at API + database level):
- Title: 1-100 characters, required
- Description: 0-500 characters, optional
- Status: enum('pending', 'completed'), default 'pending'
- Timestamps: UTC timezone, auto-managed
- Partial ID matching: Frontend displays 8-char UUID prefix, backend accepts 8+ chars

### API Contracts

**Base URL**: `/api`
**Authentication**: Session cookie required for all endpoints (except auth)
**Content-Type**: `application/json`
**Error Format**: `{"error": {"message": "...", "code": "..."}}`

#### Authentication Endpoints

```
POST /api/auth/signup
Request: {"email": "user@example.com", "password": "secure123"}
Response: 201 {"user": {"id": "uuid", "email": "..."}, "session": "cookie-set"}
Errors: 400 (invalid email/password), 409 (email exists)

POST /api/auth/login
Request: {"email": "user@example.com", "password": "secure123"}
Response: 200 {"user": {"id": "uuid", "email": "..."}, "session": "cookie-set"}
Errors: 401 (invalid credentials), 400 (validation)

POST /api/auth/logout
Request: (empty, session from cookie)
Response: 200 {"message": "Logged out"}
Errors: 401 (not logged in)
```

#### Task CRUD Endpoints

```
GET /api/tasks
Query Params: ?filter=all|active|completed (default: all)
Response: 200 {"tasks": [{"id": "uuid", "title": "...", ...}]}
Sort: created_at DESC (newest first)
Errors: 401 (unauthorized), 500 (server error)

POST /api/tasks
Request: {"title": "Buy groceries", "description": "Milk, eggs"}
Response: 201 {"task": {"id": "uuid", "title": "...", "status": "pending", "created_at": "..."}}
Errors: 400 (validation: title required, title >100 chars, description >500 chars), 401 (unauthorized)

PUT /api/tasks/{id}
Request: {"title": "Updated title", "description": "Updated description"}
Response: 200 {"task": {"id": "uuid", "title": "...", "updated_at": "..."}}
Errors: 400 (validation), 404 (task not found or not owned by user), 401 (unauthorized)

PATCH /api/tasks/{id}/complete
Request: {"completed": true} or {"completed": false}
Response: 200 {"task": {"id": "uuid", "status": "completed", "completed_at": "..." or null}}
Errors: 404 (not found), 401 (unauthorized)

DELETE /api/tasks/{id}
Request: (empty)
Response: 204 (no content)
Errors: 404 (not found or not owned by user), 401 (unauthorized)
```

**Partial ID Matching**: All endpoints accept task IDs with minimum 8 characters (prefix match). Backend resolves to full UUID.

**Rate Limiting**: Not implemented in Phase II (deferred to Phase V).

**CORS**: Configured for localhost:3000 (frontend dev) and Vercel domain (production).

### Component Architecture

#### Frontend Component Hierarchy

```
App (layout.tsx)
├── AuthProvider (Better Auth context)
├── Header
│   ├── Logo
│   └── UserMenu (logout button)
├── LoginPage (/login)
│   ├── LoginForm
│   │   ├── Input (email, with validation error)
│   │   ├── Input (password, with validation error)
│   │   ├── Button (Sign In)
│   │   └── ErrorMessage (inline, below form - for API errors)
│   └── Link (to signup)
└── Dashboard (protected route)
    ├── TaskForm
    │   ├── Input (title)
    │   ├── Textarea (description)
    │   └── Button (Add Task)
    ├── FilterTabs (All/Active/Completed)
    ├── TaskList
    │   ├── EmptyState (when no tasks)
    │   ├── LoadingSpinner (while fetching)
    │   └── TaskCard[] (map over tasks)
    │       ├── Checkbox (complete toggle)
    │       ├── TaskContent (title, description, timestamps)
    │       ├── EditForm (inline, conditional)
    │       │   ├── Input (edit title)
    │       │   ├── Textarea (edit description)
    │       │   ├── Button (Save)
    │       │   └── Button (Cancel)
    │       └── ActionButtons
    │           ├── Button (Edit - pencil icon)
    │           └── Button (Delete - trash icon)
    └── DeleteModal (confirmation dialog)
        ├── ModalOverlay
        ├── ModalContent
        │   ├── Heading ("Delete Task?")
        │   ├── Message ("Are you sure...")
        │   └── ButtonGroup
        │       ├── Button (Cancel)
        │       └── Button (Confirm)
        └── (closes on ESC, click outside)

ToastContainer (top-right, fixed)
└── Toast[] (success/error notifications)
    ├── Icon (checkmark or X)
    ├── Message
    └── CloseButton (manual dismiss)
```

#### Backend Service Architecture

```
FastAPI Application
├── Middleware
│   ├── CORS (localhost + Vercel)
│   ├── Session (Better Auth)
│   └── Error Handler (global exception to JSON)
├── Routers
│   ├── AuthRouter (/api/auth/*)
│   │   └── Better Auth handlers (signup, login, logout)
│   └── TaskRouter (/api/tasks/*)
│       ├── GET / (list_tasks)
│       ├── POST / (create_task)
│       ├── PUT /{id} (update_task)
│       ├── PATCH /{id}/complete (toggle_complete)
│       └── DELETE /{id} (delete_task)
├── Services
│   ├── TaskService
│   │   ├── create(user_id, title, description)
│   │   ├── get_all(user_id, filter)
│   │   ├── get_by_id(user_id, task_id)
│   │   ├── update(user_id, task_id, title, description)
│   │   ├── toggle_complete(user_id, task_id, completed)
│   │   └── delete(user_id, task_id)
│   └── AuthService (handled by Better Auth)
└── Database
    └── NeonDB Connection Pool
        ├── users table
        └── tasks table
```

### Quickstart for Developers

**Prerequisites**:
- Node.js 18+ with npm
- Python 3.13+ with uv
- PostgreSQL (via Neon DB account)

**Setup Steps**:

1. Clone repository and checkout Phase II branch:
   ```bash
   git clone <repo-url>
   cd Todo-application
   git checkout 002-phase2-fullstack-web
   ```

2. Frontend setup:
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with API URL and auth config
   npm run dev  # Starts on localhost:3000
   ```

3. Backend setup:
   ```bash
   cd backend
   uv pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with DATABASE_URL, AUTH_SECRET
   uvicorn src.main:app --reload  # Starts on localhost:8000
   ```

4. Database setup:
   ```bash
   # Run migrations (from backend/)
   psql $DATABASE_URL < migrations/001_initial.sql
   ```

5. Run tests:
   ```bash
   # Frontend E2E tests
   cd frontend && npm run test:e2e

   # Frontend unit tests
   cd frontend && npm run test:unit

   # Backend tests
   cd backend && pytest
   ```

**Environment Variables**:

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/auth
```

Backend (`.env`):
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
AUTH_SECRET=random-64-char-string
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

**Development Workflow**:
1. Start backend: `cd backend && uvicorn src.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:3000`
4. Make changes, save (auto-reload enabled)
5. Run tests before committing

**Deployment**:
- Frontend: Vercel (auto-deploys from GitHub)
- Backend: Vercel Serverless Functions (via API routes)
- Database: Neon DB (already hosted)

---

## Design Tokens & Styling

### Color Palette
```
Primary:   #0066CC (blue - buttons, links, active states)
Success:   #10B981 (green - checkmarks, success toasts)
Error:     #EF4444 (red - delete button, error toasts, validation)
Gray Text: #6B7280 (timestamps, labels, placeholders)
Background: #FFFFFF (cards, page background)
Border:    #E5E7EB (card borders, input borders)
Overlay:   rgba(0,0,0,0.5) (modal backdrop)
```

### Spacing Scale (8px grid)
```
4px   - gap between text and icon
8px   - minimum spacing between touch targets
12px  - card padding mobile
16px  - card padding tablet, page margins mobile
20px  - card padding desktop
24px  - page margins desktop
```

### Typography Scale
```
12px - task ID, small labels
14px - timestamps, error messages
16px - body text mobile, inputs
18px - headings mobile, body desktop
20px - headings tablet
24px - page titles desktop
```

### Component Sizes
```
Touch Targets: 44x44px minimum (WCAG 2.1 Level AA)
Visible Checkbox: 24x24px (inside 44x44px touch area)
Input Height: 44px
Textarea Min Height: 88px (2 lines)
Button Height: 44px minimum
Border Radius: 8px (cards, buttons, inputs)
Modal Max Width: 400px desktop, 90% viewport mobile
Toast Width: 320px max
```

### Animations
```
Transition Duration: 100-300ms
Card Expand: 200ms ease-in-out
Toast Slide-In: 300ms ease
Modal Fade: 200ms ease
Button Hover: 150ms ease
Loading Spinner: 1s linear infinite
```

### Responsive Breakpoints
```
Mobile:  320px - 767px (base styles, mobile-first)
Tablet:  768px - 1023px (sm: prefix in Tailwind)
Desktop: 1024px+         (lg: prefix in Tailwind)
```

---

## Testing Strategy

### Test Coverage Goals
- **E2E Tests (Playwright)**: 100% of user stories covered (7 user stories, 54 acceptance scenarios)
- **Unit Tests (Frontend)**: Critical components only (TaskCard, TaskForm, FilterTabs)
- **Integration Tests (Backend)**: 100% of API endpoints (5 task endpoints, 3 auth endpoints)
- **Overall Coverage**: 80%+ for business logic (target from spec)

### E2E Test Plan

**Test Suite 1: Authentication**
- Signup with valid email/password → success
- Signup with existing email → 409 error
- Login with valid credentials → dashboard redirect
- Login with invalid credentials → inline error "Invalid email or password" (not browser alert)
- Login with unregistered email → inline error "Invalid email or password"
- Login with empty email → inline validation error "Email is required"
- Login with empty password → inline validation error "Password is required"
- Login with invalid email format → inline validation error "Please enter a valid email address"
- Login error clears when user starts typing → error message disappears
- Logout → redirect to login

**Test Suite 2: Task CRUD (P1-P3 User Stories)**
- Dashboard loads with empty state → see "No tasks yet" message
- Add task with title only → appears in list within 500ms
- Add task with title + description → both displayed
- Add task with empty title → inline error "Title is required"
- Add task with 101 char title → disabled submit, error message
- Mark task complete → strikethrough, checkmark, timestamp
- Uncomplete task → remove strikethrough, checkmark, timestamp
- Edit task inline → enter edit mode, modify, save → see updated text
- Edit task and cancel → original text restored
- Delete task with confirmation → modal appears, confirm → task removed
- Delete task and cancel → task remains

**Test Suite 3: Responsive Layouts**
- View on 375px mobile → no horizontal scroll, 16px fonts, 44px buttons
- View on 768px tablet → single column, 32px padding
- View on 1920px desktop → 800px max-width, centered
- Keyboard navigation → Tab focuses inputs, Enter submits, Escape cancels

**Test Suite 4: Filter & Search**
- Filter to "Active" → only pending tasks visible
- Filter to "Completed" → only completed tasks visible
- Filter to "All" → all tasks visible
- Add task while filtered to "Active" → new task appears

**Test Suite 5: Error Handling**
- API timeout (mock 6s delay) → error toast "Request timed out"
- 500 error on add task → error toast, form data preserved
- Network offline → error message with retry button
- Rapid checkbox clicks → debounced to single API call

### Unit Test Plan (Frontend)

**TaskCard Component**:
- Renders title, description, timestamps correctly
- Shows checkmark when status=completed
- Hides Edit/Delete buttons in edit mode
- Emits edit/delete/complete events on click

**TaskForm Component**:
- Validates title (required, max 100 chars)
- Validates description (max 500 chars)
- Clears form on successful submit
- Shows inline errors below inputs
- Disables submit button during API call

**FilterTabs Component**:
- Highlights active tab with blue underline
- Calls onFilterChange with correct filter value
- Resets to "All" on component mount

### Integration Test Plan (Backend)

**Task Endpoints**:
- `GET /api/tasks` returns only current user's tasks
- `POST /api/tasks` validates title length (1-100 chars)
- `PUT /api/tasks/{id}` returns 404 for other user's task
- `PATCH /api/tasks/{id}/complete` toggles status correctly
- `DELETE /api/tasks/{id}` cascades on user deletion

**Auth Endpoints**:
- `POST /api/auth/signup` hashes password with bcrypt
- `POST /api/auth/login` sets HTTP-only session cookie
- `POST /api/auth/logout` clears session cookie

**Partial ID Matching**:
- Task lookup with 8-char UUID prefix → resolves to full UUID
- Task lookup with 7-char UUID → 400 error "minimum 8 characters"

---

## Non-Functional Requirements

### Performance
- **Page Load**: LCP < 2.5s on 3G (measured with Lighthouse)
- **Interactivity**: FID < 100ms for all clicks (measured with Playwright)
- **Layout Stability**: CLS < 0.1 (no layout shifts during load)
- **API Response**: p95 < 500ms for all endpoints (measured with load testing)
- **Scrolling**: 60fps with 100 tasks loaded (measured with Chrome DevTools)

### Accessibility
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- **Touch Targets**: 44x44px minimum, 8px spacing (WCAG 2.1 Level AA 2.5.5)
- **Focus Indicators**: 2px blue outline on all interactive elements
- **Keyboard Navigation**: Tab, Enter, Escape work on all components
- **Screen Reader**: Semantic HTML (button, input, label, aria-labels)

### Security
- **Input Validation**: Title 1-100 chars, description 0-500 chars (frontend + backend)
- **XSS Prevention**: React escapes by default, use textContent not innerHTML
- **CSRF Protection**: Better Auth CSRF tokens on POST/PUT/DELETE
- **SQL Injection**: SQLModel parameterized queries
- **Session Security**: HTTP-only, Secure (HTTPS), SameSite=Lax cookies
- **Password Storage**: bcrypt with salt rounds 10

### Maintainability
- **Code Formatting**: Prettier (frontend), Ruff (backend)
- **Linting**: ESLint (frontend), Ruff (backend)
- **Type Safety**: TypeScript strict mode, MyPy for Python
- **Component Reusability**: Base components (Button, Input) used by all features
- **Environment Config**: .env files (never committed), .env.example templates

---

## Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (localhost:3000) - Next.js dev server
├── Backend (localhost:8000) - Uvicorn with --reload
└── Database - Neon DB cloud (shared dev instance)
```

### Production Environment (Vercel)
```
Vercel Platform
├── Frontend (Serverless)
│   ├── Static pages served via CDN
│   ├── Server Components rendered on-demand
│   └── API routes → Backend functions
├── Backend (Serverless Functions)
│   └── FastAPI endpoints deployed as serverless
└── Database (Neon DB)
    └── Connection pooling enabled
```

**DNS**: Vercel auto-provisions HTTPS domain (e.g., `todo-app-phase2.vercel.app`)

**Environment Variables** (Vercel dashboard):
- `DATABASE_URL` (Neon connection string)
- `AUTH_SECRET` (64-char random string)
- `NEXT_PUBLIC_API_URL` (Vercel domain)

**CI/CD Pipeline** (GitHub Actions):
1. Push to branch → trigger workflow
2. Run linters (ESLint, Ruff)
3. Run type checkers (tsc, MyPy)
4. Run tests (Playwright, Vitest, Pytest)
5. Build frontend (`next build`)
6. Deploy to Vercel (auto on main branch)

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Neon DB connection limits** | API failures under load | Medium | Use connection pooling (max 10), implement retry logic |
| **Better Auth compatibility with Next.js 15** | Auth failures | Low | Use official Better Auth docs for Next.js App Router setup |
| **Responsive layout breaks on edge cases** | Poor UX on some devices | Medium | Test on real devices (mobile, tablet), use browser DevTools responsive mode |
| **CORS issues in production** | Frontend can't call backend | Low | Configure CORS_ORIGINS with Vercel domain before deployment |
| **Slow E2E tests (>5 min)** | CI/CD bottleneck | Medium | Run Playwright tests in parallel (--workers=4), cache dependencies |
| **TypeScript strict mode errors** | Build failures | High | Enable strict mode from start, fix errors incrementally, use `// @ts-expect-error` sparingly |
| **Phase I regression** | Lost functionality | Low | Run Phase I tests before Phase II, compare console output vs web UI behavior |
| **Deadline pressure (due Dec 14)** | Incomplete features | High | Prioritize P1/P2 user stories, defer P3/P4 if needed, daily progress tracking |

---

## Success Criteria

Phase 2 is complete when:

✅ All P1-P4 user stories implemented (7 stories, 54 acceptance scenarios)
✅ All acceptance scenarios pass as E2E tests (Playwright)
✅ Application responsive on mobile (375px), tablet (768px), desktop (1440px)
✅ User authentication working (signup, login, logout with Better Auth)
✅ Database persistence working (tasks persist across page reloads)
✅ All Phase I CRUD operations working identically in web UI
✅ E2E test coverage for critical user journeys (add → complete → edit → delete)
✅ API endpoints documented (FastAPI auto-generates /docs)
✅ Code quality checks passing (TypeScript, ESLint, Prettier, Ruff, MyPy)
✅ Performance metrics met (LCP < 2.5s, FID < 100ms, CLS < 0.1, API p95 < 500ms)
✅ Demo video recorded (<90 seconds) showing responsive UI
✅ Deployed to Vercel with public URL
✅ PHRs created for planning and implementation sessions
✅ No open bugs blocking core functionality (P1/P2 user stories)

**Next Steps**: Run `/sp.tasks` to generate task breakdown (tasks.md)
