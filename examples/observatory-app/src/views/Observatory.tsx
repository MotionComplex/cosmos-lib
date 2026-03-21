/**
 * Observatory — Main dashboard showing real-time Sun, Moon, and sky data.
 *
 * cosmos-lib docs used in this file:
 * - Sun.position, Sun.twilight, Sun.equationOfTime → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/sun-moon-eclipse.md#sun Sun API docs}
 * - Moon.position, Moon.phase, Moon.riseTransitSet  → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/sun-moon-eclipse.md#moon Moon API docs}
 * - AstroMath.equatorialToHorizontal, toJulian, j2000Days, lst → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md Math API docs}
 * - Eclipse.nextSolar, Eclipse.nextLunar             → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/sun-moon-eclipse.md#eclipse Eclipse API docs}
 * - Data.getActiveShowers, Data.all                   → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md Data API docs}
 *
 * Conceptual guide for coordinate transforms used here:
 * → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/guides/coordinate-systems.md Coordinate Systems Guide}
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, AstroMath, Data, Eclipse, Events } from 'cosmos-lib'
import { useMoonPhase, useTwilight, useWhatsUp } from 'cosmos-lib/react'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { MoonPhaseIcon } from '../components/MoonPhaseIcon'
import { formatTime } from '../utils/formatTime'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './Observatory.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'Sun', functions: ['position', 'twilight', 'equationOfTime'], description: 'Computes the Sun\'s coordinates for the altitude/azimuth display, sunrise/sunset/twilight times, and the equation of time correction.', docsPath: 'docs/api/sun-moon-eclipse.md#sun' },
  { module: 'Moon', functions: ['position', 'phase', 'riseTransitSet'], description: 'Provides the Moon\'s sky position, current phase name and illumination percentage, and moonrise/moonset times.', docsPath: 'docs/api/sun-moon-eclipse.md#moon' },
  { module: 'AstroMath', functions: ['equatorialToHorizontal', 'toJulian', 'j2000Days', 'lst'], description: 'Converts RA/Dec to altitude/azimuth for the observer, computes Julian Date and J2000 days for the time cards, and Local Sidereal Time.', docsPath: 'docs/api/math.md' },
  { module: 'Eclipse', functions: ['nextSolar', 'nextLunar'], description: 'Finds the next upcoming solar or lunar eclipse to display in the eclipse preview card.', docsPath: 'docs/api/sun-moon-eclipse.md#eclipse' },
  { module: 'Data', functions: ['getActiveShowers', 'all'], description: 'Retrieves currently active meteor showers and the full object catalog to find bright objects visible above the horizon.', docsPath: 'docs/api/data.md' },
  { module: 'Planner', functions: ['whatsUp'], description: 'Returns the brightest objects currently above the horizon, sorted by altitude, with moon interference scoring.', docsPath: 'docs/api/planner.md' },
  { module: 'React Hooks', functions: ['useMoonPhase', 'useTwilight', 'useWhatsUp'], description: 'Reactive hooks replacing manual useMemo + API calls for moon phase, twilight times, and visible objects.', docsPath: 'docs/api/react.md' },
]

const DOCS_GUIDES = [
  { label: 'Coordinate Systems', path: 'docs/guides/coordinate-systems.md' },
]

function formatDeg(deg: number) {
  return `${deg.toFixed(1)}°`
}

export function Observatory() {
  const { observer } = useObserverCtx()
  const now = useNow(5000)
  const navigate = useNavigate()

  // ── React hooks from cosmos-lib/react ─────────────────────────────────
  const moonPhase = useMoonPhase(undefined, 5000)
  const twilight = useTwilight(observer, now)
  const whatsUp = useWhatsUp({ ...observer, date: now }, { minAltitude: 10, magnitudeLimit: 4, limit: 6 }, 10_000)

  const data = useMemo(() => {
    const obs = { ...observer, date: now }

    // Sun position — docs: docs/api/sun-moon-eclipse.md#sun
    const sunPos = Sun.position(now)
    const sunHoriz = AstroMath.equatorialToHorizontal(
      { ra: sunPos.ra, dec: sunPos.dec },
      obs
    )

    // Moon position & rise/set — docs: docs/api/sun-moon-eclipse.md#moon
    const moonPos = Moon.position(now)
    const moonHoriz = AstroMath.equatorialToHorizontal(
      { ra: moonPos.ra, dec: moonPos.dec },
      obs
    )
    const moonRTS = Moon.riseTransitSet(obs)

    // Astronomical time calculations — docs: docs/api/math.md#time
    const jd = AstroMath.toJulian(now)
    const j2k = AstroMath.j2000Days(now)

    // Local Sidereal Time — docs: docs/api/math.md#sidereal-time
    const lst = AstroMath.lst(now, observer.lng)
    const siderealH = Math.floor(lst / 15)
    const siderealM = Math.floor((lst / 15 - siderealH) * 60)
    const siderealTime = `${String(siderealH).padStart(2, '0')}:${String(siderealM).padStart(2, '0')}`

    // Equation of Time — docs: docs/api/sun-moon-eclipse.md#sunequationoftime
    const eot = Sun.equationOfTime(now)

    // Eclipse prediction — docs: docs/api/sun-moon-eclipse.md#eclipse
    const nextEclipse = Eclipse.nextSolar(now) || Eclipse.nextLunar(now)

    // Active meteor showers — docs: docs/api/data.md#datagetactiveshowers
    const activeShowers = Data.getActiveShowers(now)

    return {
      sunPos, sunHoriz, moonPos, moonHoriz, moonRTS,
      jd, j2k, lst, siderealTime, eot, nextEclipse, activeShowers,
      isDark: sunHoriz.alt < -6,
    }
  }, [observer, now])

  const skyCondition = data.sunHoriz.alt > 0 ? 'Day' :
    data.sunHoriz.alt > -6 ? 'Civil Twilight' :
    data.sunHoriz.alt > -12 ? 'Nautical Twilight' :
    data.sunHoriz.alt > -18 ? 'Astronomical Twilight' : 'Night'

  return (
    <div className={styles.page}>
      {/* Hero section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.greeting}>{skyCondition}</p>
          <h1 className={styles.title}>Observatory</h1>
          <p className={styles.subtitle}>
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            <span className={styles.dot}>·</span>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.moonHero} role="button" tabIndex={0} onClick={() => navigate('/moon')} onKeyDown={e => e.key === 'Enter' && navigate('/moon')}>
            <MoonPhaseIcon phase={moonPhase.phase} size={80} />
            <div className={styles.moonLabel}>
              <span className={styles.phaseName}>{moonPhase.name.replace(/-/g, ' ')}</span>
              <span className={styles.illumination}>{(moonPhase.illumination * 100).toFixed(0)}% illuminated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Time cards */}
      <section className={`${styles.timeRow} stagger-grid`}>
        <div className={styles.timeCard}>
          <span className={styles.timeLabel}>Julian Date</span>
          <span className={styles.timeValue}>{data.jd.toFixed(4)}</span>
        </div>
        <div className={styles.timeCard}>
          <span className={styles.timeLabel}>J2000 Days</span>
          <span className={styles.timeValue}>{data.j2k.toFixed(4)}</span>
        </div>
        <div className={styles.timeCard}>
          <span className={styles.timeLabel}>Sidereal Time</span>
          <span className={styles.timeValue}>{data.siderealTime}</span>
        </div>
        <div className={styles.timeCard}>
          <span className={styles.timeLabel}>Eq. of Time</span>
          <span className={styles.timeValue}>{data.eot > 0 ? '+' : ''}{data.eot.toFixed(1)}m</span>
        </div>
      </section>

      {/* Sun & Moon */}
      <section className={styles.dualGrid}>
        <div className={styles.bodyCard}>
          <div className={styles.bodyHeader}>
            <div className={styles.bodyIcon} style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>☉</div>
            <div>
              <h2 className={styles.bodyName}>Sun</h2>
              <span className={styles.bodyType}>Alt {formatDeg(data.sunHoriz.alt)} · Az {formatDeg(data.sunHoriz.az)}</span>
            </div>
          </div>
          <div className={styles.bodyStats}>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Sunrise</span>
              <span className={styles.bodyStatValue}>{formatTime(twilight.sunrise)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Solar Noon</span>
              <span className={styles.bodyStatValue}>{formatTime(twilight.solarNoon)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Sunset</span>
              <span className={styles.bodyStatValue}>{formatTime(twilight.sunset)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Civil Dusk</span>
              <span className={styles.bodyStatValue}>{formatTime(twilight.civilDusk)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Astro Dusk</span>
              <span className={styles.bodyStatValue}>{formatTime(twilight.astronomicalDusk)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Distance</span>
              <span className={styles.bodyStatValue}>{data.sunPos.distance_AU.toFixed(4)} AU</span>
            </div>
          </div>
        </div>

        <div className={styles.bodyCard} role="button" tabIndex={0} onClick={() => navigate('/moon')} onKeyDown={e => e.key === 'Enter' && navigate('/moon')} style={{ cursor: 'pointer' }}>
          <div className={styles.bodyHeader}>
            <div className={styles.bodyIcon} style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>☽</div>
            <div>
              <h2 className={styles.bodyName}>Moon</h2>
              <span className={styles.bodyType}>Alt {formatDeg(data.moonHoriz.alt)} · Az {formatDeg(data.moonHoriz.az)}</span>
            </div>
          </div>
          <div className={styles.bodyStats}>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Phase</span>
              <span className={styles.bodyStatValue}>{moonPhase.name.replace(/-/g, ' ')}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Age</span>
              <span className={styles.bodyStatValue}>{moonPhase.age.toFixed(1)} days</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Moonrise</span>
              <span className={styles.bodyStatValue}>{formatTime(data.moonRTS.rise)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Moonset</span>
              <span className={styles.bodyStatValue}>{formatTime(data.moonRTS.set)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Distance</span>
              <span className={styles.bodyStatValue}>{(data.moonPos.distance_km).toLocaleString()} km</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Parallax</span>
              <span className={styles.bodyStatValue}>{data.moonPos.parallax.toFixed(3)}°</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tonight's highlights — powered by Planner.whatsUp */}
      {whatsUp.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Visible Now</h2>
          <div className={`${styles.objectGrid} stagger-grid`}>
            {whatsUp.map((v, i) => (
                <div
                  key={`${v.object.id}-${i}`}
                  className={styles.objectCard}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/object/${v.object.id}`)}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/object/${v.object.id}`)}
                >
                  <div className={styles.objectTop}>
                    <span className={styles.objectType}>{v.object.type}</span>
                    {v.object.magnitude != null && (
                      <span className={styles.objectMag}>mag {v.object.magnitude.toFixed(1)}</span>
                    )}
                  </div>
                  <h3 className={styles.objectName}>{v.object.name}</h3>
                  <p className={styles.objectPos}>
                    Alt {v.alt.toFixed(1)}° · Az {v.az.toFixed(1)}°
                    {v.moonInterference > 0.3 && (
                      <span title={`Moon ${v.moonSeparation?.toFixed(0)}° away`}> · ☽ {(v.moonInterference * 100).toFixed(0)}%</span>
                    )}
                  </p>
                </div>
            ))}
          </div>
        </section>
      )}

      {/* Active meteor showers */}
      {data.activeShowers.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Meteor Showers</h2>
          <div className={styles.showerGrid}>
            {data.activeShowers.map(shower => (
              <div key={shower.id} className={styles.showerCard}>
                <div className={styles.showerHeader}>
                  <h3 className={styles.showerName}>{shower.name}</h3>
                  <span className={styles.showerZHR}>ZHR {shower.zhr}</span>
                </div>
                <div className={styles.showerMeta}>
                  <span>Peak: {shower.peakDate}</span>
                  <span>·</span>
                  <span>{shower.speed} km/s</span>
                  {shower.parentBody && <><span>·</span><span>{shower.parentBody}</span></>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next eclipse */}
      {data.nextEclipse && (
        <section className={styles.section}>
          <div className={styles.eclipseCard} role="button" tabIndex={0} onClick={() => navigate('/eclipses')} onKeyDown={e => e.key === 'Enter' && navigate('/eclipses')}>
            <div className={styles.eclipseIcon}>◐</div>
            <div>
              <h3 className={styles.eclipseTitle}>
                Next {data.nextEclipse.subtype} {data.nextEclipse.type} eclipse
              </h3>
              <p className={styles.eclipseDate}>
                {data.nextEclipse.date.toLocaleDateString(undefined, {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
                <span className={styles.dot}>·</span>
                Magnitude {data.nextEclipse.magnitude.toFixed(3)}
              </p>
            </div>
          </div>
        </section>
      )}
      {/* Upcoming events preview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Upcoming Events
          <span style={{ fontSize: '13px', fontWeight: 400, opacity: 0.5, marginLeft: '8px', cursor: 'pointer' }} onClick={() => navigate('/events')}>
            View all →
          </span>
        </h2>
        <div className={styles.showerGrid}>
          {Events.nextEvents({ ...observer, date: now }, { days: 60, limit: 3 }).map((event, i) => (
            <div key={`${event.category}-${i}`} className={styles.showerCard} role="button" tabIndex={0} onClick={() => navigate('/events')} onKeyDown={e => e.key === 'Enter' && navigate('/events')}>
              <div className={styles.showerHeader}>
                <h3 className={styles.showerName}>{event.title}</h3>
                <span className={styles.showerZHR} style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>{event.category}</span>
              </div>
              <div className={styles.showerMeta}>
                <span>{event.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                {event.detail && <><span>·</span><span>{event.detail}</span></>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <DocsReference entries={DOCS_ENTRIES} guides={DOCS_GUIDES} />
    </div>
  )
}
