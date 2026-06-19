from fastapi import APIRouter, Depends, status, Response
from app.core.security import require_role
from app.db.schema import (
    User,
    BrandProfile,
    BrandProfileUpdate,
    APIResponse,
    BrandDashboardData,
    CampaignQuery,
    BrandSearchRequest,
    CreatorProfile,
    CreatorPublicProfile,
    ScoreRecord,
)
from app.db.client import supabase_client
from typing import List

router = APIRouter()


@router.get("/profile", response_model=APIResponse[BrandProfile])
def get_brand_profile(
    response: Response, current_user: User = Depends(require_role(["brand"]))
):
    try:
        db_response = (
            supabase_client.table("brand_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not db_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Brand profile not found")
        return APIResponse(success=True, data=BrandProfile(**db_response.data))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.put("/profile", response_model=APIResponse[BrandProfile])
def update_brand_profile(
    update_data: BrandProfileUpdate,
    response: Response,
    current_user: User = Depends(require_role(["brand"])),
):
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            db_response = (
                supabase_client.table("brand_profiles")
                .select("*")
                .eq("user_id", current_user.id)
                .single()
                .execute()
            )
            if not db_response.data:
                response.status_code = status.HTTP_404_NOT_FOUND
                return APIResponse(success=False, error="Brand profile not found")
            return APIResponse(success=True, data=BrandProfile(**db_response.data))

        db_response = (
            supabase_client.table("brand_profiles")
            .update(update_dict)
            .eq("user_id", current_user.id)
            .execute()
        )
        if not db_response.data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return APIResponse(success=False, error="Failed to update brand profile")
        return APIResponse(success=True, data=BrandProfile(**db_response.data[0]))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.get("/dashboard", response_model=APIResponse[BrandDashboardData])
def get_brand_dashboard(
    response: Response, current_user: User = Depends(require_role(["brand"]))
):
    try:
        profile_response = (
            supabase_client.table("brand_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not profile_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Brand profile not found")

        profile = BrandProfile(**profile_response.data)

        queries_response = (
            supabase_client.table("campaign_queries")
            .select("*")
            .eq("brand_id", profile.id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        queries = (
            [CampaignQuery(**query) for query in queries_response.data]
            if queries_response.data
            else []
        )

        saves_count_response = (
            supabase_client.table("saved_creators")
            .select("id", count="exact")
            .eq("brand_id", profile.id)
            .execute()
        )
        saved_count = (
            saves_count_response.count if saves_count_response.count is not None else 0
        )

        return APIResponse(
            success=True,
            data=BrandDashboardData(
                profile=profile, recent_queries=queries, saved_creator_count=saved_count
            ),
        )
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.post("/search", response_model=APIResponse[List[CreatorProfile]])
def search_creators(
    request: BrandSearchRequest,
    response: Response,
    current_user: User = Depends(require_role(["brand"])),
):
    try:
        profile_response = (
            supabase_client.table("brand_profiles")
            .select("id")
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )
        if not profile_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Brand profile not found")

        brand_id = profile_response.data["id"]

        query_data = {
            "brand_id": brand_id,
            "query_text": request.query_text,
            "niche_filter": request.niche_filter,
            "min_score_filter": request.min_score_filter,
        }
        supabase_client.table("campaign_queries").insert(query_data).execute()

        rpc_params = {
            "p_niche": request.niche_filter if request.niche_filter else "",
            "p_min_score": (
                request.min_score_filter if request.min_score_filter else 0.0
            ),
        }
        search_response = supabase_client.rpc("search_creators", rpc_params).execute()

        creators = (
            [CreatorProfile(**creator) for creator in search_response.data]
            if search_response.data
            else []
        )
        response.status_code = (
            status.HTTP_201_CREATED
        )  # if we consider saving query as creation
        return APIResponse(success=True, data=creators)
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.get("/creator/{id}", response_model=APIResponse[CreatorPublicProfile])
def get_creator_public_profile(
    id: str,
    response: Response,
    current_user: User = Depends(require_role(["brand"])),
):
    try:
        creator_response = (
            supabase_client.table("creator_profiles")
            .select("*")
            .eq("id", id)
            .single()
            .execute()
        )
        if not creator_response.data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return APIResponse(success=False, error="Creator not found")

        creator = CreatorProfile(**creator_response.data)

        audits_response = (
            supabase_client.table("audits").select("id").eq("creator_id", id).execute()
        )

        scores = []
        if audits_response.data:
            audit_ids = [audit["id"] for audit in audits_response.data]
            scores_response = (
                supabase_client.table("score_records")
                .select("*")
                .in_("audit_id", audit_ids)
                .order("created_at", desc=True)
                .execute()
            )
            if scores_response.data:
                scores = [ScoreRecord(**score) for score in scores_response.data]

        return APIResponse(
            success=True,
            data=CreatorPublicProfile(creator=creator, recent_scores=scores),
        )
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))
