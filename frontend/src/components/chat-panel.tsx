"use client";

import { useState } from "react";

import { RouterStats } from "@/components/router-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askQuestion, type ChatResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  stats?: ChatResponse;
  error?: boolean;
}

const SUGGESTIONS = [
  "Quel est son niveau sur dbt ?",
  "Pourquoi son profil marketing est un plus ?",
  "Montre-moi son projet le plus technique.",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour, je suis l'agent conversationnel de Nathan. Posez-moi une question sur son parcours, ses compétences ou ses projets.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const result = await askQuestion(question);
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer, stats: result }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Le backend n'est pas joignable pour le moment (normal en local si le proxy LiteLLM ou Redis ne tournent pas).",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("max-w-[85%]", m.role === "user" ? "self-end" : "self-start")}>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card ring-1 ring-foreground/10",
                  m.error && "ring-destructive/40 text-destructive"
                )}
              >
                {m.content}
              </div>
              {m.stats && <RouterStats stats={m.stats} />}
            </div>
          ))}
          {loading && (
            <div className="self-start max-w-[85%] rounded-2xl bg-card ring-1 ring-foreground/10 px-4 py-2 text-sm text-muted-foreground">
              …
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full ring-1 ring-foreground/10 px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t px-4 py-4"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose une question sur Nathan..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Envoyer
        </Button>
      </form>
    </div>
  );
}
