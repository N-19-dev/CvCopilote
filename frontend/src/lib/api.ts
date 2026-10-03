const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

export async function isAgentAvailable(signal?: AbortSignal): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(4000)])
        : AbortSignal.timeout(4000),
    });
    return response.ok && (await response.json()).status === "ok";
  } catch {
    return false;
  }
}

export type Tier = "fast" | "mid" | "smart";

export interface Source {
  source: string;
  heading: string;
  text: string;
}

export interface ChatResponse {
  answer: string;
  tier: Tier;
  model_name: string;
  latency_ms: number;
  cost_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached: boolean;
  savings_vs_smart_pct: number | null;
  sources: Source[];
}

export async function askQuestion(question: string): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Le backend a répondu ${response.status}`);
  }

  return response.json();
}

export type ChatStreamEvent =
  | { stage: "cache_hit" }
  | { stage: "classify"; tier: Tier }
  | { stage: "retrieve"; sources: Source[] }
  | { stage: "call_model"; tier: Tier; model_name: string }
  | { stage: "done"; response: ChatResponse };

// Le backend renvoie du SSE (`data: {...}\n\n`) plutôt que du JSON simple pour
// que le frontend puisse animer chaque étape réelle du pipeline au fur et à
// mesure — pas une choré simulée qui se contenterait d'attendre le fetch.
export async function askQuestionStream(
  question: string,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const response = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Le backend a répondu ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      onEvent(JSON.parse(line.slice("data: ".length)) as ChatStreamEvent);
    }
  }
}
