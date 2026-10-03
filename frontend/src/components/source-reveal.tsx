"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { DecryptText } from "@/components/decrypt-text";
import { MaskReveal } from "@/components/mask-reveal";
import type { Source } from "@/lib/api";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  experiences: "Expériences",
  competences: "Compétences",
  formation: "Formation",
  projets: "Projets",
  profil: "Profil",
};

// Jeu de piste léger plutôt que dashboard aride : au clic, on rejoue les
// passages du CV que le RAG a réellement retenus pour cette réponse.
export function SourceReveal({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  if (sources.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors duration-200 hover:text-signal"
      >
        <ChevronRight
          className={cn("h-3 w-3 transition-transform duration-300 ease-[var(--ease-out-expo)]", open && "rotate-90 text-signal")}
        />
        voir pourquoi
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex flex-col gap-3 border-l-2 border-signal/30 py-0.5 pl-3">
              {sources.map((s, i) => (
                <motion.div
                  key={`${s.source}-${s.heading}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO, delay: i * 0.08 }}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="rounded-full bg-signal/10 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-signal uppercase">
                      {SOURCE_LABELS[s.source] ?? s.source}
                    </span>
                    <span className="font-mono text-[11px] font-medium text-foreground/80">
                      <DecryptText text={s.heading} tickMs={22} />
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <MaskReveal text={s.text.replace(/^## .*\n/, "")} stagger={0.012} />
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
