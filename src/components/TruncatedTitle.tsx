import { Tooltip } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'

export function TruncatedTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function checkTruncation() {
      const el = ref.current
      if (!el) return
      setIsTruncated(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
    }

    checkTruncation()

    const observer = new ResizeObserver(checkTruncation)
    observer.observe(element)

    return () => observer.disconnect()
  }, [title])

  const heading = (
    <h3
      ref={ref}
      className="line-clamp-2 min-w-0 text-base font-semibold sm:line-clamp-1"
    >
      {title}
    </h3>
  )

  if (!isTruncated) {
    return <div className="min-w-0 max-w-full">{heading}</div>
  }

  return (
    <Tooltip delay={0}>
      <div className="min-w-0 max-w-full cursor-default">{heading}</div>
      <Tooltip.Content>
        <p className="max-w-xs">{title}</p>
      </Tooltip.Content>
    </Tooltip>
  )
}
