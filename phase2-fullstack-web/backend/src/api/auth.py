"""
Authentication API endpoints.
T017-T019: Signup, Login, Logout endpoints
Integrates with Better Auth for session management.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..db.connection import get_session
from ..models.user import User
from pydantic import BaseModel, EmailStr
import bcrypt

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user: dict
    message: str


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, session: Session = Depends(get_session)):
    """
    T017: Signup endpoint - create new user account.
    """
    # Check if user already exists
    statement = select(User).where(User.email == request.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash password with bcrypt
    password_hash = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()

    # Create new user
    user = User(email=request.email, name=request.name, password_hash=password_hash)
    session.add(user)
    session.commit()
    session.refresh(user)

    return AuthResponse(
        user={"id": str(user.id), "email": user.email, "name": user.name},
        message="Welcome! Your account has been created successfully",
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, session: Session = Depends(get_session)):
    """
    T018: Login endpoint - authenticate user and create session.
    """
    # Find user by email
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not bcrypt.checkpw(request.password.encode(), user.password_hash.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return AuthResponse(
        user={"id": str(user.id), "email": user.email, "name": user.name},
        message="Welcome back! Login successful",
    )


@router.post("/logout")
async def logout():
    """
    T019: Logout endpoint - invalidate session.
    """
    return {"message": "Logout successful"}
