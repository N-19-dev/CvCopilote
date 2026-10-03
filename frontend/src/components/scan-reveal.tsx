"use client";

import { motion, type Variants } from "framer-motion";
import { useRef, type ComponentProps, type ReactNode } from "react";

import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, clipPath: "inset(0% 0% 100% 0%)" },
  show: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const scanBarVariants: Variants = {
  hidden: { opacity: 0, top: "0%" },
  show: {
    opacity: [0, 1, 1, 0],
    top: ["0%", "0%", "100%", "100%"],
    transition: { duration: 0.55, times: [0, 0.05, 0.9, 1], ease: EASE_OUT_EXPO },
  },
};

export function ScanGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function ScanItem({
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof motion.div>, "variants"> & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className={cn("relative", className)}
      // Le clip-path de l'animation d'entrée reste posé sur l'élément une
      // fois l'animation finie (Framer ne le réinitialise pas) — n'importe
      // quel enfant positionné en absolu qui déborde de cette boîte (ex. un
      // logo flottant) se retrouve alors rogné en permanence. On le retire
      // une fois le reveal terminé, il ne sert plus à rien après coup.
      onAnimationComplete={(definition) => {
        if (definition === "show" && ref.current) {
          ref.current.style.clipPath = "none";
        }
      }}
      {...props}
    >
      {children}
      <motion.span
        aria-hidden
        variants={scanBarVariants}
        className="pointer-events-none absolute inset-x-0 h-px bg-[var(--tint,var(--signal))]/70"
        style={{ boxShadow: "0 0 8px 1px var(--tint, var(--signal))" }}
      />
    </motion.div>
  );
}
