"""
Database connection configuration for Neon PostgreSQL.
Handles connection pooling and session management.
"""
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL or NEON_DATABASE_URL must be set in environment")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging in development
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Maximum number of connections
    max_overflow=10,  # Maximum overflow connections
)


def create_db_and_tables() -> None:
    """Create all database tables defined in SQLModel models."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI endpoints to get database session.
    Yields a session and ensures it's closed after use.
    """
    with Session(engine) as session:
        yield session
