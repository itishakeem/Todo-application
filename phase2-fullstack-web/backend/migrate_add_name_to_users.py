"""
Migration script to add 'name' column to users table.
Run this script once to update existing database schema.
"""
from sqlalchemy import text
from src.db.connection import engine

def migrate():
    """Add name column to users table if it doesn't exist."""
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='users' AND column_name='name'
        """))

        if result.fetchone() is None:
            # Add the column
            print("Adding 'name' column to users table...")
            conn.execute(text("""
                ALTER TABLE users
                ADD COLUMN name VARCHAR(255)
            """))
            conn.commit()
            print("✓ Migration completed successfully!")
        else:
            print("✓ Column 'name' already exists. No migration needed.")

if __name__ == "__main__":
    migrate()
