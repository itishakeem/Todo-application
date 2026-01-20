"""
Integration tests for the Chat API endpoints.
Tests conversation management and message persistence.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

from src.main import app
from src.db.connection import get_session
from src.models.conversation import Conversation
from src.models.message import Message, MessageRole
from src.services.chat_service import ChatService


# Test fixtures
@pytest.fixture(name="engine")
def engine_fixture():
    """Create an in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine):
    """Create a test session."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session):
    """Create a test client with session override."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="user_id")
def user_id_fixture():
    """Create a test user ID."""
    return str(uuid4())


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(user_id):
    """Create auth headers with user ID."""
    return {"X-User-Id": user_id}


class TestChatEndpointAuth:
    """Tests for chat endpoint authentication."""

    def test_chat_requires_auth(self, client: TestClient):
        """Test that chat endpoint requires authentication."""
        response = client.post(
            "/api/chat",
            json={"message": "Hello"},
        )

        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    def test_chat_invalid_user_id_format(self, client: TestClient):
        """Test that invalid user ID format returns 400."""
        response = client.post(
            "/api/chat",
            json={"message": "Hello"},
            headers={"X-User-Id": "not-a-uuid"},
        )

        assert response.status_code == 400
        assert "Invalid user ID" in response.json()["detail"]

    def test_conversations_requires_auth(self, client: TestClient):
        """Test that conversations endpoint requires authentication."""
        response = client.get("/api/chat/conversations")

        assert response.status_code == 401

    def test_messages_requires_auth(self, client: TestClient):
        """Test that messages endpoint requires authentication."""
        response = client.get("/api/chat/conversations/1/messages")

        assert response.status_code == 401


class TestChatCreateConversation:
    """Tests for creating conversations via chat."""

    @patch("src.services.chat_service.ChatService.process_message")
    def test_chat_creates_conversation(
        self,
        mock_process: AsyncMock,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that POST /chat creates a new conversation when no ID provided."""
        mock_process.return_value = {
            "conversation_id": 1,
            "response": "Hello! How can I help?",
            "tool_calls": [],
        }

        response = client.post(
            "/api/chat",
            json={"message": "Hello"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert data["response"] == "Hello! How can I help?"
        assert data["tool_calls"] == []

    @patch("src.services.chat_service.ChatService.process_message")
    def test_chat_resumes_conversation(
        self,
        mock_process: AsyncMock,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that POST /chat with conversation_id resumes existing conversation."""
        mock_process.return_value = {
            "conversation_id": 42,
            "response": "I remember our conversation!",
            "tool_calls": [],
        }

        response = client.post(
            "/api/chat",
            json={
                "conversation_id": 42,
                "message": "What did we discuss?",
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert response.json()["conversation_id"] == 42


class TestChatMessagePersistence:
    """Tests for message persistence."""

    def test_chat_stores_messages(
        self,
        client: TestClient,
        session: Session,
        auth_headers: dict,
        user_id: str,
    ):
        """Test that messages are persisted to the database."""
        # Create a conversation directly
        chat_service = ChatService(session)
        conv = chat_service.create_conversation(uuid4())

        # Add messages
        chat_service.add_message(
            conv.id, conv.user_id, MessageRole.USER, "Hello"
        )
        chat_service.add_message(
            conv.id, conv.user_id, MessageRole.ASSISTANT, "Hi there!"
        )

        # Verify messages are stored
        messages, total, _ = chat_service.get_messages(conv.id, conv.user_id)

        assert total == 2
        assert messages[0].role == MessageRole.USER
        assert messages[0].content == "Hello"
        assert messages[1].role == MessageRole.ASSISTANT


class TestChatUserIsolation:
    """Tests for user isolation."""

    def test_chat_user_isolation_conversations(
        self,
        client: TestClient,
        session: Session,
    ):
        """Test that users can't access other users' conversations."""
        # Create conversation for user A
        user_a = uuid4()
        chat_service = ChatService(session)
        conv = chat_service.create_conversation(user_a)

        # User B tries to access
        user_b = str(uuid4())
        response = client.get(
            f"/api/chat/conversations/{conv.id}/messages",
            headers={"X-User-Id": user_b},
        )

        assert response.status_code == 404

    def test_conversations_only_returns_own(
        self,
        client: TestClient,
        session: Session,
    ):
        """Test that conversation list only returns own conversations."""
        user_a = uuid4()
        user_b = uuid4()

        chat_service = ChatService(session)
        chat_service.create_conversation(user_a)
        chat_service.create_conversation(user_a)
        chat_service.create_conversation(user_b)

        response = client.get(
            "/api/chat/conversations",
            headers={"X-User-Id": str(user_a)},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2


class TestConversationsEndpoint:
    """Tests for GET /conversations endpoint."""

    def test_get_conversations_empty(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test getting empty conversation list."""
        response = client.get(
            "/api/chat/conversations",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["conversations"] == []
        assert data["total"] == 0

    def test_get_conversations_with_data(
        self,
        client: TestClient,
        session: Session,
        user_id: str,
        auth_headers: dict,
    ):
        """Test getting conversation list with data."""
        user_uuid = uuid4()
        chat_service = ChatService(session)
        conv = chat_service.create_conversation(user_uuid)
        chat_service.add_message(
            conv.id, user_uuid, MessageRole.USER, "Test message"
        )

        response = client.get(
            "/api/chat/conversations",
            headers={"X-User-Id": str(user_uuid)},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["conversations"]) == 1
        assert data["conversations"][0]["message_count"] == 1

    def test_get_conversations_pagination(
        self,
        client: TestClient,
        session: Session,
    ):
        """Test conversation list pagination."""
        user_uuid = uuid4()
        chat_service = ChatService(session)

        # Create 5 conversations
        for _ in range(5):
            chat_service.create_conversation(user_uuid)

        response = client.get(
            "/api/chat/conversations?limit=2&offset=0",
            headers={"X-User-Id": str(user_uuid)},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["conversations"]) == 2
        assert data["total"] == 5


class TestMessagesEndpoint:
    """Tests for GET /conversations/{id}/messages endpoint."""

    def test_get_messages_not_found(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test getting messages for non-existent conversation."""
        response = client.get(
            "/api/chat/conversations/99999/messages",
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_get_messages_success(
        self,
        client: TestClient,
        session: Session,
    ):
        """Test getting messages for a conversation."""
        user_uuid = uuid4()
        chat_service = ChatService(session)
        conv = chat_service.create_conversation(user_uuid)
        chat_service.add_message(
            conv.id, user_uuid, MessageRole.USER, "Hello"
        )
        chat_service.add_message(
            conv.id, user_uuid, MessageRole.ASSISTANT, "Hi there!"
        )

        response = client.get(
            f"/api/chat/conversations/{conv.id}/messages",
            headers={"X-User-Id": str(user_uuid)},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 2
        assert data["total"] == 2
        assert data["has_more"] is False
        assert data["messages"][0]["role"] == "user"
        assert data["messages"][1]["role"] == "assistant"

    def test_get_messages_pagination(
        self,
        client: TestClient,
        session: Session,
    ):
        """Test message pagination."""
        user_uuid = uuid4()
        chat_service = ChatService(session)
        conv = chat_service.create_conversation(user_uuid)

        # Add 10 messages
        for i in range(10):
            chat_service.add_message(
                conv.id, user_uuid, MessageRole.USER, f"Message {i}"
            )

        response = client.get(
            f"/api/chat/conversations/{conv.id}/messages?limit=3&offset=0",
            headers={"X-User-Id": str(user_uuid)},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 3
        assert data["total"] == 10
        assert data["has_more"] is True


class TestChatValidation:
    """Tests for request validation."""

    def test_chat_empty_message_rejected(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that empty message is rejected."""
        response = client.post(
            "/api/chat",
            json={"message": ""},
            headers=auth_headers,
        )

        assert response.status_code == 422  # Validation error

    def test_chat_message_too_long_rejected(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that message over 2000 chars is rejected."""
        long_message = "a" * 2001
        response = client.post(
            "/api/chat",
            json={"message": long_message},
            headers=auth_headers,
        )

        assert response.status_code == 422  # Validation error

    def test_conversations_invalid_limit(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that invalid limit is rejected."""
        response = client.get(
            "/api/chat/conversations?limit=0",
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_conversations_limit_too_high(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that limit over 100 is rejected."""
        response = client.get(
            "/api/chat/conversations?limit=101",
            headers=auth_headers,
        )

        assert response.status_code == 422
