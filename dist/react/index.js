import { jsx as C } from "react/jsx-runtime";
import { useRef as v, useEffect as D, useState as g, useCallback as P, useMemo as q } from "react";
import { D as E, I as z, b as F, M as k, S as A, A as x, P as M } from "../skymap-interactive-KSM6RDPZ.js";
const S = typeof window < "u";
function B(t, e, r = 1e4) {
  const [l, u] = g(null);
  return D(() => {
    const a = () => {
      const c = E.get(t);
      if (!c) {
        u(null);
        return;
      }
      const f = /* @__PURE__ */ new Date(), s = O(c, f);
      if (!s) {
        u(null);
        return;
      }
      u(x.equatorialToHorizontal(s, { ...e, date: f }));
    };
    if (a(), !S) return;
    const d = setInterval(a, r);
    return () => clearInterval(d);
  }, [t, e.lat, e.lng, r]), l;
}
function L(t, e = 6e4) {
  const [r, l] = g(() => k.phase(t ?? /* @__PURE__ */ new Date()));
  return D(() => {
    if (t) {
      l(k.phase(t));
      return;
    }
    const u = () => l(k.phase(/* @__PURE__ */ new Date()));
    if (u(), !S) return;
    const a = setInterval(u, e);
    return () => clearInterval(a);
  }, [t == null ? void 0 : t.valueOf(), e]), r;
}
function U(t = {}) {
  const [e, r] = g(() => t.startDate ?? /* @__PURE__ */ new Date()), [l, u] = g(t.speed ?? 1), [a, d] = g(t.autoPlay ?? !1), c = v(null);
  c.current === null && (c.current = new F(t)), D(() => {
    const n = c.current, o = (m) => r(m.date), h = () => d(!0), y = () => d(!1), i = (m) => r(m.date), I = (m) => u(m.speed);
    return n.on("tick", o), n.on("play", h), n.on("pause", y), n.on("datechange", i), n.on("speedchange", I), () => {
      n.off("tick", o), n.off("play", h), n.off("pause", y), n.off("datechange", i), n.off("speedchange", I), n.dispose(), c.current = null;
    };
  }, []);
  const f = P(() => {
    var n;
    return (n = c.current) == null ? void 0 : n.play();
  }, []), s = P(() => {
    var n;
    return (n = c.current) == null ? void 0 : n.pause();
  }, []), w = P((n) => {
    var o;
    return (o = c.current) == null ? void 0 : o.setDate(n);
  }, []), p = P((n) => {
    var o;
    return (o = c.current) == null ? void 0 : o.setSpeed(n);
  }, []);
  return {
    date: e,
    speed: l,
    playing: a,
    play: f,
    pause: s,
    setDate: w,
    setSpeed: p,
    clock: c.current
  };
}
function W(t, e = {}, r = 3e4) {
  var a, d;
  const [l, u] = g([]);
  return D(() => {
    const c = () => {
      const s = { ...t, date: t.date ?? /* @__PURE__ */ new Date() };
      u(M.whatsUp(s, e));
    };
    if (c(), !S) return;
    const f = setInterval(c, r);
    return () => clearInterval(f);
  }, [
    t.lat,
    t.lng,
    (a = t.date) == null ? void 0 : a.valueOf(),
    r,
    e.minAltitude,
    e.magnitudeLimit,
    e.limit,
    e.tag,
    e.constellation,
    (d = e.types) == null ? void 0 : d.join(",")
  ]), l;
}
function G(t, e) {
  var r;
  return q(() => {
    const l = { ...t, date: e ?? t.date ?? /* @__PURE__ */ new Date() };
    return A.twilight(l);
  }, [t.lat, t.lng, e == null ? void 0 : e.valueOf(), (r = t.date) == null ? void 0 : r.valueOf()]);
}
function H({
  objects: t,
  width: e = "100%",
  height: r = "400px",
  onSelect: l,
  onHover: u,
  skymapRef: a,
  ...d
}) {
  const c = v(null), f = v(null);
  return D(() => {
    const s = c.current;
    if (!s || !S) return;
    const w = s.parentElement;
    if (!w) return;
    const p = window.devicePixelRatio || 1, n = w.getBoundingClientRect();
    s.width = n.width * p, s.height = n.height * p, s.style.width = `${n.width}px`, s.style.height = `${n.height}px`;
    const o = t ?? E.all().filter((i) => i.ra != null && i.dec != null), h = new z(s, o, d);
    f.current = h, a && "current" in a && (a.current = h), l && h.on("select", ({ object: i }) => l(i)), u && h.on("hover", ({ object: i }) => u(i));
    const y = () => {
      const i = w.getBoundingClientRect();
      s.width = i.width * p, s.height = i.height * p, s.style.width = `${i.width}px`, s.style.height = `${i.height}px`, h.render();
    };
    return window.addEventListener("resize", y), () => {
      window.removeEventListener("resize", y), h.dispose(), f.current = null, a && "current" in a && (a.current = null);
    };
  }, []), /* @__PURE__ */ C("div", { style: { width: e, height: r, position: "relative" }, children: /* @__PURE__ */ C(
    "canvas",
    {
      ref: c,
      style: { width: "100%", height: "100%", display: "block" },
      "aria-label": "Interactive sky map"
    }
  ) });
}
function O(t, e) {
  if (t.ra !== null && t.dec !== null) return { ra: t.ra, dec: t.dec };
  if (t.type === "planet")
    try {
      const r = x.planetEcliptic(t.id, e);
      return x.eclipticToEquatorial(r);
    } catch {
      return null;
    }
  if (t.id === "sun") {
    const r = A.position(e);
    return { ra: r.ra, dec: r.dec };
  }
  if (t.id === "moon") {
    const r = k.position(e);
    return { ra: r.ra, dec: r.dec };
  }
  return null;
}
export {
  H as SkyMap,
  U as useAstroClock,
  L as useMoonPhase,
  B as useSkyPosition,
  G as useTwilight,
  W as useWhatsUp
};
