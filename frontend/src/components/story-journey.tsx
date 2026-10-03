"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Pause, Play, ArrowDown } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const chapters = [
  { id: "bonjour", label: "La rencontre", word: "Bonjour.", color: "#eee0cf" },
  {
    id: "parcours",
    label: "Les premiers pas",
    word: "Oser.",
    color: "#e9dcc7",
  },
  {
    id: "projets",
    label: "Les idées prennent forme",
    word: "Construire.",
    color: "#dce7d3",
  },
  {
    id: "labo",
    label: "Un nouveau terrain de jeu",
    word: "Explorer.",
    color: "#d8e6e6",
  },
  {
    id: "competences",
    label: "Ce que j’emporte",
    word: "Apprendre.",
    color: "#e9e0cd",
  },
  {
    id: "contact",
    label: "La suite, ensemble",
    word: "Et après ?",
    color: "#e4dfcf",
  },
];

// Coordinates belong to a single continuous world, rather than six unrelated backgrounds.
const route =
  "M 1260 100 C 1550 250 1010 350 1240 510 S 1560 800 1260 940 S 1000 1240 1300 1410 S 1560 1690 1260 1810 S 1010 2140 1280 2320";

export function StoryJourney() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const worldRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const inkRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stopped = reduced || paused;

  useEffect(() => {
    const world = worldRef.current;
    const path = pathRef.current;
    if (!world || !path) return;
    const length = path.getTotalLength();
    let frame = 0;
    let offsets: number[] = [];
    let maximum = 1;
    let previousChapter = -1;
    let sceneWidth = world.offsetWidth;
    let viewportHeight = window.innerHeight;

    function draw() {
      frame = 0;
      const y = window.scrollY;
      const progress = Math.max(0, Math.min(1, y / maximum));
      let chapter = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (y + viewportHeight * 0.4 >= offsets[i]) chapter = i;
      }
      if (y >= maximum - 3) chapter = chapters.length - 1;
      if (chapter !== previousChapter) {
        previousChapter = chapter;
        setActive(chapter);
      }
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${progress})`;
      if (stopped) return;
      const point = path!.getPointAtLength(length * progress);
      // The camera tracks the ink tip while leaving the main reading column calm.
      world!.style.transform = `translate3d(0, ${viewportHeight * 0.58 - (point.y * sceneWidth) / 1600}px, 0)`;
      inkRef.current?.setAttribute("stroke-dashoffset", String(1 - progress));
      markerRef.current?.setAttribute(
        "transform",
        `translate(${point.x} ${point.y})`,
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function measure() {
      sceneWidth = world!.offsetWidth;
      viewportHeight = window.innerHeight;
      offsets = chapters.map(
        (chapter) =>
          (document.getElementById(chapter.id)?.getBoundingClientRect().top ??
            0) + window.scrollY,
      );
      maximum = Math.max(
        1,
        document.documentElement.scrollHeight - viewportHeight,
      );
      schedule();
    }
    const observer = new ResizeObserver(measure);
    const main = document.getElementById("contenu");
    if (main) observer.observe(main);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [stopped]);

  useEffect(() => {
    document.documentElement.dataset.storyMotion = stopped ? "off" : "on";
    return () => {
      delete document.documentElement.dataset.storyMotion;
    };
  }, [stopped]);

  return (
    <>
      <div
        className={`story-world ${stopped ? "story-still" : ""}`}
        aria-hidden="true"
        style={{ backgroundColor: chapters[active].color }}
      >
        <div className="story-paper" />
        <div className="story-landscape" ref={worldRef}>
          <svg viewBox="0 0 1600 2400" fill="none">
            <g stroke="currentColor" className="story-contours">
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d={route}
                  transform={`translate(${i * 34 - 90} ${i * 16})`}
                />
              ))}
              <circle cx="1380" cy="500" r="155" />
              <circle cx="1380" cy="500" r="205" />
              <rect
                x="1120"
                y="1010"
                width="270"
                height="270"
                rx="35"
                transform="rotate(18 1255 1145)"
              />
              <circle cx="1360" cy="1730" r="185" />
            </g>
            <path
              ref={pathRef}
              d={route}
              stroke="#a28c70"
              strokeWidth="1.5"
              strokeDasharray="3 10"
              opacity=".5"
            />
            <path
              ref={inkRef}
              d={route}
              pathLength="1"
              stroke="#cb7047"
              strokeWidth="3"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <g className="world-sketch" transform="translate(1200 130)">
              <path d="M0 50 L90 5 150 65 90 110Z M90 5V110 M0 50L60 85 150 65" />
              <text x="-40" y="155">
                une première idée
              </text>
            </g>
            <g className="world-sketch" transform="translate(1240 860)">
              <ellipse cx="0" cy="0" rx="50" ry="15" />
              <path d="M-50 0V65C-50 85 50 85 50 65V0 M-50 32C-50 52 50 52 50 32" />
              <text x="-110" y="130">
                trouver les connexions
              </text>
            </g>
            <g className="world-sketch" transform="translate(1320 1610)">
              <circle r="38" />
              <circle cx="-90" cy="-60" r="12" />
              <circle cx="75" cy="-90" r="12" />
              <circle cx="95" cy="55" r="12" />
              <path d="M-35 -20 -80 -53 M22 -30 68 -80 M33 17 84 48" />
              <text x="-120" y="130">
                et essayer autre chose
              </text>
            </g>
            <g ref={markerRef} transform="translate(1260 100)">
              <circle r="22" fill="#cf7046" opacity=".1" />
              <circle r="7" fill="#cf7046" />
              <circle r="3" fill="#fff9ec" />
            </g>
          </svg>
        </div>
        <span className="story-world-word" key={active}>
          {chapters[active].word}
        </span>
        <div className="story-reading-veil" />
      </div>
      <div className="story-progress" aria-hidden="true">
        <div ref={progressRef} />
      </div>
      <nav className="story-rail" aria-label="Les chapitres de mon histoire">
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            aria-label={`${index + 1}. ${chapter.label}`}
            aria-current={active === index ? "step" : undefined}
          >
            <span className="story-stop" />
            <span className="story-rail-label">{chapter.label}</span>
          </a>
        ))}
      </nav>
      <aside className="story-reader" aria-label="Lecture du parcours">
        <span className="story-reader-number">
          0{active + 1}
          <span> / 06</span>
        </span>
        <span className="story-reader-label">{chapters[active].label}</span>
        <button
          type="button"
          aria-pressed={stopped}
          disabled={reduced}
          onClick={() => setPaused(!paused)}
          aria-label={
            stopped
              ? "Activer les animations du récit"
              : "Mettre les animations du récit en pause"
          }
        >
          {stopped ? <Play size={13} /> : <Pause size={13} />}
        </button>
      </aside>
    </>
  );
}

export function StoryChapter({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [45, 0, 0, -24]);
  return (
    <motion.section
      ref={ref}
      id={id}
      className={`story-chapter ${className}`}
      style={{ y: reduced ? 0 : y }}
    >
      {children}
    </motion.section>
  );
}

export function StoryBridge({ children }: { children: ReactNode }) {
  return (
    <div className="story-bridge wrap">
      <span className="story-bridge-line" />
      <p>{children}</p>
      <ArrowDown size={18} aria-hidden="true" />
    </div>
  );
}

export function StoryMoment({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [28, 0, 0, -12]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.8, 1],
    [0.65, 1, 1, 0.75],
  );
  return (
    <motion.div
      ref={ref}
      className="story-moment"
      style={{ x: reduced ? 0 : x, opacity: reduced ? 1 : opacity }}
    >
      {children}
    </motion.div>
  );
}
