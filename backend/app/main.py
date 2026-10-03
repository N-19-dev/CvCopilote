import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

load_dotenv()

from app import cache  # noqa: E402
from app.chat import ChatRequest, ChatResponse, answer_question, stream_answer  # noqa: E402

app = FastAPI(title="CV Copilote Backend")

allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    try:
        cache.get_client().ping()
        redis_status = "ok"
    except Exception:
        redis_status = "unreachable"
    return {"status": "ok", "redis": redis_status}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return answer_question(request.question)


@app.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Même pipeline que /chat, mais rejoue chaque étape réelle (classification,
    récupération RAG, appel modèle) comme un événement SSE — pour animer côté
    frontend ce qui se passe vraiment pendant l'attente, pas une simulation.
    """

    def events():
        for event in stream_answer(request.question):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")
