export declare const SHADERS: {
    readonly atmosphereVert: "\n    varying vec3 vNormal;\n    varying vec3 vViewDir;\n    void main() {\n      vec4 worldPos = modelMatrix * vec4(position, 1.0);\n      vViewDir    = normalize(cameraPosition - worldPos.xyz);\n      vNormal     = normalize(normalMatrix * normal);\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n  ";
    readonly atmosphereFrag: "\n    uniform vec3  uAtmColor;\n    uniform float uIntensity;\n    varying vec3  vNormal;\n    varying vec3  vViewDir;\n    void main() {\n      float rim   = 1.0 - abs(dot(vNormal, vViewDir));\n      float alpha = pow(rim, 3.0) * uIntensity;\n      gl_FragColor = vec4(uAtmColor * alpha, alpha);\n    }\n  ";
};
