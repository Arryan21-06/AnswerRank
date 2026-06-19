from datetime import datetime
from typing import Optional, Literal, Any, Dict
from pydantic import BaseModel, ConfigDict, UUID4, EmailStr


# Base Model for shared configurations
class AnswerRankBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class User(AnswerRankBaseModel):
    id: UUID4
    email: EmailStr
    full_name: Optional[str] = None
    role: Literal["creator", "brand", "admin"]
    avatar_url: Optional[str] = None
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: datetime


class CreatorProfile(AnswerRankBaseModel):
    id: UUID4
    user_id: UUID4
    primary_niche: str
    handle: Optional[str] = None
    platform: Optional[Literal["youtube", "blog", "instagram"]] = None
    follower_count: Optional[int] = 0
    current_answer_rank_score: Optional[float] = None
    verified: bool = False
    created_at: datetime
    updated_at: datetime


class BrandProfile(AnswerRankBaseModel):
    id: UUID4
    user_id: UUID4
    company_name: str
    industry: Optional[str] = None
    seats_used: int = 1
    created_at: datetime
    updated_at: datetime


class Audit(AnswerRankBaseModel):
    id: UUID4
    creator_id: UUID4
    source_url: str
    platform: Literal["youtube", "blog"]
    status: Literal[
        "queued", "ingesting", "scoring", "indexing", "complete", "failed"
    ] = "queued"
    failure_reason: Optional[str] = None
    composite_score: Optional[float] = None
    word_count: Optional[int] = None
    vector_id: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class ContentNormalized(AnswerRankBaseModel):
    id: UUID4
    audit_id: UUID4
    raw_text: str
    storage_uri: Optional[str] = None
    language: str = "en"
    created_at: datetime


class ScoreRecord(AnswerRankBaseModel):
    id: UUID4
    audit_id: UUID4
    direct_answer_density: float
    entity_clarity: float
    faq_coverage: float
    structured_data: float
    formatting_quality: float
    freshness: float
    content_depth: float
    weights_version: str = "v1"
    created_at: datetime


class OptimizationEvent(AnswerRankBaseModel):
    id: UUID4
    audit_id: UUID4
    creator_id: UUID4
    status: Literal["pending", "complete", "failed"] = "pending"
    original_excerpt: Optional[str] = None
    optimized_text: Optional[str] = None
    projected_score: Optional[float] = None
    accepted: bool = False
    gemini_tokens_used: Optional[int] = None
    created_at: datetime


class CampaignQuery(AnswerRankBaseModel):
    id: UUID4
    brand_id: UUID4
    query_text: str
    niche_filter: Optional[str] = None
    min_score_filter: Optional[float] = None
    result_count: Optional[int] = None
    created_at: datetime


class SavedCreator(AnswerRankBaseModel):
    id: UUID4
    brand_id: UUID4
    creator_id: UUID4
    campaign_query_id: Optional[UUID4] = None
    note: Optional[str] = None
    created_at: datetime


class Subscription(AnswerRankBaseModel):
    id: UUID4
    user_id: UUID4
    tier: Literal[
        "free", "creator_free", "creator_pro", "brand_trial", "brand_enterprise"
    ] = "free"
    audits_used_this_period: int = 0
    gemini_credits_remaining: int = 1
    billing_provider_customer_id: Optional[str] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AuditLog(AnswerRankBaseModel):
    id: UUID4
    actor_user_id: Optional[UUID4] = None
    action: str
    target_table: Optional[str] = None
    target_id: Optional[UUID4] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
