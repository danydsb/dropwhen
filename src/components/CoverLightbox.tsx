import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import { useTranslation } from '../i18n'
import 'yet-another-react-lightbox/styles.css'

export function CoverLightbox({
  imageUrl,
  title,
  objectFit,
}: {
  imageUrl: string
  title: string
  objectFit: 'object-contain' | 'object-cover'
}) {
  const { ui } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group focus-visible:ring-accent relative h-full w-full cursor-zoom-in overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`${ui.card.enlargeCover}: ${title}`}
      >
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className={`h-full w-full bg-transparent transition group-hover:opacity-90 ${objectFit}`}
        />
      </button>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: imageUrl, alt: title }]}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
      />
    </>
  )
}
