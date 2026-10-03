"use client";

import Lenis from "lenis";
import { useEffect, useRef, type RefObject } from "react";

// Vraie easeOutExpo (pas une approximation quartique) : glisse fort au début
// puis se pose net, cohérent avec --ease-out-expo utilisé partout ailleurs.
const EASE_OUT_EXPO_FN = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// Le pane gauche (Dashboard) n'est le vrai conteneur de scroll qu'à partir de
// md: (cf. `md:overflow-y-auto` dans page.tsx). En dessous, c'est la fenêtre
// qui scrolle. Lenis doit donc cibler l'un ou l'autre selon le breakpoint,
// et se reconstruire si on le franchit (resize/rotation).
//
// L'instance est aussi exposée via la ref retournée pour que d'autres UI
// (nav latérale de section) puissent piloter `lenis.scrollTo(...)` sans
// désynchroniser la position interne de Lenis.
export function useSmoothScroll(wrapperRef: RefObject<HTMLElement | null>) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let detachProgressListener: (() => void) | null = null;

    function setProgress(target: HTMLElement | Window) {
      const isWindow = target === window;
      const scrollTop = isWindow ? window.scrollY : (target as HTMLElement).scrollTop;
      const scrollHeight = isWindow
        ? document.documentElement.scrollHeight - window.innerHeight
        : (target as HTMLElement).scrollHeight - (target as HTMLElement).clientHeight;
      const progress = scrollHeight <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / scrollHeight));
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
    }

    function bindProgressListener() {
      detachProgressListener?.();
      const wrapper = wrapperRef.current;
      const target: HTMLElement | Window = mql.matches && wrapper ? wrapper : window;
      const onScroll = () => setProgress(target);
      target.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      detachProgressListener = () => target.removeEventListener("scroll", onScroll);
    }

    function loop(time: number) {
      lenisRef.current?.raf(time);
      raf = requestAnimationFrame(loop);
    }

    function setup() {
      lenisRef.current?.destroy();
      bindProgressListener();

      if (reducedMotion.matches) {
        lenisRef.current = null;
        return;
      }

      const wrapper = wrapperRef.current;
      const isDesktop = mql.matches;
      const lenis = new Lenis({
        duration: 1.35,
        easing: EASE_OUT_EXPO_FN,
        wheelMultiplier: 0.85,
        ...(isDesktop && wrapper ? { wrapper, content: wrapper } : {}),
      });

      lenis.on("scroll", ({ progress }: { progress: number }) => {
        document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
      });

      lenisRef.current = lenis;
    }

    setup();
    if (!reducedMotion.matches) {
      raf = requestAnimationFrame(loop);
    }
    mql.addEventListener("change", setup);
    reducedMotion.addEventListener("change", setup);

    return () => {
      mql.removeEventListener("change", setup);
      reducedMotion.removeEventListener("change", setup);
      detachProgressListener?.();
      cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [wrapperRef]);

  return lenisRef;
}
