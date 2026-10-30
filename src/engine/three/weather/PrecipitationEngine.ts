import * as THREE from 'three';

export type PrecipitationMode = 'none' | 'rain' | 'petal';

const INSTANCE_COUNT = 300;
const BOX_HALF = 30;
const Y_MIN = 0.5;
const Y_MAX = 18;

// Pre-allocated temporaries — reused every frame, zero per-frame allocation
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _euler = new THREE.Euler();

/**
 * PrecipitationEngine — InstancedMesh-based particle system with 300
 * instances rendered in a **single draw call** for mobile perf.
 *
 * Two modes:
 * - `'rain'`  — vertical cyan/blue streaks slanting with wind
 * - `'petal'` — fluttering pink sakura blossom petals
 *
 * Particles wrap inside a box centred on the diorama:
 *   X/Z ∈ [−30, 30], Y ∈ [0.5, 18]
 */
export class PrecipitationEngine extends THREE.Group {
  private rainMesh: THREE.InstancedMesh;
  private petalMesh: THREE.InstancedMesh;

  /** Per-instance fall speed multiplier */
  private velocities: Float32Array;
  /** Per-instance phase offset for petal flutter */
  private phases: Float32Array;

  private mode: PrecipitationMode = 'none';
  private windDir = new THREE.Vector2(0.8, 0.6);
  private windSpeed = 0.15;

  constructor() {
    super();

    // ── Rain streak geometry: thin elongated plane ──
    const rainGeo = new THREE.PlaneGeometry(0.03, 0.5);
    const rainMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.rainMesh = new THREE.InstancedMesh(rainGeo, rainMat, INSTANCE_COUNT);
    this.rainMesh.frustumCulled = false;
    this.rainMesh.visible = false;
    this.add(this.rainMesh);

    // ── Sakura petal geometry: small flat plane ──
    const petalGeo = new THREE.PlaneGeometry(0.18, 0.12);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xffb7c5,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.petalMesh = new THREE.InstancedMesh(petalGeo, petalMat, INSTANCE_COUNT);
    this.petalMesh.frustumCulled = false;
    this.petalMesh.visible = false;
    this.add(this.petalMesh);

    // ── Initialize per-instance data ──
    this.velocities = new Float32Array(INSTANCE_COUNT);
    this.phases = new Float32Array(INSTANCE_COUNT);

    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const x = (Math.random() - 0.5) * BOX_HALF * 2;
      const y = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
      const z = (Math.random() - 0.5) * BOX_HALF * 2;
      this.velocities[i] = 4.0 + Math.random() * 4.0;
      this.phases[i] = Math.random() * Math.PI * 2;

      _position.set(x, y, z);
      _quaternion.identity();
      _scale.set(1, 1, 1);
      _matrix.compose(_position, _quaternion, _scale);
      this.rainMesh.setMatrixAt(i, _matrix);
      this.petalMesh.setMatrixAt(i, _matrix);
    }

    this.rainMesh.instanceMatrix.needsUpdate = true;
    this.petalMesh.instanceMatrix.needsUpdate = true;
  }

  /** Switch precipitation type (immediately toggles mesh visibility). */
  public setMode(mode: PrecipitationMode): void {
    this.mode = mode;
    this.rainMesh.visible = mode === 'rain';
    this.petalMesh.visible = mode === 'petal';
  }

  /** Update global wind vector (normalised direction + scalar speed). */
  public setWind(dirX: number, dirZ: number, speed: number): void {
    this.windDir.set(dirX, dirZ).normalize();
    this.windSpeed = speed;
  }

  /** Advance all 300 instances — call once per frame. */
  public update(dt: number, time: number): void {
    if (this.mode === 'none') return;

    const mesh = this.mode === 'rain' ? this.rainMesh : this.petalMesh;
    const isRain = this.mode === 'rain';

    for (let i = 0; i < INSTANCE_COUNT; i++) {
      mesh.getMatrixAt(i, _matrix);
      _matrix.decompose(_position, _quaternion, _scale);

      // Gravity / drift
      const fallSpeed = this.velocities[i] * (isRain ? 1.0 : 0.25);
      _position.y -= fallSpeed * dt;

      // Wind drift (petals affected more than rain)
      const windInfluence = isRain ? 0.5 : 1.5;
      _position.x += this.windDir.x * this.windSpeed * windInfluence * dt;
      _position.z += this.windDir.y * this.windSpeed * windInfluence * dt;

      // ── Boundary wrapping ──
      if (_position.y < Y_MIN) {
        _position.y = Y_MAX;
        _position.x = (Math.random() - 0.5) * BOX_HALF * 2;
        _position.z = (Math.random() - 0.5) * BOX_HALF * 2;
      }
      if (_position.x > BOX_HALF) _position.x -= BOX_HALF * 2;
      if (_position.x < -BOX_HALF) _position.x += BOX_HALF * 2;
      if (_position.z > BOX_HALF) _position.z -= BOX_HALF * 2;
      if (_position.z < -BOX_HALF) _position.z += BOX_HALF * 2;

      // ── Orientation ──
      if (isRain) {
        // Rain streaks slant in alignment with the wind vector
        _euler.set(0, 0, this.windDir.x * this.windSpeed * 0.3);
        _quaternion.setFromEuler(_euler);
      } else {
        // Sakura petals flutter with per-instance phase
        const p = this.phases[i];
        _euler.set(
          Math.sin(time * 1.5 + p) * 0.8,
          time * 0.5 + p,
          Math.cos(time * 1.2 + p) * 0.6,
        );
        _quaternion.setFromEuler(_euler);
      }

      _matrix.compose(_position, _quaternion, _scale);
      mesh.setMatrixAt(i, _matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  public dispose(): void {
    this.rainMesh.geometry.dispose();
    (this.rainMesh.material as THREE.Material).dispose();
    this.petalMesh.geometry.dispose();
    (this.petalMesh.material as THREE.Material).dispose();
  }
}
