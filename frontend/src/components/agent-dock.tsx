"use client";

import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AgentControlRoom } from "@/components/agent-control-room";
import { useAgentStatus } from "@/lib/agent-status-context";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AgentDock() {
  const { run } = useAgentStatus();
  const [open, setOpen] = useState(false);
  const previousStatusRef = useRef(run.status);

  useEffect(() => {
    const next = run.status;
    if (previousStatusRef.current !== "running" && next === "running") {
      setOpen(true);
    }
    previousStatusRef.current = next;
  }, [run.status]);

  const indicatorColor = run.error
    ? "var(--destructive)"
    : run.status === "running"
      ? "var(--signal)"
      : run.status === "completed"
        ? "var(--success-text)"
        : "color-mix(in oklch, var(--foreground) 22%, transparent)";

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : -368,
        }}
        transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
        className="pointer-events-none fixed top-20 left-4 bottom-4 z-40 hidden w-[424px] md:block"
      >
        <div className="pointer-events-auto relative h-full">
          <div className="absolute inset-0 border border-foreground/10 bg-background/88 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.82)] backdrop-blur-md" />

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              "absolute top-6 -right-12 flex h-32 w-12 flex-col items-center justify-center gap-3 border border-l-0 border-foreground/10 bg-background/95 text-muted-foreground shadow-[0_18px_44px_-26px_rgba(0,0,0,0.7)] backdrop-blur-md transition-colors",
              "hover:text-foreground"
            )}
            aria-label={open ? "Fermer la control room" : "Ouvrir la control room"}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: indicatorColor, boxShadow: `0 0 16px ${indicatorColor}` }}
            />
            <span className="font-mono text-[10px] tracking-[0.24em] [writing-mode:vertical-rl] uppercase">
              Pipeline
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.span>
          </button>

          <div className="relative flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-end border-b border-foreground/10 px-3 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Fermer la control room"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-3">
              <AgentControlRoom run={run} variant="dock" />
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="pointer-events-none fixed inset-x-3 bottom-4 z-40 md:hidden">
        <div className="pointer-events-auto rounded-2xl border border-foreground/10 bg-background/88 px-4 py-3 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: indicatorColor, boxShadow: `0 0 16px ${indicatorColor}` }}
              />
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Control Room
                </p>
                <p className="text-sm text-muted-foreground">
                  {run.status === "idle" ? "Masquée jusqu'à la prochaine question." : "Touchez pour suivre le pipeline."}
                </p>
              </div>
            </div>
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </button>
        </div>
      </div>
    </>
  );
}
