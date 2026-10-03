import fakeredis

from app import cache, chat, rag


def _patch_cache(monkeypatch):
    fake = fakeredis.FakeStrictRedis(decode_responses=True)
    monkeypatch.setattr(cache, "get_client", lambda: fake)


FAKE_CHUNKS = [rag.Chunk(source="experiences", heading="dbt", text="## dbt\nUtilisé chez Ippon.")]


class FakeResult:
    tier = "fast"
    model_name = "fast-model"
    answer = "Réponse test"
    latency_ms = 123.4
    cost_usd = 0.0001
    prompt_tokens = 50
    completion_tokens = 20


def test_answer_question_cache_miss_then_hit(monkeypatch):
    _patch_cache(monkeypatch)
    monkeypatch.setattr(chat, "classify_complexity", lambda q: "fast")
    monkeypatch.setattr(chat.rag, "retrieve", lambda q: FAKE_CHUNKS)
    monkeypatch.setattr(chat.rag, "render_prompt", lambda chunks: "system prompt")
    monkeypatch.setattr(chat, "call_model", lambda tier, messages: FakeResult())
    monkeypatch.setattr(chat, "_estimate_smart_cost", lambda p, c: 0.001)

    question = "Quel est son niveau sur dbt ?"

    first = chat.answer_question(question)
    assert first.cached is False
    assert first.tier == "fast"
    assert first.answer == "Réponse test"
    assert first.savings_vs_smart_pct is not None
    assert first.savings_vs_smart_pct > 0
    assert first.sources[0].source == "experiences"

    second = chat.answer_question(question)
    assert second.cached is True
    assert second.answer == "Réponse test"
    assert second.tier == "fast"
    assert second.sources[0].source == "experiences"


def test_answer_question_no_savings_when_smart_cost_unknown(monkeypatch):
    _patch_cache(monkeypatch)
    monkeypatch.setattr(chat, "classify_complexity", lambda q: "smart")
    monkeypatch.setattr(chat.rag, "retrieve", lambda q: FAKE_CHUNKS)
    monkeypatch.setattr(chat.rag, "render_prompt", lambda chunks: "system prompt")
    monkeypatch.setattr(chat, "call_model", lambda tier, messages: FakeResult())
    monkeypatch.setattr(chat, "_estimate_smart_cost", lambda p, c: None)

    result = chat.answer_question("Une autre question jamais posée avant ?")
    assert result.savings_vs_smart_pct is None


def test_stream_answer_emits_stage_events_in_order(monkeypatch):
    _patch_cache(monkeypatch)
    monkeypatch.setattr(chat, "classify_complexity", lambda q: "fast")
    monkeypatch.setattr(chat.rag, "retrieve", lambda q: FAKE_CHUNKS)
    monkeypatch.setattr(chat.rag, "render_prompt", lambda chunks: "system prompt")
    monkeypatch.setattr(chat, "call_model", lambda tier, messages: FakeResult())
    monkeypatch.setattr(chat, "_estimate_smart_cost", lambda p, c: 0.001)

    stages = [event["stage"] for event in chat.stream_answer("Une question jamais posée ?")]
    assert stages == ["classify", "retrieve", "call_model", "done"]


def test_stream_answer_cache_hit_short_circuits(monkeypatch):
    _patch_cache(monkeypatch)
    monkeypatch.setattr(chat, "classify_complexity", lambda q: "fast")
    monkeypatch.setattr(chat.rag, "retrieve", lambda q: FAKE_CHUNKS)
    monkeypatch.setattr(chat.rag, "render_prompt", lambda chunks: "system prompt")
    monkeypatch.setattr(chat, "call_model", lambda tier, messages: FakeResult())
    monkeypatch.setattr(chat, "_estimate_smart_cost", lambda p, c: 0.001)

    question = "Une question mise en cache ?"
    list(chat.stream_answer(question))  # premier appel : peuple le cache

    stages = [event["stage"] for event in chat.stream_answer(question)]
    assert stages == ["cache_hit", "done"]
