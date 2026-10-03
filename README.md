# CV Copilote

Portfolio interactif de Nathan Sornet : un portfolio présentant ses projets, son parcours et ses compétences, couplé à un agent conversationnel RAG qui répond aux questions d'un recruteur en s'appuyant sur une base de connaissances. Les appels au LLM passent par un **routeur intelligent** qui classe la complexité de chaque question et choisit dynamiquement le modèle le plus adapté (rapide/gratuit pour les questions simples, plus puissant pour les questions complexes) via un proxy **LiteLLM**.

## Architecture

```
Cv_Copilote/
├── backend/    FastAPI + LiteLLM (routing multi-fournisseurs) + Redis (cache) + RAG (embeddings locaux)
└── frontend/   Next.js + shadcn/ui — dashboard + chat
```

- **Backend** : `uv` pour les dépendances Python, FastAPI pour l'API, LiteLLM en proxy séparé (3 tiers de modèles : `fast` / `mid` / `smart`), Redis pour le cache des réponses, `sentence-transformers` pour des embeddings locaux et gratuits (retrieval hybride : cosinus + boost mots-clés).
- **Frontend** : Next.js (App Router) + shadcn/ui, direction visuelle crème, orange et sauge, projets filtrables, parcours détaillable et labo IA intégré avec chat, comparaison de fiche de poste, sources et étapes du routage en direct.

## Prérequis

- [`uv`](https://docs.astral.sh/uv/) (gestion des dépendances Python)
- Node.js 20+ et npm
- Docker (pour Redis en local) ou un Redis déjà accessible
- Une clé API [Groq](https://console.groq.com) (gratuite) et, optionnellement, une clé Anthropic

## Configuration

```bash
cp backend/.env.example backend/.env
```

Édite `backend/.env` et renseigne au minimum `GROQ_API_KEY` (le chat fonctionnera sans clé Anthropic, mais le tier `smart` échouera).

## Lancer le projet en local

**1. Redis** (une seule fois, reste en arrière-plan) :

```bash
docker run -d --name cv-copilote-redis -p 6379:6379 redis:alpine
```

**2. Le proxy LiteLLM** (terminal 1 — lit automatiquement `backend/.env`) :

```bash
cd backend
uv run litellm --config litellm_config.yaml --port 4000
```

**3. Le backend FastAPI** (terminal 2) :

```bash
cd backend
LITELLM_PROXY_URL=http://localhost:4000 uv run uvicorn app.main:app --reload --port 8000
```

**4. Le frontend** (terminal 3) :

```bash
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Ouvre **http://localhost:3000** (ou 3001 si le port 3000 est déjà pris).

## Tests

```bash
cd backend
uv run pytest
```

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

## Déploiement

Voir l'issue [#1](https://github.com/N-19-dev/CvCopilote/issues/1) — checklist Vercel (frontend) + Railway (backend) + Upstash (Redis).
