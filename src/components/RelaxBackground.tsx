import { useEffect, useMemo, useState } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

function buildOptions(): ISourceOptions {
  return {
    fullScreen: false,
    detectRetina: true,
    fpsLimit: 60,
    particles: {
      number: { value: 24, density: { enable: true } },
      color: { value: ['#7828c8', '#a855f7', '#f5a524', '#e4e4e7'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.08, max: 0.22 },
        animation: { enable: true, speed: 0.3, sync: false },
      },
      size: { value: { min: 48, max: 128 } },
      move: {
        enable: true,
        speed: 0.4,
        direction: 'none',
        random: true,
        outModes: { default: 'out' },
      },
    },
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: { enable: true, mode: 'bubble' },
        resize: { enable: true },
      },
      modes: {
        bubble: { distance: 100, size: 6, duration: 2, opacity: 0.15 },
      },
    },
  }
}

function StaticRelaxBackground() {
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

function AnimatedRelaxBackground() {
  const options = useMemo(() => buildOptions(), [])

  return (
    <ParticlesProvider init={loadSlim}>
      <Particles
        id="relax-background"
        className="pointer-events-none fixed inset-0 -z-10"
        options={options}
      />
    </ParticlesProvider>
  )
}

export function RelaxBackground() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!reducedMotion.matches)
    update()
    reducedMotion.addEventListener('change', update)
    return () => reducedMotion.removeEventListener('change', update)
  }, [])

  return enabled ? <AnimatedRelaxBackground /> : <StaticRelaxBackground />
}
