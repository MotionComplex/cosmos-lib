export function formatTime(d: Date | null | undefined) {
  if (!d) return '--:--'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
