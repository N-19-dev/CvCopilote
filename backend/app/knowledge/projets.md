# Projets

## Analyse vidéo pour coachs de rugby (projet personnel, Sep 2024 – Juin 2025)

Nathan a développé un outil d'analyse vidéo pour des coachs de rugby, combinant des algorithmes de vision par ordinateur pour suivre les joueurs et le ballon en temps réel, et du Machine Learning pour la reconnaissance d'actions (plaquages, passes) et la prédiction de stratégies. Il a construit une interface utilisateur permettant aux coachs de visualiser ces données en temps réel pendant l'analyse d'un match.

Technologies : Python, Computer Vision, Machine Learning, NumPy, Pandas.

## CV Copilote — ce projet lui-même (en cours de construction)

CV Copilote est le site que le recruteur est en train d'utiliser : un dashboard présentant le parcours de Nathan, couplé à cet agent conversationnel qui répond aux questions en s'appuyant sur une base de connaissances RAG. Le point technique notable est le **routeur intelligent** qui classe la complexité de chaque question et choisit dynamiquement le modèle le plus adapté (un modèle open source rapide et gratuit pour les questions simples, un modèle plus puissant — potentiellement Claude — pour les questions complexes), le tout orchestré via un proxy LiteLLM avec cache Redis. C'est une démonstration directe de compétences d'IA Engineer en production : RAG, routing multi-modèles, optimisation de coût/latence, et intégration front (Next.js/shadcn) - back (FastAPI).

Technologies : FastAPI, LiteLLM, Redis, sentence-transformers (embeddings locaux), Next.js, shadcn/ui.
