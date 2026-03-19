/**
 * ObjectDetail — Detail view for any celestial object (star, planet, nebula, etc.).
 *
 * cosmos-lib docs used in this file:
 * - Data.get, Data.getByName, Data.nearby, Data.imageUrls → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md Data API docs}
 * - AstroMath.planetEcliptic           → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#astromathplanetecliptic Planetary Ephemeris docs}
 * - AstroMath.eclipticToEquatorial     → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#coordinate-transforms Coordinate Transform docs}
 * - AstroMath.equatorialToHorizontal   → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#astromathequatorialtohorizontal}
 * - AstroMath.riseTransitSet           → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#astromathriseTransitset Rise/Transit/Set docs}
 * - Sun.position, Sun.twilight, Sun.equationOfTime → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/sun-moon-eclipse.md#sun Sun API docs}
 * - Moon.position, Moon.phase, Moon.libration      → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/sun-moon-eclipse.md#moon Moon API docs}
 * - CONSTANTS.AU_TO_KM                 → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/constants-and-units.md#constants Constants docs}
 * - Units.formatRA, Units.formatDistance → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/constants-and-units.md#formatting Units docs}
 *
 * This view demonstrates the full coordinate pipeline for different object types:
 * → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/guides/coordinate-systems.md Coordinate Systems Guide}
 */
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Data, AstroMath, Units, Sun, Moon, CONSTANTS } from 'cosmos-lib'
import type { PlanetName } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { formatTime } from '../utils/formatTime'
import styles from './ObjectDetail.module.css'

const PLANET_NAMES = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

export function ObjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { observer } = useObserverCtx()
  const now = useNow(10000)

  const data = useMemo(() => {
    if (!id) return null

    // Look up by ID first, then by name — docs: docs/api/data.md#dataget
    const obj = Data.get(id) || Data.getByName(id)
    if (!obj) return null

    const obs = { ...observer, date: now }
    const isPlanet = PLANET_NAMES.includes(id.toLowerCase())
    const isSun = id === 'sun'
    const isMoon = id === 'moon'

    let ra = obj.ra
    let dec = obj.dec
    let extraInfo: Record<string, string> = {}

    if (isPlanet) {
      // Planet ephemeris: ecliptic → equatorial pipeline
      // docs: docs/api/math.md#astromathplanetecliptic
      const pos = AstroMath.planetEcliptic(id.toLowerCase() as PlanetName, now)
      const eq = AstroMath.eclipticToEquatorial({ lon: pos.lon, lat: pos.lat })
      ra = eq.ra
      dec = eq.dec
      extraInfo['Ecliptic Longitude'] = `${pos.lon.toFixed(4)}°`
      extraInfo['Ecliptic Latitude'] = `${pos.lat.toFixed(4)}°`
      extraInfo['Heliocentric Distance'] = `${pos.r.toFixed(4)} AU`
      extraInfo['Distance (km)'] = `${(pos.r * CONSTANTS.AU_TO_KM).toLocaleString()} km`
      extraInfo['Mean Anomaly'] = `${pos.M.toFixed(4)}°`
      extraInfo['True Anomaly'] = `${pos.nu.toFixed(4)}°`
    }

    if (isSun) {
      // Sun-specific data — docs: docs/api/sun-moon-eclipse.md#sun
      const sunPos = Sun.position(now)
      ra = sunPos.ra
      dec = sunPos.dec
      extraInfo['Distance'] = `${sunPos.distance_AU.toFixed(6)} AU`
      extraInfo['Ecliptic Longitude'] = `${sunPos.eclipticLon.toFixed(4)}°`
      const eot = Sun.equationOfTime(now)
      extraInfo['Equation of Time'] = `${eot > 0 ? '+' : ''}${eot.toFixed(2)} min`
      const twilight = Sun.twilight(obs)
      extraInfo['Sunrise'] = formatTime(twilight.sunrise)
      extraInfo['Solar Noon'] = formatTime(twilight.solarNoon)
      extraInfo['Sunset'] = formatTime(twilight.sunset)
      extraInfo['Civil Dawn'] = formatTime(twilight.civilDawn)
      extraInfo['Civil Dusk'] = formatTime(twilight.civilDusk)
      extraInfo['Nautical Dawn'] = formatTime(twilight.nauticalDawn)
      extraInfo['Nautical Dusk'] = formatTime(twilight.nauticalDusk)
      extraInfo['Astro Dawn'] = formatTime(twilight.astronomicalDawn)
      extraInfo['Astro Dusk'] = formatTime(twilight.astronomicalDusk)
    }

    if (isMoon) {
      // Moon-specific data — docs: docs/api/sun-moon-eclipse.md#moon
      const moonPos = Moon.position(now)
      ra = moonPos.ra
      dec = moonPos.dec
      const phase = Moon.phase(now)
      const lib = Moon.libration(now)
      extraInfo['Distance'] = `${moonPos.distance_km.toLocaleString()} km`
      extraInfo['Parallax'] = `${moonPos.parallax.toFixed(4)}°`
      extraInfo['Phase'] = phase.name.replace(/-/g, ' ')
      extraInfo['Illumination'] = `${(phase.illumination * 100).toFixed(1)}%`
      extraInfo['Age'] = `${phase.age.toFixed(1)} days`
      extraInfo['Libration L'] = `${lib.l.toFixed(2)}°`
      extraInfo['Libration B'] = `${lib.b.toFixed(2)}°`
    }

    let hz = null
    let rts = null
    if (ra != null && dec != null) {
      hz = AstroMath.equatorialToHorizontal({ ra, dec }, obs)
      rts = AstroMath.riseTransitSet({ ra, dec }, obs)
    }

    // Proximity search for nearby objects — docs: docs/api/data.md#datanearby
    const nearby = ra != null && dec != null
      ? Data.nearby({ ra, dec }, 5).filter(r => r.object.id !== obj.id).slice(0, 8)
      : []

    // Image URLs from the fallback registry — docs: docs/api/data.md#dataimageurls
    const imageUrls = Data.imageUrls(obj.id)

    return { obj, ra, dec, hz, rts, extraInfo, nearby, isPlanet, isSun, isMoon, imageUrls }
  }, [id, observer, now])

  if (!data) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p>Object not found</p>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  const { obj, ra, dec, hz, rts, extraInfo, nearby, imageUrls } = data

  return (
    <div className={styles.page}>
      {/* Back button */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Hero */}
      <div className={styles.hero}>
        {imageUrls.length > 0 && (
          <div className={styles.heroImage}>
            <img
              src={imageUrls[0]}
              alt={obj.name}
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}
        <div className={styles.heroContent}>
          <span className={styles.heroType}>{obj.type}</span>
          <h1 className={styles.heroName}>{obj.name}</h1>
          {obj.aliases && obj.aliases.length > 0 && (
            <p className={styles.heroAliases}>{obj.aliases.join(' · ')}</p>
          )}
          {hz && (
            <div className={styles.heroStatus}>
              <span className={hz.alt > 0 ? styles.above : styles.below}>
                {hz.alt > 0 ? 'Above Horizon' : 'Below Horizon'}
              </span>
              <span className={styles.heroCoord}>Alt {hz.alt.toFixed(2)}° · Az {hz.az.toFixed(2)}°</span>
            </div>
          )}
        </div>
      </div>

      {/* Data sections */}
      <div className={styles.dataGrid}>
        {/* Coordinates */}
        {ra != null && dec != null && (
          <div className={styles.dataCard}>
            <h3 className={styles.dataTitle}>Coordinates</h3>
            <div className={styles.dataRows}>
              <div className={styles.dataRow}>
                <span>Right Ascension</span>
                <span className={styles.dataValue}>{Units.formatRA(ra)}</span>
              </div>
              <div className={styles.dataRow}>
                <span>Declination</span>
                <span className={styles.dataValue}>{dec > 0 ? '+' : ''}{dec.toFixed(4)}°</span>
              </div>
              {obj.magnitude != null && (
                <div className={styles.dataRow}>
                  <span>Magnitude</span>
                  <span className={styles.dataValue}>{obj.magnitude.toFixed(2)}</span>
                </div>
              )}
              {obj.distance && (
                <div className={styles.dataRow}>
                  <span>Distance</span>
                  <span className={styles.dataValue}>{obj.distance.value} {obj.distance.unit}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rise/Transit/Set */}
        {rts && (
          <div className={styles.dataCard}>
            <h3 className={styles.dataTitle}>Rise & Set</h3>
            <div className={styles.dataRows}>
              <div className={styles.dataRow}>
                <span>Rise</span>
                <span className={styles.dataValue}>{formatTime(rts.rise)}</span>
              </div>
              <div className={styles.dataRow}>
                <span>Transit</span>
                <span className={styles.dataValue}>{formatTime(rts.transit)}</span>
              </div>
              <div className={styles.dataRow}>
                <span>Set</span>
                <span className={styles.dataValue}>{formatTime(rts.set)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Extra info */}
        {Object.keys(extraInfo).length > 0 && (
          <div className={styles.dataCard}>
            <h3 className={styles.dataTitle}>Ephemeris</h3>
            <div className={styles.dataRows}>
              {Object.entries(extraInfo).map(([key, val]) => (
                <div key={key} className={styles.dataRow}>
                  <span>{key}</span>
                  <span className={styles.dataValue}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Physical properties */}
        {(obj.diameter_km || obj.mass_kg || obj.surface_temp_K || obj.spectral) && (
          <div className={styles.dataCard}>
            <h3 className={styles.dataTitle}>Physical Properties</h3>
            <div className={styles.dataRows}>
              {obj.diameter_km != null && (
                <div className={styles.dataRow}>
                  <span>Diameter</span>
                  <span className={styles.dataValue}>{Units.formatDistance(obj.diameter_km)}</span>
                </div>
              )}
              {obj.mass_kg != null && (
                <div className={styles.dataRow}>
                  <span>Mass</span>
                  <span className={styles.dataValue}>{obj.mass_kg.toExponential(3)} kg</span>
                </div>
              )}
              {obj.surface_temp_K != null && (
                <div className={styles.dataRow}>
                  <span>Surface Temp</span>
                  <span className={styles.dataValue}>{obj.surface_temp_K.toLocaleString()} K</span>
                </div>
              )}
              {obj.spectral && (
                <div className={styles.dataRow}>
                  <span>Spectral Type</span>
                  <span className={styles.dataValue}>{obj.spectral}</span>
                </div>
              )}
              {obj.moons != null && (
                <div className={styles.dataRow}>
                  <span>Known Moons</span>
                  <span className={styles.dataValue}>{obj.moons}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nearby objects */}
      {nearby.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Nearby Objects (within 5°)</h3>
          <div className={styles.nearbyGrid}>
            {nearby.map(n => (
              <div
                key={n.object.id}
                className={styles.nearbyCard}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/object/${n.object.id}`)}
                onKeyDown={e => e.key === 'Enter' && navigate(`/object/${n.object.id}`)}
              >
                <span className={styles.nearbyType}>{n.object.type}</span>
                <span className={styles.nearbyName}>{n.object.name}</span>
                <span className={styles.nearbySep}>{n.separation.toFixed(2)}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
