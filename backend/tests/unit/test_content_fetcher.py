import pytest
from httpx import Response
from app.services.scoring.content_fetcher import fetch_content


@pytest.mark.asyncio
async def test_fetch_content(respx_mock):
    url = "https://example.com/blog-post"

    html_content = """
    <html>
        <head>
            <title>My Test Blog</title>
            <meta name="description" content="A test blog description" />
            <meta property="og:title" content="Open Graph Title" />
        </head>
        <body>
            <h1>Main Title</h1>
            <h2>Subheading</h2>
            <p>This is some raw text. It has some useful content.</p>
            <script>console.log("Ignore me");</script>
            <style>.p { color: red; }</style>
        </body>
    </html>
    """

    respx_mock.get(url).mock(return_value=Response(200, text=html_content))

    result = await fetch_content(url)

    assert result["metadata"]["title"] == "My Test Blog"
    assert result["metadata"]["description"] == "A test blog description"
    assert result["metadata"]["og:title"] == "Open Graph Title"

    assert "Main Title" in result["headings"]
    assert "Subheading" in result["headings"]

    assert "This is some raw text. It has some useful content." in result["raw_text"]
    assert "Ignore me" not in result["raw_text"]
    assert "color: red" not in result["raw_text"]
