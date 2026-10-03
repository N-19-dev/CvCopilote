"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useScrollContext } from "@/lib/scroll-context";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

// Rendu conditionnel : tant que le fichier n'existe pas dans /public, ne rend
// rien du tout (pas d'icône cassée) plutôt que de planter ou d'afficher un
// placeholder. Dès que le fichier est déposé, le logo apparaît sans autre
// changement de code.
//
// Le check au montage (en plus de onError) est nécessaire : en SSR, le
// navigateur commence à charger l'image dès le HTML initial, souvent avant
// que React n'ait hydraté et attaché le handler onError — l'échec survient
// alors "raté" (l'événement ne se re-déclenche pas après coup). Même souci
// pour les dimensions naturelles : on les lit au montage si l'image est déjà
// `complete` (cache), sinon via onLoad.
export function Logo({
  src,
  alt,
  className,
  onDimensions,
}: {
  src?: string;
  alt: string;
  className?: string;
  onDimensions?: (dims: { w: number; h: number }) => void;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) setFailed(true);
    else onDimensions?.({ w: img.naturalWidth, h: img.naturalHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!src || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      onLoad={(e) => onDimensions?.({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
    />
  );
}

function seedFrom(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

const MIN_RATIO = 0.55;
const MAX_RATIO = 3;

// Les logos fournis sont des PNG/JPEG à fond carré opaque (pas de vrai canal
// alpha), mais pas tous carrés dans leurs proportions : des wordmarks très
// larges (ex. Ippon) à côté de pictos carrés (ex. FFR). Les stocker tous dans
// une carte carrée fixe écrase les larges (minuscules, noyés dans du blanc) et
// n'apporte rien aux carrés. La carte adopte donc le ratio naturel de CHAQUE
// image (mesuré au chargement, borné pour rester lisible) — hauteur fixée par
// `cardSize`, largeur qui s'ajuste. Même traitement badge/pastille pour tous
// (coins arrondis, ombre nette), juste la silhouette qui suit la forme réelle.
// Bascule 3D à la souris + petite dérive continue dans les deux modes.
function LogoBadge({ src, alt, cardSize }: { src: string; alt: string; cardSize: number }) {
  const reduced = usePrefersReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);
  const seed = useMemo(() => seedFrom(src ?? alt), [src, alt]);
  const [ratio, setRatio] = useState(1);
  const rotateX = useSpring(0, { stiffness: 140, damping: 12 });
  const rotateY = useSpring(0, { stiffness: 140, damping: 12 });
  const glow = useMotionValue(0);
  const glowSpring = useSpring(glow, { stiffness: 120, damping: 16 });

  const duration = 5 + (seed % 21) / 4; // ~5s à 10s
  const delay = (seed % 11) / 5; // 0s à 2s
  const amp = 6 + (seed % 6); // 6 à 11px
  const parallaxSign = seed % 2 === 0 ? 1 : -1;
  const cardWidth = cardSize * Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = tiltRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const py = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    rotateY.set(Math.max(-1, Math.min(1, px)) * 22);
    rotateX.set(Math.max(-1, Math.min(1, py)) * -22);
    glow.set(1);
  }
  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glow.set(0);
  }

  return (
    // Zone de survol STATIQUE (jamais animée) : Framer anime le calque visuel
    // directement sur le compositeur GPU, ce qui désynchronise le
    // hit-testing de la souris de la position réellement peinte à l'écran si
    // l'élément survolé est lui-même celui qui bouge. En gardant ce
    // conteneur immobile (avec une marge généreuse pour couvrir toute
    // l'amplitude du flottement) et en laissant seulement l'enfant flotter
    // visuellement, la souris trouve toujours une cible fiable.
    <div ref={tiltRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="p-3">
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 700 }}
        animate={
          reduced
            ? undefined
            : {
                y: [0, -amp, amp * 0.35, 0],
                rotate: [0, parallaxSign * 3, parallaxSign * -2, 0],
              }
        }
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 scale-125 rounded-full blur-xl"
          style={{ opacity: glowSpring, background: "color-mix(in oklch, var(--tint) 40%, transparent)" }}
        />
        <div
          className="flex items-center justify-center rounded-2xl bg-white p-2.5 ring-1 ring-black/[0.06] transition-[width] duration-300 ease-out"
          style={{
            width: cardWidth,
            height: cardSize,
            boxShadow: "0 20px 32px -14px rgba(0,0,0,0.55), 0 2px 6px -2px rgba(0,0,0,0.3)",
          }}
        >
          <Logo
            src={src}
            alt={alt}
            className="h-full w-full object-contain"
            onDimensions={({ w, h }) => {
              if (w && h) setRatio(w / h);
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

// Suit son propre passage dans le viewport (pas le scroll global de la page,
// trop dilué pour se sentir "interactif") : arrive d'un côté (translation
// horizontale, pas de rotation) pendant que l'élément monte dans la moitié
// basse du viewport, puis se stabilise en place — repère "start end" → "start
// 55%", donc le badge est posé bien avant d'atteindre le centre, comme s'il
// se rangeait au passage plutôt que de rester en mouvement. Un tout petit
// dépassement (`0.86` puis `1`) sur la fin de la course donne la sensation
// d'un arrêt physique plutôt que d'un simple fondu. Amplitude et léger
// désynchronisme varient par logo (seed) pour que plusieurs badges à l'écran
// n'arrivent jamais en miroir parfait.
function useScrollSlideIn(seed: number, distanceBase: number, forcedDir?: 1 | -1) {
  const reduced = usePrefersReducedMotion();
  const { containerRef } = useScrollContext();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    container: containerRef,
    offset: ["start end", "start 55%"],
  });
  const dir = forcedDir ?? (seed % 2 === 0 ? 1 : -1);
  const distance = reduced ? 0 : distanceBase + (seed % 5) * (distanceBase / 10);
  const x = useTransform(
    scrollYProgress,
    [0, 0.7, 0.86, 1],
    [dir * distance, -dir * distance * 0.04, dir * distance * 0.012, 0]
  );
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.85, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  return { trackRef, x, opacity, scale };
}

// Objet flottant détaché du flux (le parent doit être `position: relative`,
// ex. ScanItem) : parallaxe au scroll (lit directement --scroll-progress posé
// par Lenis, sans coût de useScroll par instance) + arrivée latérale liée au
// passage de CE logo précis dans le viewport. Réservé aux mises en page qui
// ont de la place libre à côté du texte (ex. la timeline d'expérience) —
// sinon utiliser `InlineLogo`.
//
// Version groupe : plusieurs logos pour une même entrée (ex. mission en
// régie) se posent en pile légèrement chevauchante dans un flex, plutôt que
// via un décalage en pixels fixe — chaque carte garde sa largeur naturelle
// (cf. LogoBadge) sans que les cartes larges ne recouvrent les suivantes.
export function FloatingLogoGroup({
  logos,
  alt,
  side = "right",
  cardSize = 56,
}: {
  logos?: (string | undefined)[];
  alt: string;
  side?: "left" | "right";
  cardSize?: number;
}) {
  const present = (logos ?? []).filter((s): s is string => Boolean(s));
  if (!present.length) return null;

  // Arrive depuis le bord auquel le groupe est ancré : un badge collé au
  // bord droit vient de plus loin à droite, celui côté gauche de plus loin à
  // gauche — cohérent avec sa position finale plutôt qu'aléatoire.
  const forcedDir = side === "right" ? 1 : -1;

  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-0 z-10 flex",
        side === "right" ? "right-0 flex-row-reverse sm:-right-2" : "left-0 sm:-left-2"
      )}
    >
      {present.map((src, i) => (
        <div key={src} style={{ marginLeft: i === 0 ? 0 : -14 }}>
          <SlideInLogo src={src} alt={alt} cardSize={cardSize} forcedDir={forcedDir} />
        </div>
      ))}
    </div>
  );
}

function SlideInLogo({
  src,
  alt,
  cardSize,
  distanceBase = 90,
  forcedDir,
}: {
  src: string;
  alt: string;
  cardSize: number;
  distanceBase?: number;
  forcedDir?: 1 | -1;
}) {
  const seed = useMemo(() => seedFrom(src ?? alt), [src, alt]);
  const { trackRef, x, opacity, scale } = useScrollSlideIn(seed, distanceBase, forcedDir);
  const parallaxSign = seed % 2 === 0 ? 1 : -1;
  const parallaxPx = 30 + (seed % 25); // 30 à 55px sur tout le scroll de la page

  return (
    <div
      ref={trackRef}
      style={{
        transform: `translateY(calc(var(--scroll-progress, 0) * ${parallaxSign * parallaxPx}px))`,
      }}
    >
      <motion.div style={{ x, opacity, scale }}>
        <LogoBadge src={src} alt={alt} cardSize={cardSize} />
      </motion.div>
    </div>
  );
}

// Variante en flux normal (pas absolue) : pour les mises en page centrées ou
// denses (ex. Formation) où faire flotter le badge en position absolue le
// ferait chevaucher le texte des lignes voisines. Garde la même arrivée
// latérale pilotée par le scroll, sur une distance plus courte.
export function InlineLogo({
  src,
  alt,
  cardSize = 44,
}: {
  src?: string;
  alt: string;
  cardSize?: number;
}) {
  const seed = useMemo(() => seedFrom(src ?? alt), [src, alt]);
  const { trackRef, x, opacity, scale } = useScrollSlideIn(seed, 46);
  if (!src) return null;

  return (
    <motion.div ref={trackRef} style={{ x, opacity, scale }}>
      <LogoBadge src={src} alt={alt} cardSize={cardSize} />
    </motion.div>
  );
}
