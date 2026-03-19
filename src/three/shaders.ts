export const SHADERS = {
  atmosphereVert: /* glsl */`
    varying vec3 vNormal;
    void main() {
      vNormal     = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  atmosphereFrag: /* glsl */`
    uniform vec3  uAtmColor;
    uniform float uIntensity;
    varying vec3  vNormal;
    void main() {
      float rim   = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
      float alpha = pow(rim, 3.0) * uIntensity;
      gl_FragColor = vec4(uAtmColor * alpha, alpha);
    }
  `,
} as const
