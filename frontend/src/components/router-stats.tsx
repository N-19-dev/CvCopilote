import type { ChatResponse, Tier } from "@/lib/api";

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
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: TIER_VAR[stats.tier] }}
          aria-hidden
        />
        {TIER_LABELS[stats.tier]} · {stats.model_name}
      </span>
      <span>{Math.round(stats.latency_ms)} ms</span>
      {stats.cached && <span>depuis le cache</span>}
      {showSavings && (
        <span style={{ color: "var(--success-text)" }}>
          -{Math.round(stats.savings_vs_smart_pct as number)}% vs modèle premium
        </span>
      )}
    </div>
  );
}
