import { useTranslation } from '../i18n'
import { AnimatedDropWhenTitle } from './AnimatedDropWhenTitle'
import { AnimatedShinyText } from './ui/animated-shiny-text'

export function HeroSection() {
  const { ui } = useTranslation()

  return (
    <section className="overflow-visible text-center">
      <AnimatedDropWhenTitle />
      <AnimatedShinyText
        shimmerWidth={200}
        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:mt-8 sm:text-lg"
      >
        {ui.hero.subtitle}
      </AnimatedShinyText>
    </section>
  )
}
