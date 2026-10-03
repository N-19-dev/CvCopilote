"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { useScrollContext } from "@/lib/scroll-context";
import { cn } from "@/lib/utils";

export function SectionShell({
  id,
  index,
  tint,
  icon: Icon,
  pinned = false,
  children,
}: {
  id: string;
  index: number;
  tint: string;
  icon: LucideIcon;
  // Désactive le zoom scroll-lié (qui pose un `transform` sur le wrapper de
  // contenu) et le clipping du <section> : un enfant `position: sticky`
  // (scroll horizontal épinglé) a besoin qu'aucun ancêtre n'établisse de
  // nouveau bloc de confinement, sinon il se fige par rapport à la section
  // au lieu du vrai viewport.
  pinned?: boolean;
  children: ReactNode;
}) {
  const { containerRef } = useScrollContext();
  const sectionRef = useRef<HTMLElement>(null);

  // Progression du transit de la section à travers le viewport (0 = elle
  // vient d'apparaître par le bas, 1 = elle vient de sortir par le haut) :
  // sert à donner la sensation de "plonger dedans" puis de s'en éloigner au
  // scroll, plutôt qu'un simple slide vertical.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });
  const contentScale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [1.08, 1, 1, 0.94]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.35, 1, 1, 0.35]);
  const numeralScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.3, 1, 0.75]);

  return (
    <section
      id={id}
      ref={sectionRef}
      style={{ "--tint": tint } as CSSProperties}
      className={cn(
        "relative flex min-h-dvh flex-col px-6 py-14 sm:px-12 sm:py-20 lg:px-16",
        !pinned && "overflow-hidden"
      )}
    >
      {/* Voile de lisibilité : le fond de particules est maintenant partagé
          par toute la page (posé au niveau page.tsx, pas par section), donc
          chaque section a besoin de son propre calque pour rester lisible —
          suffisamment opaque pour le texte, assez transparent pour laisser
          deviner la galaxie qui bouge derrière (fil conducteur du "voyage"
          entre sections plutôt que 4 fonds coupés au montage). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-30 bg-background/88" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: "radial-gradient(120% 90% at 15% 0%, color-mix(in oklch, var(--tint) 12%, transparent), transparent 65%)",
        }}
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full blur-3xl sm:h-96 sm:w-96"
        style={{ background: "color-mix(in oklch, var(--tint) 32%, transparent)" }}
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute -right-16 -bottom-20 -z-10 h-80 w-80 rounded-full blur-3xl sm:h-[28rem] sm:w-[28rem]"
        style={{ background: "color-mix(in oklch, var(--tint) 22%, transparent)" }}
      />
      {!pinned && (
        <motion.span
          aria-hidden
          style={{
            color: "color-mix(in oklch, var(--tint) 9%, transparent)",
            scale: numeralScale,
          }}
          className="pointer-events-none absolute top-1/2 right-2 -z-10 -translate-y-1/2 font-serif text-[13rem] leading-none font-medium select-none sm:right-6 sm:text-[19rem]"
        >
          {String(index).padStart(2, "0")}
        </motion.span>
      )}

      <div
        aria-hidden
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl border",
          pinned ? "sticky top-14 z-20 sm:top-20" : "mb-6 sm:mb-8"
        )}
        style={{
          borderColor: "color-mix(in oklch, var(--tint) 40%, transparent)",
          backgroundColor: "color-mix(in oklch, var(--tint) 12%, transparent)",
        }}
      >
        <Icon className="h-5 w-5" style={{ color: "var(--tint)" }} />
      </div>

      {pinned ? (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <motion.div
          style={{ scale: contentScale, opacity: contentOpacity }}
          className="relative z-10 flex min-h-0 flex-1 flex-col"
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}
