export function RelaxBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-background"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 15% 0%, color-mix(in oklch, var(--accent) 12%, transparent), transparent 55%), radial-gradient(ellipse at 85% 10%, color-mix(in oklch, var(--warning) 10%, transparent), transparent 50%)',
      }}
      aria-hidden
    />
  )
}
