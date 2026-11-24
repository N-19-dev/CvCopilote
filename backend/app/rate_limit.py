"""Quota de questions par visiteur, pour qu'une seule personne (ou un script)
ne vide pas les quotas des fournisseurs de modèles.

Deux compteurs Redis à fenêtre fixe :
- par visiteur (IP hachée — on ne stocke jamais l'IP en clair) ;
- global, toutes personnes confondues, en filet de sécurité contre un abus
  distribué sur plusieurs IP.
"""

import hashlib
import os
from dataclasses import dataclass

from fastapi import Request

from app import cache


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


def visitor_limit() -> int:
    return _int_env("CHAT_LIMIT_PER_VISITOR", 10)


def window_seconds() -> int:
    return _int_env("CHAT_LIMIT_WINDOW_SECONDS", 60 * 60 * 24)


def global_limit() -> int:
    return _int_env("CHAT_GLOBAL_DAILY_LIMIT", 500)


@dataclass
class Quota:
    allowed: bool
    limit: int
    remaining: int
    reset_in_seconds: int
    reason: str | None = None  # "visitor" | "global"

    def as_dict(self) -> dict:
        return {
            "limit": self.limit,
            "remaining": self.remaining,
            "reset_in_seconds": self.reset_in_seconds,
            "reason": self.reason,
        }


def client_ip(request: Request) -> str:
    # Derrière Railway/Vercel, la vraie IP est ajoutée en DERNIER dans
    # X-Forwarded-For par le proxy de la plateforme : les entrées précédentes
    # peuvent être forgées par le client, la dernière non.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def visitor_id(request: Request) -> str:
    salt = os.environ.get("RATE_LIMIT_SALT", os.environ.get("LITELLM_MASTER_KEY", ""))
    return hashlib.sha256(f"{salt}:{client_ip(request)}".encode()).hexdigest()[:32]


def _visitor_key(vid: str) -> str:
    return f"cv-copilote:quota:visitor:{vid}"


_GLOBAL_KEY = "cv-copilote:quota:global"


def _ttl(key: str) -> int:
    ttl = cache.get_client().ttl(key)
    return ttl if ttl and ttl > 0 else window_seconds()


def peek(request: Request) -> Quota:
    """État du quota sans rien consommer (pour l'affichage côté frontend)."""
    key = _visitor_key(visitor_id(request))
    used = int(cache.get_client().get(key) or 0)
    limit = visitor_limit()
    remaining = max(0, limit - used)
    return Quota(
        allowed=remaining > 0,
        limit=limit,
        remaining=remaining,
        reset_in_seconds=_ttl(key),
        reason=None if remaining > 0 else "visitor",
    )


def consume(request: Request) -> Quota:
    """Décompte une question. À appeler AVANT tout appel modèle."""
    client = cache.get_client()
    limit = visitor_limit()
    key = _visitor_key(visitor_id(request))

    used = client.incr(key)
    if used == 1:
        client.expire(key, window_seconds())
    if used > limit:
        return Quota(False, limit, 0, _ttl(key), reason="visitor")

    total = client.incr(_GLOBAL_KEY)
    if total == 1:
        client.expire(_GLOBAL_KEY, 60 * 60 * 24)
    if total > global_limit():
        # On rend la question au visiteur : ce n'est pas lui qui a abusé.
        client.decr(key)
        return Quota(False, limit, max(0, limit - used + 1), _ttl(_GLOBAL_KEY), reason="global")

    return Quota(True, limit, max(0, limit - used), _ttl(key))
