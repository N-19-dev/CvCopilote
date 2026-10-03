"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { ChatResponse, Source, Tier } from "@/lib/api";

export type AgentRunStage = "classify" | "retrieve" | "call_model" | "cache_hit" | "done";

export interface AgentTraceEvent {
  id: number;
  stage: AgentRunStage | "question";
  title: string;
  detail: string;
  tone?: "neutral" | "success" | "warning" | "error";
}

export interface AgentRunState {
  status: "idle" | "running" | "completed";
  question: string | null;
  stage: AgentRunStage | null;
  tier?: Tier;
  sourceCount?: number;
  modelName?: string;
  cached: boolean;
  latencyMs?: number;
  savingsVsSmartPct?: number | null;
  answer?: string;
  sources: Source[];
  events: AgentTraceEvent[];
  error?: string;
}

const IDLE_RUN_STATE: AgentRunState = {
  status: "idle",
  question: null,
  stage: null,
  cached: false,
  sources: [],
  events: [],
};

interface AgentStatusContextValue {
  run: AgentRunState;
  startRun: (question: string) => void;
  updateRun: (
    updater: AgentRunState | ((prev: AgentRunState) => AgentRunState)
  ) => void;
  pushEvent: (event: Omit<AgentTraceEvent, "id">) => void;
  finishRun: (response: ChatResponse) => void;
  failRun: (message: string) => void;
}

const AgentStatusContext = createContext<AgentStatusContextValue | null>(null);

let nextEventId = 1;

function appendEvent(run: AgentRunState, event: Omit<AgentTraceEvent, "id">): AgentRunState {
  return {
    ...run,
    events: [...run.events, { id: nextEventId++, ...event }].slice(-8),
  };
}

export function AgentStatusProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<AgentRunState>(IDLE_RUN_STATE);

  function startRun(question: string) {
    setRun({
      status: "running",
      question,
      stage: "classify",
      cached: false,
      sources: [],
      events: [
        {
          id: nextEventId++,
          stage: "question",
          title: "Ticket entrant",
          detail: question,
          tone: "neutral",
        },
      ],
    });
  }

  function updateRun(
    updater: AgentRunState | ((prev: AgentRunState) => AgentRunState)
  ) {
    setRun((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }

  function pushEvent(event: Omit<AgentTraceEvent, "id">) {
    setRun((prev) => appendEvent(prev, event));
  }

  function finishRun(response: ChatResponse) {
    setRun((prev) =>
      appendEvent(
        {
          ...prev,
          status: "completed",
          stage: "done",
          tier: response.tier,
          modelName: response.model_name,
          sourceCount: response.sources.length,
          cached: response.cached,
          latencyMs: response.latency_ms,
          savingsVsSmartPct: response.savings_vs_smart_pct,
          answer: response.answer,
          sources: response.sources,
          error: undefined,
        },
        {
          stage: "done",
          title: "Réponse livrée",
          detail: response.cached
            ? "Servie depuis le cache."
            : `${response.sources.length} source${response.sources.length > 1 ? "s" : ""} et ${Math.round(response.latency_ms)} ms.`,
          tone: "success",
        }
      )
    );
  }

  function failRun(message: string) {
    setRun((prev) =>
      appendEvent(
        {
          ...prev,
          status: "completed",
          error: message,
        },
        {
          stage: prev.stage ?? "classify",
          title: "Pipeline interrompu",
          detail: message,
          tone: "error",
        }
      )
    );
  }

  return (
    <AgentStatusContext.Provider
      value={{ run, startRun, updateRun, pushEvent, finishRun, failRun }}
    >
      {children}
    </AgentStatusContext.Provider>
  );
}

export function useAgentStatus() {
  const ctx = useContext(AgentStatusContext);
  if (!ctx) throw new Error("useAgentStatus must be used within AgentStatusProvider");
  return ctx;
}
