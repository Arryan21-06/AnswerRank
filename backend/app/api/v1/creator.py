from fastapi import APIRouter, Depends, status, Response
from app.core.security import require_role
from app.db.schema import (
    User,
    CreatorProfile,
    CreatorProfileUpdate,
    APIResponse,
    CreatorDashboardData,
    ContentSubmitRequest,
    Audit,
    AuditListResponse,
)
from app.db.client import supabase_client
from app.workers.tasks import process_content_audit

router = APIRouter()


@router.get("/profile", response_model=APIResponse[CreatorProfile])
def get_creator_profile(
    response: Response, current_user: User = Depends(require_role(["creator"]))
):
    try:
        db_response = (
            supabase_client.table("creator_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not db_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Creator profile not found")
        return APIResponse(success=True, data=CreatorProfile(**db_response.data))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.put("/profile", response_model=APIResponse[CreatorProfile])
def update_creator_profile(
    update_data: CreatorProfileUpdate,
    response: Response,
    current_user: User = Depends(require_role(["creator"])),
):
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            db_response = (
                supabase_client.table("creator_profiles")
                .select("*")
                .eq("user_id", current_user.id)
                .single()
                .execute()
            )
            if not db_response.data:
                response.status_code = status.HTTP_404_NOT_FOUND
                return APIResponse(success=False, error="Creator profile not found")
            return APIResponse(success=True, data=CreatorProfile(**db_response.data))

        db_response = (
            supabase_client.table("creator_profiles")
            .update(update_dict)
            .eq("user_id", current_user.id)
            .execute()
        )
        if not db_response.data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return APIResponse(success=False, error="Failed to update creator profile")
        return APIResponse(success=True, data=CreatorProfile(**db_response.data[0]))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.get("/dashboard", response_model=APIResponse[CreatorDashboardData])
def get_creator_dashboard(
    response: Response, current_user: User = Depends(require_role(["creator"]))
):
    try:
        profile_response = (
            supabase_client.table("creator_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not profile_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Creator profile not found")

        profile = CreatorProfile(**profile_response.data)

        audits_response = (
            supabase_client.table("audits")
            .select("*")
            .eq("creator_id", profile.id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        audits = (
            [Audit(**audit) for audit in audits_response.data]
            if audits_response.data
            else []
        )

        return APIResponse(
            success=True,
            data=CreatorDashboardData(profile=profile, recent_audits=audits),
        )
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.post("/content", response_model=APIResponse[Audit])
def submit_content(
    request: ContentSubmitRequest,
    response: Response,
    current_user: User = Depends(require_role(["creator"])),
):
    try:
        profile_response = (
            supabase_client.table("creator_profiles")
            .select("id")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not profile_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Creator profile not found")

        creator_id = profile_response.data["id"]
        platform = (
            "youtube"
            if "youtube.com" in request.source_url or "youtu.be" in request.source_url
            else "blog"
        )

        audit_data = {
            "creator_id": creator_id,
            "source_url": request.source_url,
            "platform": platform,
            "status": "pending",
        }

        audit_response = supabase_client.table("audits").insert(audit_data).execute()
        if not audit_response.data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return APIResponse(success=False, error="Failed to create audit")

        audit_id = audit_response.data[0]["id"]

        # Trigger Celery task asynchronously
        process_content_audit.delay(audit_id, request.source_url)

        response.status_code = status.HTTP_201_CREATED
        return APIResponse(success=True, data=Audit(**audit_response.data[0]))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.get("/content/list", response_model=APIResponse[AuditListResponse])
def list_content(
    response: Response,
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(require_role(["creator"])),
):
    try:
        profile_response = (
            supabase_client.table("creator_profiles")
            .select("id")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not profile_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Creator profile not found")

        creator_id = profile_response.data["id"]

        start = (page - 1) * limit
        end = start + limit - 1

        count_response = (
            supabase_client.table("audits")
            .select("id", count="exact")
            .eq("creator_id", creator_id)
            .execute()
        )
        total = count_response.count if count_response.count is not None else 0

        audits_response = (
            supabase_client.table("audits")
            .select("*")
            .eq("creator_id", creator_id)
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )
        audits = (
            [Audit(**audit) for audit in audits_response.data]
            if audits_response.data
            else []
        )

        return APIResponse(
            success=True, data=AuditListResponse(audits=audits, total=total)
        )
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.get("/content/{id}", response_model=APIResponse[Audit])
def get_content(
    id: str,
    response: Response,
    current_user: User = Depends(require_role(["creator"])),
):
    try:
        profile_response = (
            supabase_client.table("creator_profiles")
            .select("id")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not profile_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Creator profile not found")

        creator_id = profile_response.data["id"]

        audit_response = (
            supabase_client.table("audits")
            .select("*")
            .eq("id", id)
            .eq("creator_id", creator_id)
            .single()
            .execute()
        )
        if not audit_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Audit not found")

        return APIResponse(success=True, data=Audit(**audit_response.data))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))
