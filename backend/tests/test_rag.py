from app import rag


def test_chunking_splits_by_section():
    chunks = rag._load_chunks()
    sources = {c.source for c in chunks}
    assert "experiences" in sources
    assert "competences" in sources
    # persona.md ne doit jamais finir dans l'index RAG
    assert "persona" not in sources
    # experiences.md contient 5 sections "## ..." -> au moins 5 chunks
    assert len([c for c in chunks if c.source == "experiences"]) >= 5


def test_retrieve_thales_question_surfaces_thales_chunk():
    results = rag.retrieve("Quelles technologies a-t-il utilisées chez Thales ?", top_k=3)
    assert any("Thales" in c.text for c in results)


def test_retrieve_marketing_question_surfaces_relevant_chunk():
    results = rag.retrieve(
        "Pourquoi son profil marketing digital est un plus pour un poste produit ?", top_k=3
    )
    combined = " ".join(c.text for c in results).lower()
    assert "marketing" in combined


def test_build_system_prompt_includes_persona_and_context():
    prompt = rag.build_system_prompt("Quel est son niveau en dbt ?")
    assert "troisième personne" in prompt
    assert "dbt" in prompt.lower()
