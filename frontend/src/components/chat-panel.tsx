"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useAgentStatus } from "@/lib/agent-status-context";
import {
  askQuestionStream,
  getQuota,
  isAgentAvailable,
  QuotaExceededError,
  type ChatInput,
  type ChatResponse,
  type Quota,
} from "@/lib/api";
import { ContactModal } from "@/components/contact-modal";

import { profile } from "@/lib/profile";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  stats?: ChatResponse;
  retry?: { input: ChatInput; display: string };
  notice?: string;
  limit?: boolean;
}
const suggestions = [
  "Présente-moi Nathan en 30 secondes",
  "Quel est son projet le plus technique ?",
  "Que sait-il faire avec l’IA ?",
];
const tierLabels = { fast: "Rapide", mid: "Standard", smart: "Approfondi" };

export function ChatPanel() {
  const [connection, setConnection] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const unavailable = connection !== "online";
  const [quota, setQuota] = useState<Quota | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const limitReached = quota !== null && quota.remaining <= 0;
  useEffect(() => {
    const controller = new AbortController();
    void isAgentAvailable(controller.signal).then((available) => {
      if (!controller.signal.aborted)
        setConnection(available ? "online" : "offline");
    });
    void getQuota(controller.signal).then((value) => {
      if (!controller.signal.aborted && value) setQuota(value);
    });
    return () => controller.abort();
  }, []);


  async function reconnect() {
    setConnection("checking");
    setConnection((await isAgentAvailable()) ? "online" : "offline");
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [job, setJob] = useState("");
  const [mode, setMode] = useState<"chat" | "job">("chat");
  const [loading, setLoading] = useState(false);
  const { run, startRun, updateRun, pushEvent, finishRun, failRun } =
    useAgentStatus();
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const pending = useRef(false);
  useEffect(() => {
    if (messages.length === 0 && !loading) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loading, mode]);

  async function send(input: ChatInput, display = input.question ?? "") {
    const question = input.question ?? "";
    if (!question.trim() && !input.job_description?.trim()) return;
    if (pending.current || unavailable) return;
    if (limitReached) {
      setContactOpen(true);
      return;
    }
    pending.current = true;
    setMessages((previous) => [
      ...previous,
      { id: nextId.current++, role: "user", content: display },
    ]);
    setInput("");
    setLoading(true);
    startRun(display);
    let completed = false;
    let notice: string | undefined;
    try {
      await askQuestionStream(input, (event) => {
        if (event.stage === "quota") {
          setQuota(event);
        } else if (event.stage === "guard") {
          if (event.reason === "pii")
            notice =
              "Par sécurité, les données personnelles de votre message (email, téléphone…) ont été masquées avant l’envoi.";
        } else if (event.stage === "classify") {
          updateRun((previous) => ({
            ...previous,
            stage: "classify",
            tier: event.tier,
          }));
          pushEvent({
            stage: "classify",
            title: "Choix du modèle",
            detail: `Niveau ${tierLabels[event.tier].toLowerCase()} sélectionné.`,
          });
        } else if (event.stage === "retrieve") {
          updateRun((previous) => ({
            ...previous,
            stage: "retrieve",
            sources: event.sources,
            sourceCount: event.sources.length,
          }));
          pushEvent({
            stage: "retrieve",
            title: "Recherche",
            detail: `${event.sources.length} passages retrouvés dans le parcours.`,
          });
        } else if (event.stage === "call_model") {
          updateRun((previous) => ({
            ...previous,
            stage: "call_model",
            tier: event.tier,
            modelName: event.model_name,
          }));
          pushEvent({
            stage: "call_model",
            title: "Rédaction",
            detail: `Modèle utilisé : ${event.model_name}.`,
          });
        } else if (event.stage === "cache_hit") {
          updateRun((previous) => ({
            ...previous,
            stage: "cache_hit",
            cached: true,
          }));
          pushEvent({
            stage: "cache_hit",
            title: "Cache",
            detail: "Une réponse existante a été retrouvée.",
          });
        } else if (event.stage === "done") {
          completed = true;
          finishRun(event.response);
          setMessages((previous) => [
            ...previous,
            {
              id: nextId.current++,
              role: "assistant",
              content: event.response.answer,
              stats:
                event.response.model_name === "garde-fou"
                  ? undefined
                  : event.response,
              notice,
            },
          ]);
        }
      });
      if (!completed) throw new Error("La réponse a été interrompue.");
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuota(error.quota);
        failRun("Limite de questions atteinte.");
        setMessages((previous) => [
          ...previous,
          {
            id: nextId.current++,
            role: "assistant",
            content:
              "Vous avez atteint la limite de questions pour aujourd’hui. La suite se passe directement avec Nathan.",
            limit: true,
          },
        ]);
        setContactOpen(true);
        return;
      }
      setConnection("offline");
      failRun("Le service n’a pas pu terminer cette réponse.");
      setMessages((previous) => [
        ...previous,
        {
          id: nextId.current++,
          role: "assistant",
          content:
            "La connexion avec Mongoose est indisponible pour le moment. Vous pouvez contacter Nathan pour lui demander de reconnecter son agent.",
          retry: { input, display },
        },
      ]);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  function analyzeJob() {
    if (!job.trim()) return;
    const description = job.trim();
    setMode("chat");
    void send(
      { job_description: description },
      `Est-ce que mon offre correspond à son profil ?\n\n${description}`,
    );
  }

  return (
    <div className="chat-card">
      <div className="chat-header">
        <div className="agent-avatar">
          <Sparkles size={23} />
        </div>
        <div>
          <h3>
            Mongoose<span>LE COPILOTE DE NATHAN</span>
          </h3>
          <p>Mon parcours, à votre façon.</p>
        </div>
        <span className="chat-status">
          {loading
            ? "En cours…"
            : connection === "checking"
              ? "Connexion…"
              : connection === "offline"
                ? "Hors ligne"
                : limitReached
                  ? "Limite atteinte"
                  : quota && quota.remaining <= 3
                    ? `${quota.remaining} question${quota.remaining > 1 ? "s" : ""} restante${quota.remaining > 1 ? "s" : ""}`
                    : "À vous de jouer"}
        </span>
      </div>
      {unavailable && (
        <div className="chat-offline" role="status">
          {connection === "checking" ? (
            <p>Je vérifie si Mongoose est réveillé…</p>
          ) : (
            <>
              <strong>Mongoose fait une petite pause.</strong>
              <p>
                Le serveur est déconnecté pour le moment. Envie de tester mon
                agent ? Envoyez-moi un message pour que je le reconnecte. Ce
                sera aussi l’occasion de faire connaissance.
              </p>
              <div className="chat-offline-actions">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Écrire à Nathan sur LinkedIn <ArrowUpRight size={16} />
                </a>
                <button type="button" onClick={() => void reconnect()}>
                  <RefreshCw size={14} /> Vérifier la connexion
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <div
        className="chat-tabs"
        role="group"
        aria-label="Choisir une expérience"
      >
        <button aria-pressed={mode === "chat"} onClick={() => setMode("chat")}>
          <MessageCircle size={15} />
          Discuter
        </button>
        <button aria-pressed={mode === "job"} onClick={() => setMode("job")}>
          <BriefcaseBusiness size={15} />
          Comparer une offre
        </button>
      </div>
      {mode === "chat" ? (
        <>
          <div
            className="chat-messages"
            ref={scrollRef}
            role="log"
            aria-label="Conversation avec Mongoose"
            aria-live="polite"
          >
            <div className="chat-welcome">
              <span className="eyebrow">BONJOUR, MOI C’EST MONGOOSE ↗</span>
              <p>
                Nathan construit des choses avec la data et l’IA.
                <br />
                <strong>Moi, je vous aide à découvrir lesquelles.</strong>
              </p>
              <p>
                Son parcours, ses projets, ses compétences…
                <br />
                Qu’est-ce qui vous intéresse ?
              </p>
            </div>
            {messages.length === 0 && (
              <div className="chat-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    disabled={loading || unavailable}
                    key={suggestion}
                    onClick={() => send({ question: suggestion })}
                  >
                    {suggestion}
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <div
                className={`chat-message message-${message.role} ${message.retry ? "message-error" : ""}`}
                key={message.id}
              >
                <span className="message-author">
                  {message.role === "user" ? "VOUS" : "MONGOOSE"}
                </span>
                <p>{message.content}</p>
                {message.notice && (
                  <p className="message-notice">{message.notice}</p>
                )}
                {message.limit && (
                  <button
                    type="button"
                    className="retry-button"
                    onClick={() => setContactOpen(true)}
                  >
                    Parler avec Nathan <ArrowUpRight size={14} />
                  </button>
                )}
                {message.retry && (
                  <button
                    className="retry-button"
                    disabled={loading || unavailable}
                    onClick={() =>
                      send(message.retry!.input, message.retry!.display)
                    }
                  >
                    <RefreshCw size={14} />
                    Réessayer
                  </button>
                )}
                {message.stats && (
                  <div className="response-evidence">
                    <div className="response-metrics">
                      <span>
                        {tierLabels[message.stats.tier]} ·{" "}
                        {message.stats.model_name}
                      </span>
                      <span>{Math.round(message.stats.latency_ms)} ms</span>
                      <span>
                        {message.stats.cached
                          ? "Réponse en cache"
                          : `${message.stats.cost_usd.toFixed(6)} $`}
                      </span>
                      {!message.stats.cached &&
                        message.stats.savings_vs_smart_pct !== null &&
                        message.stats.savings_vs_smart_pct > 1 && (
                          <span>
                            {Math.round(message.stats.savings_vs_smart_pct)} %
                            d’économie estimée vs modèle premium
                          </span>
                        )}
                    </div>
                    {message.stats.sources.length > 0 && (
                      <details>
                        <summary>
                          Consulter{" "}
                          {message.stats.sources.length === 1
                            ? "la source"
                            : `les ${message.stats.sources.length} sources`}
                        </summary>
                        {message.stats.sources.map((source, index) => (
                          <blockquote key={`${source.source}-${index}`}>
                            <strong>{source.heading}</strong>
                            <p>{source.text}</p>
                          </blockquote>
                        ))}
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="loading-message" role="status">
                <span className="loading-dots">● ● ●</span>
                {run.stage === "retrieve"
                  ? "Je recherche dans son parcours…"
                  : run.stage === "call_model"
                    ? "Je prépare ma réponse…"
                    : "Je m’occupe de votre question…"}
              </div>
            )}
          </div>
          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void send({ question: input });
            }}
          >
            <label className="sr-only" htmlFor="question">
              Votre question sur Nathan
            </label>
            <input
              id="question"
              maxLength={2000}
              placeholder={
                unavailable
                  ? "Mongoose est momentanément hors ligne"
                  : limitReached
                    ? "Limite atteinte : continuons en direct"
                    : "Et vous, qu’aimeriez-vous savoir ?"
              }
              value={input}
              disabled={loading || unavailable || limitReached}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              type="submit"
              disabled={loading || unavailable || limitReached || !input.trim()}
              aria-label="Envoyer la question"
            >
              <Send size={18} />
            </button>
          </form>
        </>
      ) : (
        <div className="job-panel">
          <p className="eyebrow">ET SI ON TRAVAILLAIT ENSEMBLE ?</p>
          <h4>Un poste en tête ?</h4>
          <p>
            Le copilote compare votre offre à mon parcours : les points qui
            correspondent, les écarts et ce qui reste à clarifier.
          </p>
          <label htmlFor="job-description">Votre fiche de poste</label>
          <textarea
            id="job-description"
            value={job}
            onChange={(event) => setJob(event.target.value)}
            maxLength={10000}
            placeholder="Collez la description du poste ici…"
            disabled={loading || unavailable}
          />
          <button
            className="button button-orange"
            disabled={loading || unavailable || limitReached || !job.trim()}
            onClick={analyzeJob}
          >
            Comparer avec mon parcours <ArrowRight size={16} />
          </button>
        </div>
      )}
      <p className="chat-disclaimer">
        Une IA peut se tromper. Les sources sont là pour vérifier.
      </p>
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        questions={messages
          .filter((message) => message.role === "user")
          .map((message) => message.content.split("\n")[0])}
        resetInSeconds={quota?.reset_in_seconds ?? 0}
        reason={quota?.reason ?? "visitor"}
      />
    </div>
  );
}
