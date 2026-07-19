from fastapi.testclient import TestClient

from app import main
from app.chat import ChatResponse
from app.main import app

client = TestClient(app)


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
    )
    monkeypatch.setattr(main, "answer_question", lambda question: fake_response)

    response = client.post("/chat", json={"question": "test"})
    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "ok"
    assert body["tier"] == "fast"
