"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { EASE_OUT_EXPO } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

// Reveal mot par mot façon SplitType/GSAP : chaque mot glisse hors d'un
// masque overflow-hidden au lieu d'un simple fade, en complément du
// "decrypt" utilisé sur les titres — même famille de gestes, texture
// différente pour le corps de texte éditorial.
export function MaskReveal({
  text,
  className,
  wordClassName,
  stagger = 0.028,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.15em]">
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: i * stagger }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
