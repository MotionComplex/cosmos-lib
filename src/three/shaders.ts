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
