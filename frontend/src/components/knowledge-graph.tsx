"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const NODE_COUNT = 340;
const MAX_LINKS_PER_NODE = 3;
const LINK_DISTANCE = 1.5;
const FIELD_RADIUS = 6.5;

// Trajectoire ordonnée (hero → 4 sections) qu'une Catmull-Rom relie en
// courbe continue : la caméra ne saute plus d'un point à l'autre au
// changement de section, elle glisse en continu le long de cette courbe en
// fonction de `--scroll-progress` (0→1 sur toute la page, déjà calculé par
// Lenis dans smooth-scroll.tsx) — vraie sensation de "traverser" l'amas au
// scroll plutôt que quelques arrêts fixes. Les couleurs viennent de --tint-*
// (globals.css) et sont interpolées le long du même paramètre.
const PATH_WAYPOINTS: { cameraPos: [number, number, number]; lookAt: [number, number, number]; tint: string }[] = [
  { cameraPos: [0, 0, 7.5], lookAt: [0, 0, 0], tint: "var(--signal)" },
  { cameraPos: [4.2, 1.6, 5.4], lookAt: [2.2, 0.9, 0], tint: "var(--tint-competences)" },
  { cameraPos: [-4.2, -1.6, 5.4], lookAt: [-2.2, -0.9, 0], tint: "var(--tint-experience)" },
  { cameraPos: [3.4, -2.6, 5], lookAt: [1.6, -1.3, 0], tint: "var(--tint-projets)" },
  { cameraPos: [-3.2, 2.6, 5.4], lookAt: [-1.6, 1.3, 0], tint: "var(--tint-formation)" },
];

function buildGraph() {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    // `Math.random() ** 2.4` (au lieu du cbrt qui donnait une densité uniforme
    // par unité de volume) concentre la majorité des nœuds près du centre avec
    // quelques traînards vers le bord — esprit "amas galactique" plutôt que
    // nuage homogène. Le rayon plus large (vs. la version hero-only) donne aux
    // caméras de section de vraies zones distinctes à cadrer, pas juste un
    // recentrage du même petit nuage.
    const r = FIELD_RADIUS * Math.random() ** 2.4;
    nodes.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi)
      )
    );
  }

  const edges: number[] = [];
  const linkCounts = new Array(NODE_COUNT).fill(0);
  for (let i = 0; i < NODE_COUNT; i++) {
    const distances = nodes
      .map((n, j) => ({ j, d: i === j ? Infinity : nodes[i].distanceTo(n) }))
      .sort((a, b) => a.d - b.d);

    for (const { j, d } of distances) {
      if (linkCounts[i] >= MAX_LINKS_PER_NODE) break;
      if (d > LINK_DISTANCE) break;
      if (linkCounts[j] >= MAX_LINKS_PER_NODE) continue;
      edges.push(i, j);
      linkCounts[i]++;
      linkCounts[j]++;
    }
  }

  return { nodes, edges };
}

// THREE.Color ne sait pas parser oklch()/lab(). getComputedStyle() sur une
// sonde résout la var CSS mais garde l'espace colorimétrique, donc on peint
// dans un canvas 1x1 et on relit des octets sRGB bruts à la place. Coûteux
// (DOM + readback) — mis en cache par chaîne d'entrée, jamais résolu à chaque
// frame, seulement quand la teinte cible change réellement.
function resolveCssColor(cssValue: string, target: THREE.Color) {
  const probe = document.createElement("span");
  probe.style.color = cssValue;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  target.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}

export function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    // Résidu du thème sombre : le fog était calé sur du noir pur, ce qui
    // faisait disparaître les nœuds lointains vers du noir au lieu du fond
    // papier clair — désormais aligné sur --background (approximé, THREE ne
    // sait pas parser oklch()).
    scene.fog = new THREE.FogExp2(0xf6f3ee, 0.065);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(...PATH_WAYPOINTS[0].cameraPos);

    // Deux courbes Catmull-Rom (arc-length, via getPointAt) construites une
    // fois sur les mêmes points ordonnés : une pour la position caméra, une
    // pour la cible regardée — glissent à vitesse perçue constante le long du
    // scroll plutôt que de ralentir/accélérer selon l'espacement des points.
    const cameraCurve = new THREE.CatmullRomCurve3(
      PATH_WAYPOINTS.map((w) => new THREE.Vector3(...w.cameraPos))
    );
    const lookAtCurve = new THREE.CatmullRomCurve3(
      PATH_WAYPOINTS.map((w) => new THREE.Vector3(...w.lookAt))
    );
    // Résolues une seule fois (valeurs CSS fixes) plutôt qu'à chaque frame —
    // seul le mélange entre elles change en continu pendant le rendu.
    const waypointColors = PATH_WAYPOINTS.map((w) => {
      const c = new THREE.Color();
      resolveCssColor(w.tint, c);
      return c;
    });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const { nodes, edges } = buildGraph();

    const pointPositions = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      pointPositions[i * 3] = n.x;
      pointPositions[i * 3 + 1] = n.y;
      pointPositions[i * 3 + 2] = n.z;
    });
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
    const baseSize = 0.052;
    const pointMaterial = new THREE.PointsMaterial({
      color: waypointColors[0],
      size: baseSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pointGeometry, pointMaterial);
    group.add(points);

    const linePositions = new Float32Array(edges.length * 3);
    edges.forEach((idx, i) => {
      const n = nodes[idx];
      linePositions[i * 3] = n.x;
      linePositions[i * 3 + 1] = n.y;
      linePositions[i * 3 + 2] = n.z;
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: waypointColors[0],
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    group.add(lines);

    let raf = 0;
    let mouseX = 0;
    let mouseY = 0;
    let cameraX = 0;
    let cameraY = 0;
    // Impulsion au clic : boost de rotation qui se décroît, plutôt qu'un état
    // binaire — se sent comme une poussée physique, pas comme un interrupteur.
    let spinBoost = 0;

    // Écouté sur `window`, pas sur le conteneur du graphe : celui-ci est
    // posé plein-écran mais *derrière* tout le reste (fond fixe), donc pour
    // le hit-testing normal du navigateur, toute section/carte/bouton
    // au-dessus intercepte le clic en premier même quand elle est visuellement
    // transparente à cet endroit (confirmé via `elementFromPoint`). Écouter
    // sur `window` capte le clic quel que soit l'élément réellement visé —
    // toute la page se sent "vivante" au clic, pas juste les zones vides.
    function handlePointerMove(e: PointerEvent) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("pointermove", handlePointerMove);

    // Cycle de couleurs au clic — indépendant du scroll, reste jusqu'au clic
    // suivant. Reprend les mêmes teintes résolues que les points de passage,
    // plutôt que d'inventer une palette parallèle.
    let clickColorIndex = -1;

    function handlePointerDown() {
      if (prefersReducedMotion) return;
      spinBoost += 0.16;
      clickColorIndex = (clickColorIndex + 1) % waypointColors.length;
    }
    window.addEventListener("pointerdown", handlePointerDown);

    const currentCamPos = camera.position.clone();
    const currentLookAt = new THREE.Vector3(...PATH_WAYPOINTS[0].lookAt);
    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    const currentColor = waypointColors[0].clone();
    const targetColor = new THREE.Color();
    const segStart = new THREE.Color();
    const segEnd = new THREE.Color();

    function render() {
      const t = Date.now() * 0.001;

      // Position/cible caméra échantillonnées en continu sur la courbe selon
      // le scroll de toute la page (0→1) — pas figées sur un point de
      // section : sensation de traverser l'amas plutôt que de sauter entre
      // quelques arrêts. Lu en style inline (jamais getComputedStyle, qui
      // forcerait un recalcul de layout) — posé par useSmoothScroll à chaque
      // frame de scroll (voir lib/smooth-scroll.tsx).
      const raw = document.documentElement.style.getPropertyValue("--scroll-progress");
      const progress = Math.min(1, Math.max(0, parseFloat(raw) || 0));
      cameraCurve.getPointAt(progress, targetCamPos);
      lookAtCurve.getPointAt(progress, targetLookAt);

      // Couleur : dégradé continu entre les deux teintes du segment traversé
      // (pas juste "la plus proche") — un clic impose la sienne par-dessus,
      // jusqu'au clic suivant, l'interaction directe gagnant sur l'auto.
      if (clickColorIndex >= 0) {
        targetColor.copy(waypointColors[clickColorIndex]);
      } else {
        const span = PATH_WAYPOINTS.length - 1;
        const scaled = progress * span;
        const segIndex = Math.min(span - 1, Math.floor(scaled));
        const localT = scaled - segIndex;
        segStart.copy(waypointColors[segIndex]);
        segEnd.copy(waypointColors[segIndex + 1]);
        targetColor.copy(segStart).lerp(segEnd, localT);
      }

      if (!prefersReducedMotion) {
        // Rotation continue (+ impulsion au clic, décroissante) + léger
        // tangage indépendant + dérive verticale du groupe entier : plusieurs
        // mouvements de périodes différentes pour que rien ne boucle de façon
        // perceptible — "vivant", pas "en boucle".
        group.rotation.y += 0.0026 + spinBoost;
        spinBoost *= 0.94;
        group.rotation.x = Math.sin(t * 0.12) * 0.09;
        group.position.y = Math.sin(t * 0.15) * 0.12;

        // Respiration douce de la taille/opacité des points — scintillement
        // d'ensemble bon marché (pas de shader par-point) qui donne au champ
        // une sensation de "vivant" plutôt que de nuage figé.
        pointMaterial.size = baseSize * (1 + Math.sin(t * 0.7) * 0.12);
        pointMaterial.opacity = 0.85 + Math.sin(t * 0.5) * 0.1;

        // Caméra : parallax souris (nettement sensible, pas juste un
        // frémissement) par-dessus une cible qui glisse (lerp, réactif) vers
        // le point de la courbe correspondant au scroll — "ça bouge avec ma
        // souris" en continu, "on traverse l'objet" au scroll, superposés.
        cameraX += (mouseX * 1.5 - cameraX) * 0.06;
        cameraY += (-mouseY * 1.05 - cameraY) * 0.06;
        currentCamPos.lerp(targetCamPos, 0.045);
        currentLookAt.lerp(targetLookAt, 0.045);
        currentColor.lerp(targetColor, 0.035);

        camera.position.set(
          currentCamPos.x + cameraX,
          currentCamPos.y + cameraY,
          currentCamPos.z
        );
        camera.lookAt(currentLookAt);
        pointMaterial.color.copy(currentColor);
        lineMaterial.color.copy(currentColor);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    }
    render();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} aria-hidden className="h-full w-full" />;
}
