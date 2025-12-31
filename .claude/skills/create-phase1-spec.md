# Skill: Create Phase I Specification

**Owner**: SpecKit Architect Agent
**Phase**: I (Console Application)
**Purpose**: Generate a complete, production-ready specification for Phase I Todo console application using Python

---

## Context

Phase I requires a basic Python console application with CRUD operations for todos, stored in-memory. This skill creates the `specs/phase1-console-app/spec.md` file following Spec-Driven Development (SDD) principles.

## Prerequisites

- [ ] Constitution exists at `.specify/memory/constitution.md`
- [ ] User has provided feature requirements or approved Phase I start
- [ ] No existing Phase I spec (or user has approved overwrite)

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `user_requirements` | string | Yes | Natural language description of Phase I requirements | "Basic todo app with add, list, complete, delete" |
| `additional_constraints` | string | No | Extra constraints or preferences | "Must use dataclasses, type hints required" |
| `output_path` | string | No | Custom spec output path | `specs/phase1-console-app/spec.md` (default) |

## Execution Steps

### Step 1: Validate Prerequisites
```bash
# Check constitution exists
test -f .specify/memory/constitution.md || echo "❌ Constitution missing"

# Check directory structure
mkdir -p specs/phase1-console-app
mkdir -p history/prompts/phase1-console-app
```

### Step 2: Extract Core Requirements

From `user_requirements`, identify:
- **Core Entities**: Todo items (text, status, created date)
- **CRUD Operations**: Create, Read, Update (mark complete), Delete
- **Storage**: In-memory (list/dict)
- **Interface**: Console menu-driven
- **Exit Criteria**: Clean exit, data lost on close (acceptable for Phase I)

### Step 3: Generate Spec Content

Create `specs/phase1-console-app/spec.md` with these sections:

```markdown
# Phase I: Console Todo Application - Specification

## 1. Overview

**Purpose**: Basic command-line todo list application with in-memory storage
**Target**: Python 3.13+ using UV package manager
**Success Criteria**: Users can manage todos via console interface with full CRUD operations

## 2. User Stories

### US-1: Add Todo
**As a** user
**I want to** add a new todo with descriptive text
**So that** I can track tasks I need to complete

**Acceptance Criteria**:
- User enters todo text (1-200 characters)
- System assigns unique ID
- System records creation timestamp
- System defaults status to "pending"
- System confirms todo added with ID

### US-2: List Todos
**As a** user
**I want to** view all my todos
**So that** I can see what tasks I have

**Acceptance Criteria**:
- System displays all todos with ID, text, status, created date
- Empty list shows "No todos yet"
- Todos sorted by creation date (newest first)

### US-3: Mark Todo Complete
**As a** user
**I want to** mark a todo as complete
**So that** I can track my progress

**Acceptance Criteria**:
- User specifies todo ID
- System validates ID exists
- System updates status to "completed"
- System records completion timestamp
- System confirms completion

### US-4: Delete Todo
**As a** user
**I want to** delete a todo
**So that** I can remove tasks I no longer need

**Acceptance Criteria**:
- User specifies todo ID
- System validates ID exists
- System removes todo
- System confirms deletion

## 3. Functional Requirements

### FR-1: Todo Data Model
```python
@dataclass
class Todo:
    id: str  # UUID4
    text: str  # 1-200 chars
    status: Literal["pending", "completed"]
    created_at: datetime
    completed_at: Optional[datetime] = None
```

### FR-2: Storage
- In-memory list/dict (Python native)
- Data lost on application exit
- No persistence required in Phase I

### FR-3: Console Interface
- Menu-driven with numbered options
- Input validation with error messages
- Clear, readable output format
- Graceful exit option

### FR-4: Operations
1. **Add**: Prompt for text, validate, create todo
2. **List**: Display all todos in table format
3. **Complete**: Prompt for ID, validate, update status
4. **Delete**: Prompt for ID, validate, remove
5. **Exit**: Clean exit with goodbye message

## 4. Non-Functional Requirements

### NFR-1: Technology Stack
- **Language**: Python 3.13+
- **Package Manager**: UV
- **Dependencies**: Standard library only (datetime, uuid, dataclasses)
- **Architecture**: Clean separation (models, storage, ui, main)

### NFR-2: Code Quality
- Type hints on all functions
- Docstrings for public functions
- Max cyclomatic complexity: 10
- Follow PEP 8 style guide

### NFR-3: Error Handling
- Validate all user inputs
- Graceful error messages (no stack traces to user)
- Handle invalid menu choices
- Handle invalid todo IDs

## 5. Technical Constraints

- **No external dependencies** beyond standard library
- **No file I/O** (in-memory only)
- **No async/threading** (simple synchronous flow)
- **No GUI** (console only)

## 6. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Empty todo text | Reject with "Todo text required" |
| Todo text > 200 chars | Reject with "Todo text too long (max 200)" |
| Invalid todo ID | Error: "Todo ID not found" |
| Complete already completed todo | Accept (idempotent), update timestamp |
| Delete non-existent todo | Error: "Todo ID not found" |
| Invalid menu choice | Error: "Invalid choice. Please select 1-5" |

## 7. User Interface Flow

```
=== Todo Application ===
1. Add todo
2. List todos
3. Mark todo complete
4. Delete todo
5. Exit

Enter choice: _
```

## 8. Success Metrics

- [ ] User can add todos successfully
- [ ] User can view all todos
- [ ] User can mark todos complete
- [ ] User can delete todos
- [ ] User can exit cleanly
- [ ] All inputs validated
- [ ] No runtime errors on valid inputs

## 9. Out of Scope (for Phase I)

- Persistence (file/database)
- Todo editing
- Todo priorities
- Due dates
- Categories/tags
- Search/filter
- Undo/redo
- Multi-user support

## 10. Related Artifacts

- **Plan**: `specs/phase1-console-app/plan.md` (to be created)
- **Tasks**: `specs/phase1-console-app/tasks.md` (to be created)
- **Constitution**: `.specify/memory/constitution.md`
```

### Step 4: Validate Completeness

Check spec includes:
- [ ] All user stories with acceptance criteria
- [ ] Functional requirements with data models
- [ ] Non-functional requirements (tech stack, quality)
- [ ] Edge cases identified
- [ ] UI flow documented
- [ ] Success metrics defined
- [ ] Out of scope clearly stated

### Step 5: Request User Approval

Present spec summary:
```
✅ Phase I Specification Created

📄 specs/phase1-console-app/spec.md

📋 Summary:
- 4 user stories (Add, List, Complete, Delete)
- Clean architecture (models, storage, ui, main)
- In-memory storage only
- Python 3.13+ with UV
- Standard library only

👀 Please review and approve before proceeding to planning phase.

Next: Run `/sp.plan` to create implementation plan
```

## Output Artifacts

1. **Spec File**: `specs/phase1-console-app/spec.md`
2. **Directory**: `history/prompts/phase1-console-app/` (created)

## Validation Rules

### MUST Pass:
- All user stories have acceptance criteria
- Data models are concrete (not placeholders)
- Edge cases include invalid inputs
- Tech stack matches hackathon requirements
- No placeholders like "TBD" or "TODO"

### MUST NOT:
- Include implementation code
- Reference Phase II+ features
- Assume persistence
- Use external dependencies

## Example Usage

```bash
# User request:
"Create the Phase I spec for a basic todo console app"

# SpecKit Architect executes this skill:
1. Validates constitution exists
2. Creates specs/phase1-console-app/ directory
3. Generates spec.md with all sections
4. Validates completeness
5. Presents to user for approval
```

## Related Specs

- **Next**: `specs/phase2-fullstack-web/spec.md` (Phase II web app)
- **Depends On**: `.specify/memory/constitution.md`

## Success Indicators

- ✅ Spec file exists and is valid markdown
- ✅ All 10 sections present
- ✅ No placeholders or "TBD" entries
- ✅ Data models are concrete Python code
- ✅ User stories map to functional requirements
- ✅ Edge cases cover error scenarios
- ✅ Tech stack matches Phase I constraints

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Constitution missing | Prompt user to run `/sp.constitution` first |
| Directory exists | Ask user if overwrite is OK |
| Incomplete requirements | Use "Human as Tool" - ask 2-3 clarifying questions |
| Conflicting constraints | Surface to user for decision |

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
