import { C as E, M as A, A as g, P, D as _, S as w, c as $e, I as ze, g as Fe, m as He, s as Ye, r as Xe, a as qe, E as Ge, N as Ue, b as Ke } from "./skymap-interactive-DarGf66X.js";
import { B as kt, d as wt, e as At, f as Lt, h as Et, i as Mt, j as Ot, k as Nt, l as Ct, n as vt, o as _t, p as Wt, q as It, t as Tt, u as Rt, v as Pt, w as Dt, x as $t } from "./skymap-interactive-DarGf66X.js";
import { M as Ze } from "./media-DVOcIMa1.js";
const je = {
  // ── Distance ───────────────────────────────────────────────────────────────
  /**
   * Convert Astronomical Units to kilometres.
   * @param au - Distance in AU.
   * @returns Distance in kilometres.
   */
  auToKm: (e) => e * E.AU_TO_KM,
  /**
   * Convert kilometres to Astronomical Units.
   * @param km - Distance in kilometres.
   * @returns Distance in AU.
   */
  kmToAu: (e) => e / E.AU_TO_KM,
  /**
   * Convert light-years to parsecs.
   * @param ly - Distance in light-years.
   * @returns Distance in parsecs.
   */
  lyToPc: (e) => e / E.PC_TO_LY,
  /**
   * Convert parsecs to light-years.
   * @param pc - Distance in parsecs.
   * @returns Distance in light-years.
   */
  pcToLy: (e) => e * E.PC_TO_LY,
  /**
   * Convert parsecs to kilometres.
   * @param pc - Distance in parsecs.
   * @returns Distance in kilometres.
   */
  pcToKm: (e) => e * E.PC_TO_KM,
  /**
   * Convert light-years to kilometres.
   * @param ly - Distance in light-years.
   * @returns Distance in kilometres.
   */
  lyToKm: (e) => e * E.LY_TO_KM,
  /**
   * Convert kilometres to light-years.
   * @param km - Distance in kilometres.
   * @returns Distance in light-years.
   */
  kmToLy: (e) => e / E.LY_TO_KM,
  // ── Angular ────────────────────────────────────────────────────────────────
  /**
   * Convert degrees to radians.
   * @param d - Angle in degrees.
   * @returns Angle in radians.
   */
  degToRad: (e) => e * E.DEG_TO_RAD,
  /**
   * Convert radians to degrees.
   * @param r - Angle in radians.
   * @returns Angle in degrees.
   */
  radToDeg: (e) => e * E.RAD_TO_DEG,
  /**
   * Convert arcseconds to degrees.
   * @param a - Angle in arcseconds.
   * @returns Angle in degrees.
   */
  arcsecToDeg: (e) => e / 3600,
  /**
   * Convert degrees to arcseconds.
   * @param d - Angle in degrees.
   * @returns Angle in arcseconds.
   */
  degToArcsec: (e) => e * 3600,
  /**
   * Convert Right Ascension from hours to degrees.
   * @param h - RA in hours (0–24).
   * @returns RA in degrees (0–360).
   */
  hrsToDeg: (e) => e * 15,
  /**
   * Convert Right Ascension from degrees to hours.
   * @param d - RA in degrees (0–360).
   * @returns RA in hours (0–24).
   */
  degToHrs: (e) => e / 15,
  /**
   * Format a distance in kilometres into a human-readable string,
   * automatically choosing the most appropriate unit (km, AU, ly, or Mly).
   *
   * @param km - Distance in kilometres.
   * @returns Formatted string with unit suffix.
   *
   * @example
   * ```ts
   * Units.formatDistance(384_400)               // '0.002570 AU'
   * Units.formatDistance(9_460_730_472_580 * 8.6) // '8.600 ly'
   * ```
   */
  formatDistance(e) {
    const a = e / E.AU_TO_KM;
    if (a < 0.01) return `${e.toFixed(0)} km`;
    if (a < 1e3) return `${a.toPrecision(4)} AU`;
    const t = e / E.LY_TO_KM;
    return t < 1e6 ? `${t.toPrecision(4)} ly` : `${(t / 1e6).toPrecision(4)} Mly`;
  },
  /**
   * Format decimal degrees as d°m′s″ (signed).
   *
   * @param deg - Angle in decimal degrees.
   * @returns Formatted DMS string.
   *
   * @example
   * ```ts
   * Units.formatAngle(-16.716)  // '-16°42′57.6″'
   * Units.formatAngle(83.822)   // '83°49′19.2″'
   * ```
   */
  formatAngle(e) {
    const a = e < 0 ? "-" : "", t = Math.abs(e), r = Math.floor(t), n = Math.floor((t - r) * 60), i = ((t - r) * 60 - n) * 60;
    return `${a}${r}°${n}′${i.toFixed(1)}″`;
  },
  /**
   * Format Right Ascension from decimal degrees into hours/minutes/seconds.
   *
   * @param deg - RA in decimal degrees (0–360).
   * @returns Formatted string like `'5h 35m 17.3s'`.
   *
   * @example
   * ```ts
   * Units.formatRA(83.822)  // '5h 35m 17.3s'
   * Units.formatRA(0)       // '0h 0m 0.0s'
   * ```
   */
  formatRA(e) {
    const a = (e % 360 + 360) % 360, t = Math.floor(a / 15), r = Math.floor((a / 15 - t) * 60), n = ((a / 15 - t) * 60 - r) * 60;
    return `${t}h ${r}m ${n.toFixed(1)}s`;
  }
}, be = {
  /**
   * Find the next solar eclipse after the given date.
   *
   * Iterates through upcoming new moons (up to 26 lunations, approximately
   * 2 years) and checks each one for a solar eclipse condition.
   *
   * @param date - Start date from which to search forward. Defaults to the current date/time.
   * @returns An {@link EclipseEvent} describing the next solar eclipse, or `null` if none is found within approximately 2 years.
   *
   * @example
   * ```ts
   * import { Eclipse } from '@motioncomplex/cosmos-lib'
   *
   * const next = Eclipse.nextSolar(new Date('2024-03-20'))
   * if (next) {
   *   console.log(`Next solar eclipse: ${next.subtype} on ${next.date.toISOString()}`)
   *   console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
   * }
   * ```
   */
  nextSolar(e = /* @__PURE__ */ new Date()) {
    let a = new Date(e);
    for (let t = 0; t < 26; t++) {
      const r = A.nextPhase(a, "new"), n = this._checkSolarEclipse(r);
      if (n) return n;
      a = new Date(r.valueOf() + 864e5);
    }
    return null;
  },
  /**
   * Find the next lunar eclipse after the given date.
   *
   * Iterates through upcoming full moons (up to 26 lunations, approximately
   * 2 years) and checks each one for a lunar eclipse condition.
   *
   * @param date - Start date from which to search forward. Defaults to the current date/time.
   * @returns An {@link EclipseEvent} describing the next lunar eclipse, or `null` if none is found within approximately 2 years.
   *
   * @example
   * ```ts
   * import { Eclipse } from '@motioncomplex/cosmos-lib'
   *
   * const next = Eclipse.nextLunar(new Date('2024-03-20'))
   * if (next) {
   *   console.log(`Next lunar eclipse: ${next.subtype} on ${next.date.toISOString()}`)
   *   console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
   * }
   * ```
   */
  nextLunar(e = /* @__PURE__ */ new Date()) {
    let a = new Date(e);
    for (let t = 0; t < 26; t++) {
      const r = A.nextPhase(a, "full"), n = this._checkLunarEclipse(r);
      if (n) return n;
      a = new Date(r.valueOf() + 864e5);
    }
    return null;
  },
  /**
   * Search for all eclipses in a date range.
   *
   * Scans the interval from `startDate` to `endDate` in steps of approximately
   * 15 days, checking both new moons (solar) and full moons (lunar) for eclipse
   * conditions. Results are sorted chronologically and deduplicated (eclipses
   * found within 1 day of each other are treated as the same event).
   *
   * @remarks
   * The search advances by 15-day increments to ensure both new and full moons
   * within each lunation are tested. When `type` is specified, only that eclipse
   * type is checked, improving performance for targeted searches. Deduplication
   * uses a 1-day threshold to handle cases where the same eclipse is detected
   * from adjacent search windows.
   *
   * @param startDate - The beginning of the search window (inclusive).
   * @param endDate - The end of the search window (exclusive).
   * @param type - Optional filter: `'solar'` to search only for solar eclipses, `'lunar'` for only lunar eclipses, or omit for both.
   * @returns An array of {@link EclipseEvent} objects sorted by date, with duplicates removed.
   *
   * @example
   * ```ts
   * import { Eclipse } from '@motioncomplex/cosmos-lib'
   *
   * // Find all eclipses in 2024
   * const all = Eclipse.search(new Date('2024-01-01'), new Date('2025-01-01'))
   * console.log(`Found ${all.length} eclipses in 2024`)
   * all.forEach(e => console.log(`${e.type} ${e.subtype} — ${e.date.toISOString()}`))
   *
   * // Only solar eclipses in a 5-year span
   * const solar = Eclipse.search(
   *   new Date('2024-01-01'),
   *   new Date('2029-01-01'),
   *   'solar',
   * )
   * solar.forEach(e => console.log(`${e.subtype} solar eclipse: ${e.date.toISOString()}`))
   * ```
   */
  search(e, a, t) {
    const r = [];
    let n = new Date(e);
    const i = a.valueOf();
    for (; n.valueOf() < i; ) {
      if (t !== "lunar") {
        const o = A.nextPhase(n, "new");
        if (o.valueOf() > i) break;
        const s = this._checkSolarEclipse(o);
        s && r.push(s);
      }
      if (t !== "solar") {
        const o = A.nextPhase(n, "full");
        if (o.valueOf() <= i) {
          const s = this._checkLunarEclipse(o);
          s && r.push(s);
        }
      }
      n = new Date(n.valueOf() + 15 * 864e5);
    }
    return r.sort((o, s) => o.date.valueOf() - s.date.valueOf()), r.filter(
      (o, s) => s === 0 || Math.abs(o.date.valueOf() - r[s - 1].date.valueOf()) > 864e5
    );
  },
  /**
   * Check if a new moon produces a solar eclipse.
   *
   * Computes the Moon's ecliptic latitude and angular separation from the Sun
   * at the instant of new moon. If the Moon is within 1.5° of the ecliptic plane
   * and the angular separation is less than 1.5 times the sum of the apparent
   * solar and lunar radii, an eclipse is predicted. The subtype (total, annular,
   * or partial) is determined by comparing the apparent radii and the separation.
   *
   * @internal
   * @param newMoon - The date/time of the new moon to test.
   * @returns An {@link EclipseEvent} if a solar eclipse occurs at this new moon, or `null` otherwise.
   */
  _checkSolarEclipse(e) {
    const a = A.position(e), t = g.planetEcliptic("earth", e), r = ((t.lon + 180) % 360 + 360) % 360;
    if (Math.abs(a.eclipticLat) > 1.5) return null;
    const i = t.r * 1495978707e-1, o = Math.atan2(696e3, i) * (180 / Math.PI), s = Math.atan2(1737.4, a.distance_km) * (180 / Math.PI), c = g.angularSeparation(
      a,
      g.eclipticToEquatorial({ lon: r, lat: 0 })
    ), d = o + s;
    if (c > d * 1.5) return null;
    let l, m;
    if (s >= o && c < s - o)
      l = "total", m = 1;
    else if (s < o && c < o - s)
      l = "annular", m = s / o;
    else if (c < d)
      l = "partial", m = (d - c) / (2 * o);
    else
      return null;
    return { type: "solar", subtype: l, date: e, magnitude: m };
  },
  /**
   * Check if a full moon produces a lunar eclipse.
   *
   * Computes the Moon's ecliptic latitude at the instant of full moon and
   * compares it against the angular radii of Earth's umbral and penumbral
   * shadow cones at the Moon's distance. The subtype (total, partial, or
   * penumbral) is determined by where the Moon's latitude falls relative
   * to the umbral and penumbral boundaries.
   *
   * @remarks
   * The umbral cone angular radius is approximated as 2.6 times the Earth's
   * angular radius at the Moon's distance, and the penumbral cone as 4.3 times.
   * These are simplified multipliers; a full calculation would use solar parallax
   * and Earth's atmospheric extension.
   *
   * @internal
   * @param fullMoon - The date/time of the full moon to test.
   * @returns An {@link EclipseEvent} if a lunar eclipse occurs at this full moon, or `null` otherwise.
   */
  _checkLunarEclipse(e) {
    const a = A.position(e), t = Math.abs(a.eclipticLat), r = Math.atan2(6371, a.distance_km) * (180 / Math.PI), n = r * 2.6, i = r * 4.3, o = Math.atan2(1737.4, a.distance_km) * (180 / Math.PI);
    if (t > i + o) return null;
    let s, c;
    if (t < n - o)
      s = "total", c = (n - t) / (2 * o);
    else if (t < n + o)
      s = "partial", c = (n + o - t) / (2 * o);
    else if (t < i + o)
      s = "penumbral", c = (i + o - t) / (2 * o);
    else
      return null;
    return { type: "lunar", subtype: s, date: e, magnitude: Math.min(c, 1) };
  }
}, Ve = [
  { target: "new", name: "New Moon" },
  { target: "first-quarter", name: "First Quarter Moon" },
  { target: "full", name: "Full Moon" },
  { target: "last-quarter", name: "Last Quarter Moon" }
];
function le(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
const Be = {
  /**
   * Find upcoming astronomical events within a date range.
   *
   * Scans forward from the observer's date, aggregating events from
   * multiple sources: moon phases, eclipses, meteor showers, planet
   * events, equinoxes, and solstices. Results are sorted by date.
   *
   * @param observer - Observer location and start date.
   * @param options - Filtering and limit options.
   * @returns Array of events sorted by date.
   *
   * @example
   * ```ts
   * const events = Events.nextEvents(
   *   { lat: 47, lng: 8, date: new Date('2024-01-01') },
   *   { days: 365, categories: ['eclipse', 'opposition'] }
   * )
   * ```
   */
  nextEvents(e, a = {}) {
    const { days: t = 90, categories: r, limit: n = 50 } = a, i = e.date ?? /* @__PURE__ */ new Date(), o = new Date(i.valueOf() + t * 864e5), s = [], c = (d) => !r || r.includes(d);
    if (c("moon-phase") && s.push(...Qe(i, o)), c("eclipse") && s.push(...Je(i, o)), c("meteor-shower") && s.push(...et(i, o)), c("opposition") || c("conjunction")) {
      const d = P.planetEvents(e, { days: t });
      for (const l of d)
        if (c(l.type)) {
          let m, h;
          try {
            const f = g.planetEcliptic(l.planet, l.date), p = g.eclipticToEquatorial(f);
            m = p.ra, h = p.dec;
          } catch {
          }
          s.push({
            category: l.type,
            title: `${le(l.planet)} ${l.type}`,
            date: l.date,
            detail: `Solar elongation: ${l.elongation.toFixed(1)}°`,
            ra: m,
            dec: h
          });
        }
    }
    if (c("elongation") && s.push(...tt(i, t)), c("equinox") && s.push(...ye(i, o, "equinox")), c("solstice") && s.push(...ye(i, o, "solstice")), e.lat !== void 0 && e.lng !== void 0)
      for (const d of s)
        d.ra !== void 0 && d.dec !== void 0 && (d.visibility = nt(d, e));
    return s.sort((d, l) => d.date.valueOf() - l.date.valueOf()), s.slice(0, n);
  },
  /**
   * Find the next occurrence of a specific event category.
   *
   * @param category - The event category to search for.
   * @param observer - Observer location and start date.
   * @param days - How far to search forward. @defaultValue `365`
   * @returns The next event, or `null` if none found in the range.
   *
   * @example
   * ```ts
   * const nextEclipse = Events.nextEvent('eclipse', { lat: 47, lng: 8 })
   * const nextOpposition = Events.nextEvent('opposition', { lat: 47, lng: 8 })
   * ```
   */
  nextEvent(e, a, t = 365) {
    return this.nextEvents(a, { days: t, categories: [e], limit: 1 })[0] ?? null;
  },
  /**
   * Export events as an iCal (`.ics`) string.
   *
   * Generates a valid iCalendar file with VEVENT entries for each event.
   * Events are all-day events (no specific time) since most astronomical
   * events span hours or occur at observer-dependent times.
   *
   * @param events - Array of events to export.
   * @param calendarName - Calendar name. @defaultValue `'Astronomical Events'`
   * @returns A string in iCalendar format, ready to save as `.ics`.
   *
   * @example
   * ```ts
   * const events = Events.nextEvents(observer, { days: 365 })
   * const ical = Events.toICal(events)
   * download('astro-events.ics', ical, 'text/calendar')
   * ```
   */
  toICal(e, a = "Astronomical Events") {
    const t = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//cosmos-lib//Astronomical Events//EN",
      `X-WR-CALNAME:${a}`
    ];
    for (const r of e) {
      const n = r.date, i = `${n.getUTCFullYear()}${String(n.getUTCMonth() + 1).padStart(2, "0")}${String(n.getUTCDate()).padStart(2, "0")}`, o = `${i}-${r.category}-${r.title.replace(/\s/g, "-").toLowerCase()}@cosmos-lib`;
      t.push(
        "BEGIN:VEVENT",
        `DTSTART;VALUE=DATE:${i}`,
        `SUMMARY:${r.title}`,
        `UID:${o}`
      ), r.detail && t.push(`DESCRIPTION:${r.detail}`), t.push("END:VEVENT");
    }
    return t.push("END:VCALENDAR"), t.join(`\r
`);
  }
};
function Qe(e, a) {
  const t = [];
  for (const { target: r, name: n } of Ve) {
    let i = new Date(e.valueOf());
    for (let o = 0; o < 20; o++) {
      const s = A.nextPhase(i, r);
      if (s.valueOf() > a.valueOf()) break;
      const c = A.position(s);
      t.push({
        category: "moon-phase",
        title: n,
        date: s,
        ra: c.ra,
        dec: c.dec
      }), i = new Date(s.valueOf() + 864e5);
    }
  }
  return t;
}
function Je(e, a) {
  return be.search(e, a).map((r) => ({
    category: "eclipse",
    title: `${le(r.subtype)} ${r.type} eclipse`,
    date: r.date,
    detail: `Magnitude: ${r.magnitude.toFixed(3)}`
  }));
}
function et(e, a) {
  const t = [], r = /* @__PURE__ */ new Set();
  for (let n = e.valueOf(); n <= a.valueOf(); n += 864e5) {
    const i = new Date(n), o = _.getActiveShowers(i);
    for (const s of o) {
      if (r.has(s.id)) continue;
      const d = ((g.planetEcliptic("earth", i).lon + 180) % 360 + 360) % 360;
      Math.abs(((d - s.solarLon + 180) % 360 + 360) % 360 - 180) < 2 && (r.add(s.id), t.push({
        category: "meteor-shower",
        title: `${s.name} meteor shower peak`,
        date: i,
        detail: `ZHR: ${s.zhr}, speed: ${s.speed} km/s${s.parentBody ? `, parent: ${s.parentBody}` : ""}`,
        ra: s.radiantRA,
        dec: s.radiantDec,
        constellation: s.code
      }));
    }
  }
  return t;
}
function tt(e, a) {
  const t = [], r = ["mercury", "venus"];
  for (const n of r) {
    let i = 0, o = !0;
    for (let s = 0; s <= a; s++) {
      const c = new Date(e.valueOf() + s * 864e5), d = g.planetEcliptic(n, c), l = g.eclipticToEquatorial(d), m = w.position(c), h = g.angularSeparation(l, { ra: m.ra, dec: m.dec });
      if (s > 0) {
        const f = h > i;
        if (!f && o && i > 15) {
          const p = d.lon, S = m.eclipticLon;
          let u = p - S;
          u > 180 && (u -= 360), u < -180 && (u += 360);
          const x = u > 0 ? "east (evening)" : "west (morning)";
          t.push({
            category: "elongation",
            title: `${le(n)} greatest elongation`,
            date: new Date(e.valueOf() + (s - 1) * 864e5),
            detail: `${i.toFixed(1)}° ${x}`
          });
        }
        o = f;
      }
      i = h;
    }
  }
  return t;
}
function ye(e, a, t) {
  const r = [], n = t === "equinox" ? [{ lon: 0, name: "Vernal equinox (March)" }, { lon: 180, name: "Autumnal equinox (September)" }] : [{ lon: 90, name: "Summer solstice (June)" }, { lon: 270, name: "Winter solstice (December)" }];
  for (const { lon: i, name: o } of n) {
    let s = -1;
    for (let c = 0; c <= (a.valueOf() - e.valueOf()) / 864e5; c++) {
      const d = new Date(e.valueOf() + c * 864e5), m = w.position(d).eclipticLon;
      if (c > 0) {
        let h = !1;
        i === 0 ? h = s > 350 && m < 10 : h = s < i && m >= i, h && r.push({
          category: t,
          title: o,
          date: d,
          detail: `Sun ecliptic longitude: ${m.toFixed(2)}°`
        });
      }
      s = m;
    }
  }
  return r;
}
function nt(e, a) {
  const t = e.ra, r = e.dec, n = e.date, o = w.twilight({ ...a, date: n }).astronomicalDusk, c = w.twilight({ ...a, date: new Date(n.valueOf() + 864e5) }).astronomicalDawn, d = A.phase(n), l = A.position(n), m = g.angularSeparation({ ra: t, dec: r }, { ra: l.ra, dec: l.dec }), h = Math.max(0, Math.min(1, (120 - m) / 115)), f = d.illumination * h;
  if (!o || !c)
    return {
      visible: !1,
      peakAltitude: g.equatorialToHorizontal({ ra: t, dec: r }, { ...a, date: n }).alt,
      moonInterference: f,
      summary: "No astronomical darkness at this location"
    };
  const p = o.valueOf(), S = c.valueOf();
  let u = -90;
  for (let k = p; k <= S; k += 18e5) {
    const M = g.equatorialToHorizontal({ ra: t, dec: r }, { ...a, date: new Date(k) });
    M.alt > u && (u = M.alt);
  }
  const x = u > 10;
  let y;
  return x ? f > 0.5 ? y = `Visible at ${u.toFixed(0)}° alt, but strong moon interference (${(f * 100).toFixed(0)}%)` : f > 0.2 ? y = `Good — ${u.toFixed(0)}° alt, moderate moon (${(f * 100).toFixed(0)}%)` : u > 50 ? y = `Excellent — ${u.toFixed(0)}° alt, dark skies` : y = `Good — ${u.toFixed(0)}° alt, low moon interference` : y = u > 0 ? `Low visibility — peak altitude only ${u.toFixed(0)}° above horizon` : "Not visible — target never rises above horizon at this location", { visible: x, peakAltitude: u, moonInterference: f, summary: y };
}
const Z = [
  // Canon DSLR
  { id: "canon-6d-mk2", name: "Canon EOS 6D Mark II", brand: "Canon", type: "dslr", sensorWidth: 35.9, sensorHeight: 24, pixelSize: 5.73, pixelsX: 6240, pixelsY: 4160, readNoise: 3.8, recommendedISO: 800 },
  { id: "canon-5d-mk4", name: "Canon EOS 5D Mark IV", brand: "Canon", type: "dslr", sensorWidth: 36, sensorHeight: 24, pixelSize: 5.36, pixelsX: 6720, pixelsY: 4480, readNoise: 3.4, recommendedISO: 800 },
  { id: "canon-80d", name: "Canon EOS 80D", brand: "Canon", type: "dslr", sensorWidth: 22.5, sensorHeight: 15, pixelSize: 3.72, pixelsX: 6e3, pixelsY: 4e3, readNoise: 3.2, recommendedISO: 800 },
  { id: "canon-t7i", name: "Canon EOS Rebel T7i", brand: "Canon", type: "dslr", sensorWidth: 22.3, sensorHeight: 14.9, pixelSize: 3.72, pixelsX: 6e3, pixelsY: 4e3, readNoise: 3.3, recommendedISO: 800 },
  // Canon Mirrorless
  { id: "canon-eos-r", name: "Canon EOS R", brand: "Canon", type: "mirrorless", sensorWidth: 36, sensorHeight: 24, pixelSize: 5.36, pixelsX: 6720, pixelsY: 4480, readNoise: 3, recommendedISO: 1600 },
  { id: "canon-eos-ra", name: "Canon EOS Ra", brand: "Canon", type: "mirrorless", sensorWidth: 36, sensorHeight: 24, pixelSize: 5.36, pixelsX: 6720, pixelsY: 4480, astroModified: !0, readNoise: 3, recommendedISO: 1600 },
  { id: "canon-eos-r5", name: "Canon EOS R5", brand: "Canon", type: "mirrorless", sensorWidth: 36, sensorHeight: 24, pixelSize: 4.39, pixelsX: 8192, pixelsY: 5464, readNoise: 2.8, recommendedISO: 1600 },
  { id: "canon-eos-r6-mk2", name: "Canon EOS R6 Mark II", brand: "Canon", type: "mirrorless", sensorWidth: 36, sensorHeight: 24, pixelSize: 5.97, pixelsX: 6e3, pixelsY: 4e3, readNoise: 2.6, recommendedISO: 1600 },
  // Nikon
  { id: "nikon-d810a", name: "Nikon D810A", brand: "Nikon", type: "dslr", sensorWidth: 35.9, sensorHeight: 24, pixelSize: 4.88, pixelsX: 7360, pixelsY: 4912, astroModified: !0, readNoise: 2.8, recommendedISO: 800 },
  { id: "nikon-d850", name: "Nikon D850", brand: "Nikon", type: "dslr", sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 4.34, pixelsX: 8256, pixelsY: 5504, readNoise: 2.6, recommendedISO: 800 },
  { id: "nikon-z6-iii", name: "Nikon Z6 III", brand: "Nikon", type: "mirrorless", sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 5.94, pixelsX: 6048, pixelsY: 4032, readNoise: 2.4, recommendedISO: 1600 },
  { id: "nikon-z8", name: "Nikon Z8", brand: "Nikon", type: "mirrorless", sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 4.34, pixelsX: 8256, pixelsY: 5504, readNoise: 2.5, recommendedISO: 1600 },
  // Sony
  { id: "sony-a7iii", name: "Sony A7 III", brand: "Sony", type: "mirrorless", sensorWidth: 35.6, sensorHeight: 23.8, pixelSize: 5.93, pixelsX: 6e3, pixelsY: 4e3, readNoise: 3.3, recommendedISO: 800 },
  { id: "sony-a7iv", name: "Sony A7 IV", brand: "Sony", type: "mirrorless", sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 5.09, pixelsX: 7008, pixelsY: 4672, readNoise: 2.5, recommendedISO: 1600 },
  { id: "sony-a7cr", name: "Sony A7CR", brand: "Sony", type: "mirrorless", sensorWidth: 35.7, sensorHeight: 23.8, pixelSize: 3.73, pixelsX: 9568, pixelsY: 6380, readNoise: 2.2, recommendedISO: 1600 },
  { id: "sony-a7s-iii", name: "Sony A7S III", brand: "Sony", type: "mirrorless", sensorWidth: 35.6, sensorHeight: 23.8, pixelSize: 8.4, pixelsX: 4240, pixelsY: 2832, readNoise: 2, recommendedISO: 3200 },
  // ZWO Dedicated Astro
  { id: "zwo-asi294mc-pro", name: "ZWO ASI294MC Pro", brand: "ZWO", type: "dedicated", sensorWidth: 19.1, sensorHeight: 13, pixelSize: 4.63, pixelsX: 4144, pixelsY: 2822, readNoise: 1.2, recommendedGain: 120 },
  { id: "zwo-asi2600mc-pro", name: "ZWO ASI2600MC Pro", brand: "ZWO", type: "dedicated", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176, readNoise: 1.5, recommendedGain: 100 },
  { id: "zwo-asi533mc-pro", name: "ZWO ASI533MC Pro", brand: "ZWO", type: "dedicated", sensorWidth: 11.31, sensorHeight: 11.31, pixelSize: 3.76, pixelsX: 3008, pixelsY: 3008, readNoise: 1, recommendedGain: 100 },
  { id: "zwo-asi585mc", name: "ZWO ASI585MC", brand: "ZWO", type: "dedicated", sensorWidth: 12.84, sensorHeight: 9.64, pixelSize: 2.9, pixelsX: 4432, pixelsY: 3326, readNoise: 1, recommendedGain: 250 },
  { id: "zwo-asi071mc-pro", name: "ZWO ASI071MC Pro", brand: "ZWO", type: "dedicated", sensorWidth: 23.6, sensorHeight: 15.6, pixelSize: 4.78, pixelsX: 4944, pixelsY: 3284, readNoise: 2.3, recommendedGain: 90 },
  { id: "zwo-asi183mc-pro", name: "ZWO ASI183MC Pro", brand: "ZWO", type: "dedicated", sensorWidth: 13.2, sensorHeight: 8.8, pixelSize: 2.4, pixelsX: 5496, pixelsY: 3672, readNoise: 1.6, recommendedGain: 111 },
  // QHY
  { id: "qhy268c", name: "QHY268C", brand: "QHY", type: "dedicated", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6252, pixelsY: 4176, readNoise: 1.5, recommendedGain: 56 },
  { id: "qhy600m", name: "QHY600M", brand: "QHY", type: "dedicated", sensorWidth: 36, sensorHeight: 24, pixelSize: 3.76, pixelsX: 9576, pixelsY: 6388, readNoise: 1.5, recommendedGain: 56 },
  { id: "qhy163c", name: "QHY163C", brand: "QHY", type: "dedicated", sensorWidth: 13.2, sensorHeight: 8.8, pixelSize: 3.8, pixelsX: 4656, pixelsY: 3522, readNoise: 1.8, recommendedGain: 75 },
  { id: "qhy533m", name: "QHY533M", brand: "QHY", type: "dedicated", sensorWidth: 11.31, sensorHeight: 11.31, pixelSize: 3.76, pixelsX: 3008, pixelsY: 3008, readNoise: 1, recommendedGain: 56 },
  { id: "qhy294c", name: "QHY294C", brand: "QHY", type: "dedicated", sensorWidth: 19.1, sensorHeight: 13, pixelSize: 4.63, pixelsX: 4144, pixelsY: 2822, readNoise: 1.3, recommendedGain: 120 },
  // Fujifilm
  { id: "fuji-x-t5", name: "Fujifilm X-T5", brand: "Fujifilm", type: "mirrorless", sensorWidth: 23.5, sensorHeight: 15.6, pixelSize: 3.49, pixelsX: 6720, pixelsY: 4480, readNoise: 2.8, recommendedISO: 1600 },
  { id: "fuji-x-h2", name: "Fujifilm X-H2", brand: "Fujifilm", type: "mirrorless", sensorWidth: 23.5, sensorHeight: 15.6, pixelSize: 2.84, pixelsX: 8256, pixelsY: 5504, readNoise: 3, recommendedISO: 1600 },
  // Player One
  { id: "player-one-poseidon-c", name: "Player One Poseidon-C Pro", brand: "Player One", type: "dedicated", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176, readNoise: 1.5, recommendedGain: 100 },
  { id: "player-one-uranus-c", name: "Player One Uranus-C Pro", brand: "Player One", type: "dedicated", sensorWidth: 12.84, sensorHeight: 9.64, pixelSize: 2.9, pixelsX: 4432, pixelsY: 3326, readNoise: 1, recommendedGain: 250 },
  // Canon additional
  { id: "canon-eos-r8", name: "Canon EOS R8", brand: "Canon", type: "mirrorless", sensorWidth: 36, sensorHeight: 24, pixelSize: 5.97, pixelsX: 6e3, pixelsY: 4e3, readNoise: 2.6, recommendedISO: 1600 },
  { id: "canon-90d", name: "Canon EOS 90D", brand: "Canon", type: "dslr", sensorWidth: 22.3, sensorHeight: 14.9, pixelSize: 3.22, pixelsX: 6960, pixelsY: 4640, readNoise: 3, recommendedISO: 800 },
  // Nikon additional
  { id: "nikon-z5", name: "Nikon Z5", brand: "Nikon", type: "mirrorless", sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 5.94, pixelsX: 6048, pixelsY: 4032, readNoise: 2.8, recommendedISO: 1600 },
  { id: "nikon-d7500", name: "Nikon D7500", brand: "Nikon", type: "dslr", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 4.22, pixelsX: 5568, pixelsY: 3712, readNoise: 3, recommendedISO: 800 },
  // Sony additional
  { id: "sony-a6700", name: "Sony A6700", brand: "Sony", type: "mirrorless", sensorWidth: 23.5, sensorHeight: 15.6, pixelSize: 3.92, pixelsX: 6e3, pixelsY: 4e3, readNoise: 2.4, recommendedISO: 1600 },
  { id: "sony-a7rv", name: "Sony A7R V", brand: "Sony", type: "mirrorless", sensorWidth: 35.7, sensorHeight: 23.8, pixelSize: 3.73, pixelsX: 9568, pixelsY: 6380, readNoise: 2.2, recommendedISO: 1600 },
  // ZWO additional
  { id: "zwo-asi2600mm-pro", name: "ZWO ASI2600MM Pro", brand: "ZWO", type: "dedicated", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176, readNoise: 1.5, recommendedGain: 100 },
  { id: "zwo-asi533mm-pro", name: "ZWO ASI533MM Pro", brand: "ZWO", type: "dedicated", sensorWidth: 11.31, sensorHeight: 11.31, pixelSize: 3.76, pixelsX: 3008, pixelsY: 3008, readNoise: 1, recommendedGain: 100 },
  { id: "zwo-asi678mc", name: "ZWO ASI678MC", brand: "ZWO", type: "dedicated", sensorWidth: 7.7, sensorHeight: 4.3, pixelSize: 2, pixelsX: 3840, pixelsY: 2160, readNoise: 0.8, recommendedGain: 200 },
  { id: "zwo-asi462mc", name: "ZWO ASI462MC", brand: "ZWO", type: "dedicated", sensorWidth: 5.6, sensorHeight: 3.2, pixelSize: 2.9, pixelsX: 1936, pixelsY: 1096, readNoise: 0.9, recommendedGain: 300 },
  { id: "zwo-asi120mm", name: "ZWO ASI120MM Mini", brand: "ZWO", type: "dedicated", sensorWidth: 4.8, sensorHeight: 3.6, pixelSize: 3.75, pixelsX: 1280, pixelsY: 960, readNoise: 3, recommendedGain: 50 },
  // Altair
  { id: "altair-26c", name: "Altair Hypercam 26C", brand: "Altair", type: "dedicated", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176, readNoise: 1.5, recommendedGain: 100 },
  // Touptek
  { id: "touptek-2600c", name: "Touptek ATR2600C", brand: "Touptek", type: "dedicated", sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176, readNoise: 1.5, recommendedGain: 100 },
  // Pentax
  { id: "pentax-k-1-mk2", name: "Pentax K-1 Mark II", brand: "Pentax", type: "dslr", sensorWidth: 35.9, sensorHeight: 24, pixelSize: 4.88, pixelsX: 7360, pixelsY: 4912, readNoise: 3, recommendedISO: 800 },
  // Olympus/OM System (MFT)
  { id: "om-system-om-1", name: "OM System OM-1", brand: "OM System", type: "mirrorless", sensorWidth: 17.4, sensorHeight: 13, pixelSize: 3.32, pixelsX: 5184, pixelsY: 3888, readNoise: 2.2, recommendedISO: 1600 }
], j = [
  // Sky-Watcher
  { id: "sw-evostar-72ed", name: "Sky-Watcher Evostar 72ED", brand: "Sky-Watcher", type: "refractor", aperture: 72, focalLength: 420, focalRatio: 5.8 },
  { id: "sw-evostar-80ed", name: "Sky-Watcher Evostar 80ED", brand: "Sky-Watcher", type: "refractor", aperture: 80, focalLength: 600, focalRatio: 7.5 },
  { id: "sw-esprit-100ed", name: "Sky-Watcher Esprit 100ED", brand: "Sky-Watcher", type: "refractor", aperture: 100, focalLength: 550, focalRatio: 5.5 },
  { id: "sw-esprit-150ed", name: "Sky-Watcher Esprit 150ED", brand: "Sky-Watcher", type: "refractor", aperture: 150, focalLength: 1050, focalRatio: 7 },
  { id: "sw-130pds", name: "Sky-Watcher 130PDS", brand: "Sky-Watcher", type: "reflector", aperture: 130, focalLength: 650, focalRatio: 5 },
  { id: "sw-150pds", name: "Sky-Watcher 150PDS", brand: "Sky-Watcher", type: "reflector", aperture: 150, focalLength: 750, focalRatio: 5 },
  { id: "sw-200pds", name: "Sky-Watcher 200PDS", brand: "Sky-Watcher", type: "reflector", aperture: 200, focalLength: 1e3, focalRatio: 5 },
  { id: "sw-quattro-200p", name: "Sky-Watcher Quattro 200P", brand: "Sky-Watcher", type: "reflector", aperture: 200, focalLength: 800, focalRatio: 4 },
  // Celestron
  { id: "celestron-c6", name: "Celestron C6", brand: "Celestron", type: "sct", aperture: 150, focalLength: 1500, focalRatio: 10 },
  { id: "celestron-c8", name: "Celestron C8", brand: "Celestron", type: "sct", aperture: 203, focalLength: 2032, focalRatio: 10 },
  { id: "celestron-c9.25", name: "Celestron C9.25", brand: "Celestron", type: "sct", aperture: 235, focalLength: 2350, focalRatio: 10 },
  { id: "celestron-c11", name: "Celestron C11", brand: "Celestron", type: "sct", aperture: 279, focalLength: 2800, focalRatio: 10 },
  { id: "celestron-c14", name: "Celestron C14", brand: "Celestron", type: "sct", aperture: 356, focalLength: 3910, focalRatio: 11 },
  { id: "celestron-rasa-8", name: "Celestron RASA 8", brand: "Celestron", type: "sct", aperture: 203, focalLength: 400, focalRatio: 2 },
  { id: "celestron-edgehd-8", name: "Celestron EdgeHD 8", brand: "Celestron", type: "sct", aperture: 203, focalLength: 2032, focalRatio: 10 },
  // Meade
  { id: "meade-lx85-8", name: 'Meade LX85 8" ACF', brand: "Meade", type: "sct", aperture: 203, focalLength: 2e3, focalRatio: 10 },
  // Takahashi
  { id: "takahashi-fsq-106ed", name: "Takahashi FSQ-106ED", brand: "Takahashi", type: "refractor", aperture: 106, focalLength: 530, focalRatio: 5 },
  { id: "takahashi-toa-130nfb", name: "Takahashi TOA-130NFB", brand: "Takahashi", type: "refractor", aperture: 130, focalLength: 1e3, focalRatio: 7.7 },
  { id: "takahashi-epsilon-130d", name: "Takahashi Epsilon-130D", brand: "Takahashi", type: "reflector", aperture: 130, focalLength: 430, focalRatio: 3.3 },
  // William Optics
  { id: "wo-redcat-51", name: "William Optics RedCat 51", brand: "William Optics", type: "refractor", aperture: 51, focalLength: 250, focalRatio: 4.9 },
  { id: "wo-zenithstar-73", name: "William Optics ZenithStar 73", brand: "William Optics", type: "refractor", aperture: 73, focalLength: 430, focalRatio: 5.9 },
  { id: "wo-fluorostar-132", name: "William Optics FluoroStar 132", brand: "William Optics", type: "refractor", aperture: 132, focalLength: 925, focalRatio: 7 },
  // Explore Scientific
  { id: "es-ed102-fcd100", name: "Explore Scientific ED102 FCD100", brand: "Explore Scientific", type: "refractor", aperture: 102, focalLength: 714, focalRatio: 7 },
  // Sharpstar
  { id: "sharpstar-61edphii", name: "Sharpstar 61EDPH II", brand: "Sharpstar", type: "refractor", aperture: 61, focalLength: 360, focalRatio: 5.5 },
  // Orion (Synta)
  { id: "orion-8-astrograph", name: 'Orion 8" f/3.9 Astrograph', brand: "Orion", type: "reflector", aperture: 200, focalLength: 780, focalRatio: 3.9 },
  // GSO/Astro-Tech
  { id: "at-rc6", name: "Astro-Tech AT6RC", brand: "Astro-Tech", type: "rc", aperture: 152, focalLength: 1370, focalRatio: 9 },
  { id: "at-rc8", name: "Astro-Tech AT8RC", brand: "Astro-Tech", type: "rc", aperture: 203, focalLength: 1625, focalRatio: 8 },
  // Additional Sky-Watcher
  { id: "sw-evostar-100ed", name: "Sky-Watcher Evostar 100ED", brand: "Sky-Watcher", type: "refractor", aperture: 100, focalLength: 900, focalRatio: 9 },
  { id: "sw-starquest-130p", name: "Sky-Watcher StarQuest 130P", brand: "Sky-Watcher", type: "reflector", aperture: 130, focalLength: 650, focalRatio: 5 },
  { id: "sw-quattro-250p", name: "Sky-Watcher Quattro 250P", brand: "Sky-Watcher", type: "reflector", aperture: 254, focalLength: 1e3, focalRatio: 4 },
  { id: "sw-mak127", name: "Sky-Watcher Skymax 127", brand: "Sky-Watcher", type: "maksutov", aperture: 127, focalLength: 1500, focalRatio: 11.8 },
  { id: "sw-mak180", name: "Sky-Watcher Skymax 180 Pro", brand: "Sky-Watcher", type: "maksutov", aperture: 180, focalLength: 2700, focalRatio: 15 },
  // Additional Celestron
  { id: "celestron-nexstar-6se", name: "Celestron NexStar 6SE", brand: "Celestron", type: "sct", aperture: 150, focalLength: 1500, focalRatio: 10 },
  { id: "celestron-rasa-11", name: "Celestron RASA 11", brand: "Celestron", type: "sct", aperture: 279, focalLength: 620, focalRatio: 2.2 },
  { id: "celestron-starsense-8", name: 'Celestron StarSense Explorer 8" SCT', brand: "Celestron", type: "sct", aperture: 203, focalLength: 2032, focalRatio: 10 },
  // TS-Optics
  { id: "ts-photon-8-f4", name: 'TS-Optics Photon 8" f/4 Newtonian', brand: "TS-Optics", type: "reflector", aperture: 200, focalLength: 800, focalRatio: 4 },
  { id: "ts-cf-apo-80", name: "TS-Optics CF-APO 80/480", brand: "TS-Optics", type: "refractor", aperture: 80, focalLength: 480, focalRatio: 6 },
  // Askar
  { id: "askar-fra400", name: "Askar FRA400", brand: "Askar", type: "refractor", aperture: 72, focalLength: 400, focalRatio: 5.6 },
  { id: "askar-fra600", name: "Askar FRA600", brand: "Askar", type: "refractor", aperture: 108, focalLength: 600, focalRatio: 5.6 },
  { id: "askar-185edph", name: "Askar 185APO", brand: "Askar", type: "refractor", aperture: 185, focalLength: 1295, focalRatio: 7 },
  // Vaonis
  { id: "vaonis-vespera-ii", name: "Vaonis Vespera II", brand: "Vaonis", type: "refractor", aperture: 50, focalLength: 250, focalRatio: 5 },
  // SVBony
  { id: "svbony-sv503-70ed", name: "SVBony SV503 70ED", brand: "SVBony", type: "refractor", aperture: 70, focalLength: 420, focalRatio: 6 },
  // Bresser
  { id: "bresser-ar-102", name: "Bresser Messier AR-102/1000", brand: "Bresser", type: "refractor", aperture: 102, focalLength: 1e3, focalRatio: 9.8 },
  { id: "bresser-nt-150", name: "Bresser Messier NT-150/750", brand: "Bresser", type: "reflector", aperture: 150, focalLength: 750, focalRatio: 5 }
], V = [
  // Ultra-wide (Milky Way)
  { id: "rokinon-14mm-f2.8", name: "Rokinon 14mm f/2.8", brand: "Rokinon", focalLength: 14, maxAperture: 5, fNumber: 2.8, mount: "universal" },
  { id: "sigma-14mm-f1.8", name: "Sigma 14mm f/1.8 DG HSM Art", brand: "Sigma", focalLength: 14, maxAperture: 7.78, fNumber: 1.8, mount: "universal" },
  { id: "sigma-20mm-f1.4", name: "Sigma 20mm f/1.4 DG DN Art", brand: "Sigma", focalLength: 20, maxAperture: 14.29, fNumber: 1.4, mount: "sony-e" },
  { id: "canon-rf-15-35-f2.8", name: "Canon RF 15-35mm f/2.8L IS USM", brand: "Canon", focalLength: 15, maxAperture: 5.36, fNumber: 2.8, mount: "canon-rf" },
  { id: "nikon-z-14-24-f2.8", name: "Nikon Z 14-24mm f/2.8 S", brand: "Nikon", focalLength: 14, maxAperture: 5, fNumber: 2.8, mount: "nikon-z" },
  // Wide-field (constellations, tracked MW)
  { id: "sigma-24mm-f1.4", name: "Sigma 24mm f/1.4 DG DN Art", brand: "Sigma", focalLength: 24, maxAperture: 17.14, fNumber: 1.4, mount: "sony-e" },
  { id: "sony-24mm-f1.4-gm", name: "Sony FE 24mm f/1.4 GM", brand: "Sony", focalLength: 24, maxAperture: 17.14, fNumber: 1.4, mount: "sony-e" },
  { id: "rokinon-35mm-f1.4", name: "Rokinon 35mm f/1.4", brand: "Rokinon", focalLength: 35, maxAperture: 25, fNumber: 1.4, mount: "universal" },
  { id: "sigma-35mm-f1.4", name: "Sigma 35mm f/1.4 DG DN Art", brand: "Sigma", focalLength: 35, maxAperture: 25, fNumber: 1.4, mount: "sony-e" },
  // Standard (tracked deep-sky)
  { id: "canon-ef-50mm-f1.8", name: "Canon EF 50mm f/1.8 STM", brand: "Canon", focalLength: 50, maxAperture: 27.78, fNumber: 1.8, mount: "canon-ef" },
  { id: "sigma-50mm-f1.4", name: "Sigma 50mm f/1.4 DG DN Art", brand: "Sigma", focalLength: 50, maxAperture: 35.71, fNumber: 1.4, mount: "sony-e" },
  { id: "sony-50mm-f1.2-gm", name: "Sony FE 50mm f/1.2 GM", brand: "Sony", focalLength: 50, maxAperture: 41.67, fNumber: 1.2, mount: "sony-e" },
  // Short telephoto (nebulae, galaxies)
  { id: "sigma-85mm-f1.4", name: "Sigma 85mm f/1.4 DG DN Art", brand: "Sigma", focalLength: 85, maxAperture: 60.71, fNumber: 1.4, mount: "sony-e" },
  { id: "sigma-105mm-f1.4", name: "Sigma 105mm f/1.4 DG HSM Art", brand: "Sigma", focalLength: 105, maxAperture: 75, fNumber: 1.4, mount: "universal" },
  { id: "canon-ef-135mm-f2", name: "Canon EF 135mm f/2L USM", brand: "Canon", focalLength: 135, maxAperture: 67.5, fNumber: 2, mount: "canon-ef" },
  { id: "sony-135mm-f1.8-gm", name: "Sony FE 135mm f/1.8 GM", brand: "Sony", focalLength: 135, maxAperture: 75, fNumber: 1.8, mount: "sony-e" },
  // Telephoto (deep-sky targets)
  { id: "canon-ef-200mm-f2.8", name: "Canon EF 200mm f/2.8L II USM", brand: "Canon", focalLength: 200, maxAperture: 71.43, fNumber: 2.8, mount: "canon-ef" },
  { id: "sony-200-600mm-f5.6-6.3", name: "Sony FE 200-600mm f/5.6-6.3 G", brand: "Sony", focalLength: 200, maxAperture: 35.71, fNumber: 5.6, mount: "sony-e" },
  { id: "sigma-150-600mm-f5-6.3", name: "Sigma 150-600mm f/5-6.3 DG OS HSM", brand: "Sigma", focalLength: 150, maxAperture: 30, fNumber: 5, mount: "universal" },
  { id: "canon-rf-100-500mm-f4.5-7.1", name: "Canon RF 100-500mm f/4.5-7.1L IS USM", brand: "Canon", focalLength: 100, maxAperture: 22.22, fNumber: 4.5, mount: "canon-rf" },
  // Additional ultra-wide
  { id: "sigma-14-24mm-f2.8", name: "Sigma 14-24mm f/2.8 DG DN Art", brand: "Sigma", focalLength: 14, maxAperture: 5, fNumber: 2.8, mount: "sony-e" },
  { id: "laowa-12mm-f2.8", name: "Laowa 12mm f/2.8 Zero-D", brand: "Laowa", focalLength: 12, maxAperture: 4.29, fNumber: 2.8, mount: "universal" },
  { id: "irix-15mm-f2.4", name: "Irix 15mm f/2.4 Blackstone", brand: "Irix", focalLength: 15, maxAperture: 6.25, fNumber: 2.4, mount: "universal" },
  { id: "tokina-11-20mm-f2.8", name: "Tokina ATX-i 11-20mm f/2.8 CF", brand: "Tokina", focalLength: 11, maxAperture: 3.93, fNumber: 2.8, mount: "canon-ef" },
  { id: "samyang-12mm-f2", name: "Samyang 12mm f/2.0 NCS CS", brand: "Samyang", focalLength: 12, maxAperture: 6, fNumber: 2, mount: "fuji-x" },
  // Additional wide
  { id: "canon-rf-16mm-f2.8", name: "Canon RF 16mm f/2.8 STM", brand: "Canon", focalLength: 16, maxAperture: 5.71, fNumber: 2.8, mount: "canon-rf" },
  { id: "nikon-z-20mm-f1.8", name: "Nikon Z 20mm f/1.8 S", brand: "Nikon", focalLength: 20, maxAperture: 11.11, fNumber: 1.8, mount: "nikon-z" },
  { id: "sony-20mm-f1.8-g", name: "Sony FE 20mm f/1.8 G", brand: "Sony", focalLength: 20, maxAperture: 11.11, fNumber: 1.8, mount: "sony-e" },
  { id: "sigma-24-70mm-f2.8", name: "Sigma 24-70mm f/2.8 DG DN Art", brand: "Sigma", focalLength: 24, maxAperture: 8.57, fNumber: 2.8, mount: "sony-e" },
  { id: "tamron-17-28mm-f2.8", name: "Tamron 17-28mm f/2.8 Di III RXD", brand: "Tamron", focalLength: 17, maxAperture: 6.07, fNumber: 2.8, mount: "sony-e" },
  { id: "canon-ef-24mm-f1.4", name: "Canon EF 24mm f/1.4L II USM", brand: "Canon", focalLength: 24, maxAperture: 17.14, fNumber: 1.4, mount: "canon-ef" },
  // Additional standard
  { id: "nikon-z-50mm-f1.8", name: "Nikon Z 50mm f/1.8 S", brand: "Nikon", focalLength: 50, maxAperture: 27.78, fNumber: 1.8, mount: "nikon-z" },
  { id: "sony-50mm-f1.4-gm", name: "Sony FE 50mm f/1.4 GM", brand: "Sony", focalLength: 50, maxAperture: 35.71, fNumber: 1.4, mount: "sony-e" },
  { id: "canon-rf-50mm-f1.8", name: "Canon RF 50mm f/1.8 STM", brand: "Canon", focalLength: 50, maxAperture: 27.78, fNumber: 1.8, mount: "canon-rf" },
  // Additional telephoto
  { id: "samyang-135mm-f2", name: "Samyang 135mm f/2.0 ED UMC", brand: "Samyang", focalLength: 135, maxAperture: 67.5, fNumber: 2, mount: "universal" },
  { id: "canon-rf-70-200mm-f2.8", name: "Canon RF 70-200mm f/2.8L IS USM", brand: "Canon", focalLength: 70, maxAperture: 25, fNumber: 2.8, mount: "canon-rf" },
  { id: "nikon-z-70-200mm-f2.8", name: "Nikon Z 70-200mm f/2.8 VR S", brand: "Nikon", focalLength: 70, maxAperture: 25, fNumber: 2.8, mount: "nikon-z" },
  { id: "sony-70-200mm-f2.8-gm2", name: "Sony FE 70-200mm f/2.8 GM II", brand: "Sony", focalLength: 70, maxAperture: 25, fNumber: 2.8, mount: "sony-e" },
  { id: "tamron-70-300mm-f4.5-6.3", name: "Tamron 70-300mm f/4.5-6.3 Di III RXD", brand: "Tamron", focalLength: 70, maxAperture: 15.56, fNumber: 4.5, mount: "sony-e" },
  { id: "sigma-100-400mm-f5-6.3", name: "Sigma 100-400mm f/5-6.3 DG DN OS", brand: "Sigma", focalLength: 100, maxAperture: 20, fNumber: 5, mount: "sony-e" },
  { id: "canon-ef-70-200mm-f2.8", name: "Canon EF 70-200mm f/2.8L IS III USM", brand: "Canon", focalLength: 70, maxAperture: 25, fNumber: 2.8, mount: "canon-ef" },
  { id: "nikon-200-500mm-f5.6", name: "Nikon AF-S 200-500mm f/5.6E ED VR", brand: "Nikon", focalLength: 200, maxAperture: 35.71, fNumber: 5.6, mount: "nikon-f" },
  { id: "canon-ef-100mm-f2.8-macro", name: "Canon EF 100mm f/2.8L Macro IS USM", brand: "Canon", focalLength: 100, maxAperture: 35.71, fNumber: 2.8, mount: "canon-ef" },
  { id: "tamron-150-500mm-f5-6.7", name: "Tamron 150-500mm f/5-6.7 Di III VC VXD", brand: "Tamron", focalLength: 150, maxAperture: 30, fNumber: 5, mount: "sony-e" },
  // MFT lenses
  { id: "olympus-12mm-f2", name: "Olympus M.Zuiko 12mm f/2.0", brand: "Olympus", focalLength: 12, maxAperture: 6, fNumber: 2, mount: "mft" },
  { id: "olympus-25mm-f1.2", name: "Olympus M.Zuiko 25mm f/1.2 Pro", brand: "Olympus", focalLength: 25, maxAperture: 20.83, fNumber: 1.2, mount: "mft" }
], B = [
  // Star trackers (lightweight, portable)
  { id: "ioptron-skyguider-pro", name: "iOptron SkyGuider Pro", brand: "iOptron", type: "star-tracker", maxPayloadKg: 5, periodicError: 10, autoguide: !0, goto: !1, maxUnguidedExposure: 120, referenceFocalLength: 200 },
  { id: "ioptron-skytracker-pro", name: "iOptron SkyTracker Pro", brand: "iOptron", type: "star-tracker", maxPayloadKg: 3, periodicError: 25, autoguide: !1, goto: !1, maxUnguidedExposure: 60, referenceFocalLength: 200 },
  { id: "sw-star-adventurer-gti", name: "Sky-Watcher Star Adventurer GTi", brand: "Sky-Watcher", type: "star-tracker", maxPayloadKg: 5, periodicError: 10, autoguide: !0, goto: !0, maxUnguidedExposure: 120, referenceFocalLength: 200 },
  { id: "sw-star-adventurer-2i", name: "Sky-Watcher Star Adventurer 2i", brand: "Sky-Watcher", type: "star-tracker", maxPayloadKg: 5, periodicError: 12, autoguide: !0, goto: !1, maxUnguidedExposure: 90, referenceFocalLength: 200 },
  { id: "sw-star-adventurer-mini", name: "Sky-Watcher Star Adventurer Mini", brand: "Sky-Watcher", type: "star-tracker", maxPayloadKg: 3, periodicError: 20, autoguide: !1, goto: !1, maxUnguidedExposure: 30, referenceFocalLength: 135 },
  { id: "move-shoot-move", name: "Move Shoot Move Rotator", brand: "Move Shoot Move", type: "star-tracker", maxPayloadKg: 3, periodicError: 30, autoguide: !1, goto: !1, maxUnguidedExposure: 30, referenceFocalLength: 50 },
  { id: "benro-polaris", name: "Benro Polaris", brand: "Benro", type: "star-tracker", maxPayloadKg: 5, periodicError: 15, autoguide: !1, goto: !0, maxUnguidedExposure: 90, referenceFocalLength: 200 },
  { id: "vixen-polarie-u", name: "Vixen Polarie U", brand: "Vixen", type: "star-tracker", maxPayloadKg: 3.5, periodicError: 15, autoguide: !1, goto: !1, maxUnguidedExposure: 60, referenceFocalLength: 100 },
  // Portable EQ mounts
  { id: "ioptron-cem26", name: "iOptron CEM26", brand: "iOptron", type: "eq-mount", maxPayloadKg: 12.7, periodicError: 8, autoguide: !0, goto: !0, maxUnguidedExposure: 180, referenceFocalLength: 500 },
  { id: "ioptron-gem28", name: "iOptron GEM28", brand: "iOptron", type: "eq-mount", maxPayloadKg: 12.7, periodicError: 10, autoguide: !0, goto: !0, maxUnguidedExposure: 120, referenceFocalLength: 500 },
  { id: "sw-heq5", name: "Sky-Watcher HEQ5 Pro", brand: "Sky-Watcher", type: "eq-mount", maxPayloadKg: 13.6, periodicError: 8, autoguide: !0, goto: !0, maxUnguidedExposure: 120, referenceFocalLength: 750 },
  { id: "sw-eq6r-pro", name: "Sky-Watcher EQ6-R Pro", brand: "Sky-Watcher", type: "eq-mount", maxPayloadKg: 20.4, periodicError: 6, autoguide: !0, goto: !0, maxUnguidedExposure: 180, referenceFocalLength: 1e3 },
  { id: "sw-az-gti", name: "Sky-Watcher AZ-GTi", brand: "Sky-Watcher", type: "alt-az-tracker", maxPayloadKg: 5, periodicError: 20, autoguide: !1, goto: !0, maxUnguidedExposure: 30, referenceFocalLength: 200 },
  { id: "celestron-avx", name: "Celestron Advanced VX", brand: "Celestron", type: "eq-mount", maxPayloadKg: 13.6, periodicError: 12, autoguide: !0, goto: !0, maxUnguidedExposure: 90, referenceFocalLength: 750 },
  { id: "celestron-cgx", name: "Celestron CGX", brand: "Celestron", type: "eq-mount", maxPayloadKg: 24.9, periodicError: 8, autoguide: !0, goto: !0, maxUnguidedExposure: 180, referenceFocalLength: 1e3 },
  // Premium mounts
  { id: "ioptron-cem70", name: "iOptron CEM70", brand: "iOptron", type: "eq-mount", maxPayloadKg: 31.8, periodicError: 5, autoguide: !0, goto: !0, maxUnguidedExposure: 300, referenceFocalLength: 1e3 },
  { id: "sw-eq8r-pro", name: "Sky-Watcher EQ8-R Pro", brand: "Sky-Watcher", type: "eq-mount", maxPayloadKg: 50, periodicError: 5, autoguide: !0, goto: !0, maxUnguidedExposure: 300, referenceFocalLength: 2e3 },
  { id: "rainbow-rsth", name: "Rainbow Astro RST-135", brand: "Rainbow Astro", type: "eq-mount", maxPayloadKg: 13, periodicError: 3, autoguide: !0, goto: !0, maxUnguidedExposure: 300, referenceFocalLength: 1e3 },
  { id: "zwo-am5", name: "ZWO AM5", brand: "ZWO", type: "eq-mount", maxPayloadKg: 13, periodicError: 5, autoguide: !0, goto: !0, maxUnguidedExposure: 300, referenceFocalLength: 1e3 },
  { id: "zwo-am3", name: "ZWO AM3", brand: "ZWO", type: "eq-mount", maxPayloadKg: 9, periodicError: 7, autoguide: !0, goto: !0, maxUnguidedExposure: 180, referenceFocalLength: 500 }
];
class at {
  constructor(a, t, r, n, i = null) {
    this.camera = a, this.focalLength = t * n, this.aperture = r, this.barlowFactor = n, this.tracker = i;
  }
  /**
   * Field of view in degrees.
   */
  fov() {
    const a = 2 * Math.atan(this.camera.sensorWidth / (2 * this.focalLength)) * 180 / Math.PI, t = 2 * Math.atan(this.camera.sensorHeight / (2 * this.focalLength)) * 180 / Math.PI, r = Math.sqrt(this.camera.sensorWidth ** 2 + this.camera.sensorHeight ** 2), n = 2 * Math.atan(r / (2 * this.focalLength)) * 180 / Math.PI;
    return { width: a, height: t, diagonal: n };
  }
  /**
   * Pixel scale in arcseconds per pixel.
   */
  pixelScale() {
    return this.camera.pixelSize / this.focalLength * 206.265;
  }
  /**
   * Framing analysis for a catalog object.
   *
   * @param objectId - Catalog object ID (e.g. `'m42'`, `'m31'`).
   * @param overlapPercent - Mosaic overlap percentage. @defaultValue `20`
   */
  framing(a, t = 20) {
    const r = _.get(a);
    if (!r) return null;
    const n = r.size_arcmin ?? 0;
    if (n === 0)
      return { fillPercent: 0, fits: !0, orientation: "either", panels: 1, objectSize: 0, fovWidth: this.fov().width * 60 };
    const i = this.fov(), o = i.width * 60, s = i.height * 60, c = n / o * 100, d = n / s * 100, l = Math.min(c, d), m = l <= 100, h = Math.abs(c - d) < 5 ? "either" : c < d ? "landscape" : "portrait";
    let f = 1;
    if (!m) {
      const p = o * (1 - t / 100), S = s * (1 - t / 100), u = Math.ceil(n / p), x = Math.ceil(n / S);
      f = u * x;
    }
    return { fillPercent: Math.round(l), fits: m, orientation: h, panels: f, objectSize: n, fovWidth: o };
  }
  /**
   * Maximum exposure time before star trails.
   *
   * **Without tracker:** Uses the NPF formula (untracked).
   * **With tracker:** Scales the tracker's reference max exposure by
   * focal length ratio, giving a practical tracked exposure limit.
   *
   * @param observer - Observer location (used for declination correction if objectId provided).
   * @param objectId - Optional target — adjusts for declination.
   */
  maxExposure(a, t) {
    let r;
    if (this.tracker && this.tracker.maxUnguidedExposure && this.tracker.referenceFocalLength)
      r = this.tracker.maxUnguidedExposure * (this.tracker.referenceFocalLength / this.focalLength);
    else {
      const n = this.aperture ?? this.focalLength / 5, i = this.camera.pixelSize;
      r = (35 * n + 30 * i) / this.focalLength;
    }
    if (t && a) {
      const n = _.get(t);
      if (n && n.dec !== null) {
        const i = Math.cos(n.dec * Math.PI / 180);
        i > 0.01 && (r /= i);
      }
    }
    return Math.round(r * 10) / 10;
  }
  /**
   * Check if the tracker can handle this rig's payload.
   *
   * Estimates the camera + optics weight and compares to the tracker's
   * max payload capacity. Returns null if no tracker is set.
   *
   * @param opticsWeightKg - Weight of telescope/lens in kg. Estimated if not provided.
   */
  payloadCheck(a) {
    if (!this.tracker) return null;
    const t = this.camera.type === "dedicated" ? 0.5 : 0.8, r = a ?? (this.focalLength > 500 ? 4 : this.focalLength > 200 ? 2 : 1), n = Math.round((t + r) * 10) / 10, i = Math.round((this.tracker.maxPayloadKg - n) / this.tracker.maxPayloadKg * 100);
    return {
      withinLimits: n <= this.tracker.maxPayloadKg,
      estimatedPayloadKg: n,
      maxPayloadKg: this.tracker.maxPayloadKg,
      headroomPercent: Math.max(0, i)
    };
  }
  /**
   * Whether this rig is tracked (has a tracker/mount).
   */
  get isTracked() {
    return this.tracker !== null;
  }
  /**
   * Best targets visible tonight that fit well in this rig's FOV.
   *
   * Returns objects where `size_arcmin` is between 10% and 100% of the
   * FOV width — well-framed, not too small, not too large.
   *
   * @param observer - Observer location and time.
   * @param limit - Max results. @defaultValue `10`
   */
  bestTargets(a, t = 10) {
    const r = P.whatsUp(a, { minAltitude: 20, magnitudeLimit: 10, limit: 50 }), n = this.fov().width * 60;
    return r.filter((i) => {
      const o = i.object.size_arcmin ?? 0;
      if (o === 0) return !1;
      const s = o / n * 100;
      return s >= 10 && s <= 150;
    }).map((i) => ({
      ...i,
      framing: this.framing(i.object.id)
    })).sort((i, o) => {
      const s = Math.abs(i.framing.fillPercent - 65), c = Math.abs(o.framing.fillPercent - 65);
      return s - c;
    }).slice(0, t);
  }
  /**
   * Effective resolution and comparison to typical seeing.
   */
  resolution() {
    const a = this.pixelScale(), t = this.aperture ?? this.focalLength / 5, r = 116 / t, n = 138.4 / t;
    return { pixelScale: a, dawesLimit: r, raleighLimit: n };
  }
  /**
   * Sampling advice — is this setup oversampled, undersampled, or optimal?
   *
   * @param seeing - Typical seeing in arcseconds. @defaultValue `2.5`
   */
  samplingAdvice(a = 2.5) {
    const t = this.pixelScale(), r = t / a;
    let n, i;
    return r < 0.3 ? (n = "oversampled", i = `Heavily oversampled (${t.toFixed(2)}"/px vs ${a}" seeing). Consider binning 2×2 or using a shorter focal length.`) : r < 0.5 ? (n = "oversampled", i = `Slightly oversampled (${t.toFixed(2)}"/px vs ${a}" seeing). Good for lucky imaging, may benefit from 2×2 binning for faint targets.`) : r <= 1 ? (n = "optimal", i = `Well-matched to seeing (${t.toFixed(2)}"/px vs ${a}" seeing). Optimal Nyquist sampling.`) : r <= 2 ? (n = "undersampled", i = `Slightly undersampled (${t.toFixed(2)}"/px vs ${a}" seeing). Fine for wide-field, may lose fine detail.`) : (n = "undersampled", i = `Undersampled (${t.toFixed(2)}"/px vs ${a}" seeing). Good for wide-field mosaics, not ideal for small targets.`), { pixelScale: t, seeing: a, status: n, advice: i };
  }
}
const rt = {
  /**
   * Get all cameras in the database.
   */
  cameras() {
    return Z;
  },
  /**
   * Look up a camera by name (case-insensitive partial match).
   */
  camera(e) {
    const a = e.toLowerCase();
    return Z.find((t) => t.name.toLowerCase() === a || t.id === a) ?? Z.find((t) => t.name.toLowerCase().includes(a)) ?? null;
  },
  /**
   * Get all telescopes in the database.
   */
  telescopes() {
    return j;
  },
  /**
   * Look up a telescope by name (case-insensitive partial match).
   */
  telescope(e) {
    const a = e.toLowerCase();
    return j.find((t) => t.name.toLowerCase() === a || t.id === a) ?? j.find((t) => t.name.toLowerCase().includes(a)) ?? null;
  },
  /**
   * Get all lenses in the database.
   */
  lenses() {
    return V;
  },
  /**
   * Look up a lens by name (case-insensitive partial match).
   */
  lens(e) {
    const a = e.toLowerCase();
    return V.find((t) => t.name.toLowerCase() === a || t.id === a) ?? V.find((t) => t.name.toLowerCase().includes(a)) ?? null;
  },
  /**
   * Get all trackers/mounts in the database.
   */
  trackers() {
    return B;
  },
  /**
   * Look up a tracker/mount by name (case-insensitive partial match).
   */
  tracker(e) {
    const a = e.toLowerCase();
    return B.find((t) => t.name.toLowerCase() === a || t.id === a) ?? B.find((t) => t.name.toLowerCase().includes(a)) ?? null;
  },
  /**
   * Build an astrophotography rig from equipment names or specs.
   *
   * @example
   * ```ts
   * // From database names
   * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
   *
   * // With a focal reducer
   * const rig2 = Equipment.rig({ camera: 'ZWO ASI294MC Pro', telescope: 'Sky-Watcher 200PDS', barlow: 0.73 })
   *
   * // Camera + lens
   * const rig3 = Equipment.rig({ camera: 'Canon EOS Ra', lens: 'Canon EF 135mm f/2L USM' })
   *
   * // Custom specs
   * const rig4 = Equipment.rig({
   *   camera: { id: 'custom', name: 'My Camera', brand: 'Custom', type: 'dedicated',
   *     sensorWidth: 17.6, sensorHeight: 13.2, pixelSize: 3.8, pixelsX: 4656, pixelsY: 3520 },
   *   focalLength: 530,
   *   aperture: 100,
   * })
   * ```
   */
  rig(e) {
    const a = typeof e.camera == "string" ? this.camera(e.camera) : e.camera;
    if (!a) throw new Error(`Camera not found: ${e.camera}`);
    let t, r = e.aperture ?? null;
    if (e.telescope) {
      const i = typeof e.telescope == "string" ? this.telescope(e.telescope) : e.telescope;
      if (!i) throw new Error(`Telescope not found: ${e.telescope}`);
      t = i.focalLength, r = i.aperture;
    } else if (e.lens) {
      const i = typeof e.lens == "string" ? this.lens(e.lens) : e.lens;
      if (!i) throw new Error(`Lens not found: ${e.lens}`);
      t = i.focalLength, r = i.maxAperture;
    } else if (e.focalLength)
      t = e.focalLength;
    else
      throw new Error("Must provide telescope, lens, or focalLength");
    let n = null;
    if (e.tracker && (n = typeof e.tracker == "string" ? this.tracker(e.tracker) : e.tracker, !n))
      throw new Error(`Tracker not found: ${e.tracker}`);
    return new at(a, t, r, e.barlow ?? 1, n);
  },
  /**
   * Search all equipment (cameras, telescopes, lenses) by name.
   *
   * Returns a unified list of matches across all categories, scored
   * by relevance. Useful for a single search bar UI.
   *
   * @param query - Search query (case-insensitive partial match).
   * @param limit - Max results. @defaultValue `20`
   * @returns Matches with category label and the equipment object.
   *
   * @example
   * ```ts
   * const results = Equipment.search('ASI')
   * // => [{ category: 'camera', name: 'ZWO ASI2600MC Pro', item: Camera }, ...]
   *
   * const results2 = Equipment.search('200mm')
   * // => cameras, telescopes, AND lenses matching "200mm"
   * ```
   */
  search(e, a = 20) {
    const t = e.toLowerCase();
    if (!t) return [];
    const r = [];
    for (const n of Z) {
      const i = `${n.brand} ${n.name}`.toLowerCase();
      let o = 0;
      i === t ? o = 100 : i.startsWith(t) ? o = 60 : i.includes(t) ? o = 30 : n.id.includes(t) && (o = 20), o > 0 && r.push({ category: "camera", name: `${n.brand} ${n.name}`, item: n, score: o });
    }
    for (const n of j) {
      const i = `${n.brand} ${n.name}`.toLowerCase();
      let o = 0;
      i === t ? o = 100 : i.startsWith(t) ? o = 60 : i.includes(t) ? o = 30 : n.id.includes(t) && (o = 20), o > 0 && r.push({ category: "telescope", name: `${n.brand} ${n.name}`, item: n, score: o });
    }
    for (const n of V) {
      const i = `${n.brand} ${n.name}`.toLowerCase();
      let o = 0;
      i === t ? o = 100 : i.startsWith(t) ? o = 60 : i.includes(t) ? o = 30 : n.id.includes(t) && (o = 20), o > 0 && r.push({ category: "lens", name: `${n.brand} ${n.name}`, item: n, score: o });
    }
    for (const n of B) {
      const i = `${n.brand} ${n.name}`.toLowerCase();
      let o = 0;
      i === t ? o = 100 : i.startsWith(t) ? o = 60 : i.includes(t) ? o = 30 : n.id.includes(t) && (o = 20), o > 0 && r.push({ category: "tracker", name: `${n.brand} ${n.name}`, item: n, score: o });
    }
    return r.sort((n, i) => i.score - n.score).slice(0, a).map(({ category: n, name: i, item: o }) => ({ category: n, name: i, item: o }));
  }
}, Q = { ra: 266.4168, dec: -29.0078 }, ot = { ra: 37.9546, dec: 89.2641 }, it = { ra: 317.195, dec: -88.9564 };
function Se(e) {
  if (e <= 0) return 1 / 0;
  const a = (90 - e) * Math.PI / 180;
  return 1 / (Math.cos(a) + 0.50572 * Math.pow(96.07995 - (90 - e), -1.6364));
}
const st = {
  "city-center": 9,
  "bright-suburban": 8,
  suburban: 6,
  "rural-suburban": 5,
  rural: 4,
  "dark-site": 3,
  remote: 2,
  pristine: 1
}, ct = {
  1: 22,
  2: 21.9,
  3: 21.7,
  4: 20.5,
  5: 19.5,
  6: 18.9,
  7: 18.4,
  8: 17.8,
  9: 17
};
function dt(e, a, t) {
  const r = ct[Math.max(1, Math.min(9, Math.round(e)))] ?? 18.9, n = 2, i = 18.9, o = 4, s = 5, c = Math.pow(10, (i - r) / 2.5), d = (a / o) ** 2, l = (s / t) ** 2;
  return n * c * d * l;
}
function lt(e) {
  return e.bortle !== void 0 ? Math.max(1, Math.min(9, Math.round(e.bortle))) : e.skySite ? st[e.skySite] ?? 6 : 6;
}
function mt(e) {
  return e >= 50 && e <= 80 ? 100 : e >= 30 && e < 50 ? 60 + (e - 30) / 20 * 40 : e > 80 && e <= 100 ? 60 + (100 - e) / 20 * 40 : e >= 10 && e < 30 ? 20 + (e - 10) / 20 * 40 : e > 100 && e <= 150 ? 20 + (150 - e) / 50 * 40 : e > 150 ? 10 : 0;
}
const J = {
  // ── Session Planner ──────────────────────────────────────────────────
  /**
   * Generate a scored imaging plan for a night.
   *
   * Computes optimal windows for each target, scores them by altitude,
   * airmass, and moon interference, and sequences them by set-time-first
   * strategy (shoot western targets first).
   *
   * @param observer - Observer location and date.
   * @param targets - Array of object IDs to plan.
   * @param options - Constraints.
   * @returns Scored targets sorted by suggested imaging order.
   */
  sessionPlan(e, a, t = {}) {
    const { minAltitude: r = 25, maxAirmass: n = 2, minMoonSeparation: i = 30 } = t, o = e.date ?? /* @__PURE__ */ new Date(), c = w.twilight({ ...e, date: o }).astronomicalDusk, l = w.twilight({ ...e, date: new Date(o.valueOf() + 864e5) }).astronomicalDawn;
    if (!c || !l) return [];
    const m = A.phase(o), h = A.position(o), f = { ra: h.ra, dec: h.dec }, p = [];
    for (const S of a) {
      const u = _.get(S);
      if (!u || u.ra === null || u.dec === null) continue;
      const x = { ra: u.ra, dec: u.dec };
      let y = -90, k = c, M = null, W = null, I = 1 / 0, D = 0;
      for (let L = c.valueOf(); L <= l.valueOf(); L += 9e5) {
        const v = new Date(L), O = g.equatorialToHorizontal(x, { ...e, date: v }), C = Se(O.alt);
        O.alt >= r && C <= n && (M || (M = v), W = v, C < I && (I = C), C > D && (D = C)), O.alt > y && (y = O.alt, k = v);
      }
      if (!M || !W || y < r) continue;
      const $ = g.angularSeparation(x, f), z = Math.max(0, Math.min(1, (120 - $) / 115)), Y = m.illumination * z;
      if ($ < i && m.illumination > 0.3) continue;
      const T = Math.min(y / 90, 1) * 40, F = (1 - Math.min(I - 1, 2) / 2) * 30, b = (1 - Y) * 30, N = Math.round(T + F + b);
      p.push({
        objectId: S,
        name: u.name,
        start: M,
        end: W,
        transit: k,
        peakAltitude: y,
        airmassRange: [Math.round(I * 100) / 100, Math.round(D * 100) / 100],
        moonSeparation: Math.round($),
        moonInterference: Math.round(Y * 100) / 100,
        score: N
      });
    }
    return p.sort((S, u) => S.end.valueOf() - u.end.valueOf()), p;
  },
  /**
   * Optimal imaging window for a single target.
   *
   * @param objectId - Catalog object ID.
   * @param observer - Observer location and date.
   * @param maxAirmass - Maximum acceptable airmass. @defaultValue `2.0`
   */
  imagingWindow(e, a, t = 2) {
    const r = P.bestWindow(e, a, 15);
    if (!r) return null;
    const n = _.get(e);
    if (!n || n.ra === null || n.dec === null) return null;
    const i = g.riseTransitSet({ ra: n.ra, dec: n.dec }, a), s = w.twilight(a).astronomicalDusk, d = w.twilight({ ...a, date: new Date((a.date ?? /* @__PURE__ */ new Date()).valueOf() + 864e5) }).astronomicalDawn, l = s && d ? (d.valueOf() - s.valueOf()) / 36e5 : 8, m = r.rise && r.set ? (r.set.valueOf() - r.rise.valueOf()) / 36e5 : l;
    return {
      start: r.rise,
      end: r.set,
      transit: i.transit,
      peakAltitude: r.peakAltitude,
      hours: Math.round(m * 10) / 10
    };
  },
  // ── Exposure Calculators ─────────────────────────────────────────────
  /**
   * NPF rule — max untracked exposure before star trails.
   *
   * Formula: `(35 × aperture + 30 × pixelPitch) / focalLength`
   *
   * @param params - Optical parameters.
   * @param params.focalLength - Focal length in mm.
   * @param params.aperture - Aperture in mm. Defaults to focalLength / 5.
   * @param params.pixelSize - Pixel size in μm. Defaults to 4.0.
   * @param params.declination - Target declination in degrees (optional, corrects for pole proximity).
   */
  maxExposure(e) {
    const { focalLength: a, pixelSize: t = 4 } = e;
    let n = (35 * (e.aperture ?? a / 5) + 30 * t) / a;
    if (e.declination !== void 0) {
      const i = Math.cos(e.declination * Math.PI / 180);
      i > 0.01 && (n /= i);
    }
    return Math.round(n * 10) / 10;
  },
  /**
   * Rule of 500 — quick max exposure estimate.
   *
   * @param focalLength - Focal length in mm.
   * @param cropFactor - Sensor crop factor. @defaultValue `1.0`
   */
  ruleOf500(e, a = 1) {
    return Math.round(500 / (e * a) * 10) / 10;
  },
  /**
   * Optimal sub-exposure length so sky noise dominates read noise.
   *
   * @param params.readNoise - Camera read noise in electrons.
   * @param params.skyBrightness - Sky background in electrons/pixel/second.
   * @param params.targetRatio - Sky-to-read noise ratio. @defaultValue `3`
   */
  subExposure(e) {
    const { readNoise: a, skyBrightness: t, targetRatio: r = 3 } = e;
    if (t <= 0) return 300;
    const n = (r * a) ** 2 / t;
    return Math.round(n);
  },
  /**
   * Total integration time needed for a target SNR.
   *
   * @param params.subLength - Single sub-exposure length in seconds.
   * @param params.subSNR - SNR achieved in a single sub.
   * @param params.targetSNR - Desired final SNR.
   * @returns Total integration time in hours and number of subs.
   */
  totalIntegration(e) {
    const { subLength: a, subSNR: t, targetSNR: r } = e, n = Math.ceil((r / t) ** 2);
    return { hours: Math.round(n * a / 3600 * 10) / 10, subs: n };
  },
  // ── Milky Way ────────────────────────────────────────────────────────
  /**
   * Galactic center (Sgr A*) position and rise/set/transit times.
   *
   * @param observer - Observer location and date.
   */
  milkyWay(e) {
    const a = e.date ?? /* @__PURE__ */ new Date(), t = g.equatorialToHorizontal(Q, { ...e, date: a }), r = g.riseTransitSet(Q, e);
    return {
      position: { ...Q },
      altitude: t.alt,
      azimuth: t.az,
      aboveHorizon: t.alt > 0,
      rise: r.rise,
      set: r.set,
      transit: r.transit
    };
  },
  /**
   * Milky Way core season — months when the galactic center is visible
   * during astronomical darkness.
   *
   * @param observer - Observer location.
   * @returns Array of month numbers (1–12) when the core is visible at night.
   */
  milkyWaySeason(e) {
    const a = (e.date ?? /* @__PURE__ */ new Date()).getFullYear(), t = [];
    for (let r = 1; r <= 12; r++) {
      const n = new Date(a, r - 1, 15), i = w.twilight({ ...e, date: n });
      if (!i.astronomicalDusk) continue;
      const o = i.astronomicalDusk, c = w.twilight({ ...e, date: new Date(n.valueOf() + 864e5) }).astronomicalDawn;
      if (c) {
        for (let d = o.valueOf(); d <= c.valueOf(); d += 36e5)
          if (g.equatorialToHorizontal(Q, { ...e, date: new Date(d) }).alt > 10) {
            t.push(r);
            break;
          }
      }
    }
    return t;
  },
  // ── Polar Alignment ──────────────────────────────────────────────────
  /**
   * Polar alignment info — Polaris offset from true NCP.
   *
   * @param observer - Observer location and date.
   */
  polarAlignment(e) {
    const a = e.date ?? /* @__PURE__ */ new Date(), t = e.lat >= 0, r = t ? ot : it, n = g.equatorialToHorizontal(r, { ...e, date: a }), i = t ? 90 : -90, o = Math.abs(r.dec - i), d = (((g.lst(a, e.lng) - r.ra) % 360 + 360) % 360 + 180) % 360;
    return {
      polarisOffset: Math.round(o * 1e3) / 1e3,
      positionAngle: Math.round(d * 10) / 10,
      polarisAltitude: n.alt,
      polarisAzimuth: n.az,
      hemisphere: t ? "north" : "south"
    };
  },
  // ── Utilities ────────────────────────────────────────────────────────
  /**
   * Golden hour times (sun altitude +6° to -4°).
   */
  goldenHour(e) {
    const a = e.date ?? /* @__PURE__ */ new Date(), t = w.position(a), r = g.riseTransitSet(t, { ...e, date: a }, 6), n = g.riseTransitSet(t, { ...e, date: a }, -4);
    return {
      morning: n.rise && r.rise ? { start: n.rise, end: r.rise } : null,
      evening: r.set && n.set ? { start: r.set, end: n.set } : null
    };
  },
  /**
   * Blue hour times (sun altitude -4° to -6°).
   */
  blueHour(e) {
    const a = e.date ?? /* @__PURE__ */ new Date(), t = w.position(a), r = g.riseTransitSet(t, { ...e, date: a }, -4), n = g.riseTransitSet(t, { ...e, date: a }, -6);
    return {
      morning: n.rise && r.rise ? { start: n.rise, end: r.rise } : null,
      evening: r.set && n.set ? { start: r.set, end: n.set } : null
    };
  },
  /**
   * Optimal flat frame window — twilight with even sky brightness (sun at -2° to -6°).
   */
  flatFrameWindow(e) {
    const a = e.date ?? /* @__PURE__ */ new Date(), t = w.position(a), r = g.riseTransitSet(t, { ...e, date: a }, -2), n = g.riseTransitSet(t, { ...e, date: a }, -6);
    return {
      morning: n.rise && r.rise ? { start: n.rise, end: r.rise } : null,
      evening: r.set && n.set ? { start: r.set, end: n.set } : null
    };
  },
  /**
   * Brightest star near zenith — ideal for collimation and focusing.
   *
   * @param observer - Observer location and time.
   */
  collimationStar(e) {
    const a = P.whatsUp(e, { types: ["star"], magnitudeLimit: 3, minAltitude: 50, limit: 10 });
    if (a.length === 0) return null;
    const t = a.sort((r, n) => n.alt - r.alt)[0];
    return { name: t.object.name, altitude: t.alt, azimuth: t.az };
  },
  /**
   * Convert SQM (mag/arcsec²) to Bortle class.
   */
  bortleClass(e) {
    return e >= 21.99 ? 1 : e >= 21.89 ? 2 : e >= 21.69 ? 3 : e >= 20.49 ? 4 : e >= 19.5 ? 5 : e >= 18.94 ? 6 : e >= 18.38 ? 7 : e >= 17.8 ? 8 : 9;
  },
  /**
   * Convert SQM to naked-eye limiting magnitude.
   */
  sqmToNELM(e) {
    return Math.round((7.93 - 5 * Math.log10(1 + Math.pow(10, 4.316 - e / 5))) * 10) / 10;
  },
  // ── Rig-Aware Session Planner ───────────────────────────────────────
  /**
   * Generate a capture plan for a specific rig and observer.
   *
   * Combines target discovery, framing analysis, observing-condition
   * scoring, and exposure guidance into a single result. Auto-discovers
   * targets that fit well in the rig's FOV, and optionally includes
   * explicit targets regardless of framing quality.
   *
   * Targets are scored by a weighted blend of observing conditions (60%)
   * and framing quality (40%), then sequenced by set-time-first strategy
   * (shoot western targets first).
   *
   * @param rig - The astrophotography rig (camera + optics + optional tracker).
   * @param observer - Observer location and date.
   * @param options - Planning constraints and target overrides.
   * @returns Complete capture plan with per-target framing, exposure, and scoring.
   *
   * @example
   * ```ts
   * import { Equipment, AstroPhoto } from '@motioncomplex/cosmos-lib'
   *
   * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Sky-Watcher Esprit 100ED' })
   * const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }
   *
   * const plan = AstroPhoto.rigPlan(rig, observer)
   * for (const t of plan.targets) {
   *   console.log(`${t.name}: score ${t.score}, fills ${t.framing.fillPercent}% of sensor`)
   *   console.log(`  Image ${t.start.toLocaleTimeString()}–${t.end.toLocaleTimeString()}`)
   *   console.log(`  Max exposure: ${t.maxExposure}s, panels: ${t.framing.panels}`)
   * }
   * ```
   */
  rigPlan(e, a, t = {}) {
    const {
      targets: r = [],
      autoLimit: n = 15,
      minFillPercent: i = 10,
      maxFillPercent: o = 150,
      minAltitude: s = 25,
      maxAirmass: c = 2,
      minMoonSeparation: d = 30,
      targetSNR: l = 25
    } = t, m = lt(t), h = a.date ?? /* @__PURE__ */ new Date(), p = w.twilight({ ...a, date: h }).astronomicalDusk, u = w.twilight({ ...a, date: new Date(h.valueOf() + 864e5) }).astronomicalDawn;
    if (!p || !u) return null;
    const x = (u.valueOf() - p.valueOf()) / 36e5, y = J.flatFrameWindow({ ...a, date: h }), k = y.evening ?? y.morning, M = A.phase(h), W = A.position(h), I = { ra: W.ra, dec: W.dec }, D = e.fov().width * 60, $ = P.whatsUp(a, { minAltitude: 20, magnitudeLimit: 10, limit: 100 }), z = /* @__PURE__ */ new Set();
    for (const b of $) {
      const N = b.object.size_arcmin ?? 0;
      if (N === 0) continue;
      const L = N / D * 100;
      if (L >= i && L <= o && z.add(b.object.id), z.size >= n) break;
    }
    const Y = new Set(r.map((b) => b.toLowerCase())), T = /* @__PURE__ */ new Map();
    for (const b of Y)
      T.set(b, "explicit");
    for (const b of z)
      T.has(b) || T.set(b, "auto");
    const F = [];
    for (const [b, N] of T) {
      const L = _.get(b);
      if (!L || L.ra === null || L.dec === null) continue;
      const v = { ra: L.ra, dec: L.dec };
      let O = -90, C = p, X = null, te = null, q = 1 / 0, ne = 0;
      for (let se = p.valueOf(); se <= u.valueOf(); se += 9e5) {
        const U = new Date(se), K = g.equatorialToHorizontal(v, { ...a, date: U }), H = Se(K.alt);
        K.alt >= s && H <= c && (X || (X = U), te = U, H < q && (q = H), H > ne && (ne = H)), K.alt > O && (O = K.alt, C = U);
      }
      if (!X || !te || O < s) continue;
      const ae = g.angularSeparation(v, I), Oe = Math.max(0, Math.min(1, (120 - ae) / 115)), me = M.illumination * Oe;
      if (ae < d && M.illumination > 0.3) continue;
      const re = e.framing(b);
      if (!re) continue;
      const ue = e.maxExposure(a, b), pe = e.aperture ? Math.round(e.focalLength / e.aperture * 10) / 10 : 5, R = e.camera, Ne = R.readNoise ?? (R.type === "dedicated" ? 1.5 : R.type === "mirrorless" ? 3 : 3.5), fe = dt(m, R.pixelSize, pe), Ce = J.subExposure({ readNoise: Ne, skyBrightness: fe }), G = Math.min(Ce, ue), ve = Math.max(1, Math.sqrt(G * fe * 0.1)), he = J.totalIntegration({ subLength: G, subSNR: ve, targetSNR: l }), oe = R.recommendedISO ?? null, ie = R.recommendedGain ?? null, ge = oe ? `ISO ${oe}` : ie !== null ? `Gain ${ie}` : "", _e = {
        focalRatio: pe,
        iso: oe,
        gain: ie,
        subExposure: G,
        totalIntegration: he.hours,
        subs: he.subs,
        calibration: {
          darks: 30,
          flats: 30,
          bias: 50,
          darkNote: `Match ${G}s${ge ? ", " + ge : ""}, same temperature`,
          flatNote: k ? `Shoot during twilight flat window (${k.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${k.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : "Shoot during twilight or use an even light source"
        }
      }, We = Math.min(O / 90, 1) * 40, Ie = (1 - Math.min(q - 1, 2) / 2) * 30, Te = (1 - me) * 30, Re = We + Ie + Te, Pe = mt(re.fillPercent), De = Math.round(Re * 0.6 + Pe * 0.4);
      F.push({
        objectId: b,
        name: L.name,
        start: X,
        end: te,
        transit: C,
        peakAltitude: O,
        airmassRange: [Math.round(q * 100) / 100, Math.round(ne * 100) / 100],
        moonSeparation: Math.round(ae),
        moonInterference: Math.round(me * 100) / 100,
        framing: re,
        maxExposure: ue,
        capture: _e,
        score: De,
        source: N
      });
    }
    return F.sort((b, N) => b.end.valueOf() - N.end.valueOf()), {
      targets: F,
      darkness: { start: p, end: u },
      darknessHours: Math.round(x * 10) / 10,
      rig: {
        focalLength: e.focalLength,
        fov: e.fov(),
        pixelScale: e.pixelScale(),
        isTracked: e.isTracked
      }
    };
  }
}, ht = {
  sun: {
    id: "sun",
    name: "Sun Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg"
    ],
    credit: "NASA/SDO (AIA)",
    license: "public-domain",
    width: 4096,
    height: 4096
  },
  mercury: {
    id: "mercury",
    name: "Mercury Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg"
    ],
    credit: "NASA/Johns Hopkins APL/Carnegie Institution",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  venus: {
    id: "venus",
    name: "Venus Surface (Radar)",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/16/Solarsystemscope_texture_2k_venus_surface.jpg"
    ],
    credit: "NASA/JPL-Caltech",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  venus_atmosphere: {
    id: "venus_atmosphere",
    name: "Venus Atmosphere",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Solarsystemscope_texture_2k_venus_atmosphere.jpg"
    ],
    credit: "NASA/JPL-Caltech",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  earth: {
    id: "earth",
    name: "Earth Blue Marble",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Blue_Marble_2002.png"
    ],
    credit: "NASA Visible Earth",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  earth_night: {
    id: "earth_night",
    name: "Earth Night Lights",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Solarsystemscope_texture_8k_earth_nightmap.jpg"
    ],
    credit: "NASA Earth Observatory",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  earth_clouds: {
    id: "earth_clouds",
    name: "Earth Clouds",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/9d/Solarsystemscope_texture_8k_earth_clouds.jpg"
    ],
    credit: "NASA Visible Earth",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  moon: {
    id: "moon",
    name: "Moon Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/a/a8/Solarsystemscope_texture_8k_moon.jpg"
    ],
    credit: "NASA/GSFC/Arizona State University (LROC)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  mars: {
    id: "mars",
    name: "Mars Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/f/fe/Solarsystemscope_texture_8k_mars.jpg"
    ],
    credit: "NASA/JPL-Caltech (MOLA)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  jupiter: {
    id: "jupiter",
    name: "Jupiter Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/48/Solarsystemscope_texture_8k_jupiter.jpg"
    ],
    credit: "NASA/JPL-Caltech (Cassini/Juno)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  saturn: {
    id: "saturn",
    name: "Saturn Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Solarsystemscope_texture_8k_saturn.jpg"
    ],
    credit: "NASA/JPL-Caltech (Cassini)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  saturn_ring: {
    id: "saturn_ring",
    name: "Saturn Ring",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_saturn_ring_alpha.png"
    ],
    credit: "NASA/JPL-Caltech (Cassini)",
    license: "public-domain",
    width: 2048,
    height: 64
  },
  uranus: {
    id: "uranus",
    name: "Uranus Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg"
    ],
    credit: "NASA/JPL-Caltech (Voyager)",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  neptune: {
    id: "neptune",
    name: "Neptune Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg"
    ],
    credit: "NASA/JPL-Caltech (Voyager)",
    license: "public-domain",
    width: 2048,
    height: 1024
  }
}, gt = {
  milky_way: {
    id: "milky_way",
    name: "Milky Way Panorama",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/43/ESO_-_Milky_Way.jpg"
    ],
    credit: "ESO/S. Brunier",
    license: "CC-BY",
    width: 9e3,
    height: 3600
  },
  star_field: {
    id: "star_field",
    name: "Star Field Background",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/8/80/Solarsystemscope_texture_8k_stars.jpg"
    ],
    credit: "NASA/Goddard Space Flight Center",
    license: "public-domain",
    width: 8192,
    height: 4096
  }
}, xe = "https://www.astrobin.com/api/v1";
let ce = "", de = "";
const ut = {
  /**
   * Set Astrobin API credentials.
   *
   * @param apiKey - Your Astrobin API key.
   * @param apiSecret - Your Astrobin API secret.
   */
  setCredentials(e, a) {
    ce = e, de = a;
  },
  /**
   * Search for cameras on Astrobin.
   *
   * @param query - Search query (brand, model name, etc.).
   * @param options - Search options.
   * @returns Array of matching cameras.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchCameras('ZWO ASI')
   * results.forEach(c => console.log(c.make, c.name))
   * ```
   */
  async searchCameras(e, a = {}) {
    const { limit: t = 20 } = a, r = `${xe}/camera/?format=json&name__icontains=${encodeURIComponent(e)}&limit=${t}&api_key=${ce}&api_secret=${de}`, n = await fetch(r);
    if (!n.ok) throw new Error(`Astrobin API error: ${n.status} ${n.statusText}`);
    return ((await n.json()).objects ?? []).map((o) => ({
      id: o.resource_uri ?? "",
      make: o.make ?? "",
      name: o.name ?? "",
      modified: o.modified ?? !1,
      type: o.type ?? ""
    }));
  },
  /**
   * Search for telescopes on Astrobin.
   *
   * @param query - Search query (brand, model name, etc.).
   * @param options - Search options.
   * @returns Array of matching telescopes.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchTelescopes('Celestron C8')
   * results.forEach(t => console.log(t.make, t.name, t.aperture))
   * ```
   */
  async searchTelescopes(e, a = {}) {
    const { limit: t = 20 } = a, r = `${xe}/telescope/?format=json&name__icontains=${encodeURIComponent(e)}&limit=${t}&api_key=${ce}&api_secret=${de}`, n = await fetch(r);
    if (!n.ok) throw new Error(`Astrobin API error: ${n.status} ${n.statusText}`);
    return ((await n.json()).objects ?? []).map((o) => ({
      id: o.resource_uri ?? "",
      make: o.make ?? "",
      name: o.name ?? "",
      type: o.type ?? "",
      aperture: o.aperture ?? null,
      min_focal_length: o.min_focal_length ?? null,
      max_focal_length: o.max_focal_length ?? null
    }));
  },
  /**
   * Convert an Astrobin camera result to a cosmos-lib Camera.
   *
   * Astrobin doesn't store sensor dimensions or pixel size, so you must
   * provide them. Use this when you find a camera on Astrobin and want
   * to use it with `Equipment.rig()`.
   *
   * @param astrobinCamera - The Astrobin camera result.
   * @param specs - Sensor specs not available from Astrobin.
   * @returns A Camera object compatible with `Equipment.rig()`.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchCameras('ASI2600')
   * const cam = Astrobin.toCamera(results[0], {
   *   sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176
   * })
   * const rig = Equipment.rig({ camera: cam, telescope: 'Celestron C8' })
   * ```
   */
  toCamera(e, a) {
    const t = a.pixelsX ?? Math.round(a.sensorWidth * 1e3 / a.pixelSize), r = a.pixelsY ?? Math.round(a.sensorHeight * 1e3 / a.pixelSize);
    return {
      id: `astrobin-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: `${e.make} ${e.name}`.trim(),
      brand: e.make,
      type: e.modified ? "dedicated" : "mirrorless",
      sensorWidth: a.sensorWidth,
      sensorHeight: a.sensorHeight,
      pixelSize: a.pixelSize,
      pixelsX: t,
      pixelsY: r,
      astroModified: e.modified || void 0
    };
  },
  /**
   * Convert an Astrobin telescope result to a cosmos-lib Telescope.
   *
   * Astrobin usually provides aperture and focal length.
   *
   * @param astrobinTelescope - The Astrobin telescope result.
   * @param overrides - Override aperture/focal length if Astrobin data is missing.
   * @returns A Telescope object compatible with `Equipment.rig()`.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchTelescopes('Esprit 100')
   * const scope = Astrobin.toTelescope(results[0])
   * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: scope })
   * ```
   */
  toTelescope(e, a) {
    const t = (a == null ? void 0 : a.aperture) ?? e.aperture ?? 100, r = (a == null ? void 0 : a.focalLength) ?? e.min_focal_length ?? 500, n = Math.round(r / t * 10) / 10, i = {
      refractor: "refractor",
      reflector: "reflector",
      catadioptric: "sct",
      camera_lens: "refractor"
    };
    return {
      id: `astrobin-${e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: `${e.make} ${e.name}`.trim(),
      brand: e.make,
      type: i[e.type] ?? "refractor",
      aperture: t,
      focalLength: r,
      focalRatio: n
    };
  }
};
async function ke(e, a = {}) {
  const { duration: t = 400, easing: r = "ease-in-out", signal: n } = a;
  if (n != null && n.aborted) return;
  if (!("startViewTransition" in document)) {
    await e();
    return;
  }
  document.documentElement.style.setProperty("--cosmos-vt-duration", `${t}ms`), document.documentElement.style.setProperty("--cosmos-vt-easing", r), await document.startViewTransition(e).finished;
}
function we(e, a = {}) {
  const {
    delay: t = 0,
    stagger: r = 60,
    duration: n = 500,
    from: i = "bottom",
    distance: o = "20px",
    signal: s
  } = a;
  if (s != null && s.aborted) return Promise.resolve();
  const d = {
    top: `translateY(-${o})`,
    bottom: `translateY(${o})`,
    left: `translateX(-${o})`,
    right: `translateX(${o})`
  }[i], l = [...e.children];
  return l.forEach((m) => {
    m.style.opacity = "0", m.style.transform = d, m.style.transition = "none";
  }), l.length === 0 ? Promise.resolve() : new Promise((m) => {
    const h = performance.now() + t, f = () => {
      l.forEach((S) => {
        S.style.opacity = "1", S.style.transform = "none", S.style.transition = "";
      }), m();
    };
    s == null || s.addEventListener("abort", f, { once: !0 });
    const p = (S) => {
      if (s != null && s.aborted) return;
      let u = !0;
      for (let x = 0; x < l.length; x++) {
        const y = h + x * r;
        if (S >= y) {
          const k = l[x];
          k.style.opacity === "0" && (k.style.transition = `opacity ${n}ms ease, transform ${n}ms cubic-bezier(0.2,0,0,1)`, k.style.opacity = "1", k.style.transform = "none"), S < y + n && (u = !1);
        } else
          u = !1;
      }
      u ? (s == null || s.removeEventListener("abort", f), m()) : requestAnimationFrame(p);
    };
    requestAnimationFrame(() => requestAnimationFrame(p));
  });
}
function Ae(e, a = {}) {
  const {
    stagger: t = 40,
    duration: r = 300,
    from: n = "bottom",
    distance: i = "12px",
    signal: o
  } = a;
  if (o != null && o.aborted) return Promise.resolve();
  const c = {
    top: `translateY(-${i})`,
    bottom: `translateY(${i})`,
    left: `translateX(-${i})`,
    right: `translateX(${i})`
  }[n], d = [...e.children].reverse();
  return d.length === 0 ? Promise.resolve() : new Promise((l) => {
    const m = performance.now(), h = () => {
      d.forEach((p) => {
        p.style.opacity = "0", p.style.transform = c, p.style.transition = "";
      }), l();
    };
    o == null || o.addEventListener("abort", h, { once: !0 });
    const f = (p) => {
      if (o != null && o.aborted) return;
      let S = !0;
      for (let u = 0; u < d.length; u++) {
        const x = m + u * t;
        if (p >= x) {
          const y = d[u];
          y.style.opacity !== "0" && (y.style.transition = `opacity ${r}ms ease, transform ${r}ms ease`, y.style.opacity = "0", y.style.transform = c), p < x + r && (S = !1);
        } else
          S = !1;
      }
      S ? (o == null || o.removeEventListener("abort", h), l()) : requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
}
function ee(e, a, t = 300) {
  return new Promise((r) => {
    e.style.transition = `opacity ${t}ms ease`, e.style.opacity = a === "in" ? "1" : "0", e.style.pointerEvents = a === "in" ? "auto" : "none";
    const n = () => {
      e.removeEventListener("transitionend", n), r();
    };
    e.addEventListener("transitionend", n, { once: !0 }), setTimeout(r, t + 50);
  });
}
async function Le(e, a, t = 400) {
  a.style.opacity = "0", a.style.pointerEvents = "none", a.style.display = "", await Promise.all([
    ee(e, "out", t),
    ee(a, "in", t)
  ]), e.style.display = "none";
}
function Ee(e, a = {}) {
  const { duration: t = 500, easing: r = "cubic-bezier(0.4,0,0.2,1)", onDone: n, signal: i } = a;
  if (i != null && i.aborted) return;
  const o = e.getBoundingClientRect(), s = window.innerWidth / o.width, c = window.innerHeight / o.height, d = window.innerWidth / 2 - (o.left + o.width / 2), l = window.innerHeight / 2 - (o.top + o.height / 2);
  e.style.transformOrigin = "center center", e.style.transition = "none", e.style.transform = "translate(0,0) scale(1,1)", requestAnimationFrame(() => {
    i != null && i.aborted || requestAnimationFrame(() => {
      if (i != null && i.aborted) return;
      e.style.transition = `transform ${t}ms ${r}`, e.style.transform = `translate(${d}px, ${l}px) scale(${s}, ${c})`;
      const m = () => {
        e.removeEventListener("transitionend", m), e.style.transform = "", e.style.transition = "", n == null || n();
      };
      e.addEventListener("transitionend", m, { once: !0 }), setTimeout(m, t + 100);
    });
  });
}
function Me(e, a = {}, t) {
  const { duration: r = 400, easing: n = "cubic-bezier(0.4,0,0.2,1)", onDone: i, signal: o } = a;
  if (o != null && o.aborted) return;
  const s = e.getBoundingClientRect(), c = s.width / window.innerWidth, d = s.height / window.innerHeight, l = s.left + s.width / 2 - window.innerWidth / 2, m = s.top + s.height / 2 - window.innerHeight / 2, h = !t, f = t ?? document.createElement("div");
  h && (Object.assign(f.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
    transformOrigin: "center center"
  }), document.body.appendChild(f)), f.style.transition = `transform ${r}ms ${n}, opacity ${r * 0.6}ms ease ${r * 0.4}ms`;
  const p = () => {
    f.removeEventListener("transitionend", p), h && f.remove(), i == null || i();
  };
  requestAnimationFrame(() => {
    if (o != null && o.aborted) {
      p();
      return;
    }
    f.style.transform = `translate(${l}px, ${m}px) scale(${c}, ${d})`, f.style.opacity = "0", f.addEventListener("transitionend", p, { once: !0 }), setTimeout(p, r + 100);
  });
}
const yt = {
  morph: ke,
  staggerIn: we,
  staggerOut: Ae,
  fade: ee,
  crossfade: Le,
  heroExpand: Ee,
  heroCollapse: Me
}, St = {
  CONSTANTS: E,
  Units: je,
  Math: g,
  Sun: w,
  Moon: A,
  Eclipse: be,
  Planner: P,
  AstroClock: Ke,
  Events: Be,
  Equipment: rt,
  AstroPhoto: J,
  Data: _,
  Media: Ze,
  API: { NASA: Ue, ESA: Ge, Astrobin: ut, resolveSimbad: qe },
  SkyMap: { render: Xe, stereographic: Ye, mollweide: He, gnomonic: Fe, Interactive: ze, create: $e },
  Transitions: { morph: ke, staggerIn: we, staggerOut: Ae, fade: ee, crossfade: Le, heroExpand: Ee, heroCollapse: Me }
};
export {
  Ke as AstroClock,
  g as AstroMath,
  J as AstroPhoto,
  ut as Astrobin,
  kt as BRIGHT_STARS,
  E as CONSTANTS,
  wt as CONSTELLATIONS,
  At as DEEP_SKY_EXTRAS,
  _ as Data,
  Ge as ESA,
  be as Eclipse,
  rt as Equipment,
  Be as Events,
  Lt as IMAGE_FALLBACKS,
  ze as InteractiveSkyMap,
  Et as MESSIER_CATALOG,
  Mt as METEOR_SHOWERS,
  Ze as Media,
  A as Moon,
  Ue as NASA,
  ht as PLANET_TEXTURES,
  P as Planner,
  at as Rig,
  Ot as SOLAR_SYSTEM,
  gt as STAR_TEXTURES,
  Nt as SkyMap,
  w as Sun,
  yt as Transitions,
  je as Units,
  Ct as buildHips2fitsUrl,
  vt as canvasToEquatorial,
  _t as computeFov,
  $e as createInteractiveSkyMap,
  Le as crossfade,
  St as default,
  ee as fade,
  Wt as getObjectImage,
  Fe as gnomonic,
  Me as heroCollapse,
  Ee as heroExpand,
  He as mollweide,
  ke as morph,
  It as prefetchImages,
  Xe as renderSkyMap,
  Tt as resolveImages,
  qe as resolveSimbad,
  Rt as spectralColor,
  we as staggerIn,
  Ae as staggerOut,
  Ye as stereographic,
  Pt as tryDSS,
  Dt as tryHiPS,
  $t as tryPanSTARRS
};
