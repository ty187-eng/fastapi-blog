from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    environment: str = "dev"
    secret_key: SecretStr = SecretStr("dev-insecure-secret-key-change-me")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    max_upload_size_bytes: int = 5 * 1024 * 1024

    posts_per_page: int = 10

    @model_validator(mode="after")
    def validate_prod_secret(self):
        default_key = "dev-insecure-secret-key-change-me"
        if (
            self.environment.lower() == "prod"
            and self.secret_key.get_secret_value() == default_key
        ):
            raise ValueError("In production, you must set a strong SECRET_KEY")
        return self


settings = Settings()  # type: ignore[call-arg] # Loaded from .env file
