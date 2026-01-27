"""
Authentication middleware for FastAPI.
T020: Create authentication middleware
Validates session cookies and protects routes.
"""
from fastapi import Request, HTTPException, status
from typing import Optional


async def get_current_user(request: Request) -> Optional[dict]:
    """
    Extract and validate user from session cookie.
    Placeholder for Better Auth integration.
    """
    # TODO: Implement session cookie validation with Better Auth
    # For now, this is a placeholder that will be implemented
    # when Better Auth SDK is fully integrated
    session_cookie = request.cookies.get("session")
    if not session_cookie:
        return None

    # Placeholder: In production, decode and validate JWT/session token
    return {"id": "user-id", "email": "user@example.com"}


async def require_auth(request: Request) -> dict:
    """
    Dependency to require authentication for protected routes.
    Raises 401 if not authenticated.
    """
    user = await get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user
