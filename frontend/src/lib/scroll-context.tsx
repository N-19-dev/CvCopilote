"use client";

import type Lenis from "lenis";
import { createContext, useContext, type RefObject } from "react";

export const ScrollContext = createContext<{
  containerRef: RefObject<HTMLDivElement | null>;
  lenisRef: RefObject<Lenis | null>;
} | null>(null);

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScrollContext must be used within ScrollContext.Provider");
  return ctx;
}
