import google.generativeai as genai
import json
from typing import Dict, Any
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


async def analyze_content(content_data: Dict[str, Any]) -> Dict[str, float]:
    """
    Analyzes content using Gemini API for factual accuracy, source citations,
    structured formatting, expertise signals, and engagement metrics.
    Returns structured JSON dimension scores between 0.0 and 1.0.
    """
    prompt = f"""
    Analyze the following content and evaluate it across these 5 dimensions:
    - factual accuracy
    - source citations
    - structured formatting
    - expertise signals
    - engagement metrics

    Content:
    {json.dumps(content_data, ensure_ascii=False)}

    Provide a score between 0.0 and 1.0 for each dimension.
    Return ONLY a valid JSON object with the exact keys:
    "factual accuracy", "source citations", "structured formatting", "expertise signals", "engagement metrics".
    Example:
    {{"factual accuracy": 0.8, "source citations": 0.5, "structured formatting": 0.9, "expertise signals": 0.7, "engagement metrics": 0.6}}
    """

    response = await model.generate_content_async(prompt)

    try:
        text = response.text.strip()
        # Clean markdown code block if present
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        scores = json.loads(text)
        return scores
    except Exception:
        # Fallback in case of failure
        return {
            "factual accuracy": 0.0,
            "source citations": 0.0,
            "structured formatting": 0.0,
            "expertise signals": 0.0,
            "engagement metrics": 0.0,
        }
