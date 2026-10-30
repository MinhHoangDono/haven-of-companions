import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 2D Simplex noise (Ashima Arts / Ian McEwan — public domain GLSL)
// Embedded directly to avoid any external texture dependencies.
// ---------------------------------------------------------------------------
const SIMPLEX_NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,   // (3.0 - sqrt(3.0)) / 6.0
    0.366025403784439,   // 0.5 * (sqrt(3.0) - 1.0)
   -0.577350269189626,   // -1.0 + 2.0 * C.x
    0.024390243902439    // 1.0 / 41.0
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                  + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                           dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x  + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

// ---------------------------------------------------------------------------
// Vertex shader — organic displacement via simplex noise
// ---------------------------------------------------------------------------
const FLAME_VERTEX_SHADER = /* glsl */ `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;

varying vec2  vUv;
varying float vNormalizedY;

void main() {
  vUv = uv;
  // Geometry is translated so base sits at Y = 0, tip at Y = 0.9
  vNormalizedY = position.y / 0.9;

  // Displace outward along radial normal for an organic, flickering silhouette.
  // Displacement grows toward the tip where the flame is wilder.
  float noiseVal = snoise(vec2(uv.x * 4.0, position.y * 3.0 - uTime * 3.0));
  float displacement = noiseVal * 0.12 * vNormalizedY;

  vec3 pos = position;
  pos.x += normal.x * displacement;
  pos.z += normal.z * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Fragment shader — stepped anime cel bands with edge discard
// ---------------------------------------------------------------------------
const FLAME_FRAGMENT_SHADER = /* glsl */ `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;

varying vec2  vUv;
varying float vNormalizedY;

void main() {
  // Two octaves of upward-scrolling noise for rich flame texture
  vec2 nc1 = vec2(vUv.x * 3.0, vNormalizedY * 4.0 - uTime * 2.5);
  float noise1 = snoise(nc1) * 0.5 + 0.5;
  float noise2 = snoise(nc1 * 2.1 + vec2(7.3, 1.2)) * 0.5 + 0.5;

  // Flame intensity: noise modulated by vertical falloff
  float flame = noise1 * 0.6 + noise2 * 0.4;
  flame *= (1.0 - vNormalizedY);        // fade toward tip
  flame += (1.0 - vNormalizedY) * 0.35; // boost base so core stays bright

  // Transparent outer silhouette — hard discard
  if (flame < 0.30) discard;

  // Stepped cel bands (anime style)
  vec3 colRed    = vec3(0.80, 0.15, 0.00);  // crimson edge
  vec3 colOrange = vec3(1.00, 0.333, 0.00); // #ff5500
  vec3 colYellow = vec3(1.00, 0.80, 0.067); // #ffcc11
  vec3 colCore   = vec3(1.00, 1.00, 1.00);  // #ffffff

  vec3 color = colRed;
  if (flame > 0.42) color = colOrange;
  if (flame > 0.62) color = colYellow;
  if (flame > 0.80) color = colCore;

  // Soft alpha ramp at the discard boundary to avoid hard aliased edges
  float alpha = smoothstep(0.30, 0.38, flame);

  gl_FragColor = vec4(color, alpha);
}
`;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EMBER_COUNT = 24;
const EMBER_MAX_HEIGHT = 1.8;
const EMBER_SPAWN_RADIUS = 0.25;

// ---------------------------------------------------------------------------
// CartoonFireMesh — cel-shaded 3D flame body + rising ember sparks
// ---------------------------------------------------------------------------
export class CartoonFireMesh extends THREE.Group {
  private flameMaterial: THREE.ShaderMaterial;
  private flameGeometry: THREE.CylinderGeometry;
  private emberGeometry: THREE.BufferGeometry;
  private emberMaterial: THREE.PointsMaterial;
  private emberVelocitiesY: Float32Array;
  private emberPhases: Float32Array;

  constructor() {
    super();
    this.name = 'campfire_fire_mesh';

    // --- Flame body (tapered open cylinder, base-grounded) ----------------
    this.flameGeometry = new THREE.CylinderGeometry(0.05, 0.4, 0.9, 16, 16, true);
    this.flameGeometry.translate(0, 0.45, 0); // pivot base to Y = 0

    this.flameMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
      },
      vertexShader: FLAME_VERTEX_SHADER,
      fragmentShader: FLAME_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const flameMesh = new THREE.Mesh(this.flameGeometry, this.flameMaterial);
    this.add(flameMesh);

    // --- Rising ember spark particles -------------------------------------
    this.emberGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(EMBER_COUNT * 3);
    this.emberVelocitiesY = new Float32Array(EMBER_COUNT);
    this.emberPhases = new Float32Array(EMBER_COUNT);

    for (let i = 0; i < EMBER_COUNT; i++) {
      this.resetEmber(positions, i);
    }

    this.emberGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );

    this.emberMaterial = new THREE.PointsMaterial({
      color: 0xff8833,
      size: 0.055,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const emberPoints = new THREE.Points(this.emberGeometry, this.emberMaterial);
    this.add(emberPoints);
  }

  // -----------------------------------------------------------------------
  // Ember lifecycle helpers
  // -----------------------------------------------------------------------

  /** Reset a single ember to a random position near the fire base. */
  private resetEmber(positions: Float32Array, index: number): void {
    const i3 = index * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * EMBER_SPAWN_RADIUS;
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.random() * 0.3; // near fire base
    positions[i3 + 2] = Math.sin(angle) * radius;

    this.emberVelocitiesY[index] = 0.3 + Math.random() * 0.5;
    this.emberPhases[index] = Math.random() * Math.PI * 2;
  }

  // -----------------------------------------------------------------------
  // Per-frame update — call from the render loop
  // -----------------------------------------------------------------------

  /**
   * Advance flame noise time and ember particle positions.
   * @param currentTime  Raw `requestAnimationFrame` timestamp in **milliseconds**.
   * @param dt           Frame delta in **seconds** (e.g. `minInterval / 1000`).
   */
  update(currentTime: number, dt: number): void {
    // Advance shader noise clock (seconds)
    this.flameMaterial.uniforms.uTime.value = currentTime * 0.001;

    // Advance ember particles
    const posAttr = this.emberGeometry.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const tSec = currentTime * 0.001;

    for (let i = 0; i < EMBER_COUNT; i++) {
      const i3 = i * 3;

      // Rise
      positions[i3 + 1] += this.emberVelocitiesY[i] * dt;

      // Horizontal swirl
      const phase = this.emberPhases[i];
      positions[i3] += Math.sin(tSec * 2.0 + phase) * 0.15 * dt;
      positions[i3 + 2] += Math.cos(tSec * 1.7 + phase) * 0.15 * dt;

      // Height-based reset wrapping
      if (positions[i3 + 1] > EMBER_MAX_HEIGHT) {
        this.resetEmber(positions, i);
      }
    }

    posAttr.needsUpdate = true;
  }

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  dispose(): void {
    this.flameGeometry.dispose();
    this.flameMaterial.dispose();
    this.emberGeometry.dispose();
    this.emberMaterial.dispose();
  }
}
