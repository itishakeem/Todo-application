---
description: "Task breakdown for Phase I Console Todo Application"
---

# Tasks: Phase I Console Todo Application

**Input**: Design documents from `specs/001-phase1-console-app/`
**Prerequisites**: plan.md (complete), spec.md (complete)

**Tests**: All test tasks use pytest with TDD Red-Green-Refactor workflow. Tests MUST be written first and FAIL before implementation.

**Organization**: Tasks grouped by user story (US1-US6) to enable independent implementation and testing per priority.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping (US1=Add, US2=View, US3=Complete, US4=Update, US5=Delete, US6=Exit)
- File paths follow plan.md structure: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [ ] TASK-001 Create project directory structure: `src/models/`, `src/storage/`, `src/ui/`, `src/`, `tests/unit/`, `tests/integration/`
- [ ] TASK-002 Initialize Python project with UV: `uv init`, create `pyproject.toml` with Python 3.13+ requirement
- [ ] TASK-003 [P] Install dev dependencies via UV: `pytest`, `pytest-cov`, `mypy`, `ruff`
- [ ] TASK-004 [P] Configure pytest in `pyproject.toml`: test discovery, coverage settings, verbose output
- [ ] TASK-005 [P] Configure mypy in `pyproject.toml`: strict mode, Python 3.13+ target, type checking enabled
- [ ] TASK-006 [P] Configure ruff in `pyproject.toml`: PEP 8 compliance, line length 100, import sorting

**Checkpoint**: Project structure initialized, tools configured, ready for TDD workflow

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Todo model that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] TASK-007 [P] Create unit test file `tests/unit/test_todo_model.py` with test stubs for Todo creation, validation, field access
- [ ] TASK-008 Create Todo model dataclass in `src/models/todo.py`: fields (id: str, text: str, status: Literal["pending", "completed"], created_at: datetime, completed_at: Optional[datetime], updated_at: datetime)
- [ ] TASK-009 Add Todo validation: text length 1-200 characters, status must be "pending" or "completed", timestamps must be datetime objects
- [ ] TASK-010 Add Todo factory method: `Todo.create(text: str) -> Todo` that generates UUID, sets status="pending", initializes timestamps with `datetime.now(UTC)`
- [ ] TASK-011 Run unit tests for Todo model: `uv run pytest tests/unit/test_todo_model.py -v` - verify all tests pass

**Checkpoint**: Foundation ready - Todo model complete and tested, user story implementation can begin

---

## Phase 3: User Story 1 - Add New Todo (Priority: P1) 🎯 MVP

**Goal**: Users can add new todos with text 1-200 characters, receive confirmation with unique ID

**Independent Test**: Launch app, select "Add todo", enter "Buy groceries", verify confirmation message with UUID

### Tests for User Story 1 (Red Phase - Write First, Ensure FAIL)

- [ ] TASK-012 [P] [US1] Create unit test file `tests/unit/test_todo_storage.py` with test for `add()` method: verify todo created with UUID, text stored, status="pending", timestamps set
- [ ] TASK-013 [P] [US1] Add test for `add()` validation: empty text raises ValueError "Todo text required"
- [ ] TASK-014 [P] [US1] Add test for `add()` validation: text >200 chars raises ValueError "Todo text too long (max 200)"
- [ ] TASK-015 [P] [US1] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py -v` - verify all FAIL (Red phase)

### Implementation for User Story 1 (Green Phase)

- [ ] TASK-016 [US1] Create TodoStorage class in `src/storage/todo_storage.py`: initialize empty dict `_todos: dict[str, Todo]`
- [ ] TASK-017 [US1] Implement `TodoStorage.add(text: str) -> Todo`: validate text length, create Todo via factory, store in dict, return Todo instance
- [ ] TASK-018 [US1] Add input validation errors: raise ValueError for empty/too-long text with user-friendly messages
- [ ] TASK-019 [US1] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py -v` - verify all PASS (Green phase)

### UI Layer for User Story 1

- [ ] TASK-020 [P] [US1] Create unit test file `tests/unit/test_console_ui.py` with test for `display_success()` output format
- [ ] TASK-021 [US1] Create ConsoleUI class in `src/ui/console_ui.py`: implement `display_success(message: str)` that prints "✅ {message}"
- [ ] TASK-022 [US1] Implement `ConsoleUI.display_error(message: str)` that prints "❌ {message}"
- [ ] TASK-023 [US1] Implement `ConsoleUI.prompt_todo_text() -> str`: prompt user input, strip whitespace, validate length, loop on error with display_error
- [ ] TASK-024 [US1] Run UI tests: `uv run pytest tests/unit/test_console_ui.py -v` - verify display methods work

### Integration for User Story 1

- [ ] TASK-025 [US1] Create integration test file `tests/integration/test_app_integration.py` with test simulating "add todo" workflow (mock user input, verify todo stored)
- [ ] TASK-026 [US1] Create main application entry point `src/main.py`: initialize TodoStorage and ConsoleUI instances
- [ ] TASK-027 [US1] Implement menu option 1 handler in `src/main.py`: call `ui.prompt_todo_text()`, call `storage.add()`, call `ui.display_success()` with confirmation
- [ ] TASK-028 [US1] Add exception handling: catch ValueError, call `ui.display_error()`, continue menu loop
- [ ] TASK-029 [US1] Run integration test for add todo: `uv run pytest tests/integration/test_app_integration.py::test_add_todo -v` - verify PASS

**Checkpoint**: User Story 1 complete - users can add todos and receive confirmation

---

## Phase 4: User Story 2 - View All Todos (Priority: P2)

**Goal**: Users can view all todos sorted by creation date (newest first) with ID, text, status, timestamps

**Independent Test**: Add 3 todos, select "List todos", verify all 3 displayed with correct details and sort order

### Tests for User Story 2 (Red Phase)

- [ ] TASK-030 [P] [US2] Add test to `tests/unit/test_todo_storage.py` for `get_all()` method: add 3 todos, verify returned list length=3, sorted newest first
- [ ] TASK-031 [P] [US2] Add test for `get_all()` with empty storage: verify returns empty list
- [ ] TASK-032 [P] [US2] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_get_all* -v` - verify FAIL

### Implementation for User Story 2 (Green Phase)

- [ ] TASK-033 [US2] Implement `TodoStorage.get_all() -> list[Todo]` in `src/storage/todo_storage.py`: return all todos sorted by `created_at` descending
- [ ] TASK-034 [US2] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_get_all* -v` - verify PASS

### UI Layer for User Story 2

- [ ] TASK-035 [P] [US2] Add test to `tests/unit/test_console_ui.py` for `display_todos()`: verify formatted output with columns (ID first 8 chars, text, status, created date)
- [ ] TASK-036 [P] [US2] Add test for `display_todos()` with empty list: verify prints "No todos yet"
- [ ] TASK-037 [US2] Implement `ConsoleUI.display_todos(todos: list[Todo])` in `src/ui/console_ui.py`: format as table with headers, show status indicators [✓]/[ ], handle empty list
- [ ] TASK-038 [US2] Run UI tests: `uv run pytest tests/unit/test_console_ui.py::test_display_todos* -v` - verify PASS

### Integration for User Story 2

- [ ] TASK-039 [US2] Add integration test to `tests/integration/test_app_integration.py` simulating "list todos" workflow: add todos, select list option, verify output
- [ ] TASK-040 [US2] Implement menu option 2 handler in `src/main.py`: call `storage.get_all()`, call `ui.display_todos()` with results
- [ ] TASK-041 [US2] Run integration test: `uv run pytest tests/integration/test_app_integration.py::test_list_todos -v` - verify PASS

**Checkpoint**: User Story 2 complete - users can view all todos with proper formatting and sorting

---

## Phase 5: User Story 3 - Mark Todo Complete (Priority: P3)

**Goal**: Users can mark todos as complete by ID, see status change to "completed" with completion timestamp

**Independent Test**: Add todo, select "Mark complete", enter ID, verify status changes and completion timestamp appears

### Tests for User Story 3 (Red Phase)

- [ ] TASK-042 [P] [US3] Add test to `tests/unit/test_todo_storage.py` for `mark_complete(todo_id: str)`: create todo, mark complete, verify status="completed" and `completed_at` set
- [ ] TASK-043 [P] [US3] Add test for `mark_complete()` idempotency: mark complete twice, verify both succeed and `completed_at` updates
- [ ] TASK-044 [P] [US3] Add test for `mark_complete()` with invalid ID: verify raises KeyError "Todo ID not found"
- [ ] TASK-045 [P] [US3] Add test for partial UUID matching: create todo, call `mark_complete()` with first 8 chars, verify succeeds
- [ ] TASK-046 [P] [US3] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_mark_complete* -v` - verify FAIL

### Implementation for User Story 3 (Green Phase)

- [ ] TASK-047 [US3] Implement `TodoStorage.get_by_id(todo_id: str) -> Optional[Todo]` in `src/storage/todo_storage.py`: search by full or partial UUID (min 8 chars), return None if not found
- [ ] TASK-048 [US3] Implement `TodoStorage.mark_complete(todo_id: str) -> Todo`: find todo via `get_by_id()`, update status="completed", set `completed_at=datetime.now(UTC)`, return updated todo, raise KeyError if not found
- [ ] TASK-049 [US3] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_mark_complete* -v` - verify PASS

### UI Layer for User Story 3

- [ ] TASK-050 [P] [US3] Add test to `tests/unit/test_console_ui.py` for `prompt_todo_id()`: verify prompts user, validates min 8 chars, loops on error
- [ ] TASK-051 [US3] Implement `ConsoleUI.prompt_todo_id() -> str` in `src/ui/console_ui.py`: prompt for ID, validate length ≥8, re-prompt with error if invalid
- [ ] TASK-052 [US3] Run UI tests: `uv run pytest tests/unit/test_console_ui.py::test_prompt_todo_id* -v` - verify PASS

### Integration for User Story 3

- [ ] TASK-053 [US3] Add integration test to `tests/integration/test_app_integration.py` simulating "mark complete" workflow: add todo, mark complete by ID, verify status changed
- [ ] TASK-054 [US3] Implement menu option 3 handler in `src/main.py`: call `ui.prompt_todo_id()`, call `storage.mark_complete()`, call `ui.display_success()`, catch KeyError and display error
- [ ] TASK-055 [US3] Run integration test: `uv run pytest tests/integration/test_app_integration.py::test_mark_complete -v` - verify PASS

**Checkpoint**: User Story 3 complete - users can mark todos complete with status tracking

---

## Phase 6: User Story 4 - Update Todo Text (Priority: P4)

**Goal**: Users can update todo text by ID, see updated text and refreshed `updated_at` timestamp

**Independent Test**: Add todo "Buy milk", update to "Buy milk and eggs", verify text changes and `updated_at` refreshed

### Tests for User Story 4 (Red Phase)

- [ ] TASK-056 [P] [US4] Add test to `tests/unit/test_todo_storage.py` for `update_text(todo_id: str, new_text: str)`: create todo, update text, verify text changed and `updated_at` refreshed
- [ ] TASK-057 [P] [US4] Add test for `update_text()` validation: empty text raises ValueError "Todo text required"
- [ ] TASK-058 [P] [US4] Add test for `update_text()` validation: text >200 chars raises ValueError "Todo text too long (max 200)"
- [ ] TASK-059 [P] [US4] Add test for `update_text()` with invalid ID: verify raises KeyError "Todo ID not found"
- [ ] TASK-060 [P] [US4] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_update_text* -v` - verify FAIL

### Implementation for User Story 4 (Green Phase)

- [ ] TASK-061 [US4] Implement `TodoStorage.update_text(todo_id: str, new_text: str) -> Todo` in `src/storage/todo_storage.py`: validate text, find todo, update text field, set `updated_at=datetime.now(UTC)`, raise ValueError/KeyError on errors
- [ ] TASK-062 [US4] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_update_text* -v` - verify PASS

### Integration for User Story 4

- [ ] TASK-063 [US4] Add integration test to `tests/integration/test_app_integration.py` simulating "update todo" workflow: add todo, update text, verify changes persisted
- [ ] TASK-064 [US4] Implement menu option 4 handler in `src/main.py`: call `ui.prompt_todo_id()`, call `ui.prompt_todo_text()`, call `storage.update_text()`, display success, catch errors
- [ ] TASK-065 [US4] Run integration test: `uv run pytest tests/integration/test_app_integration.py::test_update_todo -v` - verify PASS

**Checkpoint**: User Story 4 complete - users can update todo text with validation

---

## Phase 7: User Story 5 - Delete Todo (Priority: P5)

**Goal**: Users can delete todos by ID, see confirmation and todo removed from list

**Independent Test**: Add todo, select "Delete todo", enter ID, verify deletion confirmed and todo no longer in list

### Tests for User Story 5 (Red Phase)

- [ ] TASK-066 [P] [US5] Add test to `tests/unit/test_todo_storage.py` for `delete(todo_id: str) -> bool`: create todo, delete, verify returns True and todo removed from storage
- [ ] TASK-067 [P] [US5] Add test for `delete()` with non-existent ID: verify returns False (no error)
- [ ] TASK-068 [P] [US5] Add test for `delete()` idempotency: delete twice, verify first returns True, second returns False
- [ ] TASK-069 [P] [US5] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_delete* -v` - verify FAIL

### Implementation for User Story 5 (Green Phase)

- [ ] TASK-070 [US5] Implement `TodoStorage.delete(todo_id: str) -> bool` in `src/storage/todo_storage.py`: find todo via `get_by_id()`, remove from dict, return True if deleted, False if not found
- [ ] TASK-071 [US5] Run storage tests: `uv run pytest tests/unit/test_todo_storage.py::test_delete* -v` - verify PASS

### Integration for User Story 5

- [ ] TASK-072 [US5] Add integration test to `tests/integration/test_app_integration.py` simulating "delete todo" workflow: add todo, delete by ID, verify removed from list
- [ ] TASK-073 [US5] Implement menu option 5 handler in `src/main.py`: call `ui.prompt_todo_id()`, call `storage.delete()`, display success if True or error if False
- [ ] TASK-074 [US5] Run integration test: `uv run pytest tests/integration/test_app_integration.py::test_delete_todo -v` - verify PASS

**Checkpoint**: User Story 5 complete - users can delete todos with confirmation

---

## Phase 8: User Story 6 - Exit Application (Priority: P1)

**Goal**: Users can cleanly exit the application with data loss warning and goodbye message, no errors or stack traces

**Independent Test**: Launch app, select "Exit", verify goodbye message displays and application terminates without errors

### Tests for User Story 6 (Red Phase)

- [ ] TASK-075 [P] [US6] Add test to `tests/unit/test_console_ui.py` for `display_menu()`: verify prints menu with 6 options numbered 1-6
- [ ] TASK-076 [P] [US6] Add test for `get_menu_choice()`: verify prompts for input, validates 1-6 range, loops on invalid input
- [ ] TASK-077 [P] [US6] Add test for `confirm_exit()`: verify prints data loss warning and goodbye message
- [ ] TASK-078 [P] [US6] Run UI tests: `uv run pytest tests/unit/test_console_ui.py::test_*menu* -v` - verify FAIL

### Implementation for User Story 6 (Green Phase)

- [ ] TASK-079 [US6] Implement `ConsoleUI.display_menu()` in `src/ui/console_ui.py`: print numbered menu options 1-6 (Add todo, List todos, Mark complete, Update todo, Delete todo, Exit)
- [ ] TASK-080 [US6] Implement `ConsoleUI.get_menu_choice() -> int` in `src/ui/console_ui.py`: prompt for number 1-6, validate input, loop with error on invalid, return validated choice
- [ ] TASK-081 [US6] Implement `ConsoleUI.confirm_exit()` in `src/ui/console_ui.py`: print "⚠️ All todos will be lost (in-memory only)" and "Goodbye!"
- [ ] TASK-082 [US6] Run UI tests: `uv run pytest tests/unit/test_console_ui.py::test_*menu* -v` - verify PASS

### Main Application Loop for User Story 6

- [ ] TASK-083 [US6] Implement main menu loop in `src/main.py`: infinite loop calling `display_menu()`, `get_menu_choice()`, routing to handlers 1-5, breaking on choice 6
- [ ] TASK-084 [US6] Implement menu option 6 handler in `src/main.py`: call `ui.confirm_exit()`, break loop, exit cleanly
- [ ] TASK-085 [US6] Add KeyboardInterrupt handler in `src/main.py`: catch Ctrl+C, call `ui.confirm_exit()`, exit without stack trace
- [ ] TASK-086 [US6] Add `if __name__ == "__main__"` block in `src/main.py`: call main() function to start application

### Integration for User Story 6

- [ ] TASK-087 [US6] Add integration test to `tests/integration/test_app_integration.py` simulating "exit" workflow: select exit option, verify clean termination
- [ ] TASK-088 [US6] Add integration test for Ctrl+C handling: simulate KeyboardInterrupt, verify graceful exit
- [ ] TASK-089 [US6] Run integration tests: `uv run pytest tests/integration/test_app_integration.py::test_exit* -v` - verify PASS

**Checkpoint**: User Story 6 complete - application has functional menu loop with clean exit

---

## Phase 9: Edge Cases & Robustness

**Purpose**: Handle all edge cases from spec.md, ensure 100% error coverage

- [ ] TASK-090 [P] Add integration test for empty text input: verify error "Todo text required" and re-prompt
- [ ] TASK-091 [P] Add integration test for text >200 chars: verify error "Todo text too long (max 200)" and re-prompt
- [ ] TASK-092 [P] Add integration test for invalid menu choice: verify error "Invalid choice. Please select 1-6" and re-prompt
- [ ] TASK-093 [P] Add integration test for invalid todo ID format: verify error "Invalid ID (minimum 8 characters)" and re-prompt
- [ ] TASK-094 [P] Add integration test for long todo list (100 items): verify list displays without lag (<500ms)
- [ ] TASK-095 Verify all edge case tests pass: `uv run pytest tests/integration/ -v -k edge_case`

**Checkpoint**: All edge cases handled gracefully per spec requirements

---

## Phase 10: Code Quality & Documentation

**Purpose**: Ensure code quality standards from plan.md NFRs

- [ ] TASK-096 [P] Add docstrings to all public functions in `src/models/todo.py` (Google style: description, Args, Returns, Raises)
- [ ] TASK-097 [P] Add docstrings to all public methods in `src/storage/todo_storage.py`
- [ ] TASK-098 [P] Add docstrings to all public methods in `src/ui/console_ui.py`
- [ ] TASK-099 [P] Add module-level docstrings to all files explaining purpose
- [ ] TASK-100 Run mypy type checking: `uv run mypy src/` - verify zero errors
- [ ] TASK-101 Run ruff linting: `uv run ruff check src/` - verify zero issues
- [ ] TASK-102 Run ruff formatting: `uv run ruff format src/` - verify all files formatted
- [ ] TASK-103 Run full test suite with coverage: `uv run pytest tests/ -v --cov=src --cov-report=term-missing --cov-report=html` - verify 100% coverage
- [ ] TASK-104 Review coverage report: open `htmlcov/index.html`, verify all lines covered, no missing branches

**Checkpoint**: Code quality gates pass (mypy, ruff, pytest, 100% coverage)

---

## Phase 11: Final Validation & Demo

**Purpose**: Validate phase transition criteria from spec.md, prepare for Phase II

- [ ] TASK-105 Manual test: Add todo "Buy groceries" - verify confirmation with UUID
- [ ] TASK-106 Manual test: List todos - verify displays with ID, text, status, created date, sorted newest first
- [ ] TASK-107 Manual test: Mark todo complete - verify status changes to "completed" with completion timestamp
- [ ] TASK-108 Manual test: Update todo text - verify text changes and `updated_at` refreshed
- [ ] TASK-109 Manual test: Delete todo - verify confirmation and removal from list
- [ ] TASK-110 Manual test: Exit application - verify data loss warning and clean termination
- [ ] TASK-111 Manual test: Ctrl+C interrupt - verify graceful exit without stack trace
- [ ] TASK-112 Record demo video (<90 seconds): show all CRUD operations, upload for submission
- [ ] TASK-113 Run phase transition validation: verify all acceptance scenarios pass, all edge cases handled, 100% test coverage achieved

**Checkpoint**: Phase I complete and ready for submission

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phases 3-8 (User Stories)**: All depend on Phase 2 completion
  - Can proceed sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4) → US5 (P5) → US6 (P1)
  - OR in parallel if multiple developers (after Phase 2 complete)
- **Phase 9 (Edge Cases)**: Depends on Phases 3-8 completion
- **Phase 10 (Quality)**: Depends on Phase 9 completion
- **Phase 11 (Validation)**: Depends on Phase 10 completion

### TDD Workflow Within Each User Story

1. **Red Phase**: Write tests first, ensure they FAIL
2. **Green Phase**: Implement minimal code to make tests PASS
3. **Refactor Phase**: Clean up code while keeping tests green
4. Move to next user story only after current story checkpoint passes

### Parallel Opportunities

**Within Setup (Phase 1)**:
- TASK-003, TASK-004, TASK-005, TASK-006 can run in parallel (different config files)

**Within Foundational (Phase 2)**:
- TASK-007 can start immediately (test file independent)

**Within Each User Story**:
- Test creation tasks marked [P] can run in parallel (different test files)
- Model creation tasks marked [P] can run in parallel (different model files)

**Across User Stories** (if multi-developer team):
- After Phase 2 complete, US1, US2, US3, US4, US5 can be implemented in parallel by different developers
- US6 (Exit) should be last as it integrates the menu loop

**Within Code Quality (Phase 10)**:
- TASK-096, TASK-097, TASK-098, TASK-099 can run in parallel (different files)

---

## Implementation Strategy

### Sequential (Single Developer - Recommended)

1. Complete Phase 1: Setup (TASK-001 to TASK-006)
2. Complete Phase 2: Foundational (TASK-007 to TASK-011)
3. Complete Phase 3: US1 Add Todo (TASK-012 to TASK-029) - MVP checkpoint
4. Complete Phase 4: US2 View Todos (TASK-030 to TASK-041)
5. Complete Phase 5: US3 Mark Complete (TASK-042 to TASK-055)
6. Complete Phase 6: US4 Update Text (TASK-056 to TASK-065)
7. Complete Phase 7: US5 Delete Todo (TASK-066 to TASK-074)
8. Complete Phase 8: US6 Exit App (TASK-075 to TASK-089)
9. Complete Phase 9: Edge Cases (TASK-090 to TASK-095)
10. Complete Phase 10: Code Quality (TASK-096 to TASK-104)
11. Complete Phase 11: Final Validation (TASK-105 to TASK-113)

### Parallel (Multi-Developer Team)

1. All: Complete Phase 1 + Phase 2 together
2. Split after Phase 2:
   - Developer A: US1 (Add) + US2 (View)
   - Developer B: US3 (Complete) + US4 (Update)
   - Developer C: US5 (Delete) + US6 (Exit)
3. Merge and complete Phase 9, 10, 11 together

---

## Notes

- **TDD Compliance**: All tests MUST be written before implementation and verified to FAIL (Red phase)
- **Task Atomicity**: Each task is independently committable and testable
- **File Isolation**: [P] tasks modify different files, enabling true parallelism
- **Checkpoints**: Stop at each checkpoint to validate user story independently before proceeding
- **Coverage Target**: 100% for `src/` directory per plan.md NFRs
- **Constitutional Compliance**: Follows SDD (spec → plan → tasks → implement), TDD (Red-Green-Refactor), Clean Architecture (4-layer separation)
- **Phase Transition**: All 113 tasks must be complete and phase transition validation must pass before advancing to Phase II

---

**Task Status**: ✅ READY FOR IMPLEMENTATION
**Total Tasks**: 113 (Setup: 6, Foundational: 5, User Stories: 83, Edge Cases: 6, Quality: 9, Validation: 9)
**Next Command**: `/sp.implement` to execute tasks via TDD workflow
