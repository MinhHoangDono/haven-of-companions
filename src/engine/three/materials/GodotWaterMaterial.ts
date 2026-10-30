import * as THREE from 'three';

/**
 * Port of Godot `water_toon.gdshader` and `water.gdshader` to Three.js.
 * Features:
 * - Dual-layer scrolling wave distortion
 * - Stepped toon lighting (banded diffuse and specular highlights)
 * - Procedural wave foam along crests
 * - Multi-tone depth gradient (deep water -> aquatic turquoise surface)
 * - Screen derivative faceted normals for stylized aesthetic
 */
export class GodotWaterMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0.0 },
        uSurfaceColor: { value: new THREE.Color(0x2dd4bf) }, // Aquatic cyan/turquoise (0.2, 1.0, 0.8)
        uDepthColor: { value: new THREE.Color(0x0a4f6d) },   // Deep ocean navy (0.08, 0.2, 0.4)
        uFoamColor: { value: new THREE.Color(0xffffff) },    // Crisp white foam
        uWaveScale: { value: new THREE.Vector2(0.12, 0.12) },
        uWaveLayerScale: { value: new THREE.Vector2(1.5, 1.5) },
        uWaveVelocity: { value: new THREE.Vector2(0.025, 0.02) },
        uWaveHighlight: { value: 0.5 },
        uDisplacementAmount: { value: 0.22 },
        uDiffuseSteps: { value: 12.0 },
        uDiffuseSmoothness: { value: 0.2 },
        uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
        uLightColor: { value: new THREE.Color(0xfffaed) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uWaveScale;
        uniform vec2 uWaveLayerScale;
        uniform vec2 uWaveVelocity;
        uniform float uDisplacementAmount;

        varying vec3 vWorldPos;
        varying vec2 vUv;
        varying float vWave;

        float sample_wave(vec2 uv, vec2 velocity) {
          vec2 base_uv = uv * uWaveScale;
          vec2 wave_uv1 = (base_uv * uWaveLayerScale) + (uTime * -velocity);
          float w1 = sin(wave_uv1.x * 3.1415 + wave_uv1.y * 2.0 + uTime * 1.4) * 0.5 + 0.5;

          vec2 wave_uv2 = base_uv + (uTime * velocity) - vec2(w1 * 0.1);
          float w2 = cos(wave_uv2.x * 2.6 - wave_uv2.y * 2.8 + uTime * 1.1) * 0.5 + 0.5;

          return mix(w1, w2, 0.5);
        }

        void main() {
          vUv = uv;
          vec4 initialWorldPos = modelMatrix * vec4(position, 1.0);

          float wave = sample_wave(initialWorldPos.xz, uWaveVelocity);
          vWave = wave;

          // In PlaneGeometry rotated -PI/2 around X, local +Z points vertically upward (+Y in world)
          vec3 transformed = position;
          transformed.z += wave * uDisplacementAmount;

          vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
          vWorldPos = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSurfaceColor;
        uniform vec3 uDepthColor;
        uniform vec3 uFoamColor;
        uniform float uWaveHighlight;
        uniform float uDiffuseSteps;
        uniform float uDiffuseSmoothness;
        uniform vec3 uLightDir;
        uniform vec3 uLightColor;

        varying vec3 vWorldPos;
        varying vec2 vUv;
        varying float vWave;

        void main() {
          // Faceted normal from screen derivatives for crisp stylized toon geometry
          vec3 fdx = dFdx(vWorldPos);
          vec3 fdy = dFdy(vWorldPos);
          vec3 N = normalize(cross(fdx, fdy));

          // 1. Toon Stepped Diffuse Lighting
          float ndotl = max(0.0, dot(N, uLightDir));
          float lightMult = ndotl * uDiffuseSteps;
          float lightStepBase = floor(lightMult);
          float lightFactor = smoothstep(0.5 - uDiffuseSmoothness * 0.5, 0.5 + uDiffuseSmoothness * 0.5, lightMult - lightStepBase);
          float toonDiffuse = (lightStepBase + lightFactor) / uDiffuseSteps;

          // 2. Toon Specular Glint (Tight sparkling highlights only on wave crests, never broad glare circles)
          vec3 V = normalize(cameraPosition - vWorldPos);
          vec3 H = normalize(uLightDir + V);
          float ndoth = max(0.0, dot(N, H));
          float specular = pow(ndoth, 160.0);
          float waveCrestFactor = smoothstep(0.55, 0.85, vWave);
          float toonSpec = step(0.70, specular) * waveCrestFactor;

          // 3. Multi-toned Surface and Depth Color
          vec3 baseColor = mix(uDepthColor, uSurfaceColor, vWave * 0.65 + 0.35);
          baseColor *= (0.75 + 0.25 * toonDiffuse);

          // 4. Wave Crest Highlights
          baseColor = mix(baseColor, uSurfaceColor * 1.15, vWave * uWaveHighlight);

          // 5. Stylized Wave Crest Foam (Subtle animated edge rim)
          float foamMask = smoothstep(0.74, 0.92, vWave);
          vec3 finalColor = mix(baseColor, uFoamColor, foamMask * 0.65);

          // Add Subtle Sparkle Glint on Wave Peaks
          finalColor += uLightColor * toonSpec * 0.40;

          gl_FragColor = vec4(finalColor, 0.90);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }

  public update(timeInSeconds: number): void {
    this.uniforms.uTime.value = timeInSeconds;
  }
}
