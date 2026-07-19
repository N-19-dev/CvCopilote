from app.router import classify_complexity


def test_simple_question_routes_to_fast():
    assert classify_complexity("Quel est son niveau sur FastAPI ?") == "fast"


def test_medium_question_routes_to_mid():
    question = (
        "Est-ce que son profil marketing digital, avec son master ISG en plus "
        "de son diplôme d'ingénieur, est un vrai atout pour un poste orienté produit ?"
    )
    assert classify_complexity(question) == "mid"


def test_complex_question_routes_to_smart():
    question = (
        "Peux-tu comparer en détail son expérience chez Thales sur le Knowledge Graph "
        "et son projet personnel de computer vision, et m'expliquer pourquoi son "
        "architecture GraphRAG est pertinente comparée à un RAG vectoriel classique, "
        "avec des exemples de code si possible ?"
    )
    assert classify_complexity(question) == "smart"


def test_empty_question_routes_to_fast():
    assert classify_complexity("   ") == "fast"
