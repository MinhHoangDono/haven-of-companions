/**
 * Analytical Gerstner-wave surface evaluation for CPU-side buoyancy.
 *
 * Every constant here MUST stay in lock-step with the vertex shader in
 * `StylizedOceanMaterial.ts`.  If you change wave parameters there,
 * mirror them here so ships ride the same surface the GPU renders.
 */

const TWO_PI = 2.0 * Math.PI;

// --- Pre-normalised wave directions (same as shader) ---

const D1_LEN = Math.sqrt(0.3 * 0.3 + 0.9 * 0.9);
const D1_X = 0.3 / D1_LEN;  // ≈ 0.316228
const D1_Z = 0.9 / D1_LEN;  // ≈ 0.948683

const D2_LEN = Math.sqrt(0.2 * 0.2 + 0.8 * 0.8);
const D2_X = -0.2 / D2_LEN; // ≈ -0.242536
const D2_Z = 0.8 / D2_LEN;  // ≈  0.970143

// --- Wave component parameters ---

const AMP1 = 0.08;
const AMP2 = 0.035;
const K1 = TWO_PI / 4.5;   // wavelength 4.5 m
const K2 = TWO_PI / 2.2;   // wavelength 2.2 m
const SPEED1 = 1.1;
const SPEED2 = 1.5;

/** Water plane base Y from DioramaBuilder. */
const WATER_BASE_Y = 0.05;

export interface WaveElevation {
  /** Absolute world Y of the water surface. */
  y: number;
  /** Rotation around the X axis (bow/stern tilt from Z-slope). */
  pitch: number;
  /** Rotation around the Z axis (port/starboard tilt from X-slope). */
  roll: number;
}

/**
 * Evaluate the Gerstner wave surface height and slope at world `(x, z)`.
 *
 * @param x     World-space X coordinate of the vessel.
 * @param z     World-space Z coordinate of the vessel.
 * @param time  Elapsed time in **seconds** (same value fed to
 *              `StylizedOceanMaterial.update()`).
 * @param speed Must match `StylizedOceanMaterial.uniforms.uSpeed.value`
 *              (default `1.0`).
 */
export function getWaveElevation(
  x: number,
  z: number,
  time: number,
  speed = 1.0,
): WaveElevation {
  const t = time * speed;

  const phase1 = (D1_X * x + D1_Z * z) * K1 - SPEED1 * t;
  const phase2 = (D2_X * x + D2_Z * z) * K2 - SPEED2 * t;

  const sin1 = Math.sin(phase1);
  const sin2 = Math.sin(phase2);
  const cos1 = Math.cos(phase1);
  const cos2 = Math.cos(phase2);

  // Surface elevation (Y displacement identical to the vertex shader)
  const y = WATER_BASE_Y + AMP1 * sin1 + AMP2 * sin2;

  // ∂y/∂x  and  ∂y/∂z  — analytic partial derivatives of the elevation
  const dydx = AMP1 * K1 * D1_X * cos1 + AMP2 * K2 * D2_X * cos2;
  const dydz = AMP1 * K1 * D1_Z * cos1 + AMP2 * K2 * D2_Z * cos2;

  // Pitch  = rotation around X-axis (forward/back tilt from Z-slope)
  // Roll   = rotation around Z-axis (side tilt from X-slope, negated)
  const pitch = Math.atan(dydz);
  const roll = Math.atan(-dydx);

  return { y, pitch, roll };
}
