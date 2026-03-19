interface MoonPhaseIconProps {
  phase: number // 0-1
  size?: number
}

export function MoonPhaseIcon({ phase, size = 64 }: MoonPhaseIconProps) {
  // phase: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
  const r = size / 2 - 2
  const cx = size / 2
  const cy = size / 2

  // Calculate the terminator curve
  const illuminatedFromRight = phase < 0.5

  // Normalize phase to 0-0.5 range for the curve calculation
  const t = phase <= 0.5 ? phase : 1 - phase
  // sweepFactor goes from -1 (new) through 0 (quarter) to 1 (full)
  const sweepFactor = (t * 4) - 1

  const terminatorX = sweepFactor * r

  // At new moon (phase~0) or full moon (phase~0.5), the arc degenerates
  const isNewMoon = t < 0.01
  const isFullMoon = t > 0.49

  let d: string = ''
  if (!isNewMoon && !isFullMoon) {
    if (illuminatedFromRight) {
      d = `M ${cx} ${cy - r}
           A ${r} ${r} 0 0 1 ${cx} ${cy + r}
           A ${Math.abs(terminatorX)} ${r} 0 0 ${sweepFactor >= 0 ? 1 : 0} ${cx} ${cy - r} Z`
    } else {
      d = `M ${cx} ${cy - r}
           A ${r} ${r} 0 0 0 ${cx} ${cy + r}
           A ${Math.abs(terminatorX)} ${r} 0 0 ${sweepFactor >= 0 ? 0 : 1} ${cx} ${cy - r} Z`
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Moon phase: ${Math.round(t * 200)}% illuminated`}>
      {/* Dark side */}
      <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      {/* Illuminated side */}
      {isFullMoon && <circle cx={cx} cy={cy} r={r} fill="#e8e4d4" opacity={0.95} />}
      {!isNewMoon && !isFullMoon && <path d={d} fill="#e8e4d4" opacity={0.95} />}
      {/* Subtle surface texture */}
      <circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.12} fill="rgba(0,0,0,0.08)" />
      <circle cx={cx + r * 0.2} cy={cy + r * 0.3} r={r * 0.08} fill="rgba(0,0,0,0.06)" />
      <circle cx={cx + r * 0.1} cy={cy - r * 0.4} r={r * 0.06} fill="rgba(0,0,0,0.05)" />
    </svg>
  )
}
