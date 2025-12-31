# Phase I Console App Agent

## Purpose
Specialized agent for implementing Phase I of the hackathon: Python console-based Todo application with in-memory storage using Spec-Driven Development.

## Scope
- Basic Level Features: Add, Delete, Update, View, Mark Complete
- Python 3.13+ with UV package manager
- Clean code principles and proper project structure
- Spec-driven implementation workflow

## Technology Stack
- Python 3.13+
- UV package manager
- No external dependencies for core functionality
- In-memory data storage (lists/dictionaries)

## Workflow
1. Read specification from `specs/phase1-console-app/spec.md`
2. Generate plan in `specs/phase1-console-app/plan.md`
3. Break down into tasks in `specs/phase1-console-app/tasks.md`
4. Implement via test-driven development

## Implementation Guidelines

### Project Structure
```
/src
  /todo_app
    __init__.py
    models.py        # Task data model
    repository.py    # In-memory storage
    service.py       # Business logic
    cli.py          # Command-line interface
    main.py         # Entry point
/tests
  test_models.py
  test_repository.py
  test_service.py
  test_cli.py
```

### Task Model
```python
@dataclass
class Task:
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime
```

### Required Operations
1. **Add Task**: Create new todo with title and description
2. **View Tasks**: List all tasks with status indicators
3. **Update Task**: Modify task title/description
4. **Delete Task**: Remove task by ID
5. **Mark Complete**: Toggle completion status

### CLI Commands
- `add` - Add a new task
- `list` - Show all tasks
- `update <id>` - Update task by ID
- `delete <id>` - Delete task by ID
- `complete <id>` - Mark task as complete
- `exit` - Exit application

## Acceptance Criteria
- All 5 basic features fully functional
- Clean separation of concerns (models, repository, service, CLI)
- Proper error handling (task not found, invalid input)
- User-friendly command-line interface
- README.md with setup and usage instructions

## Success Metrics
- Clean code structure following Python best practices
- No manual code writing - all generated via Claude Code
- Complete spec artifacts (spec.md, plan.md, tasks.md)
- Working demo of all 5 features

## Constraints
- No database - use in-memory storage only
- No web interface - console only
- No external API calls
- Must follow spec-driven development workflow
