import * as THREE from 'three';

/**
 * FoliageWindHook — attaches elevation-weighted wind vertex sway to any
 * MeshStandardMaterial / MeshLambertMaterial via `onBeforeCompile`.
 *
 * Root vertices (Y ≤ rootY) stay anchored; upper vertices sway with a
 * quadratic height factor so canopies move more than trunks.
 *
 * Usage:
 *   FoliageWindHook.apply(material, { rootY: 0, strength: 0.15 });
 *   // in render loop:
 *   FoliageWindHook.update(clock.getElapsedTime());
 */

interface WindUniforms {
  uWindTime: THREE.IUniform<number>;
  uWindDir: THREE.IUniform<THREE.Vector2>;
  uWindStrength: THREE.IUniform<number>;
  uRootY: THREE.IUniform<number>;
}

/** Shared uniforms — single instance drives all hooked materials in lockstep. */
const sharedUniforms: WindUniforms = {
  uWindTime: { value: 0 },
  uWindDir: { value: new THREE.Vector2(0.8, 0.6).normalize() },
  uWindStrength: { value: 0.15 },
  uRootY: { value: 0 },
};

const VERT_UNIFORMS = /* glsl */ `
uniform float uWindTime;
uniform vec2  uWindDir;
uniform float uWindStrength;
uniform float uRootY;
`;

const VERT_SWAY = /* glsl */ `
float heightFactor = max(0.0, position.y - uRootY);
float sway = sin(uWindTime * 2.2 + position.x * 0.7 + position.z * 0.7) * uWindStrength * (heightFactor * heightFactor);
transformed.x += uWindDir.x * sway;
transformed.z += uWindDir.y * sway;
`;

export interface FoliageWindOptions {
  /** Y coordinate of the rooted base; vertices at or below stay fixed. */
  rootY?: number;
  /** Per-material strength multiplier (overrides global default). */
  strength?: number;
}

export const FoliageWindHook = {
  /**
   * Patch a material's vertex shader to include wind sway displacement.
   * Safe to call multiple times on the same material — subsequent calls are no-ops.
   */
  apply(material: THREE.Material, options?: FoliageWindOptions): void {
    // Guard against double-patching
    if ((material.userData as Record<string, unknown>).__windHooked) return;
    (material.userData as Record<string, unknown>).__windHooked = true;

    const rootY = options?.rootY ?? 0;
    const strength = options?.strength ?? sharedUniforms.uWindStrength.value;

    material.onBeforeCompile = (shader) => {
      // Inject shared uniforms (uWindTime, uWindDir) plus per-material overrides
      shader.uniforms.uWindTime = sharedUniforms.uWindTime;
      shader.uniforms.uWindDir = sharedUniforms.uWindDir;
      shader.uniforms.uWindStrength = { value: strength };
      shader.uniforms.uRootY = { value: rootY };

      // Prepend uniform declarations to the vertex shader
      shader.vertexShader = VERT_UNIFORMS + shader.vertexShader;

      // Insert sway displacement right after #include <begin_vertex>
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n' + VERT_SWAY,
      );
    };

    // Force recompile on next render
    material.needsUpdate = true;
  },

  /**
   * Advance the global wind time uniform. Call once per frame.
   * @param currentTime elapsed time in seconds (e.g. `performance.now() * 0.001`)
   */
  update(currentTime: number): void {
    sharedUniforms.uWindTime.value = currentTime;
  },

  /**
   * Dynamically change the global wind direction and strength
   * (e.g. driven by the weather system).
   */
  setWind(dirX: number, dirZ: number, strength: number): void {
    sharedUniforms.uWindDir.value.set(dirX, dirZ).normalize();
    sharedUniforms.uWindStrength.value = strength;
  },
} as const;
