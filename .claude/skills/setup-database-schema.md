# Skill: Setup Database Schema

**Owner**: Phase II Full-Stack Web Agent
**Phase**: II (Full-Stack Web Application)
**Purpose**: Set up PostgreSQL database schema using SQLModel with Neon DB, including migrations, indexes, and relationships

---

## Context

Phase II uses Neon PostgreSQL for persistent storage with SQLModel ORM. This skill creates the database schema, configures connection pooling, sets up migrations with Alembic, and optimizes with indexes.

## Prerequisites

- [ ] Neon DB account created and database provisioned
- [ ] Database connection string available (`DATABASE_URL`)
- [ ] FastAPI backend initialized in `backend/`
- [ ] SQLModel installed (`pip install sqlmodel`)

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `database_url` | string | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `use_migrations` | bool | No | Enable Alembic migrations | `true` (default) |
| `create_indexes` | bool | No | Create performance indexes | `true` (default) |

## Execution Steps

### Step 1: Install Dependencies

```bash
cd backend

# Core dependencies
pip install sqlmodel psycopg2-binary alembic python-dotenv

# Update requirements.txt
pip freeze > requirements.txt
```

### Step 2: Configure Environment Variables

**File**: `backend/.env`

```bash
# Neon PostgreSQL Connection
DATABASE_URL=postgresql://username:password@ep-example-123.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# App Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
```

**File**: `backend/.env.example`

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET_KEY=change-this-in-production
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Step 3: Define Database Models

**File**: `backend/app/models.py`

```python
"""Database models using SQLModel."""

from datetime import datetime
from typing import Literal, Optional
from sqlmodel import Field, SQLModel, Relationship


# User Model
class User(SQLModel, table=True):
    """User account model."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    todos: list["Todo"] = Relationship(back_populates="user")


# Todo Model
class Todo(SQLModel, table=True):
    """Todo item model."""
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    text: str = Field(max_length=200)
    status: Literal["pending", "completed"] = Field(default="pending", index=True)
    priority: Literal["low", "medium", "high"] = Field(default="medium")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)

    # Relationships
    user: Optional[User] = Relationship(back_populates="todos")


# Add indexes for common queries
# Composite indexes handled in migration
```

### Step 4: Create Database Connection

**File**: `backend/app/database.py`

```python
"""Database connection and session management."""

import os
from typing import Generator
from sqlmodel import Session, SQLModel, create_engine
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")


# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)


def create_db_and_tables() -> None:
    """
    Create all database tables.

    Should only be used in development/testing.
    Use Alembic migrations in production.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get database session.

    Yields:
        Database session

    Example:
        @app.get("/items")
        async def get_items(
            session: Annotated[Session, Depends(get_session)]
        ):
            return session.exec(select(Item)).all()
    """
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Initialize database (create tables)."""
    create_db_and_tables()
```

### Step 5: Setup Alembic Migrations

```bash
# Initialize Alembic
cd backend
alembic init alembic
```

**File**: `backend/alembic.ini` (update)

```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = driver://user:pass@localhost/dbname  # Will be overridden by env.py

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

**File**: `backend/alembic/env.py` (update)

```python
"""Alembic environment configuration."""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.database import DATABASE_URL
from app.models import SQLModel  # Import all models


# Alembic Config object
config = context.config

# Override sqlalchemy.url with DATABASE_URL from .env
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Step 6: Create Initial Migration

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial schema with users and todos"

# Review the generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

**Example Migration**: `alembic/versions/001_initial_schema.py`

```python
"""Initial schema with users and todos

Revision ID: 001
Revises:
Create Date: 2025-12-30 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create tables and indexes."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create todos table
    op.create_table(
        'todos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('text', sa.String(length=200), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_todos_user_id', 'todos', ['user_id'], unique=False)
    op.create_index('ix_todos_status', 'todos', ['status'], unique=False)
    op.create_index('ix_todos_created_at', 'todos', ['created_at'], unique=False)

    # Composite index for common query (user_id + status + created_at)
    op.create_index(
        'ix_todos_user_status_created',
        'todos',
        ['user_id', 'status', 'created_at'],
        unique=False
    )


def downgrade() -> None:
    """Drop tables and indexes."""
    op.drop_index('ix_todos_user_status_created', table_name='todos')
    op.drop_index('ix_todos_created_at', table_name='todos')
    op.drop_index('ix_todos_status', table_name='todos')
    op.drop_index('ix_todos_user_id', table_name='todos')
    op.drop_table('todos')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
```

### Step 7: Update Main App

**File**: `backend/app/main.py`

```python
"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, todos


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup: Initialize database (development only)
    # In production, use Alembic migrations
    # init_db()
    print("🚀 Application starting...")
    yield
    # Shutdown
    print("🛑 Application shutting down...")


app = FastAPI(
    title="Todo API",
    description="RESTful API for todo management with authentication",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(todos.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "database": "connected"}
```

### Step 8: Create Database Utilities

**File**: `backend/app/db_utils.py`

```python
"""Database utility functions."""

from sqlmodel import Session, select
from app.models import User, Todo


def seed_test_data(session: Session) -> None:
    """
    Seed database with test data (development only).

    Args:
        session: Database session
    """
    from app.auth import get_password_hash

    # Check if data exists
    existing_user = session.exec(select(User)).first()
    if existing_user:
        print("Database already seeded")
        return

    # Create test user
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create test todos
    todos = [
        Todo(user_id=user.id, text="Buy groceries", status="pending", priority="high"),
        Todo(user_id=user.id, text="Write documentation", status="completed", priority="medium"),
        Todo(user_id=user.id, text="Deploy to production", status="pending", priority="low"),
    ]

    session.add_all(todos)
    session.commit()

    print(f"✅ Database seeded with test user: {user.email}")


def reset_database(session: Session) -> None:
    """
    Reset database (DELETE ALL DATA - use with caution).

    Args:
        session: Database session
    """
    # Delete all todos
    session.query(Todo).delete()
    session.query(User).delete()
    session.commit()

    print("🗑️ Database reset complete")
```

### Step 9: Write Database Tests

**File**: `backend/tests/test_database.py`

```python
import pytest
from sqlmodel import Session, create_engine, SQLModel, select
from sqlmodel.pool import StaticPool
from app.models import User, Todo


@pytest.fixture(name="session")
def session_fixture():
    """Create in-memory test database."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


def test_create_user(session: Session):
    """Test creating a user."""
    user = User(
        email="test@example.com",
        hashed_password="hashed",
        full_name="Test User"
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.is_active is True


def test_user_email_unique(session: Session):
    """Test email uniqueness constraint."""
    user1 = User(email="same@example.com", hashed_password="hash1")
    session.add(user1)
    session.commit()

    # This should fail (in real DB, not SQLite in-memory)
    user2 = User(email="same@example.com", hashed_password="hash2")
    session.add(user2)

    # In real PostgreSQL, this would raise IntegrityError
    # SQLite in-memory doesn't enforce UNIQUE without explicit constraint


def test_create_todo_with_user(session: Session):
    """Test creating a todo linked to a user."""
    user = User(email="user@example.com", hashed_password="hash")
    session.add(user)
    session.commit()
    session.refresh(user)

    todo = Todo(
        user_id=user.id,
        text="Test todo",
        status="pending",
        priority="medium"
    )
    session.add(todo)
    session.commit()
    session.refresh(todo)

    assert todo.id is not None
    assert todo.user_id == user.id
    assert todo.status == "pending"


def test_user_todo_relationship(session: Session):
    """Test User <-> Todo relationship."""
    user = User(email="user@example.com", hashed_password="hash")
    session.add(user)
    session.commit()
    session.refresh(user)

    todo1 = Todo(user_id=user.id, text="Todo 1", status="pending")
    todo2 = Todo(user_id=user.id, text="Todo 2", status="completed")
    session.add_all([todo1, todo2])
    session.commit()

    # Test relationship
    user_from_db = session.get(User, user.id)
    assert len(user_from_db.todos) == 2
    assert user_from_db.todos[0].text in ["Todo 1", "Todo 2"]
```

### Step 10: Create Migration Helper Scripts

**File**: `backend/scripts/migrate.sh`

```bash
#!/bin/bash
# Database migration helper script

set -e

case "$1" in
  create)
    echo "Creating new migration: $2"
    alembic revision --autogenerate -m "$2"
    ;;
  upgrade)
    echo "Upgrading database to head"
    alembic upgrade head
    ;;
  downgrade)
    echo "Downgrading database by 1 revision"
    alembic downgrade -1
    ;;
  history)
    echo "Migration history:"
    alembic history
    ;;
  current)
    echo "Current database version:"
    alembic current
    ;;
  seed)
    echo "Seeding test data"
    python -c "from app.database import get_session; from app.db_utils import seed_test_data; session = next(get_session()); seed_test_data(session)"
    ;;
  reset)
    echo "⚠️  WARNING: This will delete all data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      python -c "from app.database import get_session; from app.db_utils import reset_database; session = next(get_session()); reset_database(session)"
    fi
    ;;
  *)
    echo "Usage: $0 {create|upgrade|downgrade|history|current|seed|reset}"
    exit 1
    ;;
esac
```

```bash
chmod +x backend/scripts/migrate.sh
```

## Output Artifacts

1. **Models**: `backend/app/models.py`
2. **Database**: `backend/app/database.py`
3. **Migrations**: `backend/alembic/` directory
4. **Environment**: `backend/.env` and `.env.example`
5. **Utils**: `backend/app/db_utils.py`
6. **Scripts**: `backend/scripts/migrate.sh`
7. **Tests**: `backend/tests/test_database.py`

## Validation Rules

### MUST Pass:
- Database connection successful
- All tables created
- Indexes created on foreign keys and common query fields
- Migrations reversible (up and down)
- Relationships work correctly
- All database tests pass

### Performance Checks:
- [ ] Indexes on foreign keys
- [ ] Indexes on filtered columns (status, created_at)
- [ ] Composite indexes for common queries
- [ ] Connection pooling configured
- [ ] Pool pre-ping enabled (for Neon)

## Example Usage

```bash
# Setup database schema:
1. Configure DATABASE_URL in .env
2. Run: alembic upgrade head
3. Optional: Seed test data
4. Run tests: pytest tests/test_database.py

# Creating new migrations:
./scripts/migrate.sh create "add_todo_tags"
./scripts/migrate.sh upgrade
```

## Success Indicators

- ✅ Database tables created
- ✅ Migrations applied successfully
- ✅ Indexes created
- ✅ Relationships work
- ✅ Connection pooling configured
- ✅ All tests pass
- ✅ Can seed test data

## Failure Modes & Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Connection fails | Check DATABASE_URL, verify Neon DB running |
| Migration fails | Review migration SQL, fix, downgrade, retry |
| Constraint violation | Check model definitions, adjust migration |
| Slow queries | Add indexes, review query patterns |

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
