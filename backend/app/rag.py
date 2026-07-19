import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
EMBEDDING_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

# Fichier d'instructions de ton pour le prompt système — pas du contenu factuel
# à indexer/retrouver par le RAG.
PERSONA_FILE = "persona.md"

# Chunks trop courts (ex: un titre de section seul) pour être utiles à récupérer
# et qui polluent le classement par similarité pure.
MIN_CHUNK_WORD_COUNT = 8

FRENCH_STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "est", "son",
    "sa", "ses", "que", "qui", "pour", "dans", "sur", "avec", "il", "elle",
    "ce", "cette", "ces", "quel", "quelle", "quelles", "quels", "vous",
    "sont", "être", "avoir", "plus", "leur", "vers",
}

# Poids du score par mots-clés dans le score final hybride — les embeddings
# seuls confondent parfois des entités précises (ex: un nom d'entreprise) avec
# des chunks thématiquement proches ; un boost mots-clés corrige ce biais.
KEYWORD_SCORE_WEIGHT = 0.35


@dataclass
class Chunk:
    source: str
    heading: str
    text: str


def _split_into_chunks(markdown_text: str, source: str) -> list[Chunk]:
    """Chunke par section '## ...' — chaque section de la base de connaissances a
    été rédigée pour être auto-suffisante (dates/contexte inclus), donc un chunk
    par section reste cohérent une fois sorti de son fichier.
    """
    sections = re.split(r"(?m)^## ", markdown_text)
    chunks: list[Chunk] = []

    intro = sections[0].strip()
    if intro:
        chunks.append(Chunk(source=source, heading="intro", text=intro))

    for section in sections[1:]:
        lines = section.strip().split("\n", 1)
        heading = lines[0].strip()
        body = lines[1].strip() if len(lines) > 1 else ""
        chunks.append(Chunk(source=source, heading=heading, text=f"## {heading}\n{body}"))

    return chunks


def _load_chunks() -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        if path.name == PERSONA_FILE:
            continue
        chunks.extend(_split_into_chunks(path.read_text(encoding="utf-8"), source=path.stem))
    return [c for c in chunks if len(c.text.split()) >= MIN_CHUNK_WORD_COUNT]


def _keyword_score(query: str, text: str) -> float:
    query_tokens = {
        t for t in re.findall(r"\w+", query.lower())
        if len(t) > 2 and t not in FRENCH_STOPWORDS
    }
    if not query_tokens:
        return 0.0
    text_lower = text.lower()
    hits = sum(1 for t in query_tokens if t in text_lower)
    return hits / len(query_tokens)


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer(EMBEDDING_MODEL_NAME)


@lru_cache(maxsize=1)
def _get_index() -> tuple[list[Chunk], np.ndarray]:
    chunks = _load_chunks()
    model = _get_model()
    embeddings = model.encode([c.text for c in chunks], normalize_embeddings=True)
    return chunks, np.asarray(embeddings)


def retrieve(query: str, top_k: int = 3) -> list[Chunk]:
    """Retrieval hybride : similarité cosinus (embeddings multilingues) + boost
    mots-clés, pour ne pas rater une entité précise (ex: nom d'entreprise) que
    les embeddings seuls sous-pondèrent parfois face à une proximité thématique.
    """
    chunks, embeddings = _get_index()
    model = _get_model()
    query_embedding = model.encode([query], normalize_embeddings=True)[0]
    cosine_scores = embeddings @ query_embedding

    final_scores = np.array([
        (1 - KEYWORD_SCORE_WEIGHT) * cosine_scores[i]
        + KEYWORD_SCORE_WEIGHT * _keyword_score(query, chunks[i].text)
        for i in range(len(chunks))
    ])

    top_indices = np.argsort(-final_scores)[:top_k]
    return [chunks[i] for i in top_indices]


def load_persona() -> str:
    return (KNOWLEDGE_DIR / PERSONA_FILE).read_text(encoding="utf-8")


def build_system_prompt(query: str, top_k: int = 3) -> str:
    persona = load_persona()
    chunks = retrieve(query, top_k=top_k)
    context = "\n\n---\n\n".join(c.text for c in chunks)
    return (
        f"{persona}\n\n"
        "# Contexte factuel sur Nathan (base de connaissances — ne rien affirmer en dehors de ce cadre)\n\n"
        f"{context}"
    )
