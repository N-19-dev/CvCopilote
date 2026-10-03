"use client";

import { useEffect, useState } from "react";

// `root: null` (viewport) plutôt que le conteneur de scroll du Dashboard :
// l'intersection ne dépend alors que de la position visuelle à l'écran, ce
// qui marche aussi bien en mode mobile (la fenêtre scrolle) qu'en desktop (un
// <div> interne scrolle) sans avoir à connaître qui possède le scroll — même
// principe que SectionNav.
//
// Un seul aller : une fois `true`, ne redevient jamais `false` en remontant —
// une révélation qui clignote au moindre scroll vers le haut se lirait comme
// un bug, pas comme une mise en scène.
export function useHasScrolledPast(id: string) {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (passed) return;
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setPassed(true);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id, passed]);

  return passed;
}
