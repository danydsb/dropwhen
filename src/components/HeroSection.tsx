import { useTranslation } from '../i18n'
import { AnimatedDropWhenTitle } from './AnimatedDropWhenTitle'

export function HeroSection() {
  const { ui } = useTranslation()

  return (
    <section className="overflow-visible text-center">
      <AnimatedDropWhenTitle />
      <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted sm:mt-8 sm:text-lg">
        {ui.hero.subtitle}
      </p>
    </section>
  )
}
