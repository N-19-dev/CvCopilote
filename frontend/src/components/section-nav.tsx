"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useScrollContext } from "@/lib/scroll-context";

export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const { lenisRef } = useScrollContext();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    // root: null (viewport) fonctionne dans les deux modes de scroll (window
    // sur mobile, div interne sur desktop) : l'intersection ne dépend que de
    // la position visuelle à l'écran, pas de qui possède le scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = elements.indexOf(visible.target as HTMLElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      aria-label="Navigation des sections"
      className="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex lg:left-6"
    >
      {sections.map((s, i) => (
        <button
          key={s.id}
          type="button"
          data-cursor
          data-cursor-label={s.label}
          onClick={() => goTo(s.id)}
          aria-label={`Aller à la section ${s.label}`}
          aria-current={active === i}
          className="group relative flex h-6 w-6 items-center justify-center"
        >
          <span
            className="absolute inset-0 m-auto rounded-full border border-foreground/15 transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:border-signal/50"
            style={{ width: active === i ? 20 : 8, height: active === i ? 20 : 8 }}
          />
          <motion.span
            className="rounded-full bg-foreground/25 group-hover:bg-signal"
            animate={{
              width: active === i ? 6 : 4,
              height: active === i ? 6 : 4,
              backgroundColor: active === i ? "var(--signal)" : undefined,
            }}
            transition={{ duration: 0.3 }}
          />
        </button>
      ))}
    </nav>
  );
}
