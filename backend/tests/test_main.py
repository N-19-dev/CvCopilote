import fakeredis
import pytest
from fastapi.testclient import TestClient

from app import cache, main
from app.chat import ChatResponse
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def fake_redis(monkeypatch):
    fake = fakeredis.FakeStrictRedis(decode_responses=True)
    monkeypatch.setattr(cache, "get_client", lambda: fake)
    return fake


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["redis"] in {"ok", "unreachable"}


def test_chat_endpoint(monkeypatch):
    fake_response = ChatResponse(
        answer="ok",
        tier="fast",
        model_name="fast-model",
        latency_ms=1.0,
        cost_usd=0.0,
        prompt_tokens=1,
        completion_tokens=1,
        cached=False,
        savings_vs_smart_pct=None,
        sources=[],
    )
    monkeypatch.setattr(main, "answer_question", lambda question, job=None: fake_response)

    response = client.post("/chat", json={"question": "test"})
    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "ok"
    assert body["tier"] == "fast"


def test_quota_blocks_after_limit(monkeypatch):
    monkeypatch.setenv("CHAT_LIMIT_PER_VISITOR", "2")
    monkeypatch.setattr(main, "answer_question", lambda q, job=None: _fake())

    assert client.get("/chat/quota").json()["remaining"] == 2
    assert client.post("/chat", json={"question": "a"}).status_code == 200
    assert client.post("/chat", json={"question": "b"}).status_code == 200
    blocked = client.post("/chat", json={"question": "c"})
    assert blocked.status_code == 429
    assert blocked.json()["quota"]["remaining"] == 0
    assert client.get("/chat/quota").json()["remaining"] == 0
    # Un autre visiteur n'est pas impacté.
    other = client.post("/chat", json={"question": "d"}, headers={"x-forwarded-for": "9.9.9.9"})
    assert other.status_code == 200


def test_stream_returns_429_when_exhausted(monkeypatch):
    monkeypatch.setenv("CHAT_LIMIT_PER_VISITOR", "0")
    response = client.post("/chat/stream", json={"question": "a"})
    assert response.status_code == 429


def test_global_limit_does_not_burn_visitor_quota(monkeypatch):
    monkeypatch.setenv("CHAT_GLOBAL_DAILY_LIMIT", "1")
    monkeypatch.setattr(main, "answer_question", lambda q, job=None: _fake())
    assert client.post("/chat", json={"question": "a"}, headers={"x-forwarded-for": "1.1.1.1"}).status_code == 200
    blocked = client.post("/chat", json={"question": "b"}, headers={"x-forwarded-for": "2.2.2.2"})
    assert blocked.status_code == 429
    assert blocked.json()["quota"]["reason"] == "global"


def test_rejects_oversized_or_empty_question():
    assert client.post("/chat", json={"question": "x" * 2001}).status_code == 422
    assert client.post("/chat", json={"question": "   "}).status_code == 422


def _fake():
    return ChatResponse(
        answer="ok", tier="fast", model_name="fast-model", latency_ms=1.0, cost_usd=0.0,
        prompt_tokens=1, completion_tokens=1, cached=False, savings_vs_smart_pct=None, sources=[],
    )
