import hashlib
import json
import os
from typing import Any

import redis

_client: redis.Redis | None = None

DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7  # 1 semaine


def get_client() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.Redis.from_url(
            os.environ.get("REDIS_URL", "redis://localhost:6379"),
            decode_responses=True,
        )
    return _client


def _cache_key(question: str) -> str:
    normalized = question.strip().lower()
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return f"cv-copilote:chat:{digest}"


def get_cached_answer(question: str) -> dict[str, Any] | None:
    raw = get_client().get(_cache_key(question))
    return json.loads(raw) if raw else None


def set_cached_answer(question: str, payload: dict[str, Any], ttl_seconds: int = DEFAULT_TTL_SECONDS) -> None:
    get_client().set(_cache_key(question), json.dumps(payload), ex=ttl_seconds)
