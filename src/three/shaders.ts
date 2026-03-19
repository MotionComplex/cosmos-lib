/**
 * Built-in GLSL shader sources used by the Three.js integration layer.
 *
 * Currently contains the atmosphere glow shaders consumed by
 * {@link createAtmosphere}. The shaders implement a Fresnel-based rim-lighting
 * effect rendered on the back face of a slightly oversized sphere with additive
 * blending.
 *
 * **`atmosphereVert`** -- Vertex shader that computes per-vertex view direction
 * and normal vectors in world space.
 *
 * **`atmosphereFrag`** -- Fragment shader with the following uniforms:
 * - `uAtmColor` (`vec3`) -- atmosphere RGB colour.
 * - `uIntensity` (`float`) -- glow intensity multiplier.
 *
 * The fragment alpha is derived from `pow(rim, 3.0) * uIntensity`, where `rim`
 * is `1.0 - abs(dot(normal, viewDir))`.
 */
export const SHADERS = {
  atmosphereVert: /* glsl */`
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vViewDir    = normalize(cameraPosition - worldPos.xyz);
      vNormal     = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  atmosphereFrag: /* glsl */`
    uniform vec3  uAtmColor;
    uniform float uIntensity;
    varying vec3  vNormal;
    varying vec3  vViewDir;
    void main() {
      float rim   = 1.0 - abs(dot(vNormal, vViewDir));
      float alpha = pow(rim, 3.0) * uIntensity;
      gl_FragColor = vec4(uAtmColor * alpha, alpha);
    }
  `,
} as const
