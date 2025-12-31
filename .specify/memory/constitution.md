<!--
Sync Impact Report:
- Version Change: 1.0.0 → 1.1.0
- Modified Principles:
  - Principle I (SDD): Enhanced with hackathon-specific constraint ("Cannot write code manually")
  - Principle VIII (Bonus Features): NEW - Added to capture bonus point opportunities
- Added Sections:
  - Feature Progression (Basic → Intermediate → Advanced levels)
  - Bonus Features & Point System
  - Hackathon Milestones & Deadlines
- Templates Requiring Updates:
  - ✅ spec-template.md: Aligned with SDD workflow
  - ✅ plan-template.md: Constitution check references valid
  - ✅ tasks-template.md: Task IDs and categorization consistent
  - ✅ phr-template.prompt.md: Routing matches constitution guidance
  - ✅ adr-template.md: Significance test aligns with Principle IV
- Follow-up TODOs: None
- Rationale: MINOR version bump - added new principle (VIII) and expanded guidance for hackathon-specific requirements without breaking existing workflow
-->

# Todo App Hackathon Constitution

## Core Principles

### I. Spec-Driven Development (SDD) – NON-NEGOTIABLE

All development MUST follow the Spec-Driven Development workflow. No code may be written
without approved specifications, plans, and tasks.

**Rules:**
- Workflow sequence is mandatory: Specify → Plan → Tasks → Implement
- Specifications (spec.md) MUST be complete and approved before planning begins
- Plans (plan.md) MUST exist before task breakdown
- Tasks (tasks.md) MUST be defined before implementation
- All code MUST reference task IDs in comments
- **Hackathon Constraint:** Manual code writing is STRICTLY PROHIBITED. You MUST refine the spec until Claude Code generates the correct output. This is a core evaluation criterion.
- Every iteration MUST be documented via PHRs to demonstrate the spec refinement process

**Rationale:** SDD ensures traceability, reduces technical debt, and enables AI-native
development by making requirements explicit and testable. The hackathon evaluates your
ability to architect through specifications, not write code manually.

### II. Phased Progression – NON-NEGOTIABLE

The project progresses through 5 mandatory phases in strict sequential order. No phase
may be skipped, and each phase MUST be fully complete before the next begins.

**Rules:**
- Phase I (Console App) → Phase II (Web App) → Phase III (AI Chatbot) → Phase IV
  (Kubernetes) → Phase V (Cloud Deployment)
- Each phase requires: complete spec/plan/tasks, passing tests, working demo, PHRs created
- Phase transition validation MUST pass before advancement
- All acceptance criteria for current phase MUST be met
- **Demo Video:** <90 seconds per phase, submitted with each phase checkpoint
- **GitHub Repo:** Public repository with clear folder structure per phase

**Rationale:** Sequential phases build complexity progressively, ensuring solid foundations
and preventing premature optimization or scope creep. Judges evaluate the evolution from
simple to complex systems.

### III. Test-First Development – NON-NEGOTIABLE

All features MUST be developed using test-driven development (TDD) principles. Tests are
written and approved before implementation begins.

**Rules:**
- Red-Green-Refactor cycle strictly enforced
- Tests written → User approved → Tests fail (Red) → Implement (Green) → Refactor
- 100% test coverage for core CRUD operations (Basic Level features)
- Integration tests required for API endpoints, MCP tools, and service communication
- All tests MUST pass before phase transition
- Test cases MUST be documented in tasks.md with TC-XXX identifiers
- Use pytest for Python, npm test for TypeScript/JavaScript

**Rationale:** TDD ensures code correctness, facilitates refactoring, and provides
living documentation of system behavior. Testing discipline is critical for multi-phase
evolution.

### IV. Knowledge Capture & Traceability

All significant AI interactions, decisions, and implementation work MUST be documented
through Prompt History Records (PHRs) and Architectural Decision Records (ADRs).

**Rules:**
- PHRs MUST be created after: spec/plan/tasks creation, implementation work, debugging
  sessions, architectural discussions
- PHRs preserve full prompt text (no truncation) and route correctly by stage
- **Hackathon Judging:** Judges will review PHRs to evaluate your spec refinement process
  and iterative development approach
- ADRs MUST be created for architecturally significant decisions (3-part test:
  Impact + Alternatives + Scope)
- All code references MUST include task IDs for traceability
- Constitution → `history/prompts/constitution/`, Features → `history/prompts/<phase>/`,
  General → `history/prompts/general/`

**Rationale:** Systematic knowledge capture enables learning, maintains audit trails,
and builds organizational intelligence for future projects. PHRs demonstrate mastery
of AI-driven development to judges.

### V. Multi-Agent Orchestration

The project employs a hierarchical multi-agent system with clear roles, delegation
patterns, and authority boundaries.

**Rules:**
- Orchestrator Agent routes all user requests to specialized agents
- SpecKit Architect Agent enforces SDD workflow and blocks implementation without specs
- Phase-specific agents (I-V) provide technical expertise for their respective phases
- Agents MUST NOT operate outside their defined scope
- Phase prerequisites MUST be validated before agent loading
- All agents report completion status to Orchestrator
- Agent definitions in `.claude/agents/*.md` MUST align with constitution
- Skills in `.claude/skills/*.md` implement reusable, deterministic workflows

**Rationale:** Clear agent roles prevent confusion, ensure workflow compliance, and
enable specialized expertise while maintaining coherent project coordination. This
architecture earns bonus points for Reusable Intelligence.

### VI. Clean Architecture & Code Quality

All code MUST follow clean architecture principles, maintain high quality standards,
and adhere to technology-specific best practices.

**Rules:**
- Separation of concerns: models, services, repositories, UI layers clearly separated
- No hardcoded values; use environment variables and configuration files
- Type hints required on all Python functions (mypy clean)
- Proper error handling for all edge cases defined in specs
- PEP 8 compliance for Python code
- ESLint/Prettier compliance for TypeScript/JavaScript code
- Code comments explain "why" not "what"
- YAGNI (You Aren't Gonna Need It) – no premature abstraction or over-engineering
- **Performance:** Optimize for user experience, not premature optimization
- **Maintainability:** Code should be self-documenting through clear naming and structure

**Rationale:** Clean architecture ensures maintainability, testability, and enables
confident refactoring as the application evolves through phases.

### VII. Security & Data Privacy

Security and privacy MUST be designed in from the start, with explicit threat modeling
and secure coding practices throughout all phases.

**Rules:**
- No secrets or API keys in code; use `.env` files (git-ignored)
- User authentication required (Better Auth + JWT) from Phase II onwards
- User data isolation enforced; users see only their own tasks
- Input validation on all user-provided data
- SQL injection prevention through parameterized queries (SQLModel)
- JWT token expiry and refresh handling
- HTTPS enforced in production deployments
- Kubernetes secrets for sensitive data in Phases IV-V
- No logging of sensitive information (passwords, tokens, PII)
- CORS properly configured for frontend-backend communication

**Rationale:** Security breaches and data leaks are unacceptable. Building security in
from design phase is cheaper and more effective than retrofitting.

### VIII. Bonus Features & Innovation

Beyond core requirements, the project encourages innovation through bonus features that
demonstrate advanced capabilities and earn additional points.

**Rules:**
- **Reusable Intelligence (+200 points):** Create and use Claude Code Subagents and Agent
  Skills for repeatable workflows across phases
- **Cloud-Native Blueprints (+200 points):** Develop Agent Skills for spec-driven deployment
  automation (Infrastructure as Code via specs)
- **Multi-language Support (+100 points):** Implement Urdu language support in AI chatbot
  with accurate grammar and friendly responses
- **Voice Commands (+200 points):** Add voice input for todo commands using browser Speech
  Recognition API or equivalent
- Bonus features MUST NOT compromise core functionality or violate other principles
- Each bonus feature MUST have its own spec, plan, and tasks
- Bonus work documented separately in `specs/bonus-features/`

**Rationale:** Bonus features distinguish exceptional submissions and demonstrate mastery
of advanced AI-native development patterns. They also align with real-world production
requirements.

## Feature Progression

The Todo application evolves through three feature tiers that map to hackathon phases:

**Basic Level (Core Essentials) – Phases I-II:**
1. Add Task – Create new todo items with title and description
2. Delete Task – Remove tasks from the list
3. Update Task – Modify existing task details
4. View Task List – Display all tasks with status indicators
5. Mark as Complete – Toggle task completion status

**Intermediate Level (Organization & Usability) – Phase V:**
1. Due Dates – Assign deadlines to tasks with date pickers
2. Priorities & Tags/Categories – Assign levels (high/medium/low) or labels (work/home)
3. Search & Filter – Search by keyword; filter by status, priority, or date
4. Sort Tasks – Reorder by due date, priority, or alphabetically

**Advanced Level (Intelligent Features) – Phase V:**
1. Recurring Tasks – Auto-reschedule repeating tasks (e.g., "weekly meeting")
2. Time Reminders – Browser notifications for tasks approaching due dates

**Implementation Strategy:**
- Basic features MUST be fully functional before advancing to Intermediate
- Intermediate features MUST be stable before implementing Advanced
- Each tier has increasing architectural complexity (Basic: CRUD, Intermediate: Filtering/Sorting, Advanced: Event-Driven)

## Technology Stack

The project uses a modern, cloud-native technology stack that evolves across phases:

**Phase I (Console App):**
- Python 3.13+
- UV (package manager)
- Pytest (testing)
- In-memory storage (dictionaries/lists)
- Claude Code + Spec-Kit Plus

**Phase II (Web Application):**
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Backend: FastAPI, SQLModel, Pydantic
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT
- ORM: SQLModel
- Deployment: Vercel (frontend), FastAPI backend on cloud provider

**Phase III (AI Chatbot):**
- OpenAI ChatKit (frontend UI)
- OpenAI Agents SDK (orchestration)
- Official MCP SDK (Model Context Protocol)
- MCP Server with 5 task operation tools (add, list, complete, delete, update)
- Stateless architecture with database state persistence
- Better Auth domain allowlist configuration for hosted ChatKit

**Phase IV (Kubernetes):**
- Docker (containerization)
- Docker AI Agent "Gordon" (AI-assisted Docker operations)
- Minikube (local Kubernetes cluster)
- Helm Charts (package management)
- kubectl-ai and kagent (AI DevOps tools)

**Phase V (Cloud Deployment):**
- Cloud Platform: GKE, AKS, or **OKE (Oracle Cloud free tier recommended)**
- Event Streaming: Kafka (Redpanda Cloud Serverless or Strimzi self-hosted)
- Distributed Runtime: Dapr (Pub/Sub, State, Jobs API, Secrets, Service Invocation)
- CI/CD: GitHub Actions
- Monitoring: Prometheus + Grafana (optional)
- Event-driven architecture with Kafka topics: task-events, reminders, task-updates

**Constraint:** No substitutions for core technologies. Additional libraries may be
added if justified, but the specified stack MUST be used.

## Development Workflow

All development follows a disciplined, repeatable workflow that ensures quality and
enables AI-driven implementation.

**Standard Development Cycle:**
1. **Specify** – Create or update spec.md with requirements, user stories, acceptance
   criteria, edge cases, success metrics
2. **Plan** – Generate plan.md with architecture, components, interfaces, data models,
   API contracts, NFRs
3. **Tasks** – Break plan into atomic tasks.md with task IDs, test cases, dependencies,
   acceptance criteria
4. **Implement** – Execute tasks using test-driven development (Red-Green-Refactor)
5. **Validate** – Run tests, code quality checks, phase transition validation
6. **Document** – Create PHRs for key decisions, ADRs for significant architecture choices

**Code Review & Quality Gates:**
- All code generated via AI MUST be reviewed for correctness against spec
- Tests MUST pass (pytest for Python, npm test for TypeScript)
- Linting MUST pass (ruff for Python, ESLint for TypeScript)
- Type checking MUST pass (mypy for Python, tsc for TypeScript)
- No warnings or errors in build process
- Phase transition validation MUST approve before advancing
- **Demo Video:** Record <90 second demonstration before phase submission

**Git Workflow:**
- Feature branches for each phase: `phase-1-console-app`, `phase-2-web-app`, etc.
- Commit messages follow convention: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- All commits include task reference: `feat: implement add todo (TASK-003)`
- Pull requests created for phase transitions with `/sp.git.commit_pr` skill
- Main branch always deployable
- GitHub repository MUST be public for submission

**Failure Handling:**
- If tests fail: debug, fix implementation, rerun tests
- If spec incomplete: return to Specify step, complete spec, restart
- If architectural conflict: suggest ADR, get user approval, document decision
- If phase validation fails: fix blockers, revalidate, do not proceed without approval
- **Spec Refinement:** If Claude Code generates incorrect output, refine spec (not manual coding)

## Hackathon Milestones & Deadlines

**Phase Deadlines (All Sundays, 8:00 PM):**
- Phase I Due: December 7, 2025 (Console app checkpoint)
- Phase II Due: December 14, 2025 (Web app checkpoint)
- Phase III Due: December 21, 2025 (Chatbot checkpoint)
- Phase IV Due: January 4, 2026 (Local K8s checkpoint)
- **Final Submission: January 18, 2026** (All phases complete)

**Submission Requirements (Per Phase):**
1. Public GitHub Repository Link
2. Published App Link (Vercel for frontend, deployed backend URL)
3. Demo video link (<90 seconds) – NotebookLM or screen recording
4. WhatsApp number for live presentation invitation

**Live Presentations:**
- Sundays: December 7, 14, 21, 2025 and January 4, 18, 2026 at 8:00 PM
- Top submissions invited to present live on Zoom
- All participants welcome to attend

**Point Distribution:**
- Phase I: 100 points
- Phase II: 150 points
- Phase III: 200 points
- Phase IV: 250 points
- Phase V: 300 points
- **Total Base: 1,000 points**
- **Total Bonus: +600 points possible**

## Governance

This constitution is the supreme governing document for the Todo App Hackathon project.
All code, decisions, processes, and artifacts MUST comply with these principles.

**Amendment Process:**
1. Identify need for amendment (new principle, clarification, or removal)
2. Document rationale and impact in proposal
3. Version bump following semantic versioning:
   - MAJOR: Backward incompatible principle removals or redefinitions
   - MINOR: New principles added or material expansions
   - PATCH: Clarifications, wording fixes, non-semantic refinements
4. Update constitution with change log in Sync Impact Report (HTML comment at top)
5. Validate all templates remain consistent
6. Create ADR if amendment represents significant architectural shift
7. User approval required before adoption

**Compliance & Enforcement:**
- Orchestrator Agent enforces phase prerequisites and workflow compliance
- SpecKit Architect Agent blocks non-compliant actions (code without specs)
- Phase transition validation checks constitutional compliance
- All PRs/reviews verify adherence to principles
- Violations result in rejection and requirement to fix before proceeding

**Versioning Policy:**
- Constitution version tracked in this file
- Version bumps documented in Sync Impact Report (HTML comment at top)
- Templates updated to reflect constitutional changes
- PHRs capture constitutional amendments in `history/prompts/constitution/`

**Ratification & Amendment Authority:**
- Initial ratification: User approval required
- Amendments: Proposed by agents, approved by user
- Emergency amendments: Allowed only for critical security or compliance issues
- Complexity MUST be justified; simplicity preferred

**Runtime Guidance:**
- This constitution guides all agents via CLAUDE.md integration
- Agent-specific instructions in `.claude/agents/*.md` files MUST align with constitution
- Skills in `.claude/skills/*.md` MUST follow constitutional principles
- Any conflict: Constitution supersedes all other guidance
- AGENTS.md defines agent interaction patterns; Constitution defines standards

**Conflict Resolution Hierarchy:**
1. Constitution (supreme document)
2. Spec-Kit artifacts (spec.md, plan.md, tasks.md)
3. AGENTS.md (agent workflow guidance)
4. Agent-specific files (.claude/agents/*.md)
5. Skills (.claude/skills/*.md)

**Version**: 1.1.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30
