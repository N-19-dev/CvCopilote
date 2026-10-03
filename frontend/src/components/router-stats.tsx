"use client";

import { motion } from "framer-motion";

import { CountUp } from "@/components/count-up";
import { SourceReveal } from "@/components/source-reveal";
import type { ChatResponse, Tier } from "@/lib/api";
import { EASE_OUT_EXPO } from "@/lib/motion";

const TIER_LABELS: Record<Tier, string> = {
  fast: "Rapide",
  mid: "Standard",
  smart: "Approfondi",
};

const TIER_VAR: Record<Tier, string> = {
  fast: "var(--tier-fast)",
  mid: "var(--tier-mid)",
  smart: "var(--tier-smart)",
};

export function RouterStats({ stats }: { stats: ChatResponse }) {
  const showSavings =
    !stats.cached && stats.savings_vs_smart_pct !== null && stats.savings_vs_smart_pct > 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.1 }}
      className="mt-2"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
        <motion.span
          initial={{ opacity: 0, scale: 0.6, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5"
          style={{
            borderColor: `color-mix(in oklch, ${TIER_VAR[stats.tier]} 45%, transparent)`,
            backgroundColor: `color-mix(in oklch, ${TIER_VAR[stats.tier]} 12%, transparent)`,
          }}
        >
          <span className="relative inline-flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: TIER_VAR[stats.tier] }}
              initial={{ scale: 2.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: TIER_VAR[stats.tier] }}
              aria-hidden
            />
          </span>
          {TIER_LABELS[stats.tier]} · {stats.model_name}
        </motion.span>
        <span>
          <CountUp value={Math.round(stats.latency_ms)} /> ms
        </span>
        {stats.cached && <span>depuis le cache</span>}
        {showSavings && (
          <span style={{ color: "var(--success-text)" }}>
            -<CountUp value={Math.round(stats.savings_vs_smart_pct as number)} />% vs modèle premium
          </span>
        )}
      </div>
      <SourceReveal sources={stats.sources} />
    </motion.div>
  );
}
