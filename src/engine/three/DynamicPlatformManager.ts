import * as THREE from 'three';
import { FallingPlank, JumpVent } from '../../types/platformer';
import { audioManager } from '../../audio/audioManager';

export class DynamicPlatformManager {
  private fallingPlanks: FallingPlank[] = [];
  private jumpVents: JumpVent[] = [];
  private ventParticles: THREE.Points | null = null;
  private ventPositions: Float32Array = new Float32Array(0);

  constructor(scene: THREE.Scene) {
    this.initFallingPlank(scene);
    this.initJumpVent(scene);
  }

  /**
   * Initializes the fragile wooden pier plank
   */
  private initFallingPlank(scene: THREE.Scene) {
    const group = new THREE.Group();

    // Wooden plank geometry
    const plankGeo = new THREE.BoxGeometry(1.6, 0.22, 1.2);
    const plankMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.85,
      metalness: 0.05,
    });
    const plankMesh = new THREE.Mesh(plankGeo, plankMat);
    plankMesh.castShadow = true;
    plankMesh.receiveShadow = true;
    group.add(plankMesh);

    // Warning crack decals / moss
    const crackGeo = new THREE.BoxGeometry(1.2, 0.02, 0.15);
    const crackMat = new THREE.MeshBasicMaterial({ color: 0x221105 });
    const crack = new THREE.Mesh(crackGeo, crackMat);
    crack.position.y = 0.12;
    group.add(crack);

    // Initial position on coastal boardwalk
    const initialPos = new THREE.Vector3(-2.5, 0.45, 7.2);
    group.position.copy(initialPos);
    scene.add(group);

    this.fallingPlanks.push({
      id: 'plank_coastal_1',
      mesh: group,
      initialPos: initialPos.clone(),
      state: 'idle',
      timer: 0,
      shakeOffset: new THREE.Vector3(),
    });
  }

  /**
   * Initializes the Highland Thermal Wind Geyser Launch Vent
   */
  private initJumpVent(scene: THREE.Scene) {
    const ventPos = new THREE.Vector3(-14.5, 1.6, -8.0);
    const group = new THREE.Group();

    // Stone base rim
    const rimGeo = new THREE.CylinderGeometry(0.75, 0.9, 0.25, 16);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x4a4744,
      roughness: 0.9,
      metalness: 0.1,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.castShadow = true;
    rim.receiveShadow = true;
    group.add(rim);

    // Inner glowing wind rune
    const runeGeo = new THREE.CircleGeometry(0.6, 16);
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x38d976,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.rotation.x = -Math.PI / 2;
    rune.position.y = 0.14;
    group.add(rune);

    group.position.copy(ventPos);
    scene.add(group);

    // Upward vortex wind particles
    const particleCount = 45;
    const pGeo = new THREE.BufferGeometry();
    this.ventPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.45;
      this.ventPositions[i * 3] = ventPos.x + Math.cos(angle) * radius;
      this.ventPositions[i * 3 + 1] = ventPos.y + Math.random() * 2.5;
      this.ventPositions[i * 3 + 2] = ventPos.z + Math.sin(angle) * radius;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(this.ventPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x69db7c,
      size: 0.16,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.ventParticles = new THREE.Points(pGeo, pMat);
    scene.add(this.ventParticles);

    this.jumpVents.push({
      id: 'vent_highland_1',
      position: ventPos.clone(),
      mesh: group,
      boostVelocity: 10.8, // Launches character up to 5 meters in the air!
      cooldownTimer: 0,
    });
  }

  /**
   * Frame tick: updates animations, physics, and character step collisions
   */
  public update(
    dt: number,
    __currentTime: number,
    characterPos: THREE.Vector3,
    onLaunch: (velocity: number) => void,
    onToast?: (msg: string) => void
  ) {
    // 1. Update Falling Planks
    this.fallingPlanks.forEach((plank) => {
      const dist = Math.hypot(characterPos.x - plank.initialPos.x, characterPos.z - plank.initialPos.z);
      const isStandingOn = dist < 0.85 && Math.abs(characterPos.y - plank.initialPos.y) < 0.6;

      if (plank.state === 'idle') {
        if (isStandingOn) {
          plank.state = 'shaking';
          plank.timer = 0.85; // 0.85s warning shake
          audioManager.playWoodCreak();
          onToast?.('⚠️ Ván cầu gỗ mục sắp sập!');
        }
        plank.mesh.position.copy(plank.initialPos);
      } else if (plank.state === 'shaking') {
        plank.timer -= dt;
        // High frequency jitter shake
        const jitterX = (Math.random() - 0.5) * 0.08;
        const jitterZ = (Math.random() - 0.5) * 0.08;
        plank.mesh.position.set(
          plank.initialPos.x + jitterX,
          plank.initialPos.y,
          plank.initialPos.z + jitterZ
        );

        if (plank.timer <= 0) {
          plank.state = 'falling';
          plank.timer = 0.6;
        }
      } else if (plank.state === 'falling') {
        plank.timer -= dt;
        plank.mesh.position.y -= dt * 3.5; // Drops into water
        plank.mesh.rotation.z += dt * 0.8;

        if (plank.timer <= 0) {
          plank.state = 'fallen';
          plank.timer = 4.0; // Stays fallen for 4.0 seconds
          plank.mesh.visible = false;
        }
      } else if (plank.state === 'fallen') {
        plank.timer -= dt;
        if (plank.timer <= 0) {
          plank.state = 'respawning';
          plank.timer = 0.6;
          plank.mesh.visible = true;
          plank.mesh.position.set(plank.initialPos.x, plank.initialPos.y - 1.0, plank.initialPos.z);
          plank.mesh.rotation.set(0, 0, 0);
        }
      } else if (plank.state === 'respawning') {
        plank.timer -= dt;
        // Float smoothly back up to surface
        plank.mesh.position.y = THREE.MathUtils.lerp(plank.mesh.position.y, plank.initialPos.y, dt * 6.0);
        if (plank.timer <= 0) {
          plank.state = 'idle';
          plank.mesh.position.copy(plank.initialPos);
        }
      }
    });

    // 2. Update High-Jump Geyser Vents & Particles
    this.jumpVents.forEach((vent) => {
      if (vent.cooldownTimer > 0) {
        vent.cooldownTimer -= dt;
      }

      const dist = Math.hypot(characterPos.x - vent.position.x, characterPos.z - vent.position.z);
      if (dist < 1.15 && Math.abs(characterPos.y - vent.position.y) < 0.8 && vent.cooldownTimer <= 0) {
        vent.cooldownTimer = 0.8;
        onLaunch(vent.boostVelocity);
        audioManager.playSpring();
        onToast?.('💨 Gió Thần Cao Nguyên phóng bạn lên cao!');
      }
    });

    // Animate upward rising wind particles
    if (this.ventParticles) {
      const posAttr = this.ventParticles.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let py = posAttr.getY(i) + dt * 2.8;
        if (py > 4.2) {
          py = 1.6 + Math.random() * 0.2;
        }
        posAttr.setY(i, py);
      }
      posAttr.needsUpdate = true;
    }
  }

  public dispose(scene: THREE.Scene) {
    this.fallingPlanks.forEach((p) => scene.remove(p.mesh));
    this.jumpVents.forEach((v) => scene.remove(v.mesh));
    if (this.ventParticles) scene.remove(this.ventParticles);
  }
}
