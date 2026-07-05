import { useTranslation } from '../i18n'
import { AnimatedShinyText } from './ui/animated-shiny-text'

export function HeroSection() {
  const { ui } = useTranslation()

  return (
    <section className="text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
        <span className="bg-linear-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
          DropWhen
        </span>
      </h1>
      <AnimatedShinyText
        shimmerWidth={200}
        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:mt-8 sm:text-lg"
      >
        {ui.hero.subtitle}
      </AnimatedShinyText>
    </section>
  )
}
