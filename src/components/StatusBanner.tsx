import { useTranslation } from '../i18n'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const VARIANTS = {
  warning: { className: 'bg-(--mag-yellow)', Icon: AlertTriangle },
  error: { className: 'bg-(--mag-pink) text-white', Icon: AlertCircle },
  info: { className: 'bg-white', Icon: Info },
}

export function StatusBanner({
  message,
  variant = 'info',
  onDismiss,
}: {
  message: string
  variant?: keyof typeof VARIANTS
  onDismiss?: () => void
}) {
  const { ui } = useTranslation()
  const { className, Icon } = VARIANTS[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-center gap-2.5 border-3 border-(--mag-ink) px-3 py-2 text-sm font-semibold ${className}`}
    >
      <Icon size={16} className="shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label={ui.a11y.dismiss} className="shrink-0">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
