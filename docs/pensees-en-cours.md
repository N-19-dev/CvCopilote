# Pensées en cours — première version de développement

Développé sur `codex/pensees-bilingues`. Publication sur `main` autorisée par Nathan le 3 octobre 2026.

## Routes

- `/fr/pensees` et `/en/thoughts` : carnet.
- `/fr/pensees/brag-videos-projets` et `/en/thoughts/brag-project-videos` : première trouvaille.
- Le sélecteur conserve le billet consulté. Chaque page définit sa langue HTML et ses métadonnées.
- Le portfolio reste en français. Son apparence et ses animations sont conservées ; un lien « Mes pensées » est ajouté.

## Contenu

Les textes français et anglais sont dans `frontend/src/lib/thoughts.ts`. La version anglaise est préparée à l’avance, pas générée à chaque lecture. Brag est désormais un retour d’essai, actualisé le 5 octobre 2026 à partir du récit de Nathan. Les versions française et anglaise incluent les commandes d’installation vérifiées dans le dépôt officiel et trois vidéos locales dans `frontend/public/videos/brag/`. Les deux demandes de style sont rapportées de mémoire ; aucun coût ni résultat mesuré n’est inventé. La source et l’aide à la rédaction par IA restent explicites. Le billet fait partie de la première publication du carnet.

Cette première version contient une seule note. Pour élargir le carnet, convertir les données en collection d’articles avec un identifiant commun aux traductions, des slugs par langue et un statut brouillon/publié. Aucun formulaire d’administration ni collecte automatique de conversations n’est actif.

Flux éditorial envisagé : lien/note vocale choisi par Nathan → brouillon privé → vérification des affirmations → version anglaise → validation → publication. Ne pas inventer d’essais ni présenter une découverte comme une recommandation éprouvée.


## Point d’entrée pour les prochains retours

Utiliser le chat Codex de ce projet : Nathan peut y dicter librement ce qu’il a découvert ou testé, joindre un lien et ses captures ou vidéos, puis demander « transforme ça en pensée » ou « actualise ma pensée sur… ».

Le fonctionnement actuel est accompagné dans le chat, pas une automatisation en arrière-plan. Les notes en attente ont un endroit dédié : `docs/pensees/boite-a-idees.md`. Elles ne sont pas affichées par le site.

À partir d’un récit : retrouver d’abord un billet existant ; conserver les faits et la voix de Nathan ; distinguer commandes vérifiées, prompts exacts et souvenirs reformulés ; préparer français et anglais ; intégrer les médias ; vérifier l’affichage puis fournir un aperçu. Conserver le slug pour une mise à jour et afficher une date de modification. La mise en ligne est une étape distincte de la préparation locale.
