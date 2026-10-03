"use client";

import { useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/=<>[]{}";
const NBSP = " ";

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

// Ordre de résolution aléatoire (pas gauche→droite) : lecture "cassage de
// chiffrement" plutôt qu'un effet machine à écrire, beaucoup plus lisible
// comme intentionnel.
function shuffledIndices(length: number) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function DecryptText({
  text,
  className,
  tickMs = 60,
}: {
  text: string;
  className?: string;
  tickMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = usePrefersReducedMotion();
  const order = useMemo(() => shuffledIndices(text.length), [text]);
  const [chars, setChars] = useState<string[]>(() => text.split(""));
  const [jitters, setJitters] = useState<number[]>(() => text.split("").map(() => 0));
  const [lockedCount, setLockedCount] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    const lockedSet = new Set<number>();
    let revealed = 0;

    const id = setInterval(() => {
      revealed += 1;
      for (let k = 0; k < revealed && k < order.length; k++) lockedSet.add(order[k]);

      setChars(text.split("").map((ch, i) => (ch === " " || lockedSet.has(i) ? ch : randomChar())));
      setJitters(
        text.split("").map((ch, i) => (ch === " " || lockedSet.has(i) ? 0 : (Math.random() - 0.5) * 3))
      );
      setLockedCount(revealed);

      if (revealed >= order.length) clearInterval(id);
    }, tickMs);

    return () => clearInterval(id);
  }, [inView, reduced, order, text, tickMs]);

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  const positionOf = new Map(order.map((charIndex, position) => [charIndex, position]));

  function renderChar(ch: string, i: number) {
    const isLocked = ch === " " || (positionOf.get(i) ?? Infinity) < lockedCount;
    return (
      <span
        key={i}
        className={cn(
          "inline-block transition-[color,filter] duration-150",
          !isLocked && "text-signal blur-[0.4px]"
        )}
        style={!isLocked ? { transform: `translateY(${jitters[i]}px)` } : undefined}
      >
        {ch === " " ? NBSP : ch}
      </span>
    );
  }

  // Chaque caractère est un span `inline-block` indépendant (nécessaire pour
  // l'animation par lettre), ce qui casse la notion de "mot insécable" du
  // texte brut : le navigateur peut alors couper n'importe où, y compris au
  // milieu d'un mot, sur les tailles de police très grandes (hero). On
  // regroupe donc les caractères par mot (tokens sans espace) sous un même
  // span `whitespace-nowrap` — le wrap ne peut plus se produire qu'aux
  // espaces, comme avec du texte normal.
  const groups = Array.from(text.matchAll(/\s+|\S+/g), (match) => ({
    token: match[0],
    start: match.index,
  }));

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {groups.map(({ token, start }, g) =>
          /\s/.test(token) ? (
            renderChar(chars[start] ?? " ", start)
          ) : (
            <span key={`w-${g}`} className="inline-block whitespace-nowrap">
              {Array.from(token).map((_, k) => renderChar(chars[start + k], start + k))}
            </span>
          )
        )}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
