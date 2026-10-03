"use client";

import type Lenis from "lenis";
import { useEffect, useRef, type RefObject } from "react";

// CSS scroll-snap-type ne peut pas coexister avec Lenis : Lenis pose le
// scrollTop image par image, et le navigateur traite chaque frame comme un
// scroll "posé" à re-snapper immédiatement, ce qui bloque tout scroll (testé :
// scrollTop reste figé à 0). La pagination "plein écran" est donc reproduite
// en JS — on détecte l'arrêt du scroll puis on appelle lenis.scrollTo() vers
// la section la plus proche, comme le recommande Lenis pour ce cas d'usage.
export function useSectionSnap(lenisRef: RefObject<Lenis | null>, sectionIds: string[]) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapping = useRef(false);

  useEffect(() => {
    function scheduleSnap() {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        const lenis = lenisRef.current;
        if (!lenis || snapping.current) return;

        const elements = sectionIds
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => !!el);
        if (elements.length === 0) return;

        const current = lenis.scroll;
        let closest = elements[0];
        let min = Infinity;
        for (const el of elements) {
          const d = Math.abs(el.offsetTop - current);
          if (d < min) {
            min = d;
            closest = el;
          }
        }
        if (min < 4) return;

        // Certaines sections dépassent une hauteur d'écran (ex. Expérience à
        // 5 cartes) : ne re-snapper que près d'une frontière de section, pas
        // depuis n'importe où au milieu d'un contenu qu'on est en train de
        // lire, sinon ça "aspire" l'utilisateur en arrière pendant sa lecture.
        if (min > window.innerHeight * 0.35) return;

        snapping.current = true;
        lenis.scrollTo(closest, {
          duration: 1,
          onComplete: () => {
            snapping.current = false;
          },
        });
      }, 140);
    }

    function handleScroll() {
      if (snapping.current) return;
      scheduleSnap();
    }

    let raf = 0;
    let attempts = 0;
    let attached: Lenis | null = null;
    function attach() {
      const lenis = lenisRef.current;
      if (!lenis) {
        if (attempts++ < 60) raf = requestAnimationFrame(attach);
        return;
      }
      attached = lenis;
      lenis.on("scroll", handleScroll);
    }
    attach();

    return () => {
      cancelAnimationFrame(raf);
      attached?.off("scroll", handleScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
    // sectionIds est statique dans cette app (liste de sections du CV) : pas
    // besoin de ré-attacher l'écouteur s'il changeait de référence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenisRef]);
}
