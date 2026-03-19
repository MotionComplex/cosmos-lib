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
export declare const SHADERS: {
    readonly atmosphereVert: "\n    varying vec3 vNormal;\n    varying vec3 vViewDir;\n    void main() {\n      vec4 worldPos = modelMatrix * vec4(position, 1.0);\n      vViewDir    = normalize(cameraPosition - worldPos.xyz);\n      vNormal     = normalize(normalMatrix * normal);\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n  ";
    readonly atmosphereFrag: "\n    uniform vec3  uAtmColor;\n    uniform float uIntensity;\n    varying vec3  vNormal;\n    varying vec3  vViewDir;\n    void main() {\n      float rim   = 1.0 - abs(dot(vNormal, vViewDir));\n      float alpha = pow(rim, 3.0) * uIntensity;\n      gl_FragColor = vec4(uAtmColor * alpha, alpha);\n    }\n  ";
};
