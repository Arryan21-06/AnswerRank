from typing import Dict
from uuid import UUID
from datetime import datetime, timezone
from app.db.client import supabase_client
import os

# Weights defined without assuming exact numeric values, utilizing os.getenv to supply configurable defaults
# falling back gracefully to arbitrary safe floats ONLY if missing to avoid crashes.
WEIGHTS = {
    "Citation Likelihood": float(os.getenv("WEIGHT_CITATION", "0.20")),
    "Authority Signals": float(os.getenv("WEIGHT_AUTHORITY", "0.20")),
    "Freshness": float(os.getenv("WEIGHT_FRESHNESS", "0.20")),
    "Structure": float(os.getenv("WEIGHT_STRUCTURE", "0.20")),
    "Engagement": float(os.getenv("WEIGHT_ENGAGEMENT", "0.20")),
}

DIMENSION_MAPPING = {
    "source citations": "Citation Likelihood",
    "expertise signals": "Authority Signals",
    "factual accuracy": "Freshness",
    "structured formatting": "Structure",
    "engagement metrics": "Engagement",
}


def calculate_score(audit_id: UUID, ai_scores: Dict[str, float]) -> float:
    """
    Calculates final AnswerRank score based on mapped weights.
    Inserts ScoreRecord and updates Audit.
    """

    final_score = 0.0
    mapped_scores = {}

    for raw_dim, score in ai_scores.items():
        mapped_dim = DIMENSION_MAPPING.get(raw_dim)
        if mapped_dim:
            weight = WEIGHTS.get(mapped_dim, 0.20)
            final_score += score * weight
            mapped_scores[mapped_dim] = score

    # Normalize to 0-100
    composite_score = final_score * 100.0

    record_data = {
        "audit_id": str(audit_id),
        "direct_answer_density": mapped_scores.get("Citation Likelihood", 0.0),
        "entity_clarity": mapped_scores.get("Citation Likelihood", 0.0),
        "faq_coverage": mapped_scores.get("Structure", 0.0),
        "structured_data": mapped_scores.get("Structure", 0.0),
        "formatting_quality": mapped_scores.get("Structure", 0.0),
        "freshness": mapped_scores.get("Freshness", 0.0),
        "content_depth": mapped_scores.get("Authority Signals", 0.0),
    }

    # Insert into score_records
    supabase_client.table("score_records").insert(record_data).execute()

    # Update audits table
    supabase_client.table("audits").update(
        {
            "status": "complete",
            "composite_score": composite_score,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", str(audit_id)).execute()

    return composite_score
