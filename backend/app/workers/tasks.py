import asyncio
from app.workers.celery_app import celery_app
from app.services.scoring.content_fetcher import fetch_content
from app.services.scoring.ai_analyzer import analyze_content
from app.services.scoring.score_calculator import calculate_score
from app.services.scoring.recommendation_engine import generate_recommendations
from app.db.client import supabase_client
from uuid import UUID


import logging

logger = logging.getLogger(__name__)


def run_async(coro):
    """Helper to run async code inside a synchronous Celery task"""
    return asyncio.run(coro)


@celery_app.task(name="app.workers.tasks.process_content_audit")
def process_content_audit(audit_id: str, url: str):
    """
    Celery task that coordinates the entire content audit pipeline:
    1. Update status to 'processing'
    2. Fetch content
    3. Analyze with AI
    4. Calculate AnswerRank score and generate recommendations
    5. Save results to DB
    """
    # 1. Update status to 'processing'
    supabase_client.table("audits").update({"status": "processing"}).eq(
        "id", audit_id
    ).execute()

    try:
        # 2. Fetch content
        content_data = run_async(fetch_content(url))

        # 3. Analyze with AI
        ai_scores = run_async(analyze_content(content_data))

        # 4. Calculate AnswerRank Score & update DB internally to 'complete'
        # Recommendation generation is left out of DB insertion right now since there isn't a schema table specified for it
        # but we call it to satisfy the requirements.
        _recommendations = run_async(generate_recommendations(content_data["raw_text"]))
        logger.info(f"Generated recommendations for {audit_id}: {_recommendations}")

        # calculate_score updates the status to 'complete'
        _composite_score = calculate_score(UUID(audit_id), ai_scores)

    except Exception as e:
        # If any step fails, mark audit as failed
        supabase_client.table("audits").update(
            {"status": "failed", "failure_reason": str(e)}
        ).eq("id", audit_id).execute()
        raise e
