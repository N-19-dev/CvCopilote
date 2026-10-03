"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Braces,
  Check,
  Database,
  Code2,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import {
  StoryChapter,
  StoryBridge,
  StoryMoment,
} from "@/components/story-journey";
import { ProjectPrint } from "@/components/project-print";
import { ContinuousStory } from "@/components/continuous-story";
import { ChatPanel } from "@/components/chat-panel";
import {
  AgentStatusProvider,
  useAgentStatus,
} from "@/lib/agent-status-context";
import {
  education,
  experiences,
  profile,
  projects,
  skillDomains,
} from "@/lib/profile";

const projectLinks: Record<string, { label: string; href: string }[]> = {
  kale: [{ label: "Visiter Kalé", href: "https://joinkale.app" }],
  datapeek: [{ label: "Visiter Data Peek", href: "https://data-peek.com" }],
};

const work = [
  {
    id: "kale",
    kind: "Applications",
    title: "Kalé, pour se retrouver entre amis.",
    category: "PROJET PERSONNEL · APPLICATION IOS",
    description:
      "Trouver un moment où tout le monde est libre, sans partager le détail de son agenda. Une application que je développe autour d’un besoin du quotidien.",
    tech: ["SwiftUI", "Supabase", "EventKit", "PostgreSQL"],
    detail:
      "L’application calcule les créneaux communs à partir des disponibilités, importe les calendriers de l’iPhone et permet d’organiser des sorties en groupe. Le partage distingue les plages occupées des informations privées des événements. Projet en développement.",
    visual: "kale",
  },
  {
    id: "orchestra",
    kind: "IA & agents",
    title: "Orchestra, faire travailler les agents ensemble.",
    category: "PROJET PERSONNEL · EN DÉVELOPPEMENT",
    description:
      "Un moteur d’orchestration pour organiser les tâches des agents IA, suivre leur exécution et transmettre le contexte quand un autre agent prend le relais.",
    tech: ["TypeScript", "Agents IA", "SQLite", "Claude Code", "Codex"],
    detail:
      "Le projet comporte des moteurs de planification, d’exécution, de contexte et de passage de relais, ainsi que des adaptateurs Claude Code et Codex CLI. Je travaille aussi sur la persistance et la validation des échanges. Il s’agit d’un projet en développement, distinct du copilote de ce portfolio.",
    visual: "orchestra",
  },
  {
    id: "datapeek",
    kind: "Applications",
    title: "Data Peek, ma veille tech au quotidien.",
    category: "PROJET PERSONNEL · EN LIGNE",
    description:
      "J’ai créé le site de veille que j’avais envie d’utiliser : des lectures sélectionnées autour de la data et de l’IA, un quiz et une progression pour en faire une habitude.",
    tech: ["Python", "LLM", "React", "TypeScript"],
    detail:
      "De la collecte RSS à la classification et à la synthèse par IA, j’ai construit le pipeline et l’interface de lecture. Le site propose des lectures quotidiennes, des quiz et un suivi de progression. Il est en production ; le développement est momentanément en pause et des bugs restent à corriger.",
    visual: "datapeek",
  },
  {
    id: "copilote",
    kind: "IA & agents",
    title: "Mon portfolio, avec un copilote.",
    category: "PROJET PERSONNEL · EN COURS",
    description:
      "Un copilote qui explore mon parcours, répond à vos questions et choisit le modèle adapté. Vous êtes déjà dans le projet.",
    tech: ["RAG", "LiteLLM", "FastAPI", "Next.js"],
    detail:
      "Une recherche dans ma base de connaissances alimente les réponses. Un routeur classe la question, choisit un modèle et expose ses sources, sa latence et les économies estimées. Redis permet de réutiliser les réponses mises en cache.",
    visual: "agent",
  },
  {
    id: "graphrag",
    kind: "IA & agents",
    title: "Explorer les documents avec GraphRAG.",
    category: "IPPON · PROJET INTERNE · 2026",
    description:
      "Dans le cadre d’un projet interne chez Ippon, j’ai travaillé sur un POC pour extraire les informations de documents et les explorer avec un graphe de connaissances.",
    tech: ["Python", "Neo4j", "Mistral", "GraphRAG"],
    detail: experiences[0].description,
    visual: "graph",
  },
  {
    id: "rugby",
    kind: "Computer vision",
    title: "Analyser un match de rugby en vidéo.",
    category: "PROJET D’ÉTUDES · 2024 — 2025",
    description:
      "Pendant mes études, j’ai travaillé sur la détection des joueurs et du ballon pour aider les coachs à analyser le jeu.",
    tech: ["Python", "Computer Vision", "Machine Learning"],
    detail: projects[0].description,
    visual: "pitch",
  },
];
const filters = [
  "Tout explorer",
  "IA & agents",
  "Applications",
  "Computer vision",
];

function Mark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`brand-mark ${className}`}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function CompanyLogo({
  src,
  name,
  className = "",
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      src={src}
      alt={name}
      width={140}
      height={60}
      className={`company-logo ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

function ProjectVisual({ type }: { type: string }) {
  if (type === "kale" || type === "orchestra" || type === "datapeek")
    return (
      <div className="project-visual project-visual-shared">
        <ProjectPrint kind={type} />
      </div>
    );
  if (type === "agent")
    return (
      <div className="project-visual visual-agent" aria-hidden="true">
        <span className="visual-label">MONGOOSE / MON COPILOTE</span>
        <div className="mini-chat">
          <Mark />
          <span>Qu’est-ce que Nathan sait faire ?</span>
        </div>
        <div className="mini-answer">
          <span className="tiny-dot" />
          Chercher. Connecter. Répondre.
          <div className="answer-lines">
            <i />
            <i />
          </div>
          <span className="source-tag">
            ↳ Une réponse ancrée dans mon parcours
          </span>
        </div>
        <span className="visual-foot">
          Un vrai projet. À essayer juste en dessous. <ArrowDown size={15} />
        </span>
      </div>
    );
  if (type === "graph")
    return (
      <div className="project-visual visual-graph" aria-hidden="true">
        <span className="visual-label">DES DOCUMENTS AUX CONNAISSANCES</span>
        <svg viewBox="0 0 400 230">
          <g fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".4">
            <path d="M200 115 85 56 66 161 200 115 311 47 334 166 200 115 175 207M85 56 311 47M66 161 175 207 334 166" />
          </g>
          {[
            [85, 56],
            [66, 161],
            [311, 47],
            [334, 166],
            [175, 207],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i % 2 ? 12 : 8} fill="currentColor" />
              <circle
                cx={x}
                cy={y}
                r={i % 2 ? 21 : 16}
                fill="none"
                stroke="currentColor"
                opacity=".25"
              />
            </g>
          ))}
          <circle
            cx="200"
            cy="115"
            r="39"
            fill="#d8edb6"
            stroke="currentColor"
          />
          <text
            x="200"
            y="120"
            textAnchor="middle"
            fill="currentColor"
            fontSize="14"
          >
            knowledge
          </text>
        </svg>
        <span className="graph-tag">documents → relations → réponses</span>
      </div>
    );
  return (
    <div className="project-visual visual-pitch" aria-hidden="true">
      <span className="visual-label">COMPUTER VISION / RUGBY</span>
      <div className="rugby-field">
        <span className="field-line line-a" />
        <span className="field-line line-b" />
        <span className="field-line line-c" />
        {[
          [18, 25],
          [28, 68],
          [42, 42],
          [57, 74],
          [69, 29],
          [80, 60],
        ].map(([x, y], i) => (
          <span
            key={i}
            className={`player player-${i}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <i />
            <small>joueur {String(i + 1).padStart(2, "0")}</small>
          </span>
        ))}
        <span className="ball" />
      </div>
      <span className="visual-foot">
        Schéma illustratif · suivi des joueurs et du ballon
      </span>
    </div>
  );
}

function LivePipeline() {
  const { run } = useAgentStatus();
  const stages = [
    {
      key: "classify",
      icon: Workflow,
      title: "Le bon modèle",
      text: "La question est évaluée pour choisir le modèle adapté.",
    },
    {
      key: "retrieve",
      icon: Database,
      title: "Les bonnes sources",
      text: "Les passages utiles sont retrouvés dans mon parcours.",
    },
    {
      key: "call_model",
      icon: MessageCircle,
      title: "Une réponse étayée",
      text: "Le modèle répond à partir des informations retrouvées.",
    },
  ];
  return (
    <div className="pipeline">
      <div className="pipeline-heading">
        <span
          className={`tiny-dot ${run.status === "running" ? "is-running" : ""}`}
        />
        <span aria-live="polite">
          {run.error
            ? "Essai interrompu"
            : run.status === "idle"
              ? "Les coulisses du copilote"
              : run.status === "running"
                ? "Le copilote travaille…"
                : "Réponse terminée"}
        </span>
      </div>
      {stages.map(({ key, icon: Icon, title, text }, i) => (
        <div
          className={`pipeline-step ${run.stage === key && !run.error ? "current" : ""}`}
          key={key}
        >
          <span className="pipeline-icon">
            <Icon size={19} />
          </span>
          <div>
            <small>0{i + 1}</small>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
          {run.stage === "done" &&
            run.events.some((event) => event.stage === key) && (
              <Check size={16} />
            )}
        </div>
      ))}
      <div className="pipeline-note">
        <Braces size={17} />
        <p>
          Sources, modèle, temps de réponse et économies estimées sont affichés
          à chaque réponse.
        </p>
      </div>
      <details className="trace-details">
        <summary>
          Comprendre la mécanique <Plus size={15} />
        </summary>
        <p>
          Recherche dans ma base de connaissances, routage multi-modèles et
          cache : ce parcours s’actualise pendant chaque réponse.
        </p>
        {run.events.length > 0 && (
          <ol>
            {run.events.map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong> — {event.detail}
              </li>
            ))}
          </ol>
        )}
      </details>
    </div>
  );
}

function FloatingCopilot() {
  const [labVisible, setLabVisible] = useState(false);
  const [storyVisible, setStoryVisible] = useState(true);
  useEffect(() => {
    const lab = document.getElementById("labo");
    if (!lab) return;
    const observer = new IntersectionObserver(([entry]) =>
      setLabVisible(entry.isIntersecting),
    );
    observer.observe(lab);
    const story = document.getElementById("bonjour");
    const storyObserver = new IntersectionObserver(([entry]) =>
      setStoryVisible(entry.isIntersecting),
    );
    if (story) storyObserver.observe(story);
    return () => {
      observer.disconnect();
      storyObserver.disconnect();
    };
  }, []);
  return (
    <a
      className="floating-chat"
      href="#labo"
      hidden={labVisible || storyVisible}
      aria-label="Essayer Mongoose, mon copilote IA"
    >
      <AudioLines size={19} />
      <span>Une question sur moi ?</span>
      <ArrowUpRight size={15} />
    </a>
  );
}

export function Portfolio() {
  const [filter, setFilter] = useState("Tout explorer");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <AgentStatusProvider>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="wordmark" aria-label="Nathan Sornet, accueil">
            <span className="personal-monogram" aria-hidden="true">
              ns.
            </span>
            <span>
              nathan sornet<span className="orange">.</span>
            </span>
          </a>
          <nav
            aria-label="Navigation principale"
            className={menuOpen ? "nav-open" : ""}
          >
            {[
              ["#projets", "Les projets"],
              ["#parcours", "Le parcours"],
              ["#labo", "Le labo IA"],
            ].map(([href, label]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>
                {label}
                {href === "#labo" && <span className="nav-dot" />}
              </a>
            ))}
          </nav>
          <a
            className="header-contact"
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            On discute ? <ArrowUpRight size={16} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="contenu">
        <ContinuousStory />
        <div className="experience-band wrap">
          <span>QUELQUES ÉTAPES DE MON PARCOURS</span>
          <div className="career-logos">
            <CompanyLogo src="/logos/ippon.png" name="Ippon Technologies" />
            <CompanyLogo
              src="/logos/ffr.png"
              name="Fédération française de rugby"
              className="logo-ffr"
            />
            <CompanyLogo
              src="/logos/report-linker.jpeg"
              name="ReportLinker"
              className="logo-report"
            />
          </div>
        </div>
        <StoryBridge>
          Avant les pipelines et les modèles,
          <br />
          il y avait surtout l’envie de <em>créer quelque chose.</em>
        </StoryBridge>
        <StoryChapter id="parcours" className="section wrap journey-section">
          <div className="journey-intro">
            <p className="eyebrow">01 / 2020 → AUJOURD’HUI</p>
            <h2>
              Tout a commencé
              <br />
              par <span className="serif-word">une idée.</span>
            </h2>
            <p>
              J’ai commencé par créer Firstcop, une marketplace. Entre le SEO,
              les campagnes et l’analyse des résultats, j’ai découvert ce que ça
              voulait dire de faire vivre un produit.
            </p>
            <p>
              La suite m’a emmené vers un diplôme d’ingénieur à l’ESME et un
              master en marketing digital à l’ISG, puis chez ReportLinker et
              Ippon. Aujourd’hui, je garde ces deux regards : comment ça
              fonctionne, et à quoi ça sert.
            </p>
            <div className="personal-note">
              <span aria-hidden="true">↳</span> Comprendre le pourquoi.
              <br />
              Puis construire le comment.
            </div>
            <a
              className="text-button"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              Le parcours sur LinkedIn <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="timeline">
            {[...experiences].reverse().map((experience) => (
              <StoryMoment key={experience.company + experience.period}>
                <details className="experience" open>
                  <summary>
                    <span className="timeline-dot" />
                    <span>
                      <span className="story-year">
                        {experience.period.match(/\d{4}/)?.[0]}
                      </span>
                      <small>{experience.period}</small>
                      <h3>{experience.company}</h3>
                      <span className="experience-logos" aria-hidden="true">
                        {experience.logos.map((src) => (
                          <CompanyLogo key={src} src={src} name="" />
                        ))}
                      </span>
                      <span className="experience-role">{experience.role}</span>
                    </span>
                    <Plus size={19} />
                  </summary>
                  <div className="experience-content">
                    <p>{experience.description}</p>
                    <div className="tags">
                      {experience.tech.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </details>
              </StoryMoment>
            ))}
          </div>
        </StoryChapter>
        <StoryBridge>
          Au fil des rencontres, les idées
          <br />
          sont devenues des <em>projets concrets.</em>
        </StoryBridge>
        <section id="projets" className="section wrap cinematic-projects">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / LES IDÉES PRENNENT FORME</p>
              <h2>
                Quelques projets
                <br />
                dont je peux <span className="serif-word">vous parler.</span>
              </h2>
            </div>
            <p>
              Des projets d’études, des missions, des essais perso.
              <br className="desktop-break" /> À chaque fois, quelque chose à
              apprendre.
            </p>
          </div>
          <div className="project-toolbar">
            <div
              className="filter-list"
              role="group"
              aria-label="Filtrer les projets"
            >
              {filters.map((item) => (
                <button
                  key={item}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                  {item === "Tout explorer" && (
                    <span>{String(work.length).padStart(2, "0")}</span>
                  )}
                </button>
              ))}
            </div>
            <span className="micro-label">UNE SÉLECTION DE MON TRAVAIL ↙</span>
          </div>
          <div className="projects-grid">
            {work
              .filter(
                (project) =>
                  filter === "Tout explorer" || project.kind === filter,
              )
              .map((project) => (
                <article className="project-card" key={project.id}>
                  <ProjectVisual type={project.visual} />
                  <div className="project-body">
                    <p className="eyebrow">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tags">
                      {project.tech.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                    {projectLinks[project.id] && (
                      <div className="project-links">
                        {projectLinks[project.id].map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${link.label} — ${project.title}`}
                          >
                            {link.label}{" "}
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    )}
                    <details className="project-details">
                      <summary>
                        Dans les détails <Plus size={18} />
                      </summary>
                      <p>{project.detail}</p>
                      {project.id === "copilote" && (
                        <a href="#labo">
                          Essayer Mongoose <ArrowRight size={15} />
                        </a>
                      )}
                    </details>
                  </div>
                </article>
              ))}
          </div>
          <div className="personal-experiments">
            <div>
              <p className="eyebrow">EN DEHORS DES GRANDS PROJETS</p>
              <h3>Mon petit terrain de jeu.</h3>
              <p>
                J’aime fabriquer des outils pour moi, essayer une idée et voir
                où elle m’emmène. Tout n’a pas vocation à devenir un produit.
              </p>
            </div>
            <div className="experiment-list">
              <article>
                <span>01 / MAPASK</span>
                <h4>Une envie, des adresses autour de moi.</h4>
                <p>
                  Un prototype de recherche locale qui interprète un besoin et
                  explore les commerces à proximité. Je teste encore la
                  direction.
                </p>
              </article>
              <article>
                <span>02 / PODCAST BRIEF</span>
                <h4>Préparer un sujet sans partir d’une page blanche.</h4>
                <p>
                  Un outil personnel qui rassemble l’actualité data et IA, puis
                  prépare des briefs de podcast avec Claude ou Mistral.
                </p>
              </article>
              <article>
                <span>03 / PETITS OUTILS</span>
                <h4>Apprendre en construisant.</h4>
                <p>
                  Tester un agent, évaluer ses réponses, automatiser une tâche…
                  Des expérimentations d’automatisation que je fais sur mon
                  temps libre.
                </p>
              </article>
            </div>
          </div>
        </section>
        <StoryBridge>
          Et puis, j’ai eu envie de faire parler
          <br />
          ce portfolio. <em>À vous d’essayer.</em>
        </StoryBridge>
        <StoryChapter id="labo" className="lab-section">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <span className="tiny-dot" />
                  03 / UN NOUVEAU TERRAIN DE JEU
                </p>
                <h2>
                  Je vous présente <span className="serif-word">Mongoose.</span>
                </h2>
              </div>
              <p>
                J’ai construit ce copilote pour vous faire découvrir mon
                parcours.
                <br />
                Si vous avez une question, c’est à lui de jouer.
              </p>
            </div>
            <div className="lab-grid">
              <ChatPanel />
              <LivePipeline />
            </div>
            <div className="lab-caption">
              <span>
                <Sparkles size={15} /> Une vraie interaction avec mon projet.
              </span>
            </div>
          </div>
        </StoryChapter>
        <StoryChapter id="competences" className="skills-section wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">04 / DANS MA BOÎTE À OUTILS</p>
              <h2>
                La technique, avec <span className="serif-word">du sens.</span>
              </h2>
            </div>
            <span className="skills-doodle" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="skills-grid">
            {skillDomains.map((domain, index) => {
              const Icon =
                [Workflow, Database, Sparkles, Code2, Braces][index] ?? Code2;
              return (
                <article key={domain.title}>
                  <Icon size={24} />
                  <h3>{domain.title}</h3>
                  <ul>
                    {domain.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className="education-row">
            <div>
              <p className="eyebrow">LE DOUBLE REGARD</p>
              {education.degrees.map((degree) => (
                <div className="degree" key={degree.school}>
                  <CompanyLogo src={degree.logo} name="" />
                  <p>
                    <strong>{degree.school}</strong>
                    <span>{degree.degree}</span>
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="eyebrow">TOUJOURS EN TRAIN D’APPRENDRE</p>
              <details>
                <summary>
                  {education.certifications.length} certifications · Data & IA{" "}
                  <Plus size={17} />
                </summary>
                <ul>
                  {education.certifications.map((cert) => (
                    <li className="certification" key={cert.name}>
                      <CompanyLogo src={cert.logo} name="" />
                      {cert.name}
                    </li>
                  ))}
                </ul>
              </details>
              <div className="languages">
                {profile.languages.map((language) => (
                  <span key={language.name}>
                    {language.name} · {language.level}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </StoryChapter>
        <StoryChapter id="contact" className="contact-section wrap">
          <span className="contact-spark" aria-hidden="true">
            ✳
          </span>
          <p className="eyebrow">UNE IDÉE, UN PROJET, UNE QUESTION ?</p>
          <h2>
            On en parle <span className="serif-word">de vive voix ?</span>
          </h2>
          <a
            className="button button-dark"
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            Discutons sur LinkedIn <ArrowUpRight size={19} />
          </a>
          <p>
            Pour parler boulot, échanger une idée ou simplement faire
            connaissance.
          </p>
        </StoryChapter>
      </main>
      <footer className="site-footer wrap">
        <a className="wordmark" href="#">
          <span className="personal-monogram" aria-hidden="true">
            ns.
          </span>
          <span>nathan sornet.</span>
        </a>
        <span>Un petit bout de mon parcours, fait maison.</span>
        <a href="#">
          Retour en haut <ArrowUpRight size={15} />
        </a>
      </footer>
      <FloatingCopilot />
    </AgentStatusProvider>
  );
}
