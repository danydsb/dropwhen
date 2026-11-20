import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarPlus, Check, ChevronLeft, ChevronRight, ExternalLink, FileText, Play, Share2, X } from 'lucide-react'
import { useTranslation } from '../i18n'
import type { ReleaseItem } from '../types'
import { daysUntil, formatDisplayDate, isFromTomorrowOrLater } from '../utils/dates'

function DetailLink({
  href,
  primary,
  children,
}: {
  href: string
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`mag-press inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-extrabold uppercase ${
        primary ? 'bg-(--mag-blue) text-white' : 'bg-white'
      }`}
    >
      {children}
    </a>
  )
}

export function ReleaseDetail({
  item,
  onClose,
  onAddToCalendar,
}: {
  item: ReleaseItem | null
  onClose: () => void
  onAddToCalendar: (item: ReleaseItem) => void
}) {
  const { ui } = useTranslation()
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const images = item?.images?.length ? item.images : item?.imageUrl ? [item.imageUrl] : []
  const hasGallery = Boolean(item?.images?.length)

  const go = useCallback(
    (delta: number) => {
      if (images.length < 2) return
      setIndex((current) => (current + delta + images.length) % images.length)
    },
    [images.length],
  )

  useEffect(() => {
    setIndex(0)
    setCopied(false)
  }, [item?.id])

  useEffect(() => {
    if (!item) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose, go])

  if (!item) return null

  const days = item.dateCertainty === 'confirmed' ? daysUntil(item.releaseDate) : undefined
  const canAddToCalendar =
    item.dateCertainty === 'confirmed' && isFromTomorrowOrLater(item.releaseDate)
  const shareUrl = item.notesUrl ?? item.steamUrl ?? item.sourceUrl
  const meta = [item.parentTitle, item.developer, item.genres?.join(', '), item.platformOrPublisher]
    .filter(Boolean)
    .join(' — ')

  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (permissions, non-secure context).
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="grid max-h-[calc(100dvh-24px)] w-full max-w-[1100px] overflow-auto border-3 border-(--mag-ink) bg-white shadow-[8px_8px_0_var(--mag-ink)] md:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]"
      >
        <div className="relative flex min-w-0 flex-col bg-black">
          {images.length > 0 ? (
            <>
              <img
                key={images[index]}
                src={images[index]}
                alt=""
                className={`aspect-video max-h-[62vh] w-full bg-black md:aspect-auto md:max-h-none md:min-h-[360px] md:flex-1 ${
                  hasGallery ? 'object-contain md:object-cover' : 'object-contain p-4'
                }`}
              />
              {images.length > 1 && (
                <>
                  <span className="absolute top-2.5 left-2.5 bg-black/60 px-2 py-0.5 font-mono text-xs font-semibold text-white">
                    {index + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={ui.mag.previousImage}
                    className="absolute top-1/2 left-2.5 flex size-10 -translate-y-1/2 items-center justify-center border-2 border-(--mag-ink) bg-(--mag-yellow)"
                  >
                    <ChevronLeft size={22} strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={ui.mag.nextImage}
                    className="absolute top-1/2 right-2.5 flex size-10 -translate-y-1/2 items-center justify-center border-2 border-(--mag-ink) bg-(--mag-yellow)"
                  >
                    <ChevronRight size={22} strokeWidth={3} />
                  </button>
                  <div className="flex gap-1.5 overflow-x-auto bg-[#111] p-2">
                    {images.map((src, thumbIndex) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setIndex(thumbIndex)}
                        aria-label={`${thumbIndex + 1} / ${images.length}`}
                        className={`h-14 flex-none border-2 ${
                          thumbIndex === index
                            ? 'border-(--mag-yellow) opacity-100'
                            : 'border-transparent opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img
                          src={src.replace('/t_1080p/', '/t_screenshot_med/')}
                          alt=""
                          loading="lazy"
                          className="aspect-video h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center font-mono text-sm text-neutral-400">
              {ui.mag.noImages}
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-3 p-5 sm:p-6">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={ui.mag.close}
            className="absolute top-2.5 right-2.5 p-1"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          <div className="flex items-start gap-3.5 pr-8">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="aspect-3/4 w-[76px] flex-none border-3 border-(--mag-ink) object-cover"
              />
            )}
            <div className="min-w-0">
              <h2 className="font-anton text-[30px] leading-[0.95] uppercase sm:text-[34px]">
                {item.title}
              </h2>
              <p className="mt-1.5 font-bold text-(--mag-blue)">
                {item.ongoing && item.endDate
                  ? ui.content.ongoingUntil(formatDisplayDate(item.endDate))
                  : item.ongoing && item.releaseDate
                    ? ui.content.ongoingSince(formatDisplayDate(item.releaseDate))
                    : item.category === 'content' && !item.releaseDate && !item.ongoing
                      ? ui.content.tbdLong
                      : item.releaseDateLabel}
                {days !== undefined && days > 0 ? ` · ${ui.mag.countdown(days)}` : ''}
              </p>
            </div>
          </div>

          {meta && <p className="text-[13px] text-(--mag-muted)">{meta}</p>}
          {item.summary && (
            <p className="line-clamp-[9] text-sm leading-relaxed">{item.summary}</p>
          )}
          {item.hypes ? (
            <p className="text-[13px] text-(--mag-muted)">{ui.mag.followers(item.hypes)}</p>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {item.notesUrl && (
              <DetailLink href={item.notesUrl} primary>
                <FileText size={14} aria-hidden />
                {item.notesLabel ?? ui.content.patchNotes}
              </DetailLink>
            )}
            {item.trailerUrl && (
              <DetailLink href={item.trailerUrl} primary={!item.notesUrl}>
                <Play size={14} fill="currentColor" aria-hidden />
                {ui.mag.trailer}
              </DetailLink>
            )}
            {item.steamUrl ? (
              <DetailLink href={item.steamUrl}>
                {ui.mag.steam}
                <ExternalLink size={13} aria-hidden />
              </DetailLink>
            ) : item.sourceUrl && item.sourceUrl !== item.notesUrl ? (
              <DetailLink href={item.sourceUrl}>
                {ui.mag.viewSource(item.source)}
                <ExternalLink size={13} aria-hidden />
              </DetailLink>
            ) : null}
            {canAddToCalendar && (
              <button
                type="button"
                onClick={() => onAddToCalendar(item)}
                className="mag-press inline-flex items-center gap-1.5 bg-(--mag-yellow) px-3 py-2 text-[13px] font-extrabold uppercase"
              >
                <CalendarPlus size={14} aria-hidden />
                {ui.mag.addToCalendar}
              </button>
            )}
            {shareUrl && (
              <button
                type="button"
                onClick={copyLink}
                className="mag-press inline-flex items-center gap-1.5 bg-white px-3 py-2 text-[13px] font-extrabold uppercase"
              >
                {copied ? <Check size={14} aria-hidden /> : <Share2 size={14} aria-hidden />}
                {copied ? ui.card.linkCopied : ui.card.copyLink}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
