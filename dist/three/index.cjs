"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const media = require("../media-V7DDwLAB.cjs");
const SHADERS = {
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
function createPlanet(opts, THREE) {
  var _a, _b;
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const toDispose = [];
  (_a = loader.setCrossOrigin) == null ? void 0 : _a.call(loader, "anonymous");
  let mat;
  if (opts.isBlackHole) {
    mat = new THREE.MeshBasicMaterial({ color: 0 });
  } else {
    const stdMat = new THREE.MeshStandardMaterial({
      color: opts.color ?? 16777215,
      roughness: 0.8,
      metalness: 0.1
    });
    if ((_b = opts.textureUrls) == null ? void 0 : _b.length) {
      media.Media.chainLoad(opts.textureUrls).then((url) => {
        const t = loader.load(url);
        t.colorSpace = THREE.SRGBColorSpace;
        stdMat.map = t;
        stdMat.needsUpdate = true;
        toDispose.push(t);
      }).catch(() => {
      });
    } else if (opts.textureUrl) {
      const t = loader.load(opts.textureUrl);
      t.colorSpace = THREE.SRGBColorSpace;
      stdMat.map = t;
      toDispose.push(t);
    }
    if (opts.bumpUrl) {
      const b = loader.load(opts.bumpUrl);
      stdMat.bumpMap = b;
      stdMat.bumpScale = 0.025;
      toDispose.push(b);
    }
    if (opts.emissive !== void 0) {
      stdMat.emissive = new THREE.Color(opts.emissive);
      stdMat.emissiveIntensity = opts.emissiveIntensity ?? 1;
    }
    mat = stdMat;
  }
  toDispose.push(mat);
  const geo = new THREE.SphereGeometry(opts.radius, 64, 64);
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  toDispose.push(geo);
  if (opts.atmosphere && !opts.isBlackHole) {
    const atmMesh = createAtmosphere(
      opts.radius,
      opts.atmosphere.color,
      THREE,
      opts.atmosphere.intensity ?? 1.2
    );
    group.add(atmMesh);
    (atmMesh.userData._toDispose ?? []).forEach((d) => toDispose.push(d));
  }
  if (opts.rings) {
    const { inner, outer, color, opacity, tilt = 0 } = opts.rings;
    const rGeo = new THREE.RingGeometry(opts.radius * inner, opts.radius * outer, 128);
    const pos = rGeo.attributes["position"];
    const uv = rGeo.attributes["uv"];
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const u = (r - opts.radius * inner) / (opts.radius * (outer - inner));
      uv.setXY(i, u, 0.5);
    }
    uv.needsUpdate = true;
    rGeo.rotateX(-Math.PI / 2);
    const rMat = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    rMesh.rotation.x = tilt;
    group.add(rMesh);
    toDispose.push(rGeo, rMat);
  }
  return {
    group,
    mesh,
    dispose: () => toDispose.forEach((o) => o.dispose())
  };
}
function createNebula(opts, THREE) {
  var _a;
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  (_a = loader.setCrossOrigin) == null ? void 0 : _a.call(loader, "anonymous");
  const mat = new THREE.SpriteMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: opts.opacity ?? 0.85,
    depthWrite: false,
    color: 16777215
  });
  media.Media.chainLoad(opts.textureUrls).then((url) => {
    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      mat.map = texture;
      mat.needsUpdate = true;
    });
  }).catch(() => {
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(opts.radius * (opts.aspect ?? 1), opts.radius, 1);
  sprite.renderOrder = 100;
  group.add(sprite);
  const hitGeo = new THREE.SphereGeometry(opts.radius * 0.5, 16, 16);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  group.add(hitMesh);
  return {
    group,
    sprite,
    hitMesh,
    dispose: () => {
      var _a2;
      (_a2 = mat.map) == null ? void 0 : _a2.dispose();
      mat.dispose();
      hitGeo.dispose();
      hitMat.dispose();
    }
  };
}
function createAtmosphere(radius, colorHex, THREE, intensity = 1.2) {
  const geo = new THREE.SphereGeometry(radius * 1.06, 64, 64);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uAtmColor: { value: new THREE.Color(colorHex) },
      uIntensity: { value: intensity }
    },
    vertexShader: SHADERS.atmosphereVert,
    fragmentShader: SHADERS.atmosphereFrag,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData["_toDispose"] = [geo, mat];
  return mesh;
}
function createStarField(opts = {}, THREE) {
  const {
    count = 4e4,
    minRadius = 3e4,
    maxRadius = 15e4,
    sizeMin = 1.5,
    sizeMax = 4,
    opacity = 0.7
  } = opts;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = minRadius + Math.random() * (maxRadius - minRadius);
    const th = 2 * Math.PI * Math.random();
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph);
    const raw = Math.random();
    const c = new THREE.Color(raw > 0.7 ? 11193599 : raw > 0.5 ? 16768426 : 16777215);
    const b = 0.5 + Math.random() * 0.5;
    col[i * 3] = c.r * b;
    col[i * 3 + 1] = c.g * b;
    col[i * 3 + 2] = c.b * b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: (sizeMin + sizeMax) / 2,
    vertexColors: true,
    transparent: true,
    opacity,
    sizeAttenuation: true
  });
  const points = new THREE.Points(geo, mat);
  points.userData["dispose"] = () => {
    geo.dispose();
    mat.dispose();
  };
  return points;
}
function createOrbit(distance, opts = {}, THREE) {
  const { color = 16777215, opacity = 0.1, segments = 128 } = opts;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = i / segments * Math.PI * 2;
    pts.push(Math.cos(a) * distance, 0, Math.sin(a) * distance);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const line = new THREE.Line(geo, mat);
  line.userData["dispose"] = () => {
    geo.dispose();
    mat.dispose();
  };
  return line;
}
class LODTextureManager {
  constructor(THREE, opts = {}) {
    var _a, _b;
    this._entries = [];
    this._THREE = THREE;
    this._loader = new THREE.TextureLoader();
    (_b = (_a = this._loader).setCrossOrigin) == null ? void 0 : _b.call(_a, "anonymous");
    this._opts = opts;
  }
  /**
   * Register a mesh for LOD management.
   * The low-res texture is loaded immediately.
   * The high-res texture is loaded lazily when the camera enters `lodDistance`.
   *
   * @param mesh          target mesh (must have a MeshStandardMaterial or similar)
   * @param lowResUrl     low-resolution texture URL — loaded immediately
   * @param highResUrl    high-resolution texture URL — loaded on demand
   * @param lodDistance   camera distance threshold in scene units
   */
  register(mesh, lowResUrl, highResUrl, lodDistance) {
    const THREE = this._THREE;
    const t = this._loader.load(lowResUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    const mat = mesh.material;
    mat.map = t;
    mat.needsUpdate = true;
    this._entries.push({
      mesh,
      lodDistance,
      lowUrl: lowResUrl,
      highUrl: highResUrl,
      currentLOD: "low",
      loading: false,
      lowTex: t,
      highTex: null
    });
  }
  /**
   * Unregister a mesh from LOD management and dispose its textures.
   */
  unregister(mesh) {
    var _a, _b;
    const idx = this._entries.findIndex((e) => e.mesh === mesh);
    if (idx === -1) return;
    const entry = this._entries[idx];
    (_a = entry.lowTex) == null ? void 0 : _a.dispose();
    (_b = entry.highTex) == null ? void 0 : _b.dispose();
    this._entries.splice(idx, 1);
  }
  /**
   * Call this every frame in your render loop.
   * Swaps textures based on current camera distance.
   */
  update(camera) {
    var _a;
    const THREE = this._THREE;
    const cameraPos = camera.position;
    for (const entry of this._entries) {
      const worldPos = new THREE.Vector3();
      entry.mesh.getWorldPosition(worldPos);
      const dist = cameraPos.distanceTo(worldPos);
      if (dist < entry.lodDistance && entry.currentLOD === "low" && !entry.loading) {
        entry.loading = true;
        let timedOut = false;
        let timeoutId = null;
        if (this._opts.timeout && this._opts.timeout > 0) {
          timeoutId = setTimeout(() => {
            var _a2, _b;
            timedOut = true;
            entry.loading = false;
            (_b = (_a2 = this._opts).onError) == null ? void 0 : _b.call(_a2, entry.mesh, new Error(`Texture load timed out after ${this._opts.timeout}ms`));
          }, this._opts.timeout);
        }
        this._loader.load(
          entry.highUrl,
          (texture) => {
            if (timedOut) {
              texture.dispose();
              return;
            }
            if (timeoutId) clearTimeout(timeoutId);
            texture.colorSpace = THREE.SRGBColorSpace;
            entry.highTex = texture;
            const mat = entry.mesh.material;
            mat.map = texture;
            mat.needsUpdate = true;
            entry.currentLOD = "high";
            entry.loading = false;
          },
          void 0,
          (error) => {
            var _a2, _b;
            if (timedOut) return;
            if (timeoutId) clearTimeout(timeoutId);
            entry.loading = false;
            (_b = (_a2 = this._opts).onError) == null ? void 0 : _b.call(_a2, entry.mesh, error);
          }
        );
      }
      if (dist > entry.lodDistance * 1.6 && entry.currentLOD === "high") {
        const mat = entry.mesh.material;
        mat.map = entry.lowTex;
        mat.needsUpdate = true;
        (_a = entry.highTex) == null ? void 0 : _a.dispose();
        entry.highTex = null;
        entry.currentLOD = "low";
      }
    }
  }
  /** Dispose all registered textures and clear the registry. */
  dispose() {
    var _a, _b;
    for (const entry of this._entries) {
      (_a = entry.lowTex) == null ? void 0 : _a.dispose();
      (_b = entry.highTex) == null ? void 0 : _b.dispose();
    }
    this._entries = [];
  }
}
class CameraFlight {
  constructor(camera, controls, THREE) {
    this._active = false;
    this._orbitHandles = /* @__PURE__ */ new Set();
    this._camera = camera;
    this._controls = controls;
    this._THREE = THREE;
  }
  /**
   * Fly the camera to a world position while pointing at a target.
   *
   * @param toPosition  destination camera position
   * @param toTarget    destination look-at point (OrbitControls target)
   * @param opts        animation options
   */
  flyTo(toPosition, toTarget, opts = {}) {
    const { duration = 2e3, easing = "inOut", onDone } = opts;
    const THREE = this._THREE;
    const fromPos = this._camera.position.clone();
    const fromTarget = this._controls.target.clone();
    const endPos = new THREE.Vector3(toPosition.x, toPosition.y, toPosition.z);
    const endTarget = new THREE.Vector3(toTarget.x, toTarget.y, toTarget.z);
    const ease = this._makeEase(easing);
    const start = performance.now();
    this._active = true;
    const tick = (now) => {
      if (!this._active) return;
      const t = Math.min((now - start) / duration, 1);
      const et = ease(t);
      this._camera.position.lerpVectors(fromPos, endPos, et);
      this._controls.target.lerpVectors(fromTarget, endTarget, et);
      this._controls.update();
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this._active = false;
        onDone == null ? void 0 : onDone();
      }
    };
    requestAnimationFrame(tick);
  }
  /**
   * Continuously orbit the camera around a world point.
   * Uses delta-time for frame-rate independent rotation.
   * Returns a `{ stop }` handle to halt the orbit.
   */
  orbitAround(center, opts = {}) {
    const { radius = 200, speed = 5e-4, elevation = 0.2 } = opts;
    const THREE = this._THREE;
    const c = new THREE.Vector3(center.x, center.y, center.z);
    let angle = 0;
    let running = true;
    let lastTime = performance.now();
    const handle = {
      stop: () => {
        running = false;
        this._orbitHandles.delete(handle);
      }
    };
    this._orbitHandles.add(handle);
    const tick = (now) => {
      if (!running) return;
      const dt = (now - lastTime) / 1e3;
      lastTime = now;
      angle += speed * dt * 60;
      this._camera.position.set(
        c.x + Math.cos(angle) * radius,
        c.y + elevation * radius,
        c.z + Math.sin(angle) * radius
      );
      this._camera.lookAt(c);
      this._controls.target.copy(c);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return handle;
  }
  /** Cancel any in-progress flight. */
  cancel() {
    this._active = false;
  }
  /** Stop all active orbits and cancel any in-progress flight. */
  dispose() {
    this.cancel();
    for (const h of this._orbitHandles) h.stop();
    this._orbitHandles.clear();
  }
  // ── Private ───────────────────────────────────────────────────────────────
  _makeEase(type) {
    switch (type) {
      case "in":
        return (t) => t * t * t;
      case "out":
        return (t) => 1 - (1 - t) ** 3;
      default:
        return (t) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    }
  }
}
exports.CameraFlight = CameraFlight;
exports.LODTextureManager = LODTextureManager;
exports.SHADERS = SHADERS;
exports.createAtmosphere = createAtmosphere;
exports.createNebula = createNebula;
exports.createOrbit = createOrbit;
exports.createPlanet = createPlanet;
exports.createStarField = createStarField;
//# sourceMappingURL=index.cjs.map
