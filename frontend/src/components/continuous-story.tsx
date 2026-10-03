"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ProjectPrint } from "@/components/project-print";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const chapters = [
  { name: "La rencontre", progress: 0 },
  { name: "Le parcours", progress: 0.32 },
  { name: "Les projets", progress: 0.59 },
  { name: "Mes créations", progress: 0.77 },
  { name: "À vous", progress: 1 },
];

function CurtainStrip({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const start = 0.405 + index * 0.0018;
  const y = useTransform(progress, [start, start + 0.105], ["105%", "0%"]);
  return <motion.i style={{ y }} />;
}

export function ContinuousStory() {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [simple, setSimple] = useState(false);
  const [shortViewport, setShortViewport] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-height: 500px)");
    const update = () => setShortViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const [active, setActive] = useState(0);
  const [travel, setTravel] = useState(1500);
  const gallery = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const p = useMotionValue(0);
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const viewport = stage.current;
      if (!viewport) return;
      const inset = Number.parseFloat(getComputedStyle(viewport).top) || 0;
      const distance = el.offsetHeight - viewport.offsetHeight;
      p.set(
        Math.max(
          0,
          Math.min(
            1,
            (inset - el.getBoundingClientRect().top) / Math.max(1, distance),
          ),
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    if (ref.current) observer.observe(ref.current);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [p]);
  const photoScale = useTransform(p, [0, 0.22], [1, 1.22]);
  const photoOpacity = useTransform(p, [0, 0.12, 0.235], [1, 1, 0]);
  const photoX = useTransform(
    p,
    [0, 0.35, 0.55, 0.85],
    ["0%", "24%", "12%", "-30%"],
  );
  const etchedOpacity = useTransform(
    p,
    [0.09, 0.21, 0.39, 0.55, 0.88, 0.98],
    [0, 0.5, 0.35, 0.2, 0.15, 0],
  );
  const etchedScale = useTransform(p, [0, 0.4, 0.65, 1], [1, 1.4, 1.65, 1.1]);
  const etchedY = useTransform(
    p,
    [0, 0.4, 0.58, 1],
    ["0%", "15%", "40%", "10%"],
  );
  const etchedFilter = useTransform(
    p,
    [0.45, 0.55],
    [
      "grayscale(1) sepia(.4) brightness(1.4)",
      "grayscale(1) sepia(.4) brightness(.28)",
    ],
  );
  const heroOpacity = useTransform(p, [0, 0.1, 0.19], [1, 1, 0]);
  const heroY = useTransform(p, [0, 0.2], ["0%", "-30%"]);
  const aboutOpacity = useTransform(p, [0.18, 0.24, 0.38, 0.445], [0, 1, 1, 0]);
  const aboutY = useTransform(p, [0.18, 0.44], ["12%", "-12%"]);
  const projectsTitleOpacity = useTransform(
    p,
    [0.49, 0.535, 0.565, 0.605],
    [0, 1, 1, 0],
  );
  const projectsTitleY = useTransform(p, [0.51, 0.65], ["0%", "-65%"]);
  const galleryX = useTransform(p, [0.655, 0.86], [0, -travel]);
  const galleryY = useTransform(
    p,
    [0.58, 0.645, 0.89, 0.94],
    ["160%", "0%", "0%", "-160%"],
  );
  const oddY = useTransform(p, [0.61, 0.9], ["6%", "-8%"]);
  const evenY = useTransform(p, [0.61, 0.9], ["-8%", "8%"]);
  const endOpacity = useTransform(p, [0.945, 0.985], [0, 1]);
  const endScale = useTransform(p, [0.91, 1], [0.92, 1]);
  const ink = useTransform(p, [0.45, 0.55], ["#f5eedc", "#292b27"]);
  const still = reduced || simple || shortViewport;
  useEffect(
    () =>
      p.on("change", (v) =>
        setActive(
          v < 0.2 ? 0 : v < 0.49 ? 1 : v < 0.65 ? 2 : v < 0.965 ? 3 : 4,
        ),
      ),
    [p],
  );
  useEffect(() => {
    const strip = gallery.current;
    const viewport = stage.current;
    if (!strip || !viewport || still) return;
    const measure = () =>
      setTravel(
        Math.max(
          0,
          strip.scrollWidth -
            viewport.clientWidth +
            viewport.clientWidth * 0.07,
        ),
      );
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [still]);
  useEffect(() => {
    document.documentElement.dataset.storyMotion = still ? "off" : "on";
    if (visible && !still)
      document.documentElement.dataset.filmTone = active < 2 ? "dark" : "light";
    else delete document.documentElement.dataset.filmTone;
    return () => {
      delete document.documentElement.dataset.filmTone;
      delete document.documentElement.dataset.storyMotion;
    };
  }, [still, visible, active]);
  function seek(progress: number) {
    const el = ref.current;
    const viewport = stage.current;
    if (!el || !viewport) return;
    const inset = Number.parseFloat(getComputedStyle(viewport).top) || 0;
    window.scrollTo({
      top:
        window.scrollY +
        el.getBoundingClientRect().top -
        inset +
        (el.offsetHeight - viewport.offsetHeight) * progress,
      behavior: "instant",
    });
  }
  return (
    <section
      id="bonjour"
      ref={ref}
      className={`reference-film ${still ? "reference-simple" : ""}`}
      aria-label="L’histoire de Nathan Sornet"
    >
      <div ref={stage} className="reference-stage">
        <motion.div
          className="reference-tools"
          style={still ? undefined : { color: ink }}
        >
          <span>DATA, IA & ENVIES DE CRÉER</span>
          <button
            disabled={reduced || shortViewport}
            aria-pressed={still}
            onClick={() => {
              setSimple(!simple);
              ref.current?.scrollIntoView({ behavior: "instant" });
            }}
          >
            {reduced
              ? "Mouvement réduit"
              : shortViewport
                ? "Lecture simple"
                : simple
                  ? "Revoir le film"
                  : "Lecture simple"}
          </button>
          <a href="#parcours">Passer au parcours ↗</a>
        </motion.div>
        {still ? (
          <div className="reference-transcript">
            <h1>Nathan Sornet</h1>
            <p>
              Ingénieur Data & IA. J’aime comprendre, créer, et voir une idée
              prendre vie.
            </p>
            <h2>Tout commence par l’envie de créer.</h2>
            <p>
              Firstcop, une marketplace lancée en 2020. Puis l’ingénierie et le
              marketing, ReportLinker et Ippon, notamment en mission à la FFR.
              Aujourd’hui, je construis des pipelines et des applications d’IA.
            </p>
            <h2>Les idées prennent vie.</h2>
            <ProjectPrint kind="kale" />
            <ProjectPrint kind="orchestra" />
            <ProjectPrint kind="datapeek" />
            <a href="#labo">Rencontrer mon copilote ↗</a>
          </div>
        ) : (
          <>
            <motion.div
              className="reference-photo"
              style={{ opacity: photoOpacity, scale: photoScale, x: photoX }}
              aria-hidden="true"
            >
              <Image
                src="/images/nathan-paris-cutout.webp"
                loading="eager"
                alt=""
                fill
                priority
                sizes="100vw"
              />
            </motion.div>
            <motion.div
              className="reference-hero"
              style={{ opacity: heroOpacity, y: heroY }}
              aria-hidden="true"
            >
              <span>UN PORTFOLIO, UNE HISTOIRE.</span>
              <h1>
                NATHAN
                <br />
                <em>SORNET</em>
              </h1>
              <div>
                <p>
                  Ingénieur Data & IA.
                  <br />
                  Curieux de bien d’autres choses.
                </p>
                <span>
                  FAITES DÉFILER
                  <br />
                  POUR ENTRER DANS L’HISTOIRE ↓
                </span>
              </div>
            </motion.div>
            <div className="reference-curtain" aria-hidden="true">
              {Array.from({ length: 44 }, (_, i) => (
                <CurtainStrip progress={p} index={i} key={i} />
              ))}
            </div>
            <motion.div
              className="reference-etching"
              style={{
                x: photoX,
                y: etchedY,
                scale: etchedScale,
                opacity: etchedOpacity,
                filter: etchedFilter,
              }}
              aria-hidden="true"
            >
              <Image
                src="/images/nathan-paris-cutout.webp"
                loading="eager"
                alt=""
                fill
                sizes="100vw"
              />
            </motion.div>
            <motion.div
              className="reference-about"
              style={{ opacity: aboutOpacity, y: aboutY }}
              aria-hidden="true"
            >
              <span>01 / D’OÙ JE VIENS</span>
              <h2>
                TOUT COMMENCE
                <br />
                PAR L’ENVIE
                <br />
                <em>DE CRÉER.</em>
              </h2>
              <div className="reference-about-columns">
                <p>
                  Une marketplace en 2020.
                  <br />
                  Un premier produit, de premières questions. Et l’envie de
                  comprendre comment tout fonctionne.
                </p>
                <p>
                  L’ingénierie, le marketing, puis la data et l’IA.
                  ReportLinker, puis Ippon : missions à la FFR et projets
                  internes. À chaque étape : apprendre en construisant.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="reference-projects-title"
              style={{ opacity: projectsTitleOpacity, y: projectsTitleY }}
              aria-hidden="true"
            >
              <span>02 / CE QUE JE CONSTRUIS</span>
              <h2>
                LES IDÉES
                <br />
                <em>PRENNENT VIE.</em>
              </h2>
            </motion.div>
            <motion.div
              className="reference-gallery-viewport"
              style={{ y: galleryY }}
              aria-hidden="true"
            >
              <motion.div
                ref={gallery}
                className="reference-gallery"
                style={{ x: galleryX }}
              >
                <motion.div style={{ y: oddY }}>
                  <ProjectPrint kind="kale" />
                </motion.div>
                <motion.div style={{ y: evenY }}>
                  <ProjectPrint kind="orchestra" />
                </motion.div>
                <motion.div style={{ y: oddY }}>
                  <ProjectPrint kind="datapeek" />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="reference-ending"
              style={{ opacity: endOpacity, scale: endScale }}
              aria-hidden="true"
            >
              <span>03 / ET MAINTENANT ?</span>
              <h2>
                FAISONS
                <br />
                <em>CONNAISSANCE.</em>
              </h2>
              <p>
                Ce portfolio est aussi un de mes projets.
                <br />
                Son copilote vous raconte la suite.
              </p>
            </motion.div>
            {active === 4 && (
              <a className="reference-lab-link" href="#labo">
                Parler à mon copilote ↗
              </a>
            )}
            <motion.nav
              className="reference-nav"
              style={{ color: ink }}
              aria-label="Chapitres du film"
            >
              {chapters.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => seek(c.progress)}
                  aria-current={active === i ? "step" : undefined}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </motion.nav>
            <div className="sr-only">
              <h1>Nathan Sornet — Ingénieur Data et IA</h1>
              <p>
                Firstcop : une marketplace créée en 2020. Puis l’ingénierie, le
                marketing, les expériences chez ReportLinker et Ippon, entre
                missions à la FFR et projets internes.
              </p>
              <h2>Mes projets</h2>
              <p>
                Kalé : application iOS pour organiser des sorties entre amis.
                Orchestra : orchestration d’agents IA, en développement. Data
                Peek : mon site de veille tech, en ligne.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
