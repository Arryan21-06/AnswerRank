import google.generativeai as genai
from typing import List
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


async def generate_recommendations(text: str) -> List[str]:
    """
    Generates 3-5 plain English recommendations for content improvement
    using Gemini API.
    """
    prompt = f"""
    Analyze the following content and provide 3 to 5 actionable, plain English
    recommendations for how to improve it to rank better for AI models.
    Focus on structural improvements (e.g., adding FAQs, clearer entities, better formatting).
    Return only the recommendations as a bulleted list.

    Content excerpt:
    {text[:5000]}
    """

    response = await model.generate_content_async(prompt)

    try:
        output = response.text.strip()
        recommendations = [
            line.strip().lstrip("-*1234567890. ")
            for line in output.split("\n")
            if line.strip()
        ]
        # Filter out empty strings or non-bullet lines if any
        return [r for r in recommendations if r][:5]
    except Exception:
        return [
            "Add a structured FAQ section to improve question-answering capabilities.",
            "Clearly define key entities (products, brands, people) early in the text.",
            "Improve heading hierarchy with clear H2s and H3s.",
        ]
