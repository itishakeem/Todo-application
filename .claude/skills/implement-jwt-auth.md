# Skill: Implement JWT Authentication

**Owner**: Phase II Full-Stack Web Agent
**Phase**: II (Full-Stack Web Application)
**Purpose**: Implement JWT-based authentication using Better Auth for secure user authentication and authorization

---

## Context

Phase II requires user authentication with Better Auth, providing JWT tokens for secure API access. This skill implements the complete auth flow: registration, login, logout, token refresh, and protected route middleware.

## Prerequisites

- [ ] Phase II spec includes authentication requirements
- [ ] FastAPI backend initialized in `backend/`
- [ ] Next.js frontend initialized in `frontend/`
- [ ] Database configured (Neon PostgreSQL)
- [ ] Better Auth installed (`npm install better-auth`)

## Input Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `auth_provider` | enum | Yes | Authentication provider | "better-auth" (required for hackathon) |
| `session_duration` | int | No | Session duration in seconds | `86400` (24 hours, default) |
| `enable_email_verification` | bool | No | Require email verification | `false` (default for Phase II) |

## Execution Steps

### Step 1: Install Better Auth

```bash
# Frontend (Next.js)
cd frontend
npm install better-auth

# Backend dependencies
cd ../backend
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
```

### Step 2: Configure Better Auth Client (Frontend)

**File**: `frontend/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  credentials: "include", // Enable cookies
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
```

### Step 3: Setup Better Auth Server (Frontend)

**File**: `frontend/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth"
import { Pool } from "pg"

// Database connection for Better Auth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  database: {
    provider: "pg",
    pool,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase II: simple auth
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 24, // Update every 24 hours
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8000",
  ],
})
```

### Step 4: Create Auth API Route (Frontend)

**File**: `frontend/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

### Step 5: Implement Backend JWT Utilities

**File**: `backend/app/auth.py`

```python
from datetime import datetime, timedelta
from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
import os


# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Bearer token scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Payload data (e.g., {"sub": user_id})
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token

    Example:
        >>> token = create_access_token({"sub": "user-123"})
        >>> print(token[:20])
        eyJhbGciOiJIUzI1NiIs...
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: 401 if token is invalid or expired

    Example:
        >>> token = create_access_token({"sub": "user-123"})
        >>> payload = decode_access_token(token)
        >>> payload["sub"]
        'user-123'
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> dict:
    """
    Dependency to get the current authenticated user.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        User payload from JWT token

    Raises:
        HTTPException: 401 if authentication fails

    Example:
        @app.get("/protected")
        async def protected_route(
            user: Annotated[dict, Depends(get_current_user)]
        ):
            return {"user_id": user["sub"]}
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    return {"sub": user_id, **payload}


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[dict]:
    """
    Optional authentication dependency (doesn't fail if no token).

    Args:
        credentials: Optional bearer token

    Returns:
        User payload or None if not authenticated
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
```

### Step 6: Create User Model and Auth Endpoints

**File**: `backend/app/models.py` (add user model)

```python
from sqlmodel import Field, SQLModel
from typing import Optional


class User(SQLModel, table=True):
    """User database model."""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = Field(default=True)
```

**File**: `backend/app/routers/auth.py`

```python
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from app.database import get_session
from app.auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)
from app.models import User


router = APIRouter(prefix="/api/auth", tags=["auth"])


# Request/Response Models
class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """User info response."""
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    session: Annotated[Session, Depends(get_session)],
) -> TokenResponse:
    """
    Register a new user.

    Args:
        user_data: User registration data
        session: Database session

    Returns:
        JWT access token

    Raises:
        HTTPException: 400 if email already exists
    """
    # Check if user exists
    existing = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    session: Annotated[Session, Depends(get_session)],
) -> TokenResponse:
    """
    Authenticate user and return JWT token.

    Args:
        credentials: User login credentials
        session: Database session

    Returns:
        JWT access token

    Raises:
        HTTPException: 401 if credentials invalid
    """
    # Find user
    user = session.exec(select(User).where(User.email == credentials.email)).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[dict, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> User:
    """
    Get current authenticated user info.

    Args:
        current_user: Authenticated user from JWT
        session: Database session

    Returns:
        User information

    Raises:
        HTTPException: 404 if user not found
    """
    user_id = int(current_user["sub"])
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
```

### Step 7: Create Frontend Auth Components

**File**: `frontend/components/auth/login-form.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setError(error.message || "Login failed")
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
    </form>
  )
}
```

**File**: `frontend/components/auth/protected-route.tsx`

```typescript
"use client"

import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
```

### Step 8: Write Auth Tests

**File**: `backend/tests/test_auth.py`

```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.main import app
from app.database import get_session
from app.models import User
from app.auth import get_password_hash


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_register_success(client: TestClient):
    """Test user registration with valid data."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!",
            "full_name": "Test User"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient, session: Session):
    """Test registration rejects duplicate email."""
    # Create existing user
    user = User(
        email="existing@example.com",
        hashed_password=get_password_hash("password123"),
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/auth/register",
        json={
            "email": "existing@example.com",
            "password": "password123"
        }
    )

    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client: TestClient, session: Session):
    """Test login with valid credentials."""
    # Create user
    user = User(
        email="user@example.com",
        hashed_password=get_password_hash("mypassword"),
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@example.com",
            "password": "mypassword"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_wrong_password(client: TestClient, session: Session):
    """Test login rejects wrong password."""
    # Create user
    user = User(
        email="user@example.com",
        hashed_password=get_password_hash("correctpassword"),
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/auth/login",
        json={
            "email": "user@example.com",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401


def test_get_me_authenticated(client: TestClient, session: Session):
    """Test GET /api/auth/me with valid token."""
    # Create user and get token
    user = User(
        email="user@example.com",
        hashed_password=get_password_hash("password"),
        full_name="John Doe"
    )
    session.add(user)
    session.commit()

    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "password"}
    )
    token = login_response.json()["access_token"]

    # Get user info
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user@example.com"
    assert data["full_name"] == "John Doe"


def test_get_me_unauthenticated(client: TestClient):
    """Test GET /api/auth/me without token."""
    response = client.get("/api/auth/me")

    assert response.status_code == 403  # No auth header


def test_protected_route_with_token(client: TestClient, session: Session):
    """Test accessing protected route with valid token."""
    # Setup (create user and login)
    user = User(
        email="user@example.com",
        hashed_password=get_password_hash("password"),
    )
    session.add(user)
    session.commit()

    login_response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "password"}
    )
    token = login_response.json()["access_token"]

    # Access protected route (e.g., GET /api/todos)
    response = client.get(
        "/api/todos",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200  # Success
```

## Output Artifacts

1. **Auth Client**: `frontend/lib/auth-client.ts`
2. **Auth Server**: `frontend/lib/auth.ts`
3. **Auth API**: `frontend/app/api/auth/[...all]/route.ts`
4. **Backend Auth**: `backend/app/auth.py`
5. **Auth Router**: `backend/app/routers/auth.py`
6. **Components**: `frontend/components/auth/`
7. **Tests**: `backend/tests/test_auth.py`

## Validation Rules

### MUST Pass:
- All test cases pass
- JWT tokens generated correctly
- Password hashing works (bcrypt)
- Protected routes require authentication
- Token expiration enforced
- User isolation (users can't access others' data)

### Security Checklist:
- [ ] Passwords hashed with bcrypt
- [ ] JWT secret in environment variable
- [ ] HTTPS in production (not enforced in dev)
- [ ] Token expiration set
- [ ] No passwords in logs
- [ ] CORS configured correctly

## Success Indicators

- ✅ User registration works
- ✅ User login returns JWT
- ✅ Protected routes require token
- ✅ Invalid tokens rejected
- ✅ Password hashing secure
- ✅ All auth tests pass
- ✅ Frontend auth flow complete

---

**Last Updated**: 2025-12-30
**Version**: 1.0
**Hackathon**: Todo Spec-Driven Development
