export function isDemoMode(): boolean {
  const flag = import.meta.env.VITE_DEMO_MODE?.trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  return false
}
