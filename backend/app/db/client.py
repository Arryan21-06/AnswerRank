from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client using credentials from the environment.
    """
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment."
        )

    return create_client(url, key)


supabase_client = get_supabase_client()
