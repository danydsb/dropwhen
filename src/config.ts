export function isDemoMode(): boolean {
  const flag = import.meta.env.VITE_DEMO_MODE?.trim().toLowerCase()
  if (flag === 'false') return false
  if (flag === 'true') return true
  return true
}
