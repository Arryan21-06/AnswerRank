from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import supabase_client
from app.db.schema import User
from gotrue.errors import AuthApiError
from typing import List, Callable

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """
    Validate the JWT token and return the User object.
    Requires Authorization: Bearer <token>
    """
    token = credentials.credentials
    try:
        # Supabase's get_user will validate the JWT token
        response = supabase_client.auth.get_user(token)

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = response.user.id

        # Fetch the user profile from the database
        db_response = (
            supabase_client.table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not db_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )

        return User(**db_response.data)

    except AuthApiError:
        # Check if it's an invalid refresh token or any other auth error to cleanly return 401
        detail_msg = "Invalid or expired token"

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail_msg,
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Dependency generator for RBAC.
    Usage: Depends(require_role(["creator", "admin"]))
    """

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return role_checker
