import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Briefcase, Cpu, GraduationCap, Rocket } from "lucide-react";
import { useRef, useState } from "react";

import { DecryptText } from "@/components/decrypt-text";
import { GlbModel } from "@/components/glb-model";
import { FloatingLogoGroup, InlineLogo } from "@/components/logo";
import { MaskReveal } from "@/components/mask-reveal";
import { ScanGroup, ScanItem } from "@/components/scan-reveal";
import { SectionNav } from "@/components/section-nav";
import { SectionShell } from "@/components/section-shell";
import { useScrollContext } from "@/lib/scroll-context";
import { useSectionSnap } from "@/lib/use-section-snap";
import { education, experiences, profile, projects, skillDomains } from "@/lib/profile";

const SECTIONS = [
  { id: "section-competences", label: "Compétences" },
  { id: "section-experience", label: "Expérience" },
  { id: "section-projets", label: "Projets" },
  { id: "section-formation", label: "Formation" },
];

function SectionTitle({ index, children }: { index: number; children: string }) {
  return (
    <h2 className="mb-6 flex items-baseline gap-2 font-mono text-sm font-medium tracking-wide text-muted-foreground uppercase sm:mb-8">
      <span className="text-[var(--tint,var(--signal))]">{String(index).padStart(2, "0")}</span>
      <DecryptText text={children} />
    </h2>
  );
}

function Hero() {
  const { containerRef } = useScrollContext();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    container: containerRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background from-45% via-background/85 via-75% to-transparent to-100% sm:from-15% sm:via-background/75 sm:via-45% sm:to-85%" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent sm:from-background/40" />

      <motion.div style={{ opacity: contentOpacity, y: contentY }}>
        <ScanGroup stagger={0.1} className="relative z-10 flex max-w-3xl flex-col gap-4 px-6 sm:px-12 lg:px-16">
          <ScanItem>
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              {profile.title}
            </p>
          </ScanItem>
          <ScanItem>
            <h1 className="font-serif text-7xl leading-[0.9] font-medium tracking-tight sm:text-8xl lg:text-[8.5rem]">
              <DecryptText text={profile.name} />
            </h1>
          </ScanItem>
          <ScanItem className="mt-2">
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              <MaskReveal text={profile.summary} />
            </p>
          </ScanItem>
          <ScanItem className="mt-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor
                  data-cursor-label="Ouvrir"
                  className="underline decoration-signal/40 underline-offset-4 transition-colors duration-300 hover:text-signal hover:decoration-signal"
                >
                  LinkedIn
                </a>
                {profile.languages.map((l) => (
                  <span key={l.name}>
                    {l.name} — {l.level}
                  </span>
                ))}
              </div>
              {/* Test d'asset .glb fourni par l'utilisateur. */}
              <GlbModel src="/models/earth-hologram.glb" size={56} className="shrink-0 overflow-hidden rounded-full" />
            </div>
          </ScanItem>
        </ScanGroup>
      </motion.div>
    </section>
  );
}

// Chapitre "index" — dense, tout en mono, lignes de conduite pointillées :
// se lit comme une table des matières technique, pas comme une liste éditoriale.
function CompetencesIndex() {
  return (
    <div className="flex flex-col font-mono">
      {skillDomains.map((d, i) => (
        <ScanItem key={d.title} className="border-b border-foreground/10 py-4 sm:py-5">
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm font-medium tracking-[0.08em] uppercase sm:text-base">
              {d.title}
            </span>
            <span aria-hidden className="mb-1 h-px flex-1 border-b border-dotted border-foreground/25" />
            <span className="text-xs text-muted-foreground">
              {String(d.skills.length).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-1.5 pl-8 text-xs text-muted-foreground sm:pl-9">
            {d.skills.join("  ·  ")}
          </p>
        </ScanItem>
      ))}
    </div>
  );
}

// Chapitre "timeline" — une vraie ligne verticale qui se dessine au scroll,
// un point par étape : le parcours comme un trajet dans le temps.
function ExperienceTimeline() {
  const { containerRef } = useScrollContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    container: containerRef,
    offset: ["start 85%", "end 65%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={wrapRef} className="relative pl-8 sm:pl-10">
      <div aria-hidden className="absolute top-1 bottom-1 left-[3px] w-px bg-foreground/10 sm:left-[7px]" />
      <motion.div
        aria-hidden
        className="absolute top-1 left-[3px] w-px origin-top sm:left-[7px]"
        style={{ scaleY: lineScale, height: "100%", background: "var(--tint)" }}
      />
      <div className="flex flex-col gap-10 sm:gap-14">
        {experiences.map((e) => (
          <ScanItem key={`${e.company}-${e.period}`} className="relative">
            <span
              aria-hidden
              className="absolute top-1.5 -left-8 h-2.5 w-2.5 rounded-full ring-4 ring-background sm:-left-10"
              style={{ background: "var(--tint)" }}
            />
            <FloatingLogoGroup logos={e.logos} alt={e.company} cardSize={44} />
            {/* pr- réserve la place des badges flottants (absolus, ancrés à
                droite) — sans ça, un intitulé de poste long passe dessous.
                cardSize réduit (56→44) + réserve élargie : un empilement de 2
                logos (~2×44-14≈74px) passait encore au-dessus de la marge
                mobile précédente (pr-20=80px) sur les intitulés à 3 segments
                ("... — Projet interne — Ippon"), confirmé par capture d'écran. */}
            <div className="pr-24 sm:pr-32">
              <div className="font-mono text-xs text-muted-foreground">{e.period}</div>
              <h3 className="mt-1 font-serif text-2xl font-medium sm:text-3xl">
                {e.role} <span className="text-muted-foreground">— {e.company}</span>
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                <MaskReveal text={e.description} />
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-xs text-muted-foreground">
                {e.tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </ScanItem>
        ))}
      </div>
    </div>
  );
}

// Chapitre "showcase" — 2 pièces seulement, traitées comme des affiches :
// gros numéro, typographie énorme, alignement alterné.
// Chapitre "showcase" — épinglé : le scroll vertical normal fait glisser les
// projets horizontalement (comme les pages produit Apple). Même geste que le
// reste de la page, juste le mouvement visuel qui change de sens.
function ProjectsShowcase() {
  const { containerRef } = useScrollContext();
  const wrapRef = useRef<HTMLDivElement>(null);
  const count = projects.length;
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    container: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(count - 1) * 100}%`]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(count - 1, Math.max(0, Math.round(v * (count - 1))));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  return (
    <div
      ref={wrapRef}
      style={{ height: `${count * 100}dvh` }}
      className="relative -mx-6 sm:-mx-12 lg:-mx-16"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <motion.div style={{ x }} className="flex h-full">
          {projects.map((p, i) => (
            <div
              key={p.title}
              data-cursor
              data-cursor-label="Voir"
              className="flex w-full shrink-0 flex-col justify-center gap-4 px-6 sm:px-12 lg:px-16"
            >
              <span
                aria-hidden
                className="font-serif text-7xl leading-none font-medium select-none sm:text-9xl"
                style={{ color: "color-mix(in oklch, var(--tint) 35%, transparent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-mono text-xs text-muted-foreground">{p.period}</p>
              <h3 className="font-serif text-4xl leading-[0.95] font-medium sm:text-7xl">
                {p.title}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                <MaskReveal text={p.description} />
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                {p.tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute right-6 bottom-8 flex items-center gap-2 sm:right-12 sm:bottom-10 lg:right-16">
          {projects.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                backgroundColor:
                  i === active ? "var(--tint)" : "color-mix(in oklch, var(--foreground) 20%, transparent)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Chapitre "générique de fin" — centré, sobre, très aéré : le contraste
// volontaire avec la densité des chapitres précédents marque la clôture.
function FormationOutro() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
      <div className="flex flex-col gap-6">
        {education.degrees.map((d) => (
          <ScanItem key={d.school} className="flex flex-col items-center gap-3">
            <InlineLogo src={d.logo} alt={d.school} cardSize={64} />
            <h3 className="font-serif text-xl font-medium sm:text-2xl">{d.degree}</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{d.school}</p>
          </ScanItem>
        ))}
      </div>
      <ScanItem className="flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-3">
        {education.certifications.map((c) => (
          <span
            key={c.name}
            className="flex flex-col items-center gap-1.5 font-mono text-[11px] tracking-wide text-muted-foreground/70"
          >
            <InlineLogo src={c.logo} alt="" cardSize={36} />
            {c.name}
          </span>
        ))}
      </ScanItem>
    </div>
  );
}

const ALL_SECTION_IDS = ["hero", ...SECTIONS.map((s) => s.id)];

export function Dashboard() {
  const { lenisRef } = useScrollContext();
  useSectionSnap(lenisRef, ALL_SECTION_IDS);

  return (
    <div className="flex flex-col md:pl-20">
      <SectionNav sections={SECTIONS} />
      <Hero />

      <SectionShell id="section-competences" index={1} tint="var(--tint-competences)" icon={Cpu}>
        <ScanGroup className="flex min-h-0 flex-1 flex-col justify-center">
          <ScanItem>
            <SectionTitle index={1}>Compétences</SectionTitle>
          </ScanItem>
          <CompetencesIndex />
        </ScanGroup>
      </SectionShell>

      <SectionShell id="section-experience" index={2} tint="var(--tint-experience)" icon={Briefcase}>
        <ScanGroup className="flex min-h-0 flex-1 flex-col justify-center">
          <ScanItem>
            <SectionTitle index={2}>Expérience</SectionTitle>
          </ScanItem>
          <ExperienceTimeline />
        </ScanGroup>
      </SectionShell>

      <SectionShell id="section-projets" index={3} tint="var(--tint-projets)" icon={Rocket} pinned>
        <ScanGroup className="flex min-h-0 flex-1 flex-col justify-center">
          <ScanItem>
            <SectionTitle index={3}>Projets</SectionTitle>
          </ScanItem>
          <ProjectsShowcase />
        </ScanGroup>
      </SectionShell>

      <SectionShell id="section-formation" index={4} tint="var(--tint-formation)" icon={GraduationCap}>
        <ScanGroup className="flex min-h-0 flex-1 flex-col justify-center">
          <ScanItem>
            <SectionTitle index={4}>Formation</SectionTitle>
          </ScanItem>
          <FormationOutro />
        </ScanGroup>
      </SectionShell>
    </div>
  );
}
