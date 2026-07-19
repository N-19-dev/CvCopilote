import os
import time
from dataclasses import dataclass
from typing import Literal

import litellm

ModelTier = Literal["fast", "mid", "smart"]

TIER_MODEL_NAMES: dict[ModelTier, str] = {
    "fast": "fast-model",
    "mid": "mid-model",
    "smart": "smart-model",
}

# Mots-clés qui trahissent une question qui demande de la réflexion (comparaison,
# code, architecture...) plutôt qu'un fait simple ("quel est son niveau sur X ?").
COMPLEXITY_KEYWORDS = [
    "compare",
    "comparer",
    "comparaison",
    "explique en détail",
    "détaille",
    "détaillé",
    "architecture",
    "code",
    "algorithme",
    "pourquoi",
    "stratégie",
    "avantages et inconvénients",
    "analyse",
    "analyser",
]

SIMPLE_WORD_COUNT_THRESHOLD = 12
COMPLEX_WORD_COUNT_THRESHOLD = 30


def classify_complexity(question: str) -> ModelTier:
    """Classifieur heuristique — pas d'appel LLM ici : un appel de classification
    annulerait une partie du gain de coût/latence que le routeur cherche à démontrer.
    """
    normalized = question.strip().lower()
    word_count = len(normalized.split())
    keyword_hits = sum(1 for kw in COMPLEXITY_KEYWORDS if kw in normalized)

    if keyword_hits >= 2 or word_count > COMPLEX_WORD_COUNT_THRESHOLD:
        return "smart"
    if keyword_hits == 1 or word_count > SIMPLE_WORD_COUNT_THRESHOLD:
        return "mid"
    return "fast"


@dataclass
class RouteResult:
    tier: ModelTier
    model_name: str
    answer: str
    latency_ms: float
    cost_usd: float
    prompt_tokens: int
    completion_tokens: int


def call_model(tier: ModelTier, messages: list[dict]) -> RouteResult:
    """Appelle le proxy LiteLLM (processus séparé, pas le SDK en direct) via le
    provider spécial `litellm_proxy/`, pour bénéficier du routing/cache/tracking
    de coût gérés par le proxy plutôt que de les réimplémenter ici.
    """
    model_name = TIER_MODEL_NAMES[tier]
    proxy_url = os.environ.get("LITELLM_PROXY_URL", "http://localhost:4000")
    master_key = os.environ.get("LITELLM_MASTER_KEY", "")

    start = time.perf_counter()
    response = litellm.completion(
        model=f"litellm_proxy/{model_name}",
        messages=messages,
        api_base=proxy_url,
        api_key=master_key,
    )
    latency_ms = (time.perf_counter() - start) * 1000

    try:
        cost_usd = litellm.completion_cost(completion_response=response)
    except Exception:
        cost_usd = 0.0

    usage = response.usage

    return RouteResult(
        tier=tier,
        model_name=model_name,
        answer=response.choices[0].message.content,
        latency_ms=latency_ms,
        cost_usd=cost_usd,
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
    )


def route_and_call(question: str, messages: list[dict]) -> RouteResult:
    tier = classify_complexity(question)
    return call_model(tier, messages)
