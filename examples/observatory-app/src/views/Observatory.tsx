import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, AstroMath, Data, Eclipse } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { MoonPhaseIcon } from '../components/MoonPhaseIcon'
import { formatTime } from '../utils/formatTime'
import styles from './Observatory.module.css'

function formatDeg(deg: number) {
  return `${deg.toFixed(1)}°`
}

export function Observatory() {
  const { observer } = useObserverCtx()
  const now = useNow(5000)
  const navigate = useNavigate()

  const data = useMemo(() => {
    const obs = { ...observer, date: now }
    const sunPos = Sun.position(now)
    const sunHoriz = AstroMath.equatorialToHorizontal(
      { ra: sunPos.ra, dec: sunPos.dec },
      obs
    )
    const twilight = Sun.twilight(obs)
    const moonPos = Moon.position(now)
    const moonHoriz = AstroMath.equatorialToHorizontal(
      { ra: moonPos.ra, dec: moonPos.dec },
      obs
    )
    const moonPhase = Moon.phase(now)
    const moonRTS = Moon.riseTransitSet(obs)
    const jd = AstroMath.toJulian(now)
    const j2k = AstroMath.j2000Days(now)
    const lst = AstroMath.lst(now, observer.lng)
    const siderealH = Math.floor(lst / 15)
    const siderealM = Math.floor((lst / 15 - siderealH) * 60)
    const siderealTime = `${String(siderealH).padStart(2, '0')}:${String(siderealM).padStart(2, '0')}`
    const eot = Sun.equationOfTime(now)
    const nextEclipse = Eclipse.nextSolar(now) || Eclipse.nextLunar(now)
    const activeShowers = Data.getActiveShowers(now)

    // What's visible tonight - get bright objects above horizon
    const brightObjects = Data.all()
      .filter(o => o.ra != null && o.dec != null && o.magnitude != null)
      .sort((a, b) => (a.magnitude ?? 99) - (b.magnitude ?? 99))
      .slice(0, 60)
      .map(o => {
        const hz = AstroMath.equatorialToHorizontal({ ra: o.ra!, dec: o.dec! }, obs)
        return { obj: o, hz }
      })
      .filter(o => o.hz.alt > 10)
      .slice(0, 6)

    return {
      sunPos, sunHoriz, twilight, moonPos, moonHoriz, moonPhase, moonRTS,
      jd, j2k, lst, siderealTime, eot, nextEclipse, activeShowers,
      brightObjects, isDark: sunHoriz.alt < -6,
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
            <MoonPhaseIcon phase={data.moonPhase.phase} size={80} />
            <div className={styles.moonLabel}>
              <span className={styles.phaseName}>{data.moonPhase.name.replace(/-/g, ' ')}</span>
              <span className={styles.illumination}>{(data.moonPhase.illumination * 100).toFixed(0)}% illuminated</span>
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
              <span className={styles.bodyStatValue}>{formatTime(data.twilight.sunrise)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Solar Noon</span>
              <span className={styles.bodyStatValue}>{formatTime(data.twilight.solarNoon)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Sunset</span>
              <span className={styles.bodyStatValue}>{formatTime(data.twilight.sunset)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Civil Dusk</span>
              <span className={styles.bodyStatValue}>{formatTime(data.twilight.civilDusk)}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Astro Dusk</span>
              <span className={styles.bodyStatValue}>{formatTime(data.twilight.astronomicalDusk)}</span>
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
              <span className={styles.bodyStatValue}>{data.moonPhase.name.replace(/-/g, ' ')}</span>
            </div>
            <div className={styles.bodyStat}>
              <span className={styles.bodyStatLabel}>Age</span>
              <span className={styles.bodyStatValue}>{data.moonPhase.age.toFixed(1)} days</span>
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

      {/* Tonight's highlights */}
      {data.brightObjects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Visible Now</h2>
          <div className={`${styles.objectGrid} stagger-grid`}>
            {data.brightObjects.map(({ obj, hz }) => (
                <div
                  key={obj.id}
                  className={styles.objectCard}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/object/${obj.id}`)}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/object/${obj.id}`)}
                >
                  <div className={styles.objectTop}>
                    <span className={styles.objectType}>{obj.type}</span>
                    {obj.magnitude != null && (
                      <span className={styles.objectMag}>mag {obj.magnitude.toFixed(1)}</span>
                    )}
                  </div>
                  <h3 className={styles.objectName}>{obj.name}</h3>
                  <p className={styles.objectPos}>
                    Alt {hz.alt.toFixed(1)}° · Az {hz.az.toFixed(1)}°
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
    </div>
  )
}
