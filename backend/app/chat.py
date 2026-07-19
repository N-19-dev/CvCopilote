import litellm
from pydantic import BaseModel

from app import cache, rag
from app.router import ModelTier, call_model, classify_complexity

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


def answer_question(question: str) -> ChatResponse:
    cached_payload = cache.get_cached_answer(question)
    if cached_payload is not None:
        return ChatResponse(**{**cached_payload, "cached": True})

    tier = classify_complexity(question)
    system_prompt = rag.build_system_prompt(question)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ]

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
    }
    cache.set_cached_answer(question, payload)

    return ChatResponse(**{**payload, "cached": False})
