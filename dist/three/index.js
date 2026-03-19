import { M as S } from "../media-DVOcIMa1.js";
const x = {
  atmosphereVert: (
    /* glsl */
    `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vViewDir    = normalize(cameraPosition - worldPos.xyz);
      vNormal     = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  ),
  atmosphereFrag: (
    /* glsl */
    `
    uniform vec3  uAtmColor;
    uniform float uIntensity;
    varying vec3  vNormal;
    varying vec3  vViewDir;
    void main() {
      float rim   = 1.0 - abs(dot(vNormal, vViewDir));
      float alpha = pow(rim, 3.0) * uIntensity;
      gl_FragColor = vec4(uAtmColor * alpha, alpha);
    }
  `
  )
};
function C(r, e) {
  var h, u;
  const t = new e.Group(), i = new e.TextureLoader(), a = [];
  (h = i.setCrossOrigin) == null || h.call(i, "anonymous");
  let s;
  if (r.isBlackHole)
    s = new e.MeshBasicMaterial({ color: 0 });
  else {
    const o = new e.MeshStandardMaterial({
      color: r.color ?? 16777215,
      roughness: 0.8,
      metalness: 0.1
    });
    if ((u = r.textureUrls) != null && u.length)
      S.chainLoad(r.textureUrls).then((n) => {
        const d = i.load(n);
        d.colorSpace = e.SRGBColorSpace, o.map = d, o.needsUpdate = !0, a.push(d);
      }).catch(() => {
      });
    else if (r.textureUrl) {
      const n = i.load(r.textureUrl);
      n.colorSpace = e.SRGBColorSpace, o.map = n, a.push(n);
    }
    if (r.bumpUrl) {
      const n = i.load(r.bumpUrl);
      o.bumpMap = n, o.bumpScale = 0.025, a.push(n);
    }
    r.emissive !== void 0 && (o.emissive = new e.Color(r.emissive), o.emissiveIntensity = r.emissiveIntensity ?? 1), s = o;
  }
  a.push(s);
  const c = new e.SphereGeometry(r.radius, 64, 64), l = new e.Mesh(c, s);
  if (t.add(l), a.push(c), r.atmosphere && !r.isBlackHole) {
    const o = A(
      r.radius,
      r.atmosphere.color,
      e,
      r.atmosphere.intensity ?? 1.2
    );
    t.add(o), (o.userData._toDispose ?? []).forEach((n) => a.push(n));
  }
  if (r.rings) {
    const { inner: o, outer: n, color: d, opacity: m, tilt: p = 0 } = r.rings, f = new e.RingGeometry(r.radius * o, r.radius * n, 128), w = f.attributes.position, g = f.attributes.uv, M = new e.Vector3();
    for (let v = 0; v < w.count; v++) {
      M.fromBufferAttribute(w, v);
      const b = (M.length() - r.radius * o) / (r.radius * (n - o));
      g.setXY(v, b, 0.5);
    }
    g.needsUpdate = !0, f.rotateX(-Math.PI / 2);
    const _ = new e.MeshStandardMaterial({
      color: d,
      transparent: !0,
      opacity: m,
      side: e.DoubleSide
    }), y = new e.Mesh(f, _);
    y.rotation.x = p, t.add(y), a.push(f, _);
  }
  return {
    group: t,
    mesh: l,
    dispose: () => a.forEach((o) => o.dispose())
  };
}
function G(r, e) {
  var u;
  const t = new e.Group(), i = new e.TextureLoader();
  (u = i.setCrossOrigin) == null || u.call(i, "anonymous");
  const a = new e.SpriteMaterial({
    transparent: !0,
    blending: e.AdditiveBlending,
    opacity: r.opacity ?? 0.85,
    depthWrite: !1,
    color: 16777215
  });
  S.chainLoad(r.textureUrls).then((o) => {
    i.load(o, (n) => {
      n.colorSpace = e.SRGBColorSpace, a.map = n, a.needsUpdate = !0;
    });
  }).catch(() => {
  });
  const s = new e.Sprite(a);
  s.scale.set(r.radius * (r.aspect ?? 1), r.radius, 1), s.renderOrder = 100, t.add(s);
  const c = new e.SphereGeometry(r.radius * 0.5, 16, 16), l = new e.MeshBasicMaterial({ visible: !1 }), h = new e.Mesh(c, l);
  return t.add(h), {
    group: t,
    sprite: s,
    hitMesh: h,
    dispose: () => {
      var o;
      (o = a.map) == null || o.dispose(), a.dispose(), c.dispose(), l.dispose();
    }
  };
}
function A(r, e, t, i = 1.2) {
  const a = new t.SphereGeometry(r * 1.06, 64, 64), s = new t.ShaderMaterial({
    uniforms: {
      uAtmColor: { value: new t.Color(e) },
      uIntensity: { value: i }
    },
    vertexShader: x.atmosphereVert,
    fragmentShader: x.atmosphereFrag,
    side: t.BackSide,
    blending: t.AdditiveBlending,
    transparent: !0,
    depthWrite: !1
  }), c = new t.Mesh(a, s);
  return c.userData._toDispose = [a, s], c;
}
function U(r = {}, e) {
  const {
    count: t = 4e4,
    minRadius: i = 3e4,
    maxRadius: a = 15e4,
    sizeMin: s = 1.5,
    sizeMax: c = 4,
    opacity: l = 0.7
  } = r, h = new Float32Array(t * 3), u = new Float32Array(t * 3);
  for (let m = 0; m < t; m++) {
    const p = i + Math.random() * (a - i), f = 2 * Math.PI * Math.random(), w = Math.acos(2 * Math.random() - 1);
    h[m * 3] = p * Math.sin(w) * Math.cos(f), h[m * 3 + 1] = p * Math.sin(w) * Math.sin(f), h[m * 3 + 2] = p * Math.cos(w);
    const g = Math.random(), M = new e.Color(g > 0.7 ? 11193599 : g > 0.5 ? 16768426 : 16777215), _ = 0.5 + Math.random() * 0.5;
    u[m * 3] = M.r * _, u[m * 3 + 1] = M.g * _, u[m * 3 + 2] = M.b * _;
  }
  const o = new e.BufferGeometry();
  o.setAttribute("position", new e.BufferAttribute(h, 3)), o.setAttribute("color", new e.BufferAttribute(u, 3));
  const n = new e.PointsMaterial({
    size: (s + c) / 2,
    vertexColors: !0,
    transparent: !0,
    opacity: l,
    sizeAttenuation: !0
  }), d = new e.Points(o, n);
  return d.userData.dispose = () => {
    o.dispose(), n.dispose();
  }, d;
}
function V(r, e = {}, t) {
  const { color: i = 16777215, opacity: a = 0.1, segments: s = 128 } = e, c = [];
  for (let o = 0; o <= s; o++) {
    const n = o / s * Math.PI * 2;
    c.push(Math.cos(n) * r, 0, Math.sin(n) * r);
  }
  const l = new t.BufferGeometry();
  l.setAttribute("position", new t.Float32BufferAttribute(c, 3));
  const h = new t.LineBasicMaterial({ color: i, transparent: !0, opacity: a }), u = new t.Line(l, h);
  return u.userData.dispose = () => {
    l.dispose(), h.dispose();
  }, u;
}
class L {
  /**
   * @param THREE - The Three.js module, passed at runtime to avoid a hard
   *                dependency on `three` in the library bundle.
   * @param opts  - Optional error and timeout configuration.
   */
  constructor(e, t = {}) {
    var i, a;
    this._entries = [], this._THREE = e, this._loader = new e.TextureLoader(), (a = (i = this._loader).setCrossOrigin) == null || a.call(i, "anonymous"), this._opts = t;
  }
  /**
   * Register a mesh for LOD texture management.
   *
   * The low-res texture is loaded immediately and applied to the mesh's
   * material. The high-res texture is loaded lazily the first time the camera
   * comes within `lodDistance` of the mesh.
   *
   * @param mesh        - Target mesh whose material will be swapped. Must use a
   *                      `MeshStandardMaterial` (or compatible) with a `map` slot.
   * @param lowResUrl   - URL for the low-resolution texture, loaded eagerly.
   * @param highResUrl  - URL for the high-resolution texture, loaded on demand.
   * @param lodDistance - Camera distance threshold (in scene units) at which the
   *                      high-res texture is loaded and applied.
   */
  register(e, t, i, a) {
    const s = this._THREE, c = this._loader.load(t);
    c.colorSpace = s.SRGBColorSpace;
    const l = e.material;
    l.map = c, l.needsUpdate = !0, this._entries.push({
      mesh: e,
      lodDistance: a,
      lowUrl: t,
      highUrl: i,
      currentLOD: "low",
      loading: !1,
      lowTex: c,
      highTex: null
    });
  }
  /**
   * Unregister a mesh from LOD management and dispose its textures.
   *
   * After calling this, the mesh's material `map` will still reference the
   * last-applied texture, but the texture GPU memory is freed. Assign a new
   * texture or remove the mesh from the scene as needed.
   *
   * @param mesh - The mesh previously passed to {@link register}. If the mesh
   *               was never registered, this is a no-op.
   */
  unregister(e) {
    var a, s;
    const t = this._entries.findIndex((c) => c.mesh === e);
    if (t === -1) return;
    const i = this._entries[t];
    (a = i.lowTex) == null || a.dispose(), (s = i.highTex) == null || s.dispose(), this._entries.splice(t, 1);
  }
  /**
   * Evaluate all registered meshes and swap textures as needed.
   *
   * Call this once per frame inside your render loop. For each mesh the
   * manager checks the camera-to-mesh distance and:
   * - loads the high-res texture when the camera enters `lodDistance`, and
   * - reverts to the low-res texture when the camera moves beyond
   *   `lodDistance * 1.6` (hysteresis to prevent thrashing).
   *
   * @param camera - The active Three.js camera used for distance checks.
   */
  update(e) {
    var a;
    const t = this._THREE, i = e.position;
    for (const s of this._entries) {
      const c = new t.Vector3();
      s.mesh.getWorldPosition(c);
      const l = i.distanceTo(c);
      if (l < s.lodDistance && s.currentLOD === "low" && !s.loading) {
        s.loading = !0;
        let h = !1, u = null;
        this._opts.timeout && this._opts.timeout > 0 && (u = setTimeout(() => {
          var o, n;
          h = !0, s.loading = !1, (n = (o = this._opts).onError) == null || n.call(o, s.mesh, new Error(`Texture load timed out after ${this._opts.timeout}ms`));
        }, this._opts.timeout)), this._loader.load(
          s.highUrl,
          (o) => {
            if (h) {
              o.dispose();
              return;
            }
            u && clearTimeout(u), o.colorSpace = t.SRGBColorSpace, s.highTex = o;
            const n = s.mesh.material;
            n.map = o, n.needsUpdate = !0, s.currentLOD = "high", s.loading = !1;
          },
          void 0,
          (o) => {
            var n, d;
            h || (u && clearTimeout(u), s.loading = !1, (d = (n = this._opts).onError) == null || d.call(n, s.mesh, o));
          }
        );
      }
      if (l > s.lodDistance * 1.6 && s.currentLOD === "high") {
        const h = s.mesh.material;
        h.map = s.lowTex, h.needsUpdate = !0, (a = s.highTex) == null || a.dispose(), s.highTex = null, s.currentLOD = "low";
      }
    }
  }
  /**
   * Dispose all registered textures (both low- and high-res) and clear the
   * internal registry.
   *
   * After calling this, no further {@link update} calls will have any effect
   * until new meshes are registered.
   */
  dispose() {
    var e, t;
    for (const i of this._entries)
      (e = i.lowTex) == null || e.dispose(), (t = i.highTex) == null || t.dispose();
    this._entries = [];
  }
}
class O {
  /**
   * @param camera   - The Three.js camera to animate.
   * @param controls - An `OrbitControls`-compatible object whose `target` is
   *                   updated in sync with the camera position.
   * @param THREE    - The Three.js module, passed at runtime to avoid a hard
   *                   dependency on `three` in the library bundle.
   */
  constructor(e, t, i) {
    this._active = !1, this._orbitHandles = /* @__PURE__ */ new Set(), this._camera = e, this._controls = t, this._THREE = i;
  }
  /**
   * Fly the camera to a world-space position while smoothly re-targeting the
   * look-at point. The animation uses `requestAnimationFrame` internally and
   * is frame-rate independent.
   *
   * Only one flight can be active at a time; starting a new flight implicitly
   * cancels any in-progress one.
   *
   * @param toPosition - Destination camera position in world coordinates.
   * @param toTarget   - Destination look-at point (`OrbitControls.target`).
   * @param opts       - Animation options (duration, easing curve, completion callback).
   * @returns `void` -- listen for completion via `opts.onDone`.
   */
  flyTo(e, t, i = {}) {
    const { duration: a = 2e3, easing: s = "inOut", onDone: c } = i, l = this._THREE, h = this._camera.position.clone(), u = this._controls.target.clone(), o = new l.Vector3(e.x, e.y, e.z), n = new l.Vector3(t.x, t.y, t.z), d = this._makeEase(s), m = performance.now();
    this._active = !0;
    const p = (f) => {
      if (!this._active) return;
      const w = Math.min((f - m) / a, 1), g = d(w);
      this._camera.position.lerpVectors(h, o, g), this._controls.target.lerpVectors(u, n, g), this._controls.update(), w < 1 ? requestAnimationFrame(p) : (this._active = !1, c == null || c());
    };
    requestAnimationFrame(p);
  }
  /**
   * Continuously orbit the camera around a world-space point.
   *
   * Uses delta-time for frame-rate independent rotation. Multiple orbits
   * can be active simultaneously; each returns an independent stop handle.
   * All active orbits are terminated when {@link dispose} is called.
   *
   * @param center - The world-space point to orbit around.
   * @param opts   - Orbit configuration (radius, angular speed, elevation).
   * @returns A `{ stop }` handle. Call `handle.stop()` to halt the orbit.
   */
  orbitAround(e, t = {}) {
    const { radius: i = 200, speed: a = 5e-4, elevation: s = 0.2 } = t, c = this._THREE, l = new c.Vector3(e.x, e.y, e.z);
    let h = 0, u = !0, o = performance.now();
    const n = {
      stop: () => {
        u = !1, this._orbitHandles.delete(n);
      }
    };
    this._orbitHandles.add(n);
    const d = (m) => {
      if (!u) return;
      const p = (m - o) / 1e3;
      o = m, h += a * p * 60, this._camera.position.set(
        l.x + Math.cos(h) * i,
        l.y + s * i,
        l.z + Math.sin(h) * i
      ), this._camera.lookAt(l), this._controls.target.copy(l), requestAnimationFrame(d);
    };
    return requestAnimationFrame(d), n;
  }
  /**
   * Cancel any in-progress {@link flyTo} animation.
   *
   * Active {@link orbitAround} loops are **not** affected -- use
   * {@link dispose} to stop everything.
   */
  cancel() {
    this._active = !1;
  }
  /**
   * Stop all active orbits and cancel any in-progress flight.
   *
   * Call this when tearing down the scene or when the `CameraFlight`
   * instance is no longer needed to ensure no lingering `requestAnimationFrame`
   * callbacks remain.
   */
  dispose() {
    this.cancel();
    for (const e of this._orbitHandles) e.stop();
    this._orbitHandles.clear();
  }
  // ── Private ───────────────────────────────────────────────────────────────
  _makeEase(e) {
    switch (e) {
      case "in":
        return (t) => t * t * t;
      case "out":
        return (t) => 1 - (1 - t) ** 3;
      default:
        return (t) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    }
  }
}
export {
  O as CameraFlight,
  L as LODTextureManager,
  x as SHADERS,
  A as createAtmosphere,
  G as createNebula,
  V as createOrbit,
  C as createPlanet,
  U as createStarField
};
