# Sources pour enrichir le portfolio de Nathan

Relevé local du 2 octobre 2026. Exploration ciblée de Documents, avec inventaire initial du Bureau et de Téléchargements ; ce document n'est pas un inventaire exhaustif de l'ordinateur. Aucun déploiement ni test d'exécution des autres projets n'a été effectué.

Nathan a confirmé dans la conversation que les projets ci-dessous sont ses créations. Kalé et Orchestra sont prioritaires ; MapAsk et Podcast Brief sont des tests personnels. Data Peek est également un projet majeur, confirmé le 3 octobre 2026 ; les autres petits outils relèvent de son hobby. Noms écrits repris des dépôts : Kalé, Orchestra, MapAsk.

| Projet | Éléments observés | Présentation retenue |
|---|---|---|
| Kalé (`PoteAgenda`) | README, code SwiftUI, calcul des créneaux dans `Services/CommonSlotFinder.swift`, services EventKit/Supabase, migrations ; commits Nathan Sornet | Application personnelle en développement ; disponibilités communes et organisation de sorties. Aucune affirmation de publication App Store. |
| Orchestra | README initial devenu ancien ; packages réels execution-engine, handoff-engine, context-engine, adaptateurs Claude Code et Codex CLI ; commits Nathan Sornet | Projet personnel prioritaire d'orchestration d'agents en développement. Ni simple squelette, ni produit déclaré terminé. |
| MapAsk | README ancien ; `src/lib/providers/index.ts` câble désormais Claude, Google Places et Mapbox ; mocks encore disponibles | Prototype de recherche locale ; pas de garantie sur les stocks, les résultats réels ou le déploiement. |
| Podcast Brief (`podcast_creator`) | README et `main.py` : collecte d'actualités, génération de briefs, Claude/Mistral ; commits Nathan Sornet | Outil personnel exploratoire pour préparer des podcasts. |
| Agent Veille Ippon | README d'évaluation, dépendances LangGraph/DeepEval, historique de contributions | Piste complémentaire ; ne pas reprendre les scores d'exemple du README comme résultats mesurés. |
| Data Peek (`veille_tech_crawling`) | Pipeline Python RSS/classification/synthèse, interface React/TypeScript ; LandingPage.tsx : lectures, quiz et progression ; URL canonique data-peek.com | Projet personnel majeur. Production confirmée par Nathan ; développement en pause, bugs connus. Veille Tech Crawling et Data Peek sont le même projet. |

## CV de référence

`/Users/nathansornet/Documents/Cv_Helper/nathan-sornet-cv.json`, ainsi que deux variantes anglaises dans le même dossier. Le contenu français a été lu. Les deux variantes ont été repérées, pas comparées ligne à ligne.

Les expériences, diplômes et certifications actuels sont cohérents avec le CV français consulté. Celui-ci mentionne également Neo4j/GraphRAG et la sensibilité produit issue du marketing. Le statut du projet rugby diverge entre le site (« études ») et le CV (« personnel ») : ne pas arbitrer sans précision supplémentaire.

## Périmètre

Les dépôts professionnels, workshops téléchargés et copies de dépendances ne sont pas automatiquement assimilés à des créations personnelles. Les secrets, fichiers d'identité, configurations d'accès et données client ne sont pas repris. Les dossiers d'origine sont restés inchangés. Les textes publics évitent les chemins locaux et les détails d'infrastructure privés.
