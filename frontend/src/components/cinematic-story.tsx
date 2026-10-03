"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

function useCinematicMotion() {
  const reduced = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1100px) and (min-height: 850px)",
    );
    const update = () =>
      setEnabled(
        media.matches && document.documentElement.dataset.storyMotion !== "off",
      );
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-story-motion"],
    });
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return enabled && !reduced;
}

export function CinematicOpening({ children }: { children: ReactNode }) {
  const enabled = useCinematicMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1.06, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65], [1, 1, 0]);
  const mask = useTransform(
    scrollYProgress,
    [0.15, 0.9],
    ["circle(0% at 76% 52%)", "circle(140% at 76% 52%)"],
  );
  const titleY = useTransform(scrollYProgress, [0.45, 0.95], [90, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0.5, 0.8], [0, 1]);
  return (
    <div
      ref={ref}
      className={`cinematic-opening ${enabled ? "cinema-enabled" : ""}`}
    >
      <div className="opening-stage">
        <motion.div
          className="opening-content"
          style={enabled ? { scale, opacity } : undefined}
        >
          {children}
        </motion.div>
        {enabled && (
          <motion.div
            className="opening-curtain"
            aria-hidden="true"
            style={{ clipPath: mask }}
          >
            <motion.div style={{ y: titleY, opacity: titleOpacity }}>
              <span className="eyebrow">2020 · LES PREMIERS PAS</span>
              <p>
                D’abord,
                <br />
                l’envie de <em>créer.</em>
              </p>
              <span className="opening-caption">
                Une marketplace. Beaucoup de questions.
                <br />
                Et le début de mon histoire.
              </span>
            </motion.div>
            <span className="opening-next">L’HISTOIRE CONTINUE ↓</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function ProjectGallery({ children }: { children: ReactNode }) {
  const enabled = useCinematicMotion();
  const ref = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    const track = ref.current;
    const strip = viewport.current;
    if (!track || !strip) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      if (!enabled || strip.contains(document.activeElement)) return;
      const available = track.offsetHeight - window.innerHeight + 108;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (108 - track.getBoundingClientRect().top) / Math.max(1, available),
        ),
      );
      strip.scrollLeft = progress * (strip.scrollWidth - strip.clientWidth);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const measure = () => {
      setDistance(Math.max(0, strip.scrollWidth - strip.clientWidth));
      scroll();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    for (const card of strip.children) observer.observe(card);
    window.addEventListener("scroll", scroll, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
    };
  }, [enabled, children]);
  return (
    <div
      ref={ref}
      className={`gallery-track ${enabled ? "gallery-enabled" : ""}`}
      style={
        enabled && distance > 10
          ? { height: `calc(100svh - 108px + ${distance}px)` }
          : undefined
      }
    >
      <div className="gallery-stage">
        <p className="gallery-hint">
          DES IDÉES AU CONCRET <span>Faites défiler pour explorer →</span>
        </p>
        <div
          ref={viewport}
          className="projects-grid cinematic-gallery"
          aria-label="Galerie des projets"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
