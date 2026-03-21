import { C as h, M as w, A as k, c as P, I as $, g as x, m as C, s as N, r as I, a as R, E as D, N as j, D as F, b as Y, P as X, S as K } from "./skymap-interactive-BBwTtzAL.js";
import { B as ee, d as te, e as ie, f as ne, h as ae, i as se, j as re, k as oe, l as ce, n as le, o as ue, p as de, q as me, t as pe, u as he, v as fe } from "./skymap-interactive-BBwTtzAL.js";
import { M as q } from "./media-DVOcIMa1.js";
const J = {
  // ── Distance ───────────────────────────────────────────────────────────────
  /**
   * Convert Astronomical Units to kilometres.
   * @param au - Distance in AU.
   * @returns Distance in kilometres.
   */
  auToKm: (e) => e * h.AU_TO_KM,
  /**
   * Convert kilometres to Astronomical Units.
   * @param km - Distance in kilometres.
   * @returns Distance in AU.
   */
  kmToAu: (e) => e / h.AU_TO_KM,
  /**
   * Convert light-years to parsecs.
   * @param ly - Distance in light-years.
   * @returns Distance in parsecs.
   */
  lyToPc: (e) => e / h.PC_TO_LY,
  /**
   * Convert parsecs to light-years.
   * @param pc - Distance in parsecs.
   * @returns Distance in light-years.
   */
  pcToLy: (e) => e * h.PC_TO_LY,
  /**
   * Convert parsecs to kilometres.
   * @param pc - Distance in parsecs.
   * @returns Distance in kilometres.
   */
  pcToKm: (e) => e * h.PC_TO_KM,
  /**
   * Convert light-years to kilometres.
   * @param ly - Distance in light-years.
   * @returns Distance in kilometres.
   */
  lyToKm: (e) => e * h.LY_TO_KM,
  /**
   * Convert kilometres to light-years.
   * @param km - Distance in kilometres.
   * @returns Distance in light-years.
   */
  kmToLy: (e) => e / h.LY_TO_KM,
  // ── Angular ────────────────────────────────────────────────────────────────
  /**
   * Convert degrees to radians.
   * @param d - Angle in degrees.
   * @returns Angle in radians.
   */
  degToRad: (e) => e * h.DEG_TO_RAD,
  /**
   * Convert radians to degrees.
   * @param r - Angle in radians.
   * @returns Angle in degrees.
   */
  radToDeg: (e) => e * h.RAD_TO_DEG,
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
    const a = e / h.AU_TO_KM;
    if (a < 0.01) return `${e.toFixed(0)} km`;
    if (a < 1e3) return `${a.toPrecision(4)} AU`;
    const i = e / h.LY_TO_KM;
    return i < 1e6 ? `${i.toPrecision(4)} ly` : `${(i / 1e6).toPrecision(4)} Mly`;
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
    const a = e < 0 ? "-" : "", i = Math.abs(e), s = Math.floor(i), r = Math.floor((i - s) * 60), o = ((i - s) * 60 - r) * 60;
    return `${a}${s}°${r}′${o.toFixed(1)}″`;
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
    const a = (e % 360 + 360) % 360, i = Math.floor(a / 15), s = Math.floor((a / 15 - i) * 60), r = ((a / 15 - i) * 60 - s) * 60;
    return `${i}h ${s}m ${r.toFixed(1)}s`;
  }
}, B = {
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
    for (let i = 0; i < 26; i++) {
      const s = w.nextPhase(a, "new"), r = this._checkSolarEclipse(s);
      if (r) return r;
      a = new Date(s.valueOf() + 864e5);
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
    for (let i = 0; i < 26; i++) {
      const s = w.nextPhase(a, "full"), r = this._checkLunarEclipse(s);
      if (r) return r;
      a = new Date(s.valueOf() + 864e5);
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
  search(e, a, i) {
    const s = [];
    let r = new Date(e);
    const o = a.valueOf();
    for (; r.valueOf() < o; ) {
      if (i !== "lunar") {
        const t = w.nextPhase(r, "new");
        if (t.valueOf() > o) break;
        const n = this._checkSolarEclipse(t);
        n && s.push(n);
      }
      if (i !== "solar") {
        const t = w.nextPhase(r, "full");
        if (t.valueOf() <= o) {
          const n = this._checkLunarEclipse(t);
          n && s.push(n);
        }
      }
      r = new Date(r.valueOf() + 15 * 864e5);
    }
    return s.sort((t, n) => t.date.valueOf() - n.date.valueOf()), s.filter(
      (t, n) => n === 0 || Math.abs(t.date.valueOf() - s[n - 1].date.valueOf()) > 864e5
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
    const a = w.position(e), i = k.planetEcliptic("earth", e), s = ((i.lon + 180) % 360 + 360) % 360;
    if (Math.abs(a.eclipticLat) > 1.5) return null;
    const o = i.r * 1495978707e-1, t = Math.atan2(696e3, o) * (180 / Math.PI), n = Math.atan2(1737.4, a.distance_km) * (180 / Math.PI), l = k.angularSeparation(
      a,
      k.eclipticToEquatorial({ lon: s, lat: 0 })
    ), d = t + n;
    if (l > d * 1.5) return null;
    let u, c;
    if (n >= t && l < n - t)
      u = "total", c = 1;
    else if (n < t && l < t - n)
      u = "annular", c = n / t;
    else if (l < d)
      u = "partial", c = (d - l) / (2 * t);
    else
      return null;
    return { type: "solar", subtype: u, date: e, magnitude: c };
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
    const a = w.position(e), i = Math.abs(a.eclipticLat), s = Math.atan2(6371, a.distance_km) * (180 / Math.PI), r = s * 2.6, o = s * 4.3, t = Math.atan2(1737.4, a.distance_km) * (180 / Math.PI);
    if (i > o + t) return null;
    let n, l;
    if (i < r - t)
      n = "total", l = (r - i) / (2 * t);
    else if (i < r + t)
      n = "partial", l = (r + t - i) / (2 * t);
    else if (i < o + t)
      n = "penumbral", l = (o + t - i) / (2 * t);
    else
      return null;
    return { type: "lunar", subtype: n, date: e, magnitude: Math.min(l, 1) };
  }
}, V = {
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
}, G = {
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
async function E(e, a = {}) {
  const { duration: i = 400, easing: s = "ease-in-out", signal: r } = a;
  if (r != null && r.aborted) return;
  if (!("startViewTransition" in document)) {
    await e();
    return;
  }
  document.documentElement.style.setProperty("--cosmos-vt-duration", `${i}ms`), document.documentElement.style.setProperty("--cosmos-vt-easing", s), await document.startViewTransition(e).finished;
}
function v(e, a = {}) {
  const {
    delay: i = 0,
    stagger: s = 60,
    duration: r = 500,
    from: o = "bottom",
    distance: t = "20px",
    signal: n
  } = a;
  if (n != null && n.aborted) return Promise.resolve();
  const d = {
    top: `translateY(-${t})`,
    bottom: `translateY(${t})`,
    left: `translateX(-${t})`,
    right: `translateX(${t})`
  }[o], u = [...e.children];
  return u.forEach((c) => {
    c.style.opacity = "0", c.style.transform = d, c.style.transition = "none";
  }), u.length === 0 ? Promise.resolve() : new Promise((c) => {
    const y = performance.now() + i, m = () => {
      u.forEach((f) => {
        f.style.opacity = "1", f.style.transform = "none", f.style.transition = "";
      }), c();
    };
    n == null || n.addEventListener("abort", m, { once: !0 });
    const p = (f) => {
      if (n != null && n.aborted) return;
      let _ = !0;
      for (let g = 0; g < u.length; g++) {
        const S = y + g * s;
        if (f >= S) {
          const A = u[g];
          A.style.opacity === "0" && (A.style.transition = `opacity ${r}ms ease, transform ${r}ms cubic-bezier(0.2,0,0,1)`, A.style.opacity = "1", A.style.transform = "none"), f < S + r && (_ = !1);
        } else
          _ = !1;
      }
      _ ? (n == null || n.removeEventListener("abort", m), c()) : requestAnimationFrame(p);
    };
    requestAnimationFrame(() => requestAnimationFrame(p));
  });
}
function T(e, a = {}) {
  const {
    stagger: i = 40,
    duration: s = 300,
    from: r = "bottom",
    distance: o = "12px",
    signal: t
  } = a;
  if (t != null && t.aborted) return Promise.resolve();
  const l = {
    top: `translateY(-${o})`,
    bottom: `translateY(${o})`,
    left: `translateX(-${o})`,
    right: `translateX(${o})`
  }[r], d = [...e.children].reverse();
  return d.length === 0 ? Promise.resolve() : new Promise((u) => {
    const c = performance.now(), y = () => {
      d.forEach((p) => {
        p.style.opacity = "0", p.style.transform = l, p.style.transition = "";
      }), u();
    };
    t == null || t.addEventListener("abort", y, { once: !0 });
    const m = (p) => {
      if (t != null && t.aborted) return;
      let f = !0;
      for (let _ = 0; _ < d.length; _++) {
        const g = c + _ * i;
        if (p >= g) {
          const S = d[_];
          S.style.opacity !== "0" && (S.style.transition = `opacity ${s}ms ease, transform ${s}ms ease`, S.style.opacity = "0", S.style.transform = l), p < g + s && (f = !1);
        } else
          f = !1;
      }
      f ? (t == null || t.removeEventListener("abort", y), u()) : requestAnimationFrame(m);
    };
    requestAnimationFrame(m);
  });
}
function b(e, a, i = 300) {
  return new Promise((s) => {
    e.style.transition = `opacity ${i}ms ease`, e.style.opacity = a === "in" ? "1" : "0", e.style.pointerEvents = a === "in" ? "auto" : "none";
    const r = () => {
      e.removeEventListener("transitionend", r), s();
    };
    e.addEventListener("transitionend", r, { once: !0 }), setTimeout(s, i + 50);
  });
}
async function M(e, a, i = 400) {
  a.style.opacity = "0", a.style.pointerEvents = "none", a.style.display = "", await Promise.all([
    b(e, "out", i),
    b(a, "in", i)
  ]), e.style.display = "none";
}
function L(e, a = {}) {
  const { duration: i = 500, easing: s = "cubic-bezier(0.4,0,0.2,1)", onDone: r, signal: o } = a;
  if (o != null && o.aborted) return;
  const t = e.getBoundingClientRect(), n = window.innerWidth / t.width, l = window.innerHeight / t.height, d = window.innerWidth / 2 - (t.left + t.width / 2), u = window.innerHeight / 2 - (t.top + t.height / 2);
  e.style.transformOrigin = "center center", e.style.transition = "none", e.style.transform = "translate(0,0) scale(1,1)", requestAnimationFrame(() => {
    o != null && o.aborted || requestAnimationFrame(() => {
      if (o != null && o.aborted) return;
      e.style.transition = `transform ${i}ms ${s}`, e.style.transform = `translate(${d}px, ${u}px) scale(${n}, ${l})`;
      const c = () => {
        e.removeEventListener("transitionend", c), e.style.transform = "", e.style.transition = "", r == null || r();
      };
      e.addEventListener("transitionend", c, { once: !0 }), setTimeout(c, i + 100);
    });
  });
}
function O(e, a = {}, i) {
  const { duration: s = 400, easing: r = "cubic-bezier(0.4,0,0.2,1)", onDone: o, signal: t } = a;
  if (t != null && t.aborted) return;
  const n = e.getBoundingClientRect(), l = n.width / window.innerWidth, d = n.height / window.innerHeight, u = n.left + n.width / 2 - window.innerWidth / 2, c = n.top + n.height / 2 - window.innerHeight / 2, y = !i, m = i ?? document.createElement("div");
  y && (Object.assign(m.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
    transformOrigin: "center center"
  }), document.body.appendChild(m)), m.style.transition = `transform ${s}ms ${r}, opacity ${s * 0.6}ms ease ${s * 0.4}ms`;
  const p = () => {
    m.removeEventListener("transitionend", p), y && m.remove(), o == null || o();
  };
  requestAnimationFrame(() => {
    if (t != null && t.aborted) {
      p();
      return;
    }
    m.style.transform = `translate(${u}px, ${c}px) scale(${l}, ${d})`, m.style.opacity = "0", m.addEventListener("transitionend", p, { once: !0 }), setTimeout(p, s + 100);
  });
}
const W = {
  morph: E,
  staggerIn: v,
  staggerOut: T,
  fade: b,
  crossfade: M,
  heroExpand: L,
  heroCollapse: O
}, z = {
  CONSTANTS: h,
  Units: J,
  Math: k,
  Sun: K,
  Moon: w,
  Eclipse: B,
  Planner: X,
  AstroClock: Y,
  Data: F,
  Media: q,
  API: { NASA: j, ESA: D, resolveSimbad: R },
  SkyMap: { render: I, stereographic: N, mollweide: C, gnomonic: x, Interactive: $, create: P },
  Transitions: { morph: E, staggerIn: v, staggerOut: T, fade: b, crossfade: M, heroExpand: L, heroCollapse: O }
};
export {
  Y as AstroClock,
  k as AstroMath,
  ee as BRIGHT_STARS,
  h as CONSTANTS,
  te as CONSTELLATIONS,
  ie as DEEP_SKY_EXTRAS,
  F as Data,
  D as ESA,
  B as Eclipse,
  ne as IMAGE_FALLBACKS,
  $ as InteractiveSkyMap,
  ae as MESSIER_CATALOG,
  se as METEOR_SHOWERS,
  q as Media,
  w as Moon,
  j as NASA,
  V as PLANET_TEXTURES,
  X as Planner,
  re as SOLAR_SYSTEM,
  G as STAR_TEXTURES,
  oe as SkyMap,
  K as Sun,
  W as Transitions,
  J as Units,
  ce as canvasToEquatorial,
  le as computeFov,
  P as createInteractiveSkyMap,
  M as crossfade,
  z as default,
  b as fade,
  ue as getObjectImage,
  x as gnomonic,
  O as heroCollapse,
  L as heroExpand,
  C as mollweide,
  E as morph,
  de as prefetchImages,
  I as renderSkyMap,
  me as resolveImages,
  R as resolveSimbad,
  pe as spectralColor,
  v as staggerIn,
  T as staggerOut,
  N as stereographic,
  he as tryDSS,
  fe as tryPanSTARRS
};
