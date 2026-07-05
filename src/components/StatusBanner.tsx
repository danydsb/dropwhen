import { useTranslation } from '../i18n'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const VARIANTS = {
  warning: {
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    Icon: AlertTriangle,
  },
  error: {
    className: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
    Icon: AlertCircle,
  },
  info: {
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
    Icon: Info,
  },
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
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${className}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label={ui.a11y.dismiss}>
          <X size={16} />
        </button>
      )}
    </div>
  )
}
