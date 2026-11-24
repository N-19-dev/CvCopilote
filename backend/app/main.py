import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

load_dotenv()

from app import cache, rate_limit  # noqa: E402
from app.chat import ChatRequest, ChatResponse, answer_question, stream_answer  # noqa: E402

app = FastAPI(title="CV Copilote Backend")

allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _quota_exceeded(quota: rate_limit.Quota) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "quota_exceeded", "quota": quota.as_dict()},
        headers={"Retry-After": str(quota.reset_in_seconds)},
    )


@app.get("/health")
def health() -> dict[str, str]:
    try:
        cache.get_client().ping()
        redis_status = "ok"
    except Exception:
        redis_status = "unreachable"
    return {"status": "ok", "redis": redis_status}


@app.get("/chat/quota")
def chat_quota(http_request: Request) -> dict:
    return rate_limit.peek(http_request).as_dict()


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, http_request: Request):
    quota = rate_limit.consume(http_request)
    if not quota.allowed:
        return _quota_exceeded(quota)
    return answer_question(request.question, request.job_description)


@app.post("/chat/stream")
def chat_stream(request: ChatRequest, http_request: Request):
    """Même pipeline que /chat, mais rejoue chaque étape réelle (classification,
    récupération RAG, appel modèle) comme un événement SSE — pour animer côté
    frontend ce qui se passe vraiment pendant l'attente, pas une simulation.
    """

    quota = rate_limit.consume(http_request)
    if not quota.allowed:
        return _quota_exceeded(quota)

    def events():
        yield f"data: {json.dumps({'stage': 'quota', **quota.as_dict()})}\n\n"
        for event in stream_answer(request.question, request.job_description):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")
