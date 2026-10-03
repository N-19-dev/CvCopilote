from collections.abc import Iterator
from typing import Any

import litellm
from pydantic import BaseModel

from app import cache, rag
from app.router import TIER_MODEL_NAMES, ModelTier, call_model, classify_complexity

# Modèles réels par tier, alignés sur litellm_config.yaml — sert uniquement à
# estimer, via la table de prix statique de LiteLLM, ce qu'aurait coûté la même
# question sur le modèle "smart", sans faire un appel supplémentaire pour de vrai.
TIER_UNDERLYING_MODEL: dict[ModelTier, str] = {
    "fast": "groq/llama-3.1-8b-instant",
    "mid": "groq/llama-3.3-70b-versatile",
    "smart": "claude-sonnet-5",
}


class ChatRequest(BaseModel):
    question: str


class Source(BaseModel):
    source: str
    heading: str
    text: str


class ChatResponse(BaseModel):
    answer: str
    tier: str
    model_name: str
    latency_ms: float
    cost_usd: float
    prompt_tokens: int
    completion_tokens: int
    cached: bool
    savings_vs_smart_pct: float | None
    sources: list[Source]


def _estimate_smart_cost(prompt_tokens: int, completion_tokens: int) -> float | None:
    try:
        prompt_cost, completion_cost = litellm.cost_per_token(
            model=TIER_UNDERLYING_MODEL["smart"],
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )
        return prompt_cost + completion_cost
    except Exception:
        return None


def _chunk_source(chunk: rag.Chunk) -> dict[str, str]:
    return {"source": chunk.source, "heading": chunk.heading, "text": chunk.text}


def stream_answer(question: str) -> Iterator[dict[str, Any]]:
    """Rejoue les étapes réelles du pipeline (classification -> RAG -> appel
    modèle) comme une suite d'événements, pour que le frontend puisse animer
    ce qui se passe vraiment plutôt qu'une choré simulée en façade. Source
    unique de vérité : `answer_question` ne fait que consommer le dernier
    événement "done" de ce générateur.
    """
    cached_payload = cache.get_cached_answer(question)
    if cached_payload is not None:
        # Compat : entrées mises en cache avant l'ajout du champ "sources".
        cached_payload.setdefault("sources", [])
        yield {"stage": "cache_hit"}
        yield {"stage": "done", "response": {**cached_payload, "cached": True}}
        return

    tier = classify_complexity(question)
    yield {"stage": "classify", "tier": tier}

    chunks = rag.retrieve(question)
    sources = [_chunk_source(c) for c in chunks]
    yield {"stage": "retrieve", "sources": sources}

    system_prompt = rag.render_prompt(chunks)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ]
    yield {"stage": "call_model", "tier": tier, "model_name": TIER_MODEL_NAMES[tier]}

    result = call_model(tier, messages)

    smart_cost = _estimate_smart_cost(result.prompt_tokens, result.completion_tokens)
    if smart_cost and smart_cost > 0:
        savings_pct = max(0.0, (1 - result.cost_usd / smart_cost) * 100)
    else:
        savings_pct = None

    payload = {
        "answer": result.answer,
        "tier": result.tier,
        "model_name": result.model_name,
        "latency_ms": result.latency_ms,
        "cost_usd": result.cost_usd,
        "prompt_tokens": result.prompt_tokens,
        "completion_tokens": result.completion_tokens,
        "savings_vs_smart_pct": savings_pct,
        "sources": sources,
    }
    cache.set_cached_answer(question, payload)

    yield {"stage": "done", "response": {**payload, "cached": False}}


def answer_question(question: str) -> ChatResponse:
    response: dict[str, Any] | None = None
    for event in stream_answer(question):
        if event["stage"] == "done":
            response = event["response"]
    assert response is not None
    return ChatResponse(**response)
