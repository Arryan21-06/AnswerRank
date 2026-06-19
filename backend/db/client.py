import os
from supabase import create_client, Client
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

supabase: Client = create_client(
    settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
)


def get_supabase_client() -> Client:
    return supabase
