import { useEffect, useRef } from 'react'
import { animate, createScope, stagger, splitText } from 'animejs'

export function AnimatedDropWhenTitle() {
  const rootRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const scope = createScope({ root })

    const splitter = splitText(root, {
      words: false,
      chars: { class: 'inline-block' },
    })

    for (const char of splitter.chars as HTMLElement[]) {
      char.classList.add('text-accent', 'cursor-default')
    }

    let isAnimating = true

    const animation = animate(splitter.chars, {
      y: [
        { to: '-2.75rem', ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 100 },
      ],
      rotate: {
        from: '-1turn',
        delay: 0,
      },
      delay: stagger(50),
      ease: 'inOutCirc',
      onComplete: () => {
        isAnimating = false
      },
    })

    const replay = () => {
      if (isAnimating) return
      isAnimating = true
      animation.restart()
    }

    root.addEventListener('mouseenter', replay)

    return () => {
      root.removeEventListener('mouseenter', replay)
      animation.cancel()
      splitter.revert()
      scope.revert()
    }
  }, [])

  return (
    <h1
      ref={rootRef}
      className="font-display text-accent mt-8 cursor-default overflow-visible text-4xl font-normal uppercase tracking-tight sm:mt-0 sm:text-5xl lg:text-6xl"
    >
      DropWhen
    </h1>
  )
}
