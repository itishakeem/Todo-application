"""
Unit tests for Conversation model.
TASK-006: Write test for Conversation model
TC-006: Unit tests pass
"""
import pytest
from datetime import datetime
from uuid import UUID
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from src.models.conversation import Conversation


@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database session for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


class TestConversationModel:
    """Test suite for Conversation SQLModel."""

    def test_create_conversation_with_valid_data(self, session: Session):
        """Test model creation with valid user_id."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        assert conversation.id is not None
        assert conversation.user_id == user_id
        assert conversation.created_at is not None
        assert conversation.updated_at is not None

    def test_conversation_auto_timestamps(self, session: Session):
        """Test created_at and updated_at are automatically set."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        before_creation = datetime.utcnow()
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        after_creation = datetime.utcnow()

        # Timestamps should be within the creation window
        assert before_creation <= conversation.created_at <= after_creation
        assert before_creation <= conversation.updated_at <= after_creation

    def test_conversation_user_id_required(self, session: Session):
        """Test that user_id is a required field (enforced at database level)."""
        # SQLModel allows creating object but database enforces NOT NULL
        # We verify the field is defined as required in the model
        from sqlmodel import SQLModel
        import inspect

        # Check that user_id field is defined without default
        fields = Conversation.model_fields
        assert "user_id" in fields
        # The field should not have a default value (it's required)
        user_id_field = fields["user_id"]
        assert user_id_field.is_required() is True

    def test_multiple_conversations_for_same_user(self, session: Session):
        """Test a user can have multiple conversations."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        conversation1 = Conversation(user_id=user_id)
        conversation2 = Conversation(user_id=user_id)

        session.add(conversation1)
        session.add(conversation2)
        session.commit()

        # Query all conversations for user
        conversations = session.query(Conversation).filter(
            Conversation.user_id == user_id
        ).all()

        assert len(conversations) == 2
        assert conversations[0].id != conversations[1].id

    def test_conversation_id_auto_generated(self, session: Session):
        """Test that id is auto-generated as primary key."""
        user_id = UUID("12345678-1234-1234-1234-123456789012")

        conversation = Conversation(user_id=user_id)
        assert conversation.id is None  # Before commit

        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        assert conversation.id is not None
        assert isinstance(conversation.id, int)

    def test_conversation_tablename(self):
        """Test that the table name is set correctly."""
        assert Conversation.__tablename__ == "conversations"
