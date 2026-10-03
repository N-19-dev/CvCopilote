"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { currentMood } from "@/lib/mood";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

// Horodatage fixe (pas `new Date()`) pour l'état initial : le serveur et le
// navigateur ne rendent jamais au même instant, donc calculer le mood "live"
// dès le premier rendu produit deux valeurs différentes et un avertissement
// d'hydratation à chaque chargement. On rend d'abord ce mood neutre (identique
// des deux côtés), puis on bascule sur l'heure réelle dans useEffect — qui ne
// tourne qu'après l'hydratation, donc plus de désaccord serveur/client.
const SSR_SAFE_MOOD = currentMood(new Date(2024, 0, 1, 12, 0, 0));

// Une seule horloge de mood pour tout le panneau (header + avatars par
// message) : posée ici et consommée via un prop plutôt que recalculée par
// composant, pour que le glow de chaque avatar et la légende du header restent
// synchrones — deux horloges indépendantes auraient fini par diverger de
// quelques secondes après plusieurs re-renders.
export function useLiveMood() {
  const [mood, setMood] = useState(SSR_SAFE_MOOD);
  useEffect(() => {
    const initialFrame = requestAnimationFrame(() => setMood(currentMood(new Date())));
    const id = setInterval(() => setMood(currentMood(new Date())), 30_000);
    return () => {
      cancelAnimationFrame(initialFrame);
      clearInterval(id);
    };
  }, []);
  return mood;
}

// Marque géométrique de l'agent — reprend le vocabulaire des nœuds
// d'AgentControlRoom (carré hairline, pas de remplissage décoratif) plutôt
// qu'un personnage illustré : un point unique respire au centre, coloré par
// --mood, pour rester lisible comme "instrument" plutôt que "mascotte".
export function MongooseAvatar({ size = 32, className }: { size?: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const dot = Math.max(3, size * 0.16);
  return (
    <div
      aria-hidden
      className={cn("relative shrink-0 border border-foreground/15 bg-background", className)}
      style={{ width: size, height: size }}
    >
      <motion.span
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: dot,
          height: dot,
          marginLeft: -dot / 2,
          marginTop: -dot / 2,
          background: "var(--mood)",
        }}
        animate={
          reduced ? { opacity: 0.75 } : { opacity: [0.45, 1, 0.45], scale: [0.85, 1.05, 0.85] }
        }
        transition={reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Bandeau d'identité persistant en tête du chat : nom, tag de mood (même
// recette pastille que RouterStats — color-mix sur la variable de couleur) et
// légende horaire qui se rafraîchit en direct, plutôt qu'un message figé au
// premier chargement.
export function MongooseHeader({ mood }: { mood: ReturnType<typeof currentMood> }) {
  return (
    <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3">
      <MongooseAvatar size={36} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wide">MONGOOSE</span>
          <span
            className="inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[10px] tracking-wide"
            style={{
              borderColor: "color-mix(in oklch, var(--mood) 45%, transparent)",
              backgroundColor: "color-mix(in oklch, var(--mood) 12%, transparent)",
              color: "var(--mood)",
            }}
          >
            {mood.tag}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={mood.caption}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="truncate text-xs text-muted-foreground"
          >
            {mood.caption}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
