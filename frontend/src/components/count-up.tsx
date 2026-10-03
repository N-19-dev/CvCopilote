"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

import { EASE_OUT_EXPO } from "@/lib/motion";

export function CountUp({
  value,
  duration = 0.6,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toString());

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: EASE_OUT_EXPO });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
