const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Tier = "fast" | "mid" | "smart";

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
