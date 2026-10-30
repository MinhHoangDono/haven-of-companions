import * as THREE from 'three';

/**
 * Gerstner wave parameters — shared with `buoyancy.ts`.
 *
 * Component 1 (Ocean Swell): Dir(0.3,0.9) normalized, λ=4.5 m, A=0.08 m, speed=1.1
 * Component 2 (Shore Chop):  Dir(-0.2,0.8) normalized, λ=2.2 m, A=0.035 m, speed=1.5
 */

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSpeed;

varying vec3 vWorldPosition;

// Pre-normalized wave directions (must match buoyancy.ts)
const vec2 DIR1 = vec2(0.316228, 0.948683);
const vec2 DIR2 = vec2(-0.242536, 0.970143);
const float K1 = 6.283185 / 4.5;
const float K2 = 6.283185 / 2.2;
const float AMP1 = 0.08;
const float AMP2 = 0.035;
const float SPEED1 = 1.1;
const float SPEED2 = 1.5;
const float Q1 = 0.45;
const float Q2 = 0.35;

vec3 gerstnerWave(vec2 xz, float t) {
  float phase1 = dot(DIR1, xz) * K1 - SPEED1 * t;
  float phase2 = dot(DIR2, xz) * K2 - SPEED2 * t;

  float c1 = cos(phase1);
  float s1 = sin(phase1);
  float c2 = cos(phase2);
  float s2 = sin(phase2);

  return vec3(
    Q1 * AMP1 * DIR1.x * c1 + Q2 * AMP2 * DIR2.x * c2,
    AMP1 * s1 + AMP2 * s2,
    Q1 * AMP1 * DIR1.y * c1 + Q2 * AMP2 * DIR2.y * c2
  );
}

void main() {
  // World position of the flat-plane vertex
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  // Gerstner displacement in world space
  vec3 disp = gerstnerWave(worldPos.xz, uTime * uSpeed);
  worldPos.xyz += disp;

  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uShallowColor;
uniform vec3 uDeepColor;
uniform vec3 uFoamColor;
uniform vec3 uSunDirection;
uniform float uTime;

varying vec3 vWorldPosition;

// --- Voronoi helpers (procedural cartoon foam cells) ---

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float voronoi(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float md = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 nb = vec2(float(x), float(y));
      vec2 pt = hash22(i + nb);
      // Gentle organic animation of cell centres
      pt = 0.5 + 0.5 * sin(uTime * 0.6 + 6.283185 * pt);
      md = min(md, length(nb + pt - f));
    }
  }
  return md;
}

void main() {
  // ---- Faceted low-poly normal via hardware screen-derivatives ----
  vec3 fdx = dFdx(vWorldPosition);
  vec3 fdy = dFdy(vWorldPosition);
  vec3 N = normalize(cross(fdx, fdy));

  // ---- Depth / height colour blend ----
  // Maps wave troughs (~-0.05) → 0 and crests (~0.15) → 1
  float heightFactor = smoothstep(-0.05, 0.15, vWorldPosition.y);
  vec3 baseColor = mix(uDeepColor, uShallowColor, heightFactor);

  // ---- Procedural Voronoi foam on wave crests ----
  float foam = voronoi(vWorldPosition.xz * 1.5);
  // Foam visible only near crests (upper ~40% of wave height)
  float foamMask = smoothstep(0.35, 0.05, foam) * smoothstep(0.55, 0.85, heightFactor);
  baseColor = mix(baseColor, uFoamColor, foamMask * 0.65);

  // ---- Lighting ----
  // Half-lambert diffuse for softer cartoon shading
  float NdotL = dot(N, uSunDirection);
  float diffuse = NdotL * 0.5 + 0.5;

  // View direction
  vec3 V = normalize(cameraPosition - vWorldPosition);

  // Grazing Fresnel glint
  float fresnel = pow(1.0 - max(dot(V, N), 0.0), 4.0);

  // Blinn-Phong specular highlight
  vec3 H = normalize(uSunDirection + V);
  float spec = pow(max(dot(N, H), 0.0), 48.0);

  vec3 color = baseColor * diffuse
             + vec3(1.0) * spec * 0.5
             + uShallowColor * fresnel * 0.25;

  gl_FragColor = vec4(color, 0.88);
}
`;

/**
 * Zelda / Ghibli stylized ocean water shader.
 *
 * Features:
 * - Two-component trochoidal Gerstner wave displacement (GPU vertex shader)
 * - Faceted flat-shading normals via `dFdx` / `dFdy` screen derivatives
 * - Procedural animated Voronoi cartoon foam cells on wave crests
 * - Grazing Fresnel glint and Blinn-Phong specular highlight
 */
export class StylizedOceanMaterial extends THREE.ShaderMaterial {
  constructor() {
    const sunDir = new THREE.Vector3(0.5, 0.7, 0.3).normalize();

    super({
      uniforms: {
        uTime: { value: 0.0 },
        uShallowColor: { value: new THREE.Color('#2dd4bf') },
        uDeepColor: { value: new THREE.Color('#0f4c81') },
        uFoamColor: { value: new THREE.Color('#ffffff') },
        uSunDirection: { value: sunDir },
        uSpeed: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.FrontSide,
    });
  }

  /** Advance shader time. Call once per frame with elapsed seconds. */
  update(timeInSeconds: number): void {
    this.uniforms.uTime.value = timeInSeconds;
  }
}
