from typing import Generic, TypeVar

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal, Dict, Any
from datetime import datetime
from uuid import UUID

# Pydantic models for the 11 schema tables


class User(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: Literal["creator", "brand", "admin"]
    avatar_url: Optional[str] = None
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreatorProfile(BaseModel):
    id: UUID
    user_id: UUID
    primary_niche: str
    handle: Optional[str] = None
    platform: Optional[Literal["youtube", "blog", "instagram"]] = None
    follower_count: Optional[int] = 0
    current_answer_rank_score: Optional[float] = Field(
        None, decimal_places=2, ge=0.0, le=100.0
    )
    verified: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BrandProfile(BaseModel):
    id: UUID
    user_id: UUID
    company_name: str
    industry: Optional[str] = None
    seats_used: int = 1
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Audit(BaseModel):
    id: UUID
    creator_id: UUID
    source_url: str
    platform: Literal["youtube", "blog"]
    status: Literal[
        "queued", "ingesting", "scoring", "indexing", "complete", "failed"
    ] = "queued"
    failure_reason: Optional[str] = None
    composite_score: Optional[float] = Field(None, decimal_places=2, ge=0.0, le=100.0)
    word_count: Optional[int] = None
    vector_id: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    recommendations: Optional[list[str]] = None

    model_config = ConfigDict(from_attributes=True)


class ContentNormalized(BaseModel):
    id: UUID
    audit_id: UUID
    raw_text: str
    storage_uri: Optional[str] = None
    language: str = "en"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScoreRecord(BaseModel):
    id: UUID
    audit_id: UUID
    direct_answer_density: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    entity_clarity: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    faq_coverage: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    structured_data: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    formatting_quality: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    freshness: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    content_depth: float = Field(..., decimal_places=3, ge=0.0, le=1.0)
    weights_version: str = "v1"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OptimizationEvent(BaseModel):
    id: UUID
    audit_id: UUID
    creator_id: UUID
    status: Literal["pending", "complete", "failed"] = "pending"
    original_excerpt: Optional[str] = None
    optimized_text: Optional[str] = None
    projected_score: Optional[float] = Field(None, decimal_places=2, ge=0.0, le=100.0)
    accepted: bool = False
    gemini_tokens_used: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CampaignQuery(BaseModel):
    id: UUID
    brand_id: UUID
    query_text: str
    niche_filter: Optional[str] = None
    min_score_filter: Optional[float] = Field(None, decimal_places=2, ge=0.0, le=100.0)
    result_count: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavedCreator(BaseModel):
    id: UUID
    brand_id: UUID
    creator_id: UUID
    campaign_query_id: Optional[UUID] = None
    note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Subscription(BaseModel):
    id: UUID
    user_id: UUID
    tier: Literal[
        "free", "creator_free", "creator_pro", "brand_trial", "brand_enterprise"
    ] = "free"
    audits_used_this_period: int = 0
    gemini_credits_remaining: int = 1
    billing_provider_customer_id: Optional[str] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLog(BaseModel):
    id: UUID
    actor_user_id: Optional[UUID] = None
    action: str
    target_table: Optional[str] = None
    target_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None


class CreatorProfileUpdate(BaseModel):
    primary_niche: Optional[str] = None
    handle: Optional[str] = None
    platform: Optional[Literal["youtube", "blog", "instagram"]] = None
    follower_count: Optional[int] = None


class BrandProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None


class ContentSubmitRequest(BaseModel):
    source_url: str


class CreatorDashboardData(BaseModel):
    profile: CreatorProfile
    recent_audits: list[Audit]
    radar_data: list[dict]


class BrandDashboardData(BaseModel):
    profile: BrandProfile
    recent_queries: list[CampaignQuery]
    saved_creator_count: int


class BrandSearchRequest(BaseModel):
    query_text: str
    niche_filter: Optional[str] = None
    min_score_filter: Optional[float] = Field(None, decimal_places=2, ge=0.0, le=100.0)


class CreatorPublicProfile(BaseModel):
    creator: CreatorProfile
    recent_scores: list[ScoreRecord]


class AuditDetailResponse(BaseModel):
    audit: Audit
    score_record: Optional[ScoreRecord] = None


class AuditListResponse(BaseModel):
    audits: list[Audit]
    total: int
