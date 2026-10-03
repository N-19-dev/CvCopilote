"use client";

import { motion } from "framer-motion";

import type { AgentRunStage, AgentRunState } from "@/lib/agent-status-context";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const STAGE_TO_AGENT: Record<AgentRunStage, string> = {
  classify: "router",
  retrieve: "archivist",
  call_model: "writer",
  cache_hit: "mongoose",
  done: "writer",
};

const NODES = {
  mongoose: { x: 82, y: 82, color: "var(--signal)" },
  router: { x: 276, y: 82, color: "var(--tier-smart)" },
  archivist: { x: 82, y: 244, color: "var(--tint-formation)" },
  writer: { x: 276, y: 244, color: "var(--tier-mid)" },
} as const;

const CIRCUITS = [
  "M 120 82 H 238",
  "M 276 120 V 162 H 82 V 206",
  "M 120 244 H 238",
  "M 314 244 H 344 V 196 H 370",
] as const;

function getActiveNode(run: AgentRunState) {
  return run.stage ? (STAGE_TO_AGENT[run.stage] ?? "mongoose") : "mongoose";
}

function getNodeTone(run: AgentRunState, key: keyof typeof NODES) {
  const active = getActiveNode(run);
  if (run.error && active === key) return "error";
  if (run.status === "completed") return key === "writer" ? "done" : "idle";
  if (run.status === "running" && active === key) return "active";
  return "idle";
}

function getCircuitColor(run: AgentRunState, index: number) {
  if (run.error) return index === 0 ? "var(--destructive)" : "transparent";
  if (run.cached) return index === 0 ? "var(--signal)" : "transparent";
  if (run.stage === "classify") return index === 0 ? "var(--tier-smart)" : "transparent";
  if (run.stage === "retrieve") return index <= 1 ? "var(--tint-formation)" : "transparent";
  if (run.stage === "call_model") return index <= 2 ? "var(--tier-mid)" : "transparent";
  if (run.stage === "done") return "var(--success-text)";
  return "transparent";
}

function Node({
  x,
  y,
  color,
  tone,
}: {
  x: number;
  y: number;
  color: string;
  tone: "idle" | "active" | "done" | "error";
}) {
  const toneColor =
    tone === "error" ? "var(--destructive)" : tone === "done" ? "var(--success-text)" : color;
  const lit = tone !== "idle";

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
      animate={tone === "active" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.9, repeat: tone === "active" ? Infinity : 0, ease: "easeInOut" }}
    >
      <div
        aria-hidden
        className="grid h-12 w-12 grid-cols-3 gap-1 border bg-background/90 p-2"
        style={{
          borderColor: lit ? toneColor : "color-mix(in oklch, var(--foreground) 16%, transparent)",
          boxShadow: lit ? `0 0 20px -6px ${toneColor}` : undefined,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
          <span
            key={cell}
            className={cn("aspect-square", cell === 4 || (cell === 0 && lit) ? "opacity-100" : "opacity-25")}
            style={{ backgroundColor: toneColor }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function WalkingAgent({ color, path, delay = 0 }: { color: string; path: string; delay?: number }) {
  return (
    <g fill={color}>
      <animateMotion dur="1.45s" begin={`${delay}s`} repeatCount="indefinite" path={path} />
      <animate attributeName="opacity" values="0;1;1;0" dur="1.45s" begin={`${delay}s`} repeatCount="indefinite" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -1;0 1;0 -1"
          dur="0.32s"
          repeatCount="indefinite"
        />
        <rect x="-3" y="-9" width="6" height="6" />
        <rect x="-4" y="-2" width="8" height="8" />
        <rect x="-7" y="0" width="3" height="3" />
        <rect x="4" y="0" width="3" height="3" />
        <rect x="-4" y="6" width="3" height="6">
          <animate attributeName="y" values="6;8;6" dur="0.32s" repeatCount="indefinite" />
        </rect>
        <rect x="1" y="6" width="3" height="6">
          <animate attributeName="y" values="8;6;8" dur="0.32s" repeatCount="indefinite" />
        </rect>
      </g>
    </g>
  );
}

export function AgentControlRoom({ run, variant = "inline" }: { run: AgentRunState; variant?: "inline" | "dock" }) {
  const reduced = usePrefersReducedMotion();
  const active = getActiveNode(run);
  const isDock = variant === "dock";
  const activeIndex = active === "mongoose" ? 0 : active === "router" ? 1 : active === "archivist" ? 2 : 3;
  const outputColor = run.error ? "var(--destructive)" : run.status === "completed" ? "var(--success-text)" : "var(--signal)";
  const packetColor = active === "router" ? "var(--tier-smart)" : active === "archivist" ? "var(--tint-formation)" : active === "writer" ? "var(--tier-mid)" : "var(--signal)";

  return (
    <section className={cn("h-full", isDock && "overflow-hidden")} aria-label="Visualisation du pipeline des agents">
      <div className={cn("relative h-full min-h-[440px] overflow-hidden border border-foreground/10 bg-[#080a0b]", isDock && "min-h-0")}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        <div className="absolute left-4 top-4 flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="h-2.5 w-2.5"
              style={{ backgroundColor: index <= activeIndex ? ["var(--signal)", "var(--tier-smart)", "var(--tint-formation)", "var(--tier-mid)"][index] : "rgba(255,255,255,.14)" }}
              animate={run.status === "running" && !reduced && index === activeIndex ? { opacity: [0.35, 1, 0.35] } : { opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          ))}
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 388 360" preserveAspectRatio="none" aria-hidden>
          <path d="M 28 82 H 44" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="2" />
          {CIRCUITS.map((circuit) => (
            <path key={circuit} d={circuit} fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="2" />
          ))}
          <path d="M 314 244 H 344 V 196 H 370" fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="2" />
          {CIRCUITS.map((circuit, index) => {
            const color = getCircuitColor(run, index);
            return <path key={`${circuit}-active`} d={circuit} fill="none" stroke={color} strokeWidth="3" style={{ opacity: color === "transparent" ? 0 : 0.9, filter: `drop-shadow(0 0 5px ${color})` }} />;
          })}
          {!reduced && run.status === "running" && !run.error && <WalkingAgent color={packetColor} path={CIRCUITS[Math.min(activeIndex, 3)]} />}
          {run.cached && !reduced && <WalkingAgent color="var(--signal)" path="M 120 82 H 344 V 196 H 370" delay={0.25} />}
        </svg>

        <div className="absolute left-4 top-[62px] h-10 w-10 border border-foreground/15 bg-background/90 p-2" aria-hidden>
          <span className="block h-full w-full border border-signal/60" />
        </div>

        {(Object.entries(NODES) as Array<[keyof typeof NODES, (typeof NODES)[keyof typeof NODES]]>).map(([key, node]) => (
          <Node key={key} {...node} tone={getNodeTone(run, key)} />
        ))}

        <motion.div
          className="absolute right-3 top-[174px] h-12 w-12 border bg-background/90 p-2"
          style={{ borderColor: outputColor }}
          animate={run.status === "completed" && !reduced ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, repeat: run.status === "completed" ? Infinity : 0 }}
          aria-hidden
        >
          <span className="block h-full w-full" style={{ backgroundColor: outputColor, opacity: run.status === "idle" ? 0.2 : 0.9 }} />
        </motion.div>

        <div className="absolute bottom-4 left-4 right-4 flex gap-1.5" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className="h-1.5 flex-1" style={{ backgroundColor: index <= activeIndex * 3 ? packetColor : "rgba(255,255,255,.1)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
