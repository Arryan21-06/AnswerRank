from fastapi import APIRouter, Depends, status, Response
from app.core.security import require_role
import uuid

from app.db.schema import (
    User,
    CreatorProfile,
    CreatorProfileUpdate,
    APIResponse,
    CreatorDashboardData,
    ContentSubmitRequest,
    Audit,
    AuditListResponse,
    AuditDetailResponse,
)
from app.db.client import supabase_client
from app.services.scoring.content_fetcher import fetch_content
from app.services.scoring.ai_analyzer import analyze_content
from app.services.scoring.score_calculator import calculate_score
from app.services.scoring.recommendation_engine import generate_recommendations

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
            .maybe_single()
            .execute()
        )
        if not profile_response.data:
            new_profile_data = {
                "user_id": str(current_user.id),
                "primary_niche": "General",
            }
            inserted_response = (
                supabase_client.table("creator_profiles")
                .insert(new_profile_data)
                .execute()
            )
            if not inserted_response.data:
                response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                return APIResponse(
                    success=False, error="Failed to create default creator profile"
                )
            profile_data = inserted_response.data[0]
        else:
            profile_data = profile_response.data

        profile = CreatorProfile(**profile_data)

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

        # Calculate overall score and radar data based on all audits of this creator
        all_audits_response = (
            supabase_client.table("audits")
            .select("id, composite_score")
            .eq("creator_id", profile.id)
            .eq("status", "complete")
            .execute()
        )
        all_audits = all_audits_response.data if all_audits_response.data else []

        radar_data = [
            {"subject": "Citation Likelihood", "A": 0, "fullMark": 100},
            {"subject": "Authority", "A": 0, "fullMark": 100},
            {"subject": "Freshness", "A": 0, "fullMark": 100},
            {"subject": "Structure", "A": 0, "fullMark": 100},
            {"subject": "Engagement", "A": 0, "fullMark": 100},
        ]

        if all_audits:
            audit_ids = [a["id"] for a in all_audits]
            avg_composite_score = sum(
                a.get("composite_score") or 0.0 for a in all_audits
            ) / len(all_audits)

            # Fetch score records for these audits
            scores_response = (
                supabase_client.table("score_records")
                .select("*")
                .in_("audit_id", audit_ids)
                .execute()
            )
            scores = scores_response.data if scores_response.data else []

            if scores:
                avg_citation = sum(
                    s.get("direct_answer_density", 0.0) * 100 for s in scores
                ) / len(scores)
                avg_authority = sum(
                    s.get("content_depth", 0.0) * 100 for s in scores
                ) / len(scores)
                avg_freshness = sum(
                    s.get("freshness", 0.0) * 100 for s in scores
                ) / len(scores)
                avg_structure = sum(
                    (s.get("structured_data", 0.0) + s.get("formatting_quality", 0.0))
                    / 2
                    * 100
                    for s in scores
                ) / len(scores)
                # We use faq_coverage or a mix for engagement since engagement is mapped differently, let's use faq_coverage
                avg_engagement = sum(
                    s.get("faq_coverage", 0.0) * 100 for s in scores
                ) / len(scores)

                radar_data = [
                    {
                        "subject": "Citation Likelihood",
                        "A": round(avg_citation, 2),
                        "fullMark": 100,
                    },
                    {
                        "subject": "Authority",
                        "A": round(avg_authority, 2),
                        "fullMark": 100,
                    },
                    {
                        "subject": "Freshness",
                        "A": round(avg_freshness, 2),
                        "fullMark": 100,
                    },
                    {
                        "subject": "Structure",
                        "A": round(avg_structure, 2),
                        "fullMark": 100,
                    },
                    {
                        "subject": "Engagement",
                        "A": round(avg_engagement, 2),
                        "fullMark": 100,
                    },
                ]

            if (
                profile.current_answer_rank_score is None
                or profile.current_answer_rank_score != round(avg_composite_score, 2)
            ):
                profile.current_answer_rank_score = round(avg_composite_score, 2)
                supabase_client.table("creator_profiles").update(
                    {"current_answer_rank_score": profile.current_answer_rank_score}
                ).eq("id", profile.id).execute()

        return APIResponse(
            success=True,
            data=CreatorDashboardData(
                profile=profile, recent_audits=audits, radar_data=radar_data
            ),
        )
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))


@router.post("/content", response_model=APIResponse[Audit])
async def submit_content(
    request: ContentSubmitRequest,
    response: Response,
    current_user: User = Depends(require_role(["creator"])),
):
    try:
        profile_response = (
            supabase_client.table("creator_profiles")
            .select("id")
            .eq("user_id", current_user.id)
            .maybe_single()
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

        # Run actual Gemini scoring pipeline synchronously (awaiting async functions)
        try:
            # Update status to processing to reflect start
            supabase_client.table("audits").update({"status": "processing"}).eq(
                "id", audit_id
            ).execute()

            content_data = await fetch_content(request.source_url)
            ai_scores = await analyze_content(content_data)
            recommendations = await generate_recommendations(content_data["raw_text"])

            # calculate_score updates the status to 'complete' and saves to score_records
            calculate_score(uuid.UUID(audit_id), ai_scores)

            # We also need to save recommendations to the audit
            supabase_client.table("audits").update(
                {"recommendations": recommendations}
            ).eq("id", audit_id).execute()

            # Refetch the updated audit
            final_audit_resp = (
                supabase_client.table("audits")
                .select("*")
                .eq("id", audit_id)
                .single()
                .execute()
            )

            response.status_code = status.HTTP_201_CREATED
            return APIResponse(success=True, data=Audit(**final_audit_resp.data))
        except Exception as pipeline_error:
            supabase_client.table("audits").update(
                {"status": "failed", "failure_reason": str(pipeline_error)}
            ).eq("id", audit_id).execute()

            # Re-fetch so we return the failed status properly
            failed_audit_resp = (
                supabase_client.table("audits")
                .select("*")
                .eq("id", audit_id)
                .single()
                .execute()
            )

            response.status_code = status.HTTP_201_CREATED
            return APIResponse(success=True, data=Audit(**failed_audit_resp.data))
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
            .maybe_single()
            .execute()
        )
        if not profile_response.data:
            return APIResponse(success=True, data=AuditListResponse(audits=[], total=0))

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


@router.get("/content/{id}", response_model=APIResponse[AuditDetailResponse])
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

        audit_data = Audit(**audit_response.data)

        from app.db.schema import ScoreRecord

        score_record = None
        try:
            score_response = (
                supabase_client.table("score_records")
                .select("*")
                .eq("audit_id", id)
                .single()
                .execute()
            )
            if score_response.data:
                score_record = ScoreRecord(**score_response.data)
        except Exception:
            # single() raises an exception if 0 rows are found, which is normal for failed/pending audits
            pass

        return APIResponse(
            success=True,
            data=AuditDetailResponse(audit=audit_data, score_record=score_record),
        )
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return APIResponse(success=False, error=str(e))
