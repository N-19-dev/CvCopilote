import fakeredis

from app import cache


def test_cache_roundtrip(monkeypatch):
    fake = fakeredis.FakeStrictRedis(decode_responses=True)
    monkeypatch.setattr(cache, "get_client", lambda: fake)

    question = "Quel est le niveau de Nathan sur FastAPI ?"
    assert cache.get_cached_answer(question) is None

    payload = {"answer": "Solide", "model": "fast-model"}
    cache.set_cached_answer(question, payload)

    assert cache.get_cached_answer(question) == payload


def test_cache_key_is_normalized(monkeypatch):
    fake = fakeredis.FakeStrictRedis(decode_responses=True)
    monkeypatch.setattr(cache, "get_client", lambda: fake)

    cache.set_cached_answer("Quel est son niveau ?", {"answer": "ok"})

    assert cache.get_cached_answer("  quel est son niveau ?  ") == {"answer": "ok"}
