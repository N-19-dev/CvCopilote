"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarClock, Check, Copy, Mail, X } from "lucide-react";
import { profile } from "@/lib/profile";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

function formatReset(seconds: number) {
  if (seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours} h`;
  return `${Math.max(1, Math.ceil(seconds / 60))} min`;
}

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  questions: string[];
  resetInSeconds: number;
  reason: "visitor" | "global" | null;
}

export function ContactModal({
  open,
  onClose,
  questions,
  resetInSeconds,
  reason,
}: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const reset = formatReset(resetInSeconds);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  async function copyQuestions() {
    const text = [
      "Bonjour Nathan, j’ai échangé avec Mongoose sur votre portfolio. Mes questions :",
      ...questions.map((q) => `– ${q}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="contact-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              type="button"
              className="contact-close"
              onClick={onClose}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            >
              <motion.span className="eyebrow" variants={item}>
                {reason === "global" ? "MONGOOSE SOUFFLE UN PEU" : "ON PASSE EN DIRECT ?"}
              </motion.span>
              <motion.h3 id="contact-title" variants={item}>
                {reason === "global"
                  ? "Beaucoup de curieux aujourd’hui."
                  : "Vous avez fait le tour de mes questions."}
              </motion.h3>
              <motion.p variants={item}>
                {reason === "global"
                  ? "Mongoose a atteint sa limite du jour. Le plus rapide, c’est de m’écrire directement : je réponds moi-même."
                  : "Pour aller plus loin, le mieux est d’en parler avec moi. Je réponds en personne, généralement dans la journée."}
                {reset && (
                  <span className="contact-reset">
                    {" "}
                    Mongoose sera de nouveau disponible dans {reset}.
                  </span>
                )}
              </motion.p>
              <motion.div className="contact-actions" variants={item}>
                <a
                  ref={primaryRef}
                  className="contact-action contact-action-primary"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Écrire à Nathan sur LinkedIn</span>
                  <ArrowUpRight size={17} />
                </a>
                {BOOKING_URL && (
                  <a
                    className="contact-action"
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Réserver 15 min en visio</span>
                    <CalendarClock size={17} />
                  </a>
                )}
                {CONTACT_EMAIL && (
                  <a className="contact-action" href={`mailto:${CONTACT_EMAIL}`}>
                    <span>Envoyer un email</span>
                    <Mail size={17} />
                  </a>
                )}
                {questions.length > 0 && (
                  <button
                    type="button"
                    className="contact-action"
                    onClick={() => void copyQuestions()}
                  >
                    <span>
                      {copied ? "Questions copiées" : "Copier mes questions pour Nathan"}
                    </span>
                    {copied ? <Check size={17} /> : <Copy size={17} />}
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 30 } },
};
