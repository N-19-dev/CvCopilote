"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Chargeur .glb générique — cadre et centre automatiquement le modèle (utile
// pour des assets fournis sans savoir à quelle échelle/pivot ils ont été
// exportés), joue les animations embarquées en boucle si présentes. N'affiche
// rien en cas d'échec de chargement, même filet de sécurité que Logo pour les
// assets optionnels.
export function GlbModel({
  src,
  size = 72,
  autoRotateSpeed = 0.004,
  className,
}: {
  src: string;
  size?: number;
  autoRotateSpeed?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    const point = new THREE.PointLight(0xffffff, 20);
    point.position.set(2, 2, 3);
    scene.add(ambient, point);

    let raf = 0;
    let mixer: THREE.AnimationMixer | null = null;
    let disposed = false;
    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const scale = 1.1 / (sphere.radius || 1);
        model.scale.setScalar(scale);
        model.position.sub(sphere.center.clone().multiplyScalar(scale));
        scene.add(model);

        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
        }

        function render() {
          const dt = clock.getDelta();
          if (!prefersReducedMotion) {
            mixer?.update(dt);
            model.rotation.y += autoRotateSpeed;
          }
          renderer.render(scene, camera);
          raf = requestAnimationFrame(render);
        }
        render();
      },
      undefined,
      () => setFailed(true)
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [src, size, autoRotateSpeed]);

  if (failed) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={className ?? "shrink-0 overflow-hidden"}
      style={{ width: size, height: size }}
    />
  );
}
