export function ScrollProgress() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px bg-foreground/10">
      <div
        className="h-full origin-left bg-signal"
        style={{
          transform: "scaleX(var(--scroll-progress, 0))",
          boxShadow: "0 0 8px 1px var(--signal)",
        }}
      />
    </div>
  );
}
