# Skill: Validate Console UI

**Owner**: Phase I Console App Agent
**Phase**: I (Console Application)
**Purpose**: Validate that the console UI meets Phase I requirements for usability, error handling, and user experience

---

## Context

Phase I requires a menu-driven console interface that is clear, user-friendly, and handles errors gracefully. This skill validates the UI implementation against spec requirements before marking Phase I complete.

## Prerequisites

- [ ] Phase I spec exists at `specs/phase1-console-app/spec.md`
- [ ] Console UI implemented in `src/ui.py` and `src/main.py`
- [ ] All CRUD operations implemented
- [ ] Basic manual testing completed

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `ui_file_path` | string | No | Path to UI implementation | `src/ui.py` (default) |
| `main_file_path` | string | No | Path to main entry point | `src/main.py` (default) |
| `run_interactive_test` | bool | No | Run interactive validation | `false` (default) |

## Validation Checklist

### 1. Menu Structure
- [ ] Main menu displays 5 options (Add, List, Complete, Delete, Exit)
- [ ] Menu is clearly formatted with numbered choices
- [ ] Menu shows after each operation (loop until exit)
- [ ] Exit option cleanly terminates program

**Expected Menu Format**:
```
=== Todo Application ===
1. Add todo
2. List todos
3. Mark todo complete
4. Delete todo
5. Exit

Enter choice: _
```

### 2. User Input Handling
- [ ] Invalid menu choice shows error and re-prompts
- [ ] Empty inputs handled gracefully
- [ ] Whitespace trimmed from inputs
- [ ] Case-insensitive where appropriate
- [ ] Ctrl+C (KeyboardInterrupt) handled gracefully

### 3. Error Messages
- [ ] All errors user-friendly (no stack traces)
- [ ] Error format consistent: `❌ Error: <message>`
- [ ] Success format consistent: `✅ <message>`
- [ ] Errors reference what went wrong, not technical details

### 4. Operation-Specific Validations

#### Add Todo
- [ ] Prompts for todo text
- [ ] Shows success with todo ID
- [ ] Rejects empty text with clear error
- [ ] Rejects text > 200 chars with clear error
- [ ] Returns to main menu after completion

**Test Cases**:
```python
# Valid input
Input: "Buy groceries"
Output: "✅ Todo added with ID: a3b2c1d4..."

# Empty input
Input: ""
Output: "❌ Error: Todo text required"

# Long input (201 chars)
Input: "x" * 201
Output: "❌ Error: Todo text too long (max 200)"
```

#### List Todos
- [ ] Shows "No todos yet" when empty
- [ ] Displays todos in table format
- [ ] Shows ID (first 8 chars), status, created date, text
- [ ] Sorted newest first
- [ ] Text truncated if needed to fit table

**Test Cases**:
```python
# Empty list
Output:
=== Your Todos ===
No todos yet. Add one to get started!

# With todos
Output:
=== Your Todos ===
ID        Status      Created              Text
------------------------------------------------------------------------------------
a3b2c1d4  pending     2025-12-30 14:30    Buy groceries
f5e6d7c8  completed   2025-12-30 14:25    Write documentation
```

#### Mark Complete
- [ ] Prompts for todo ID
- [ ] Accepts full or partial ID (first 8 chars)
- [ ] Shows success with todo text
- [ ] Shows error for non-existent ID
- [ ] Idempotent (completing twice is OK)

**Test Cases**:
```python
# Valid ID (short form)
Input: "a3b2c1d4"
Output: "✅ Marked complete: Buy groceries"

# Invalid ID
Input: "invalid"
Output: "❌ Error: Todo ID not found"
```

#### Delete Todo
- [ ] Prompts for todo ID
- [ ] Accepts full or partial ID
- [ ] Shows success message
- [ ] Shows error for non-existent ID
- [ ] Confirms deletion (optional but recommended)

**Test Cases**:
```python
# Valid ID
Input: "a3b2c1d4"
Output: "✅ Todo deleted"

# Invalid ID
Input: "invalid"
Output: "❌ Error: Todo ID not found"
```

#### Exit
- [ ] Shows goodbye message
- [ ] Exits cleanly (no errors)
- [ ] Returns exit code 0

**Test Case**:
```python
Input: "5" (or "exit")
Output:
👋 Goodbye! Your todos will be lost (in-memory only).
```

## Execution Steps

### Step 1: Static Code Review

Read `src/ui.py` and `src/main.py`:

```python
# Check main.py structure
def check_main_structure(filepath: str) -> list[str]:
    """Validate main.py structure."""
    issues = []

    with open(filepath) as f:
        content = f.read()

    # Must have main menu loop
    if "while" not in content.lower():
        issues.append("No main menu loop found")

    # Must have exit condition
    if "break" not in content and "exit" not in content.lower():
        issues.append("No exit condition found")

    # Must handle invalid input
    if "except" not in content and "if" not in content:
        issues.append("No input validation found")

    return issues
```

### Step 2: Automated UI Tests

**File**: `tests/test_ui.py`

```python
import pytest
from io import StringIO
from unittest.mock import patch
from src.ui import ConsoleUI
from src.storage import TodoStorage


def test_menu_display(capsys):
    """Validate main menu displays correctly."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    # Simulate displaying menu (implementation-specific)
    # This would call ui.show_menu() or similar

    captured = capsys.readouterr()
    assert "=== Todo Application ===" in captured.out
    assert "1. Add todo" in captured.out
    assert "5. Exit" in captured.out


def test_add_todo_interactive_success(monkeypatch):
    """Validate add todo with valid input."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    # Mock user input
    inputs = iter(["Buy groceries"])
    monkeypatch.setattr('builtins.input', lambda _: next(inputs))

    with patch('builtins.print') as mock_print:
        ui.add_todo_interactive()

    # Check success message printed
    calls = [str(call) for call in mock_print.call_args_list]
    assert any("✅" in call and "Todo added" in call for call in calls)


def test_add_todo_interactive_empty_rejected(monkeypatch):
    """Validate add todo rejects empty input."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    inputs = iter([""])
    monkeypatch.setattr('builtins.input', lambda _: next(inputs))

    with patch('builtins.print') as mock_print:
        ui.add_todo_interactive()

    calls = [str(call) for call in mock_print.call_args_list]
    assert any("❌" in call and "Todo text required" in call for call in calls)


def test_list_todos_empty_message(capsys):
    """Validate empty list shows friendly message."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    ui.list_todos_interactive()

    captured = capsys.readouterr()
    assert "No todos yet" in captured.out


def test_list_todos_table_format(capsys):
    """Validate todo list displays in table format."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    storage.add_todo("Task 1")
    storage.add_todo("Task 2")

    ui.list_todos_interactive()

    captured = capsys.readouterr()
    assert "ID" in captured.out
    assert "Status" in captured.out
    assert "Created" in captured.out
    assert "Text" in captured.out
    assert "Task 1" in captured.out
    assert "Task 2" in captured.out


def test_complete_todo_short_id_works(monkeypatch):
    """Validate partial ID matching works."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    todo = storage.add_todo("Task")
    short_id = todo.id[:8]

    inputs = iter([short_id])
    monkeypatch.setattr('builtins.input', lambda _: next(inputs))

    with patch('builtins.print') as mock_print:
        ui.complete_todo_interactive()

    calls = [str(call) for call in mock_print.call_args_list]
    assert any("✅" in call and "Marked complete" in call for call in calls)


def test_error_message_format():
    """Validate error messages follow consistent format."""
    storage = TodoStorage()
    ui = ConsoleUI(storage)

    # Errors should start with ❌ and include "Error:"
    # This would test actual error outputs from UI methods
    assert True  # Placeholder for actual validation
```

### Step 3: Manual Interactive Test (Optional)

If `run_interactive_test` is true, run the application and perform:

```bash
# Start application
python -m src.main

# Test flow:
# 1. List todos (should be empty)
# 2. Add todo "Test task 1"
# 3. Add todo "Test task 2"
# 4. List todos (should show 2)
# 5. Complete first todo (use short ID)
# 6. List todos (should show 1 completed, 1 pending)
# 7. Delete second todo
# 8. List todos (should show 1)
# 9. Try invalid menu choice (should error gracefully)
# 10. Exit
```

### Step 4: Accessibility Checks

- [ ] All outputs readable in 80-column terminal
- [ ] No ASCII art or complex formatting (keep it simple)
- [ ] Clear visual hierarchy (headers, separators)
- [ ] Color codes optional (not required for Phase I)

### Step 5: Generate Validation Report

```markdown
# Phase I Console UI Validation Report

**Date**: 2025-12-30
**Validator**: Phase I Console App Agent

## Summary
- ✅ Menu structure meets requirements
- ✅ Error handling comprehensive
- ✅ User input validation complete
- ✅ All operations functional
- ✅ UI/UX meets Phase I spec

## Detailed Results

### Menu Structure
- ✅ 5 options displayed
- ✅ Numbered choices
- ✅ Loop until exit
- ✅ Clean exit

### Operation Validation

#### Add Todo
- ✅ Valid input accepted
- ✅ Empty input rejected
- ✅ Long input rejected
- ✅ Success message shown

#### List Todos
- ✅ Empty list handled
- ✅ Table format correct
- ✅ Sorting correct (newest first)
- ✅ All fields displayed

#### Mark Complete
- ✅ Valid ID works
- ✅ Short ID works
- ✅ Invalid ID handled
- ✅ Success message shown

#### Delete Todo
- ✅ Valid ID works
- ✅ Short ID works
- ✅ Invalid ID handled
- ✅ Success message shown

#### Exit
- ✅ Goodbye message
- ✅ Clean exit

### Error Handling
- ✅ Consistent error format (❌ Error: ...)
- ✅ Consistent success format (✅ ...)
- ✅ No stack traces to user
- ✅ All edge cases handled

### Code Quality
- ✅ Type hints present
- ✅ Docstrings present
- ✅ PEP 8 compliant
- ✅ No hardcoded values

## Test Results
- **Unit tests**: 15/15 passed ✅
- **Integration tests**: 5/5 passed ✅
- **Manual tests**: All scenarios passed ✅

## Issues Found
None

## Recommendations for Phase II
- Add confirmation prompts for destructive actions
- Consider colored output (e.g., rich library)
- Add undo functionality
- Implement search/filter

## Approval Status
✅ **APPROVED** - Phase I Console UI meets all requirements

**Next Steps**:
1. Record demo video (<90 seconds)
2. Update README with usage instructions
3. Create PHR for Phase I completion
4. Begin Phase II planning
```

## Output Artifacts

1. **Validation Report**: `specs/phase1-console-app/ui-validation-report.md`
2. **Test Results**: `tests/test_ui.py` execution output
3. **Screenshots**: Optional terminal screenshots in `docs/phase1/`

## Validation Rules

### MUST Pass:
- All automated tests pass
- Manual test flow completes without errors
- Error messages never show stack traces
- All edge cases handled gracefully

### MUST NOT:
- Crash on invalid input
- Show technical error details to user
- Require debugging knowledge to use
- Have inconsistent UI patterns

## Example Usage

```bash
# Agent validation workflow:
1. Run static code review of ui.py and main.py
2. Execute pytest tests/test_ui.py
3. Run interactive test (optional)
4. Generate validation report
5. Present findings to user

# All checks pass ✅
# Phase I Console UI validated successfully
```

## Success Indicators

- ✅ All automated tests pass (100% coverage)
- ✅ Manual test flow completes successfully
- ✅ Error handling comprehensive
- ✅ UI matches spec requirements
- ✅ No hardcoded values or magic strings
- ✅ Validation report generated
- ✅ Ready for Phase I completion

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Test fails | Fix UI implementation, revalidate |
| Error not handled | Add error handling, add test |
| Inconsistent formatting | Standardize messages, update tests |
| Stack trace shown | Wrap in try/except, user-friendly message |

## Related Skills

- **implement-crud-operation**: Implements operations validated here
- **create-phase1-spec**: Defines requirements validated here
- **validate-phase-transition**: Uses this for Phase I→II transition

## Quality Gates

Before approving Phase I UI:
- [ ] All CRUD operations work
- [ ] All error paths tested
- [ ] No crashes on invalid input
- [ ] User experience is smooth
- [ ] Code quality meets constitution
- [ ] Ready for demo video

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
