import { useTranslation } from '../i18n'
import { Alert, Button } from '@heroui/react'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const VARIANTS = {
  warning: { status: 'warning' as const, Icon: AlertTriangle },
  error: { status: 'danger' as const, Icon: AlertCircle },
  info: { status: 'accent' as const, Icon: Info },
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
  const { status, Icon } = VARIANTS[variant]

  return (
    <Alert status={status} className="items-center">
      <Alert.Indicator className="shrink-0">
        <Icon size={16} aria-hidden />
      </Alert.Indicator>
      <Alert.Content className="flex min-w-0 flex-1 flex-row items-center gap-2">
        <Alert.Description className="min-w-0 flex-1">{message}</Alert.Description>
        {onDismiss && (
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="shrink-0"
            onPress={onDismiss}
            aria-label={ui.a11y.dismiss}
          >
            <X size={14} />
          </Button>
        )}
      </Alert.Content>
    </Alert>
  )
}
