import { C as S, M as A, A as _, P as M, D as O, S as E, c as R, I as F, g as q, m as j, s as V, r as U, a as Y, E as B, N as X, b as G } from "./skymap-interactive-BBwTtzAL.js";
import { B as ue, d as de, e as me, f as pe, h as he, i as fe, j as ge, k as ye, l as _e, n as we, o as Se, p as Ae, q as ve, t as Ee, u as ke, v as be } from "./skymap-interactive-BBwTtzAL.js";
import { M as H } from "./media-DVOcIMa1.js";
const J = {
  // ── Distance ───────────────────────────────────────────────────────────────
  /**
   * Convert Astronomical Units to kilometres.
   * @param au - Distance in AU.
   * @returns Distance in kilometres.
   */
  auToKm: (e) => e * S.AU_TO_KM,
  /**
   * Convert kilometres to Astronomical Units.
   * @param km - Distance in kilometres.
   * @returns Distance in AU.
   */
  kmToAu: (e) => e / S.AU_TO_KM,
  /**
   * Convert light-years to parsecs.
   * @param ly - Distance in light-years.
   * @returns Distance in parsecs.
   */
  lyToPc: (e) => e / S.PC_TO_LY,
  /**
   * Convert parsecs to light-years.
   * @param pc - Distance in parsecs.
   * @returns Distance in light-years.
   */
  pcToLy: (e) => e * S.PC_TO_LY,
  /**
   * Convert parsecs to kilometres.
   * @param pc - Distance in parsecs.
   * @returns Distance in kilometres.
   */
  pcToKm: (e) => e * S.PC_TO_KM,
  /**
   * Convert light-years to kilometres.
   * @param ly - Distance in light-years.
   * @returns Distance in kilometres.
   */
  lyToKm: (e) => e * S.LY_TO_KM,
  /**
   * Convert kilometres to light-years.
   * @param km - Distance in kilometres.
   * @returns Distance in light-years.
   */
  kmToLy: (e) => e / S.LY_TO_KM,
  // ── Angular ────────────────────────────────────────────────────────────────
  /**
   * Convert degrees to radians.
   * @param d - Angle in degrees.
   * @returns Angle in radians.
   */
  degToRad: (e) => e * S.DEG_TO_RAD,
  /**
   * Convert radians to degrees.
   * @param r - Angle in radians.
   * @returns Angle in degrees.
   */
  radToDeg: (e) => e * S.RAD_TO_DEG,
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
    const i = e / S.AU_TO_KM;
    if (i < 0.01) return `${e.toFixed(0)} km`;
    if (i < 1e3) return `${i.toPrecision(4)} AU`;
    const o = e / S.LY_TO_KM;
    return o < 1e6 ? `${o.toPrecision(4)} ly` : `${(o / 1e6).toPrecision(4)} Mly`;
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
    const i = e < 0 ? "-" : "", o = Math.abs(e), a = Math.floor(o), s = Math.floor((o - a) * 60), r = ((o - a) * 60 - s) * 60;
    return `${i}${a}°${s}′${r.toFixed(1)}″`;
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
    const i = (e % 360 + 360) % 360, o = Math.floor(i / 15), a = Math.floor((i / 15 - o) * 60), s = ((i / 15 - o) * 60 - a) * 60;
    return `${o}h ${a}m ${s.toFixed(1)}s`;
  }
}, x = {
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
    let i = new Date(e);
    for (let o = 0; o < 26; o++) {
      const a = A.nextPhase(i, "new"), s = this._checkSolarEclipse(a);
      if (s) return s;
      i = new Date(a.valueOf() + 864e5);
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
    let i = new Date(e);
    for (let o = 0; o < 26; o++) {
      const a = A.nextPhase(i, "full"), s = this._checkLunarEclipse(a);
      if (s) return s;
      i = new Date(a.valueOf() + 864e5);
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
  search(e, i, o) {
    const a = [];
    let s = new Date(e);
    const r = i.valueOf();
    for (; s.valueOf() < r; ) {
      if (o !== "lunar") {
        const n = A.nextPhase(s, "new");
        if (n.valueOf() > r) break;
        const t = this._checkSolarEclipse(n);
        t && a.push(t);
      }
      if (o !== "solar") {
        const n = A.nextPhase(s, "full");
        if (n.valueOf() <= r) {
          const t = this._checkLunarEclipse(n);
          t && a.push(t);
        }
      }
      s = new Date(s.valueOf() + 15 * 864e5);
    }
    return a.sort((n, t) => n.date.valueOf() - t.date.valueOf()), a.filter(
      (n, t) => t === 0 || Math.abs(n.date.valueOf() - a[t - 1].date.valueOf()) > 864e5
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
    const i = A.position(e), o = _.planetEcliptic("earth", e), a = ((o.lon + 180) % 360 + 360) % 360;
    if (Math.abs(i.eclipticLat) > 1.5) return null;
    const r = o.r * 1495978707e-1, n = Math.atan2(696e3, r) * (180 / Math.PI), t = Math.atan2(1737.4, i.distance_km) * (180 / Math.PI), c = _.angularSeparation(
      i,
      _.eclipticToEquatorial({ lon: a, lat: 0 })
    ), l = n + t;
    if (c > l * 1.5) return null;
    let u, d;
    if (t >= n && c < t - n)
      u = "total", d = 1;
    else if (t < n && c < n - t)
      u = "annular", d = t / n;
    else if (c < l)
      u = "partial", d = (l - c) / (2 * n);
    else
      return null;
    return { type: "solar", subtype: u, date: e, magnitude: d };
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
    const i = A.position(e), o = Math.abs(i.eclipticLat), a = Math.atan2(6371, i.distance_km) * (180 / Math.PI), s = a * 2.6, r = a * 4.3, n = Math.atan2(1737.4, i.distance_km) * (180 / Math.PI);
    if (o > r + n) return null;
    let t, c;
    if (o < s - n)
      t = "total", c = (s - o) / (2 * n);
    else if (o < s + n)
      t = "partial", c = (s + n - o) / (2 * n);
    else if (o < r + n)
      t = "penumbral", c = (r + n - o) / (2 * n);
    else
      return null;
    return { type: "lunar", subtype: t, date: e, magnitude: Math.min(c, 1) };
  }
}, K = [
  { target: "new", name: "New Moon" },
  { target: "first-quarter", name: "First Quarter Moon" },
  { target: "full", name: "Full Moon" },
  { target: "last-quarter", name: "Last Quarter Moon" }
];
function b(e) {
  return e.charAt(0).toUpperCase() + e.slice(1);
}
const z = {
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
  nextEvents(e, i = {}) {
    const { days: o = 90, categories: a, limit: s = 50 } = i, r = e.date ?? /* @__PURE__ */ new Date(), n = new Date(r.valueOf() + o * 864e5), t = [], c = (l) => !a || a.includes(l);
    if (c("moon-phase") && t.push(...W(r, n)), c("eclipse") && t.push(...Q(r, n)), c("meteor-shower") && t.push(...Z(r, n)), c("opposition") || c("conjunction")) {
      const l = M.planetEvents(e, { days: o });
      for (const u of l)
        if (c(u.type)) {
          let d, f;
          try {
            const m = _.planetEcliptic(u.planet, u.date), h = _.eclipticToEquatorial(m);
            d = h.ra, f = h.dec;
          } catch {
          }
          t.push({
            category: u.type,
            title: `${b(u.planet)} ${u.type}`,
            date: u.date,
            detail: `Solar elongation: ${u.elongation.toFixed(1)}°`,
            ra: d,
            dec: f
          });
        }
    }
    if (c("elongation") && t.push(...ee(r, o)), c("equinox") && t.push(...T(r, n, "equinox")), c("solstice") && t.push(...T(r, n, "solstice")), e.lat !== void 0 && e.lng !== void 0)
      for (const l of t)
        l.ra !== void 0 && l.dec !== void 0 && (l.visibility = te(l, e));
    return t.sort((l, u) => l.date.valueOf() - u.date.valueOf()), t.slice(0, s);
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
  nextEvent(e, i, o = 365) {
    return this.nextEvents(i, { days: o, categories: [e], limit: 1 })[0] ?? null;
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
  toICal(e, i = "Astronomical Events") {
    const o = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//cosmos-lib//Astronomical Events//EN",
      `X-WR-CALNAME:${i}`
    ];
    for (const a of e) {
      const s = a.date, r = `${s.getUTCFullYear()}${String(s.getUTCMonth() + 1).padStart(2, "0")}${String(s.getUTCDate()).padStart(2, "0")}`, n = `${r}-${a.category}-${a.title.replace(/\s/g, "-").toLowerCase()}@cosmos-lib`;
      o.push(
        "BEGIN:VEVENT",
        `DTSTART;VALUE=DATE:${r}`,
        `SUMMARY:${a.title}`,
        `UID:${n}`
      ), a.detail && o.push(`DESCRIPTION:${a.detail}`), o.push("END:VEVENT");
    }
    return o.push("END:VCALENDAR"), o.join(`\r
`);
  }
};
function W(e, i) {
  const o = [];
  for (const { target: a, name: s } of K) {
    let r = new Date(e.valueOf());
    for (let n = 0; n < 20; n++) {
      const t = A.nextPhase(r, a);
      if (t.valueOf() > i.valueOf()) break;
      const c = A.position(t);
      o.push({
        category: "moon-phase",
        title: s,
        date: t,
        ra: c.ra,
        dec: c.dec
      }), r = new Date(t.valueOf() + 864e5);
    }
  }
  return o;
}
function Q(e, i) {
  return x.search(e, i).map((a) => ({
    category: "eclipse",
    title: `${b(a.subtype)} ${a.type} eclipse`,
    date: a.date,
    detail: `Magnitude: ${a.magnitude.toFixed(3)}`
  }));
}
function Z(e, i) {
  const o = [], a = /* @__PURE__ */ new Set();
  for (let s = e.valueOf(); s <= i.valueOf(); s += 864e5) {
    const r = new Date(s), n = O.getActiveShowers(r);
    for (const t of n) {
      if (a.has(t.id)) continue;
      const l = ((_.planetEcliptic("earth", r).lon + 180) % 360 + 360) % 360;
      Math.abs(((l - t.solarLon + 180) % 360 + 360) % 360 - 180) < 2 && (a.add(t.id), o.push({
        category: "meteor-shower",
        title: `${t.name} meteor shower peak`,
        date: r,
        detail: `ZHR: ${t.zhr}, speed: ${t.speed} km/s${t.parentBody ? `, parent: ${t.parentBody}` : ""}`,
        ra: t.radiantRA,
        dec: t.radiantDec,
        constellation: t.code
      }));
    }
  }
  return o;
}
function ee(e, i) {
  const o = [], a = ["mercury", "venus"];
  for (const s of a) {
    let r = 0, n = !0;
    for (let t = 0; t <= i; t++) {
      const c = new Date(e.valueOf() + t * 864e5), l = _.planetEcliptic(s, c), u = _.eclipticToEquatorial(l), d = E.position(c), f = _.angularSeparation(u, { ra: d.ra, dec: d.dec });
      if (t > 0) {
        const m = f > r;
        if (!m && n && r > 15) {
          const h = l.lon, g = d.eclipticLon;
          let p = h - g;
          p > 180 && (p -= 360), p < -180 && (p += 360);
          const w = p > 0 ? "east (evening)" : "west (morning)";
          o.push({
            category: "elongation",
            title: `${b(s)} greatest elongation`,
            date: new Date(e.valueOf() + (t - 1) * 864e5),
            detail: `${r.toFixed(1)}° ${w}`
          });
        }
        n = m;
      }
      r = f;
    }
  }
  return o;
}
function T(e, i, o) {
  const a = [], s = o === "equinox" ? [{ lon: 0, name: "Vernal equinox (March)" }, { lon: 180, name: "Autumnal equinox (September)" }] : [{ lon: 90, name: "Summer solstice (June)" }, { lon: 270, name: "Winter solstice (December)" }];
  for (const { lon: r, name: n } of s) {
    let t = -1;
    for (let c = 0; c <= (i.valueOf() - e.valueOf()) / 864e5; c++) {
      const l = new Date(e.valueOf() + c * 864e5), d = E.position(l).eclipticLon;
      if (c > 0) {
        let f = !1;
        r === 0 ? f = t > 350 && d < 10 : f = t < r && d >= r, f && a.push({
          category: o,
          title: n,
          date: l,
          detail: `Sun ecliptic longitude: ${d.toFixed(2)}°`
        });
      }
      t = d;
    }
  }
  return a;
}
function te(e, i) {
  const o = e.ra, a = e.dec, s = e.date, n = E.twilight({ ...i, date: s }).astronomicalDusk, c = E.twilight({ ...i, date: new Date(s.valueOf() + 864e5) }).astronomicalDawn, l = A.phase(s), u = A.position(s), d = _.angularSeparation({ ra: o, dec: a }, { ra: u.ra, dec: u.dec }), f = Math.max(0, Math.min(1, (120 - d) / 115)), m = l.illumination * f;
  if (!n || !c)
    return {
      visible: !1,
      peakAltitude: _.equatorialToHorizontal({ ra: o, dec: a }, { ...i, date: s }).alt,
      moonInterference: m,
      summary: "No astronomical darkness at this location"
    };
  const h = n.valueOf(), g = c.valueOf();
  let p = -90;
  for (let v = h; v <= g; v += 18e5) {
    const $ = _.equatorialToHorizontal({ ra: o, dec: a }, { ...i, date: new Date(v) });
    $.alt > p && (p = $.alt);
  }
  const w = p > 10;
  let y;
  return w ? m > 0.5 ? y = `Visible at ${p.toFixed(0)}° alt, but strong moon interference (${(m * 100).toFixed(0)}%)` : m > 0.2 ? y = `Good — ${p.toFixed(0)}° alt, moderate moon (${(m * 100).toFixed(0)}%)` : p > 50 ? y = `Excellent — ${p.toFixed(0)}° alt, dark skies` : y = `Good — ${p.toFixed(0)}° alt, low moon interference` : y = p > 0 ? `Low visibility — peak altitude only ${p.toFixed(0)}° above horizon` : "Not visible — target never rises above horizon at this location", { visible: w, peakAltitude: p, moonInterference: m, summary: y };
}
const ae = {
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
}, ie = {
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
};
async function L(e, i = {}) {
  const { duration: o = 400, easing: a = "ease-in-out", signal: s } = i;
  if (s != null && s.aborted) return;
  if (!("startViewTransition" in document)) {
    await e();
    return;
  }
  document.documentElement.style.setProperty("--cosmos-vt-duration", `${o}ms`), document.documentElement.style.setProperty("--cosmos-vt-easing", a), await document.startViewTransition(e).finished;
}
function P(e, i = {}) {
  const {
    delay: o = 0,
    stagger: a = 60,
    duration: s = 500,
    from: r = "bottom",
    distance: n = "20px",
    signal: t
  } = i;
  if (t != null && t.aborted) return Promise.resolve();
  const l = {
    top: `translateY(-${n})`,
    bottom: `translateY(${n})`,
    left: `translateX(-${n})`,
    right: `translateX(${n})`
  }[r], u = [...e.children];
  return u.forEach((d) => {
    d.style.opacity = "0", d.style.transform = l, d.style.transition = "none";
  }), u.length === 0 ? Promise.resolve() : new Promise((d) => {
    const f = performance.now() + o, m = () => {
      u.forEach((g) => {
        g.style.opacity = "1", g.style.transform = "none", g.style.transition = "";
      }), d();
    };
    t == null || t.addEventListener("abort", m, { once: !0 });
    const h = (g) => {
      if (t != null && t.aborted) return;
      let p = !0;
      for (let w = 0; w < u.length; w++) {
        const y = f + w * a;
        if (g >= y) {
          const v = u[w];
          v.style.opacity === "0" && (v.style.transition = `opacity ${s}ms ease, transform ${s}ms cubic-bezier(0.2,0,0,1)`, v.style.opacity = "1", v.style.transform = "none"), g < y + s && (p = !1);
        } else
          p = !1;
      }
      p ? (t == null || t.removeEventListener("abort", m), d()) : requestAnimationFrame(h);
    };
    requestAnimationFrame(() => requestAnimationFrame(h));
  });
}
function D(e, i = {}) {
  const {
    stagger: o = 40,
    duration: a = 300,
    from: s = "bottom",
    distance: r = "12px",
    signal: n
  } = i;
  if (n != null && n.aborted) return Promise.resolve();
  const c = {
    top: `translateY(-${r})`,
    bottom: `translateY(${r})`,
    left: `translateX(-${r})`,
    right: `translateX(${r})`
  }[s], l = [...e.children].reverse();
  return l.length === 0 ? Promise.resolve() : new Promise((u) => {
    const d = performance.now(), f = () => {
      l.forEach((h) => {
        h.style.opacity = "0", h.style.transform = c, h.style.transition = "";
      }), u();
    };
    n == null || n.addEventListener("abort", f, { once: !0 });
    const m = (h) => {
      if (n != null && n.aborted) return;
      let g = !0;
      for (let p = 0; p < l.length; p++) {
        const w = d + p * o;
        if (h >= w) {
          const y = l[p];
          y.style.opacity !== "0" && (y.style.transition = `opacity ${a}ms ease, transform ${a}ms ease`, y.style.opacity = "0", y.style.transform = c), h < w + a && (g = !1);
        } else
          g = !1;
      }
      g ? (n == null || n.removeEventListener("abort", f), u()) : requestAnimationFrame(m);
    };
    requestAnimationFrame(m);
  });
}
function k(e, i, o = 300) {
  return new Promise((a) => {
    e.style.transition = `opacity ${o}ms ease`, e.style.opacity = i === "in" ? "1" : "0", e.style.pointerEvents = i === "in" ? "auto" : "none";
    const s = () => {
      e.removeEventListener("transitionend", s), a();
    };
    e.addEventListener("transitionend", s, { once: !0 }), setTimeout(a, o + 50);
  });
}
async function C(e, i, o = 400) {
  i.style.opacity = "0", i.style.pointerEvents = "none", i.style.display = "", await Promise.all([
    k(e, "out", o),
    k(i, "in", o)
  ]), e.style.display = "none";
}
function N(e, i = {}) {
  const { duration: o = 500, easing: a = "cubic-bezier(0.4,0,0.2,1)", onDone: s, signal: r } = i;
  if (r != null && r.aborted) return;
  const n = e.getBoundingClientRect(), t = window.innerWidth / n.width, c = window.innerHeight / n.height, l = window.innerWidth / 2 - (n.left + n.width / 2), u = window.innerHeight / 2 - (n.top + n.height / 2);
  e.style.transformOrigin = "center center", e.style.transition = "none", e.style.transform = "translate(0,0) scale(1,1)", requestAnimationFrame(() => {
    r != null && r.aborted || requestAnimationFrame(() => {
      if (r != null && r.aborted) return;
      e.style.transition = `transform ${o}ms ${a}`, e.style.transform = `translate(${l}px, ${u}px) scale(${t}, ${c})`;
      const d = () => {
        e.removeEventListener("transitionend", d), e.style.transform = "", e.style.transition = "", s == null || s();
      };
      e.addEventListener("transitionend", d, { once: !0 }), setTimeout(d, o + 100);
    });
  });
}
function I(e, i = {}, o) {
  const { duration: a = 400, easing: s = "cubic-bezier(0.4,0,0.2,1)", onDone: r, signal: n } = i;
  if (n != null && n.aborted) return;
  const t = e.getBoundingClientRect(), c = t.width / window.innerWidth, l = t.height / window.innerHeight, u = t.left + t.width / 2 - window.innerWidth / 2, d = t.top + t.height / 2 - window.innerHeight / 2, f = !o, m = o ?? document.createElement("div");
  f && (Object.assign(m.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
    transformOrigin: "center center"
  }), document.body.appendChild(m)), m.style.transition = `transform ${a}ms ${s}, opacity ${a * 0.6}ms ease ${a * 0.4}ms`;
  const h = () => {
    m.removeEventListener("transitionend", h), f && m.remove(), r == null || r();
  };
  requestAnimationFrame(() => {
    if (n != null && n.aborted) {
      h();
      return;
    }
    m.style.transform = `translate(${u}px, ${d}px) scale(${c}, ${l})`, m.style.opacity = "0", m.addEventListener("transitionend", h, { once: !0 }), setTimeout(h, a + 100);
  });
}
const se = {
  morph: L,
  staggerIn: P,
  staggerOut: D,
  fade: k,
  crossfade: C,
  heroExpand: N,
  heroCollapse: I
}, re = {
  CONSTANTS: S,
  Units: J,
  Math: _,
  Sun: E,
  Moon: A,
  Eclipse: x,
  Planner: M,
  AstroClock: G,
  Events: z,
  Data: O,
  Media: H,
  API: { NASA: X, ESA: B, resolveSimbad: Y },
  SkyMap: { render: U, stereographic: V, mollweide: j, gnomonic: q, Interactive: F, create: R },
  Transitions: { morph: L, staggerIn: P, staggerOut: D, fade: k, crossfade: C, heroExpand: N, heroCollapse: I }
};
export {
  G as AstroClock,
  _ as AstroMath,
  ue as BRIGHT_STARS,
  S as CONSTANTS,
  de as CONSTELLATIONS,
  me as DEEP_SKY_EXTRAS,
  O as Data,
  B as ESA,
  x as Eclipse,
  z as Events,
  pe as IMAGE_FALLBACKS,
  F as InteractiveSkyMap,
  he as MESSIER_CATALOG,
  fe as METEOR_SHOWERS,
  H as Media,
  A as Moon,
  X as NASA,
  ae as PLANET_TEXTURES,
  M as Planner,
  ge as SOLAR_SYSTEM,
  ie as STAR_TEXTURES,
  ye as SkyMap,
  E as Sun,
  se as Transitions,
  J as Units,
  _e as canvasToEquatorial,
  we as computeFov,
  R as createInteractiveSkyMap,
  C as crossfade,
  re as default,
  k as fade,
  Se as getObjectImage,
  q as gnomonic,
  I as heroCollapse,
  N as heroExpand,
  j as mollweide,
  L as morph,
  Ae as prefetchImages,
  U as renderSkyMap,
  ve as resolveImages,
  Y as resolveSimbad,
  Ee as spectralColor,
  P as staggerIn,
  D as staggerOut,
  V as stereographic,
  ke as tryDSS,
  be as tryPanSTARRS
};
