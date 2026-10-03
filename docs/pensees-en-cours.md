# Pensées en cours — première version de développement

Développé sur `codex/pensees-bilingues`. Publication sur `main` autorisée par Nathan le 3 octobre 2026.

## Routes

- `/fr/pensees` et `/en/thoughts` : carnet.
- `/fr/pensees/brag-videos-projets` et `/en/thoughts/brag-project-videos` : première trouvaille.
- Le sélecteur conserve le billet consulté. Chaque page définit sa langue HTML et ses métadonnées.
- Le portfolio reste en français. Son apparence et ses animations sont conservées ; un lien « Mes pensées » est ajouté.

## Contenu

Les textes français et anglais sont dans `frontend/src/lib/thoughts.ts`. La version anglaise est préparée à l’avance, pas générée à chaque lecture. Brag est une découverte non testée, issue des notes de Nathan ; la source et l’aide à la rédaction par IA sont explicites. Le billet fait partie de la première publication du carnet.

Cette première version contient une seule note. Pour élargir le carnet, convertir les données en collection d’articles avec un identifiant commun aux traductions, des slugs par langue et un statut brouillon/publié. Aucun formulaire d’administration ni collecte automatique de conversations n’est actif.

Flux éditorial envisagé : lien/note vocale choisi par Nathan → brouillon privé → vérification des affirmations → version anglaise → validation → publication. Ne pas inventer d’essais ni présenter une découverte comme une recommandation éprouvée.
