/**
 * useObserver — Manages the observer's geographic location and time.
 *
 * Provides an ObserverParams object (lat, lng, date) that is required by
 * most cosmos-lib functions that compute topocentric positions:
 * - AstroMath.equatorialToHorizontal(eq, obs)
 * - AstroMath.riseTransitSet(eq, obs)
 * - Sun.twilight(obs), Moon.riseTransitSet(obs)
 *
 * - ObserverParams type → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/types.md#coordinates Type Reference}
 * - How observer location affects calculations → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/guides/coordinate-systems.md#horizontal-altitudeazimuth Coordinate Systems Guide}
 */
import { useState, useEffect, useCallback } from 'react'
import type { ObserverParams } from 'cosmos-lib'

const STORAGE_KEY = 'cosmos-observer'

const DEFAULT_OBSERVER: ObserverParams = {
  lat: 51.4769,  // Greenwich
  lng: -0.0005,
  date: new Date(),
}

export function useObserver() {
  const [observer, setObserverState] = useState<ObserverParams>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...parsed, date: new Date() }
      }
    } catch { /* ignore */ }
    return { ...DEFAULT_OBSERVER, date: new Date() }
  })

  const setObserver = useCallback((update: Partial<ObserverParams>) => {
    setObserverState(prev => {
      const next = { ...prev, ...update }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: next.lat, lng: next.lng }))
      return next
    })
  }, [])

  // Update date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setObserverState(prev => ({ ...prev, date: new Date() }))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Try to get user location on mount
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setObserver({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* use default */ },
        { timeout: 5000 }
      )
    }
  }, [setObserver])

  return { observer, setObserver }
}
