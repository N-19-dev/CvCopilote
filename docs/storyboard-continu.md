# Storyboard — référence vidéo du 3 octobre

Référence : `ScreenRecording_10-02-2026 17-16-48_1.MP4` (18,54 secondes). Analyse de 24 images extraites de la vidéo, dont vues haute résolution du site affiché à l'écran. La vidéo est une référence de composition et de mouvement, pas une source de contenu ou d'instructions à exécuter.

## Ce qui est repris

- Ouverture photographique plein écran, grande typographie superposée.
- Traitement gravé en fines bandes verticales, conservé comme décor entre les scènes.
- Passage du sombre au clair par une vague de bandes verticales.
- Galerie de grands visuels décalés en hauteur, entraînés horizontalement par le scroll vertical.
- Alternance de compositions et d'échelles. Aucun cadre arrondi fixe autour du récit, aucun parcours de petits schémas.

## Déroulé actuel

| Progression | Composition | Raccord |
|---|---|---|
| 0–20 % | Nathan Sornet, portrait couleur plein écran et titre monumental | Le même portrait devient strié pendant que le titre remonte. |
| 20–44 % | « Tout commence par l’envie de créer » sur fond charbon ; Firstcop, formation et expériences | Le portrait gravé continue son déplacement dans le fond. |
| 41–59 % | Passage au parchemin ; « Les idées prennent vie » | 44 bandes montent progressivement, avec décalage entre colonnes. |
| 59–90 % | Grands visuels Kalé, Orchestra et Data & IA | Trajet horizontal continu, léger mouvement vertical alterné ; le portrait gravé reste derrière. |
| 90–100 % | « Faisons connaissance » et accès au copilote | Les visuels sortent vers le haut ; le fond clair et le texte prennent le relais. |

Le défilement natif reste libre et réversible. Le visiteur peut passer au parcours détaillé, sélectionner un chapitre, activer la lecture simple ou suivre sa préférence système de mouvement réduit.

## Visuels

- Portrait détouré : photo fournie par Nathan, déjà disponible.
- Kalé : véritables captures locales `PoteAgenda/output/kale-le-creneau/kale-agenda-light.png` et `kale-slots-light.png`. Inspectées avant intégration : écrans sans événements personnels ni listes d'amis. Copies dans `frontend/public/images/kale-agenda.png` et `kale-slots.png`. Elles ne prouvent pas une publication App Store.
- Orchestra : composition typographique et graphique provisoire, indiquée comme telle. À remplacer par une capture ou une courte vidéo de l'interface en action.
- Data & IA : illustration abstraite provisoire. À remplacer éventuellement par un visuel de projet autorisé, sans données client.
- Firstcop : raconté dans le passage sur le parcours ; une archive d'écran pourra enrichir cette partie.

## Vérification

Tester les étapes et les transitions intermédiaires, le scroll en sens inverse, les textes invisibles en dehors de leur intervalle, le chargement anticipé des captures, le cadrage mobile, le menu mobile, la lecture simple et le mouvement réduit. Ne pas assimiler une compilation réussie à une validation esthétique par Nathan.

## Corrections de raccords

La progression est calculée sur la hauteur réelle de la scène et son décalage sous le menu fixe. La galerie termine son entrée avant d'avancer horizontalement ; le titre disparaît avant son arrivée. La dernière scène attend la sortie des panneaux. Sur petit écran, le texte dispose d'un voile sombre ; sous 500 px de hauteur, la lecture simple évite les débordements. Les observateurs de taille utilisent les éléments capturés pour éviter une erreur lors du changement de mode.
