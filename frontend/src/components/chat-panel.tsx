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
  isAgentAvailable,
  type ChatResponse,
} from "@/lib/api";

import { profile } from "@/lib/profile";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  stats?: ChatResponse;
  retry?: string;
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
  useEffect(() => {
    const controller = new AbortController();
    void isAgentAvailable(controller.signal).then((available) => {
      if (!controller.signal.aborted)
        setConnection(available ? "online" : "offline");
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

  async function send(question: string, display = question) {
    if (!question.trim() || pending.current || unavailable) return;
    pending.current = true;
    setMessages((previous) => [
      ...previous,
      { id: nextId.current++, role: "user", content: display },
    ]);
    setInput("");
    setLoading(true);
    startRun(question);
    let completed = false;
    try {
      await askQuestionStream(question, (event) => {
        if (event.stage === "classify") {
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
              stats: event.response,
            },
          ]);
        }
      });
      if (!completed) throw new Error("La réponse a été interrompue.");
    } catch {
      setConnection("offline");
      failRun("Le service n’a pas pu terminer cette réponse.");
      setMessages((previous) => [
        ...previous,
        {
          id: nextId.current++,
          role: "assistant",
          content:
            "La connexion avec Mongoose est indisponible pour le moment. Vous pouvez contacter Nathan pour lui demander de reconnecter son agent.",
          retry: question,
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
      `Analyse l’adéquation de Nathan avec cette fiche de poste. Réponds en français sous ce format : VERDICT (adapté, partiellement adapté ou peu adapté), CE QUI CORRESPOND (2 à 4 éléments concrets), POINTS À CLARIFIER (écarts ou informations manquantes), INTÉRÊT PROBABLE (uniquement si étayé par le parcours). N’invente aucune expérience, compétence ou motivation. Appuie-toi uniquement sur les informations disponibles sur Nathan.\n\nFICHE DE POSTE :\n${description}`,
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
                    onClick={() => send(suggestion)}
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
                {message.retry && (
                  <button
                    className="retry-button"
                    disabled={loading || unavailable}
                    onClick={() => send(message.retry!)}
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
              void send(input);
            }}
          >
            <label className="sr-only" htmlFor="question">
              Votre question sur Nathan
            </label>
            <input
              id="question"
              maxLength={12000}
              placeholder={
                unavailable
                  ? "Mongoose est momentanément hors ligne"
                  : "Et vous, qu’aimeriez-vous savoir ?"
              }
              value={input}
              disabled={loading || unavailable}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              type="submit"
              disabled={loading || unavailable || !input.trim()}
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
            disabled={loading || unavailable || !job.trim()}
            onClick={analyzeJob}
          >
            Comparer avec mon parcours <ArrowRight size={16} />
          </button>
        </div>
      )}
      <p className="chat-disclaimer">
        Une IA peut se tromper. Les sources sont là pour vérifier.
      </p>
    </div>
  );
}
