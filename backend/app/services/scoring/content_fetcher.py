import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any


async def fetch_content(url: str) -> Dict[str, Any]:
    """
    Fetches content from URLs (blogs, YouTube, LinkedIn, Instagram).
    Extracts raw text, headings, and metadata using BeautifulSoup and httpx.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Extract metadata
    metadata = {}
    title_tag = soup.find("title")
    if title_tag:
        metadata["title"] = title_tag.text.strip()

    for meta in soup.find_all("meta"):
        if meta.get("name"):
            metadata[meta.get("name")] = meta.get("content")
        elif meta.get("property"):
            metadata[meta.get("property")] = meta.get("content")

    # Extract headings
    headings = []
    for level in ["h1", "h2", "h3", "h4", "h5", "h6"]:
        for heading in soup.find_all(level):
            headings.append(heading.text.strip())

    # Extract raw text (removing scripts and styles)
    for script_or_style in soup(["script", "style"]):
        script_or_style.extract()

    raw_text = soup.get_text(separator=" ", strip=True)

    return {
        "raw_text": raw_text,
        "headings": headings,
        "metadata": metadata,
    }
