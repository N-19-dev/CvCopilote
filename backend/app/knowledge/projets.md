# Projets

## Analyse vidéo pour coachs de rugby (projet personnel, Sep 2024 – Juin 2025)

Nathan a développé un outil d'analyse vidéo pour des coachs de rugby, combinant des algorithmes de vision par ordinateur pour suivre les joueurs et le ballon en temps réel, et du Machine Learning pour la reconnaissance d'actions (plaquages, passes) et la prédiction de stratégies. Il a construit une interface utilisateur permettant aux coachs de visualiser ces données en temps réel pendant l'analyse d'un match.

Technologies : Python, Computer Vision, Machine Learning, NumPy, Pandas.

## CV Copilote — ce projet lui-même (en cours de construction)

CV Copilote est le site que le recruteur est en train d'utiliser : un dashboard présentant le parcours de Nathan, couplé à cet agent conversationnel qui répond aux questions en s'appuyant sur une base de connaissances RAG. Le point technique notable est le **routeur intelligent** qui classe la complexité de chaque question et choisit dynamiquement le modèle le plus adapté (un modèle open source rapide et gratuit pour les questions simples, un modèle plus puissant — potentiellement Claude — pour les questions complexes), le tout orchestré via un proxy LiteLLM avec cache Redis. C'est une démonstration directe de compétences d'IA Engineer en production : RAG, routing multi-modèles, optimisation de coût/latence, et intégration front (Next.js/shadcn) - back (FastAPI).

Technologies : FastAPI, LiteLLM, Redis, sentence-transformers (embeddings locaux), Next.js, shadcn/ui.

## Kalé — application personnelle, projet important en développement

Kalé (nom historique du dossier : PoteAgenda) est une création personnelle de Nathan. Il s'agit d'une application iOS pour trouver des créneaux communs entre amis et organiser des sorties sans exposer les titres des événements privés. Le code comprend le calcul des créneaux, l'import des calendriers avec EventKit et un backend Supabase avec PostgreSQL. Nathan indique que ce projet a une place importante parmi ses créations. Sa publication sur l'App Store et son nombre d'utilisateurs ne sont pas établis.

Technologies : SwiftUI, EventKit, Supabase, PostgreSQL.

## Orchestra — orchestration d'agents, projet important en développement

Orchestra est une création personnelle prioritaire de Nathan, distincte du copilote RAG de ce site. Le projet développe un moteur d'orchestration d'agents : planification, exécution, gestion de contexte et passage de relais. Le code comporte des adaptateurs Claude Code et Codex CLI ainsi que de la persistance SQLite. Le projet est en développement ; ne pas le présenter comme un produit terminé ou un service déployé. Le README initial ne reflète pas tout le code actuel.

Technologies : TypeScript, orchestration d'agents, Claude Code, Codex CLI, SQLite.

## Data Peek — site de veille tech, projet personnel majeur

Data Peek est une création personnelle importante de Nathan, au même titre que Kalé et Orchestra. Son dépôt local porte le nom veille_tech_crawling. Nathan confirme que le site https://data-peek.com est en production, avec des bugs encore présents et un développement momentanément en pause. Le projet associe un pipeline de collecte RSS, classification et synthèse par LLM à une interface de lectures quotidiennes, quiz et suivi de progression. Ce n’est pas un simple petit essai de veille. Ne pas annoncer de nombre d’utilisateurs ni de résultats de performance non vérifiés.

Technologies : Python, LLM, React, TypeScript.

## MapAsk — expérimentation de recherche locale

Nathan teste MapAsk, un prototype qui interprète un besoin d'achat et recherche des commerces proches. Le code comporte des fournisseurs Claude, Google Places et Mapbox, ainsi qu'un mode simulé. Nathan ne sait pas encore quelle direction prendra le projet. Ne pas promettre une disponibilité réelle des produits, un déploiement public ou des résultats vérifiés.

## Podcast Brief — outil personnel exploratoire

Nathan développe un outil pour l'aider à préparer des briefs de podcast sur la data et l'IA. Le code FastAPI collecte des actualités et génère des briefs avec Claude et un repli Mistral. C'est un test personnel dont la suite n'est pas encore définie, pas un produit commercial établi.

## Veille et petits outils — hobby

Nathan confirme construire de petits outils et expérimenter pendant son temps libre : c'est un hobby. Ces essais incluent notamment l’évaluation de réponses LLM et des automatisations ponctuelles. Data Peek est un projet majeur distinct de ces petits essais. Ne pas attribuer de résultats chiffrés aux exemples des documentations. Kalé, Orchestra et Data Peek doivent être mis en avant avant ces petits essais.
