import * as THREE from 'three';

export type CollectibleType = 'gold_coin' | 'dalat_tea' | 'sea_conch' | 'firework_ember';

export interface CollectibleItem {
  id: string;
  type: CollectibleType;
  name: string;
  description: string;
  value: number;
  position: THREE.Vector3;
  spawnPosition: THREE.Vector3;
  mesh?: THREE.Group;
  collected: boolean;
  respawnTimer: number;
}

export type PlatformState = 'idle' | 'shaking' | 'falling' | 'fallen' | 'respawning';

export interface FallingPlank {
  id: string;
  mesh: THREE.Group;
  initialPos: THREE.Vector3;
  state: PlatformState;
  timer: number;
  shakeOffset: THREE.Vector3;
}

export interface JumpVent {
  id: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
  boostVelocity: number;
  cooldownTimer: number;
}
