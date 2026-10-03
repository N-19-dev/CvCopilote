"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { EASE_OUT_EXPO } from "@/lib/motion";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, [data-cursor]";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useHasFinePointer() {
  return useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false
  );
}

export function CursorField() {
  const frame = useRef(0);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.4 });
  const ready = useHasFinePointer();
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!ready) return;

    function handleMove(e: MouseEvent) {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`);
      });
      x.set(e.clientX);
      y.set(e.clientY);
    }
    function handleOver(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(INTERACTIVE_SELECTOR);
      setHovering(!!target);
      setLabel(target?.dataset.cursorLabel ?? null);
    }
    function handleDown() {
      setPressed(true);
    }
    function handleUp() {
      setPressed(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      cancelAnimationFrame(frame.current);
    };
  }, [ready, x, y]);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(600px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), color-mix(in oklch, var(--signal) 8%, transparent), transparent 70%)",
        }}
      />
      {ready && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center rounded-full border border-signal/70"
          style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
          animate={{
            width: hovering ? 60 : pressed ? 12 : 18,
            height: hovering ? 60 : pressed ? 12 : 18,
            backgroundColor: hovering
              ? "color-mix(in oklch, var(--signal) 14%, transparent)"
              : "color-mix(in oklch, var(--signal) 35%, transparent)",
            opacity: hovering ? 1 : 0.85,
          }}
          transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
        >
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[9px] tracking-[0.15em] whitespace-nowrap text-signal uppercase"
            >
              {label}
            </motion.span>
          )}
        </motion.div>
      )}
    </>
  );
}
