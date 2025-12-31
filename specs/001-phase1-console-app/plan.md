# Implementation Plan: Phase I Console Todo Application

**Branch**: `001-phase1-console-app` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-phase1-console-app/spec.md`

## Summary

Implement an in-memory Python console application providing complete CRUD operations for todo management. The system uses a menu-driven text interface with numbered options (1-6), storing todos in Python dictionaries with UUID identifiers. All operations include input validation, error handling, and user-friendly confirmation messages. Data persists only during runtime; all todos are lost on application exit.

**Technical Approach**: Clean architecture with four distinct layers (models, storage, UI, main orchestration) using Python dataclasses for type safety, built-in datetime/uuid for data integrity, and standard library only (no external dependencies). Test-driven development with pytest covering all CRUD operations and edge cases.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Standard library only (datetime, uuid, dataclasses, typing)
**Storage**: In-memory (Python dictionary keyed by UUID)
**Testing**: pytest with 100% coverage target for CRUD operations
**Target Platform**: Console/Terminal (Windows WSL2, macOS, Linux)
**Project Type**: Single (CLI application)
**Performance Goals**:
- Application startup: <1 second
- Menu response time: <100ms per operation
- Support 100+ todos without noticeable lag (<500ms for list operation)

**Constraints**:
- No external dependencies (standard library only)
- No file persistence or database
- No async/await or threading
- Synchronous, single-process execution
- Text input limited to 1-200 characters
- UUID v4 for unique identifiers (accept first 8 chars as shorthand)

**Scale/Scope**:
- Single user per session
- 100-1000 todos per session (in-memory limit)
- 6 menu operations (Add, List, Complete, Update, Delete, Exit)
- 5 core CRUD functions + exit

## Constitution Check

*GATE: Must pass before implementation. Validates alignment with constitutional principles.*

### Principle I: Spec-Driven Development
- ✅ Complete specification exists (spec.md with 6 user stories, 15 FRs, 8 success criteria)
- ✅ Plan created before tasks/implementation
- ✅ All requirements testable and traceable
- ✅ No manual coding constraint respected (AI-driven implementation)

### Principle III: Test-First Development
- ✅ TDD workflow designed: Write tests → Red → Green → Refactor
- ✅ 100% coverage target for core CRUD operations
- ✅ pytest framework selected
- ✅ Test cases mapped to acceptance scenarios in spec

### Principle VI: Clean Architecture & Code Quality
- ✅ Separation of concerns: models, storage, ui, main
- ✅ Type hints required (Python 3.13+ dataclasses)
- ✅ PEP 8 compliance enforced
- ✅ Error handling for all edge cases
- ✅ No hardcoded values (constants defined)

### Principle II: Phased Progression
- ✅ Phase I scope respected (console-only, in-memory)
- ✅ Out-of-scope items deferred (persistence, multi-user, web UI)
- ✅ Foundation designed for Phase II evolution (clean interfaces, testable design)

**GATE RESULT**: ✅ PASS - Proceed with implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-console-app/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── tasks.md             # Task breakdown (next step: /sp.tasks)
└── checklists/
    └── requirements.md  # Quality validation checklist (completed)
```

### Source Code (repository root)

```text
src/
├── models/
│   └── todo.py          # Todo dataclass with UUID, text, status, timestamps
├── storage/
│   └── todo_storage.py  # In-memory TodoStorage class (dict-based CRUD)
├── ui/
│   └── console_ui.py    # ConsoleUI class (menu display, input prompts, output formatting)
└── main.py              # Application entry point (menu loop orchestration)

tests/
├── unit/
│   ├── test_todo_model.py         # Todo dataclass validation tests
│   ├── test_todo_storage.py       # Storage CRUD operation tests
│   └── test_console_ui.py         # UI display and input validation tests
└── integration/
    └── test_app_integration.py    # End-to-end user scenario tests
```

**Structure Decision**: Single project structure selected. CLI application does not require frontend/backend separation. Clean layering (models → storage → ui → main) provides clear boundaries for testing and future Phase II migration. The `src/` directory contains all application code; `tests/` mirrors structure with unit and integration test separation.

## Complexity Tracking

No constitutional violations. All complexity is justified and minimal:

| Design Choice | Justification |
|---------------|---------------|
| Four-layer architecture (models/storage/ui/main) | Minimal separation for testability; simpler than three layers (would merge storage+ui, harder to test); more complex than two layers (would be untestable monolith) |
| Dataclass for Todo model | Standard library feature providing type safety and immutability; simpler than dict (no validation), more maintainable than namedtuple (no defaults) |
| Dictionary-based storage | Simplest O(1) lookup by UUID; list would be O(n); no need for complex data structures given in-memory constraint |

## Architecture Overview

### System Components

**1. Todo Model (src/models/todo.py)**
- **Responsibility**: Define todo data structure with validation
- **Interface**: Dataclass with fields: id (UUID), text (str), status (str), created_at (datetime), completed_at (Optional[datetime]), updated_at (datetime)
- **Behavior**: Immutable after creation except for status and text updates via explicit methods
- **Validation**: Text length 1-200 characters, status must be "pending" or "completed"

**2. TodoStorage (src/storage/todo_storage.py)**
- **Responsibility**: Manage in-memory todo collection with CRUD operations
- **Interface**:
  - `add(text: str) -> Todo` - Create and store new todo
  - `get_all() -> list[Todo]` - Retrieve all todos sorted by created_at (newest first)
  - `get_by_id(todo_id: str) -> Optional[Todo]` - Find todo by full or partial UUID (min 8 chars)
  - `update_text(todo_id: str, new_text: str) -> Todo` - Modify todo text, refresh updated_at
  - `mark_complete(todo_id: str) -> Todo` - Set status to "completed", set completed_at timestamp
  - `delete(todo_id: str) -> bool` - Remove todo from storage
- **Storage**: Python dict keyed by UUID string, values are Todo instances
- **Error Handling**: Raise ValueError for validation failures, KeyError for missing IDs

**3. ConsoleUI (src/ui/console_ui.py)**
- **Responsibility**: Handle all user interaction (display, input, output formatting)
- **Interface**:
  - `display_menu() -> None` - Show numbered menu options 1-6
  - `get_menu_choice() -> int` - Prompt for menu selection, validate 1-6 range
  - `prompt_todo_text() -> str` - Get todo text input with length validation
  - `prompt_todo_id() -> str` - Get todo ID input (full or partial)
  - `display_todos(todos: list[Todo]) -> None` - Format and print todo list
  - `display_success(message: str) -> None` - Print confirmation message
  - `display_error(message: str) -> None` - Print error message (user-friendly, no stack traces)
  - `confirm_exit() -> None` - Show data loss warning and goodbye message
- **Formatting**:
  - Todo list: Display ID (first 8 chars), text, status, created_at, completed_at (if applicable)
  - Clear visual separation between menu and output (separator lines)
  - Status indicators: [✓] for completed, [ ] for pending

**4. Main Application (src/main.py)**
- **Responsibility**: Orchestrate menu loop and coordinate components
- **Control Flow**:
  1. Initialize TodoStorage instance
  2. Initialize ConsoleUI instance
  3. Enter infinite menu loop:
     - Display menu via ConsoleUI
     - Get user choice via ConsoleUI
     - Route to appropriate handler:
       - Choice 1: Add todo (prompt text, call storage.add, display success)
       - Choice 2: List todos (call storage.get_all, display via ConsoleUI)
       - Choice 3: Mark complete (prompt ID, call storage.mark_complete, display success)
       - Choice 4: Update todo (prompt ID and text, call storage.update_text, display success)
       - Choice 5: Delete todo (prompt ID, call storage.delete, display success)
       - Choice 6: Exit (confirm via ConsoleUI, break loop)
     - Handle exceptions: catch ValueError/KeyError, display error via ConsoleUI, continue loop
  4. Exit cleanly (no errors, no stack traces)
- **Error Recovery**: All exceptions caught at menu loop level; application never crashes

### Data Flow

```
User Input → ConsoleUI.get_menu_choice()
            → Main.menu_loop() routes to handler
            → Handler calls TodoStorage method
            → TodoStorage manipulates Todo models
            → TodoStorage returns result
            → Handler calls ConsoleUI.display_* method
            → ConsoleUI formats output → User sees result
```

**Key Principles**:
- **Unidirectional**: User → UI → Main → Storage → Models
- **No direct coupling**: Models never import storage/ui; storage never imports ui; ui never imports storage
- **Testable layers**: Each component can be tested in isolation with mocks

### State Management

**Storage State**:
- Single source of truth: `TodoStorage._todos: dict[str, Todo]`
- State mutations only via public methods (add, update_text, mark_complete, delete)
- State queries via get_all, get_by_id (read-only, return copies or immutable views)

**Session State**:
- No persistent state across application restarts
- State initialized empty on startup
- State lost on exit (expected behavior per spec)

**Concurrency**:
- None required (single-threaded, synchronous execution)
- No file I/O or network operations

## Data Model

### Todo Entity

**Fields**:
- `id: str` - UUID v4 string representation (e.g., "550e8400-e29b-41d4-a716-446655440000")
- `text: str` - Todo description, 1-200 characters
- `status: Literal["pending", "completed"]` - Completion state
- `created_at: datetime` - Timestamp when todo was created (UTC)
- `completed_at: Optional[datetime]` - Timestamp when marked complete (UTC, None if pending)
- `updated_at: datetime` - Timestamp of last text modification (UTC)

**Invariants**:
- `id` is immutable after creation
- `created_at` is immutable after creation
- `status` starts as "pending", can transition to "completed" (idempotent)
- `completed_at` is None when status is "pending", set when status is "completed"
- `updated_at` refreshes when `text` changes (not when status changes)
- `text` length always 1-200 characters

**Lifecycle**:
1. **Creation**: `Todo(id=new_uuid(), text=user_input, status="pending", created_at=now(), completed_at=None, updated_at=now())`
2. **Update Text**: Create new Todo with updated `text` and `updated_at`, preserve other fields
3. **Mark Complete**: Create new Todo with `status="completed"`, `completed_at=now()`, preserve other fields
4. **Deletion**: Remove from storage dict

**Validation Rules**:
- Text length: 1 ≤ len(text) ≤ 200
- Status: Must be "pending" or "completed"
- Timestamps: Must be valid datetime objects (UTC timezone)
- ID: Must be valid UUID v4 format

### Storage Schema

**In-Memory Dictionary**:
```
_todos: dict[str, Todo] = {
    "550e8400-e29b-41d4-a716-446655440000": Todo(...),
    "7c9e6679-7425-40de-944b-e07fc1f90ae7": Todo(...),
    ...
}
```

**Key**: UUID string (full 36-character format)
**Value**: Todo dataclass instance
**Lookup**: O(1) by full UUID or first 8+ characters (scan required for partial match)

**No persistence layer**: Storage exists only in memory during application runtime

## API Contracts

### TodoStorage Public Interface

**add(text: str) -> Todo**
- **Input**: text (1-200 characters)
- **Output**: Created Todo instance
- **Errors**: ValueError if text length invalid
- **Side Effects**: Adds todo to internal dict
- **Idempotency**: No (each call creates new UUID)

**get_all() -> list[Todo]**
- **Input**: None
- **Output**: List of all todos sorted by created_at descending (newest first)
- **Errors**: None
- **Side Effects**: None (read-only)
- **Idempotency**: Yes

**get_by_id(todo_id: str) -> Optional[Todo]**
- **Input**: Full or partial UUID (minimum 8 characters)
- **Output**: Todo if found, None if not found
- **Errors**: ValueError if todo_id < 8 characters
- **Side Effects**: None (read-only)
- **Idempotency**: Yes

**update_text(todo_id: str, new_text: str) -> Todo**
- **Input**: todo_id (8+ chars), new_text (1-200 chars)
- **Output**: Updated Todo instance
- **Errors**: ValueError if text invalid, KeyError if todo_id not found
- **Side Effects**: Modifies todo in dict, updates updated_at timestamp
- **Idempotency**: Yes (same text = same result)

**mark_complete(todo_id: str) -> Todo**
- **Input**: todo_id (8+ chars)
- **Output**: Updated Todo with status="completed"
- **Errors**: KeyError if todo_id not found
- **Side Effects**: Sets status and completed_at timestamp
- **Idempotency**: Yes (multiple calls = same result, completed_at updates)

**delete(todo_id: str) -> bool**
- **Input**: todo_id (8+ chars)
- **Output**: True if deleted, False if not found
- **Errors**: None
- **Side Effects**: Removes todo from dict
- **Idempotency**: Yes (second call returns False)

### ConsoleUI Public Interface

**display_menu() -> None**
- **Output**: Prints menu to stdout
- **Format**: Numbered list 1-6 with clear descriptions

**get_menu_choice() -> int**
- **Input**: User types number 1-6
- **Output**: Validated integer 1-6
- **Errors**: Re-prompts on invalid input (loops until valid)
- **Validation**: Accepts only integers in range 1-6

**prompt_todo_text() -> str**
- **Input**: User types text
- **Output**: Validated text (1-200 chars)
- **Errors**: Re-prompts on invalid length
- **Validation**: Strips whitespace, checks length

**prompt_todo_id() -> str**
- **Input**: User types UUID (full or partial)
- **Output**: UUID string (8+ characters)
- **Errors**: Re-prompts on invalid length
- **Validation**: Minimum 8 characters required

**display_todos(todos: list[Todo]) -> None**
- **Input**: List of todos (may be empty)
- **Output**: Formatted table or "No todos yet" message
- **Format**: ID (8 chars) | Text | Status | Created | Completed (if applicable)

**display_success(message: str) -> None**
- **Output**: Prints success message with visual indicator (e.g., "✅ {message}")

**display_error(message: str) -> None**
- **Output**: Prints error message with visual indicator (e.g., "❌ {message}")

**confirm_exit() -> None**
- **Output**: Prints data loss warning and goodbye message

## Non-Functional Requirements

### Performance

**Targets** (from spec SC-001 to SC-004):
- Application startup: <1 second (Python interpreter load + module imports)
- Menu display: <100ms per operation
- Add todo: <10 seconds total (including user input time)
- List todos: <500ms for 100 todos (O(n log n) sort)
- Individual operations (complete/update/delete): <100ms

**Optimization Strategy**:
- Use dict for O(1) lookup by ID
- Sort only on display (lazy sorting, not on every add)
- No premature optimization; measure if targets missed

### Reliability

**Targets** (from spec SC-003, SC-005, SC-007):
- No crashes on valid inputs: 100%
- All invalid inputs handled gracefully: 100%
- All actions have confirmation/error messages: 100%
- Clean exit without errors: 100%

**Error Handling Strategy**:
- Validate all inputs at UI layer (first line of defense)
- Validate business rules at storage layer (second line of defense)
- Catch all exceptions at main loop level (safety net)
- Never expose stack traces to user (log internally if needed for debugging)

**Error Categories**:
1. **User Input Errors**: Invalid menu choice, empty text, text too long, invalid ID format
   - **Recovery**: Re-prompt with clear error message
2. **Business Logic Errors**: Todo ID not found, duplicate operation on completed todo
   - **Recovery**: Display error, return to menu
3. **System Errors**: Out of memory (unlikely with 100-1000 todos)
   - **Recovery**: Display generic error, attempt graceful shutdown

### Usability

**Targets** (from spec SC-006):
- Menu options understandable without documentation: 100%
- Clear prompts for all inputs
- Visual separation between menu and output
- Consistent formatting across all operations

**Design Patterns**:
- Numbered menu (1-6) with action verbs: "1. Add todo", "2. List todos"
- Prompts include examples: "Enter todo ID (e.g., abc12345):"
- Success messages repeat action: "✅ Todo added: 'Buy groceries'"
- Error messages suggest correction: "❌ Text too long (max 200 characters)"
- Todo list formatted as table with aligned columns

### Testability

**Coverage Target**: 100% for core CRUD operations (add, get_all, update, complete, delete)

**Test Strategy**:
- **Unit Tests**: Test each component in isolation with mocks
  - `test_todo_model.py`: Validate dataclass creation, validation, immutability
  - `test_todo_storage.py`: Test all CRUD methods, edge cases (empty storage, not found, partial ID matching)
  - `test_console_ui.py`: Test display formatting, input validation loops
- **Integration Tests**: Test end-to-end scenarios
  - `test_app_integration.py`: Simulate user interactions, verify state changes

**Test Cases Mapped to Acceptance Scenarios** (from spec):
- User Story 1 → TC-001 to TC-003 (add todo scenarios)
- User Story 2 → TC-004 to TC-006 (list todos scenarios)
- User Story 3 → TC-007 to TC-009 (mark complete scenarios)
- User Story 4 → TC-010 to TC-012 (update text scenarios)
- User Story 5 → TC-013 to TC-015 (delete todo scenarios)
- User Story 6 → TC-016 to TC-018 (exit scenarios)
- Edge Cases → TC-019 to TC-025 (invalid inputs, Ctrl+C, etc.)

### Maintainability

**Code Quality Standards**:
- PEP 8 compliance (enforced by ruff linter)
- Type hints on all functions (checked by mypy)
- Docstrings for all public functions (Google style)
- Max cyclomatic complexity: 10 per function
- No code duplication (DRY principle)

**Documentation**:
- Each module includes purpose docstring
- Public functions include: description, args, returns, raises
- Complex logic includes inline comments explaining "why" not "what"

**Future-Proofing for Phase II**:
- Storage interface designed for easy swap to database (same method signatures)
- UI layer isolated (can be replaced with web API routes)
- Models remain valid (same Todo structure for web app)

### Security

**Scope**: Minimal (single-user, local execution, no network/file I/O)

**Considerations**:
- Input validation prevents code injection (no eval, exec, or dynamic imports)
- Text length limits prevent memory exhaustion attacks
- No secrets or credentials (none required for Phase I)

**Phase II Preparation**:
- Todo model supports future user_id field (multi-user isolation)
- No hardcoded assumptions about single-user (design supports extension)

## Deployment Strategy

### Development Environment

**Prerequisites**:
- Python 3.13+ installed
- UV package manager installed
- Git for version control
- WSL2 (Windows users) or native Unix shell (macOS/Linux)

**Setup Steps**:
1. Initialize UV project: `uv init` (if not done)
2. Create virtual environment: `uv venv`
3. Install dev dependencies: `uv add --dev pytest pytest-cov mypy ruff`
4. Configure tools: Create `pyproject.toml` with tool settings

### Execution

**Run Application**:
```bash
uv run python src/main.py
```

**Run Tests**:
```bash
uv run pytest tests/ -v --cov=src --cov-report=term-missing
```

**Code Quality Checks**:
```bash
uv run mypy src/
uv run ruff check src/
uv run ruff format src/
```

### Package Structure

**No packaging required**: Application runs as script during Phase I

**Phase II Migration**:
- Backend: Convert to FastAPI package with same models/storage structure
- Frontend: Build Next.js app consuming FastAPI endpoints

## Risk Analysis

### Top Risks

**Risk 1: Input Validation Complexity**
- **Impact**: Medium - Missing validation could allow invalid data
- **Likelihood**: Low - Spec defines all edge cases clearly
- **Mitigation**:
  - Implement validation at both UI and storage layers (defense in depth)
  - Write comprehensive test cases for all edge cases before implementation
  - Use type hints and mypy to catch type errors statically
- **Contingency**: If validation proves complex, extract to separate validator module

**Risk 2: UUID Partial Matching Ambiguity**
- **Impact**: Low - User enters partial ID matching multiple todos
- **Likelihood**: Very Low - UUIDs have high entropy (8 chars = 16^8 combinations)
- **Mitigation**:
  - Require minimum 8 characters (collision probability negligible)
  - If multiple matches found, return first match (UUIDs sorted)
  - Document behavior in help text
- **Contingency**: Require full UUID if collision occurs (unlikely with 100-1000 todos)

**Risk 3: Menu Loop Exit Handling**
- **Impact**: Medium - Ctrl+C or unexpected exit leaves error messages
- **Likelihood**: Medium - Users may interrupt program
- **Mitigation**:
  - Catch KeyboardInterrupt (Ctrl+C) at main loop level
  - Handle SystemExit gracefully
  - Display clean exit message even on interrupt
- **Contingency**: Use try/finally block to ensure cleanup runs

## Testing Strategy

### Test-Driven Development Workflow

**Red-Green-Refactor Cycle**:
1. **Red**: Write test for next acceptance scenario (test fails)
2. **Green**: Implement minimal code to pass test
3. **Refactor**: Clean up code while keeping tests green
4. Repeat for each acceptance scenario

**Implementation Order** (by user story priority):
1. Todo model + tests (foundation)
2. TodoStorage.add + tests (P1: Add New Todo)
3. TodoStorage.get_all + tests (P2: View All Todos)
4. TodoStorage.mark_complete + tests (P3: Mark Complete)
5. TodoStorage.update_text + tests (P4: Update Text)
6. TodoStorage.delete + tests (P5: Delete Todo)
7. ConsoleUI + tests (all display/input methods)
8. Main application + integration tests (P1: Exit Application)
9. Edge case tests (invalid inputs, Ctrl+C, etc.)

### Test Coverage

**Unit Tests** (80% of test effort):
- `test_todo_model.py`: 10 tests (creation, validation, field access)
- `test_todo_storage.py`: 25 tests (all CRUD methods + edge cases)
- `test_console_ui.py`: 15 tests (display formatting, input validation)

**Integration Tests** (20% of test effort):
- `test_app_integration.py`: 18 tests (one per acceptance scenario from spec)

**Total Test Cases**: ~68 tests (mapped to 18 acceptance scenarios + edge cases)

**Coverage Target**: 100% for src/ directory (all lines, all branches)

### Test Tools

**pytest Configuration** (pyproject.toml):
- Minimum coverage: 100%
- Fail on coverage drop
- Generate HTML coverage report
- Verbose output with test names

**Mock Strategy**:
- Mock ConsoleUI in integration tests (simulate user input)
- Mock datetime.now() for timestamp testing (deterministic tests)
- Mock uuid.uuid4() for ID testing (predictable UUIDs)
- No mocks for unit tests (test real implementations)

## Success Criteria Validation

**Mapping to Spec Success Criteria**:

| Spec ID | Criterion | Validation Method |
|---------|-----------|-------------------|
| SC-001 | Add todo in <10 seconds | Manual testing (user input time variable) |
| SC-002 | All 5 CRUD operations in single session | Integration test simulating full workflow |
| SC-003 | 100% error messages without stack traces | Integration tests + exception handling review |
| SC-004 | 100 todos without lag | Performance test: add 100 todos, measure list operation |
| SC-005 | 100% confirmation/error messages | Code review: every operation has display_success or display_error |
| SC-006 | Menu understandable without docs | User acceptance testing (optional) |
| SC-007 | 100% clean exits | Integration tests + manual testing (Ctrl+C, normal exit) |
| SC-008 | Consistent newest-first sorting | Unit tests for get_all() with multiple todos |

**Phase Transition Criteria Checklist**:
- [ ] All P1-P5 user stories implemented and tested
- [ ] All edge cases handled gracefully
- [ ] All acceptance scenarios pass (18 integration tests)
- [ ] 100% test coverage for CRUD operations
- [ ] Code quality checks pass (mypy, ruff, pytest)
- [ ] Demo video recorded (<90 seconds)
- [ ] Specification documented with PHRs
- [ ] Phase transition validation approved

## Architectural Decision Records

**Significant decisions requiring ADR documentation**:

1. **In-Memory Storage with Dictionary**
   - **Decision**: Use dict[str, Todo] for storage instead of list or external library
   - **Rationale**: O(1) lookup by UUID, simple, no external dependencies, meets performance targets
   - **Alternatives Considered**: List (O(n) lookup), SQLite (overkill for Phase I), external library (violates constraint)
   - **Tradeoffs**: No persistence (acceptable for Phase I), no query optimization (not needed)
   - **ADR**: Document via `/sp.adr in-memory-dictionary-storage`

2. **Four-Layer Architecture**
   - **Decision**: Separate models, storage, ui, main into distinct modules
   - **Rationale**: Testability, clear boundaries, easy Phase II migration
   - **Alternatives Considered**: Monolithic main.py (untestable), three layers (merged storage+ui, harder to test)
   - **Tradeoffs**: More files (minimal cost), clearer contracts (high benefit)
   - **ADR**: Document via `/sp.adr four-layer-console-architecture`

3. **Partial UUID Matching (8 Characters Minimum)**
   - **Decision**: Accept first 8+ characters of UUID for user convenience
   - **Rationale**: User-friendly (shorter input), negligible collision risk with 100-1000 todos
   - **Alternatives Considered**: Full UUID only (tedious for users), auto-increment IDs (not globally unique)
   - **Tradeoffs**: Collision handling complexity (minimal), UX improvement (high)
   - **ADR**: Document via `/sp.adr partial-uuid-matching`

**ADR Creation**: Run `/sp.adr <title>` after plan approval to document these decisions formally.

## Next Steps

1. ✅ **Plan Complete**: This document
2. ⏭️ **Task Breakdown**: Run `/sp.tasks` to generate tasks.md with atomic implementation tasks
3. ⏭️ **ADR Documentation**: Run `/sp.adr` three times for significant decisions above
4. ⏭️ **Implementation**: Run `/sp.implement` to execute tasks via TDD workflow
5. ⏭️ **Phase Transition**: Run `/sp.validate-phase-transition` before advancing to Phase II

**Blockers**: None - ready to proceed with task breakdown

**Open Questions**: None - all requirements clarified in spec

---

**Plan Status**: ✅ COMPLETE
**Constitutional Compliance**: ✅ VERIFIED
**Ready for Task Breakdown**: ✅ YES
**Next Command**: `/sp.tasks`
