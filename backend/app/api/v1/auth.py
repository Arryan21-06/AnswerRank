from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from app.db.client import supabase_client
from gotrue.errors import AuthApiError
from app.core.security import get_current_user
from app.db.schema import User

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["creator", "brand", "admin"]
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: User


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    try:
        # 1. Register user with Supabase Auth
        auth_response = supabase_client.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
            }
        )

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed"
            )

        # 2. Insert into public.users table (via Supabase Python Client)
        user_data = {
            "id": auth_response.user.id,
            "email": request.email,
            "role": request.role,
            "full_name": request.full_name,
        }

        supabase_client.table("users").insert(user_data).execute()

        # Also create profile rows based on the role
        if request.role == "creator":
            supabase_client.table("creator_profiles").insert(
                {
                    "user_id": auth_response.user.id,
                    "primary_niche": "Uncategorized",  # Requires update later
                }
            ).execute()
        elif request.role == "brand":
            supabase_client.table("brand_profiles").insert(
                {
                    "user_id": auth_response.user.id,
                    "company_name": "New Company",  # Requires update later
                }
            ).execute()

        # Create basic subscription row
        supabase_client.table("subscriptions").insert(
            {"user_id": auth_response.user.id, "tier": "free"}
        ).execute()

        return {"message": "User registered successfully", "user": user_data}

    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # In a real app we'd want a transaction here or webhook-based synchronization
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    try:
        # Sign in with Supabase Auth
        auth_response = supabase_client.auth.sign_in_with_password(
            {
                "email": request.email,
                "password": request.password,
            }
        )

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Login failed, invalid credentials",
            )

        # Get user details from public.users table
        user_id = auth_response.user.id
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
                detail="User profile not found in public database",
            )

        return AuthResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=User(**db_response.data),
        )

    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    try:
        # Refresh the session
        auth_response = supabase_client.auth.refresh_session(request.refresh_token)

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not refresh token",
            )

        # Optional: return user details again
        db_response = (
            supabase_client.table("users")
            .select("*")
            .eq("id", auth_response.user.id)
            .single()
            .execute()
        )

        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user": db_response.data,
        }

    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    try:
        # Sign out from Supabase Auth.
        # Note: If the client maintains its own JWTs, this just invalidates it on Supabase's side.
        supabase_client.auth.sign_out()
        return {"message": "Successfully logged out"}
    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
