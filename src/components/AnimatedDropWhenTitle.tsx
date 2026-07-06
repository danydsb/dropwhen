import { useEffect, useRef } from 'react'
import { animate, createScope, stagger, splitText } from 'animejs'

const TITLE_GRADIENT =
  'bg-linear-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent'

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
      char.classList.add(...TITLE_GRADIENT.split(' '), 'cursor-default')
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
      className={`cursor-default overflow-visible text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${TITLE_GRADIENT}`}
    >
      DropWhen
    </h1>
  )
}
