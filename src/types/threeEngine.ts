import * as THREE from 'three';

export interface Vector3Coord {
  x: number;
  y: number;
  z: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export type InteractivePropType = 'stew_pot' | 'sea_bell' | 'fireworks_mortar' | 'tea_pavilion';
export type InteractiveTargetType = 'character' | InteractivePropType | 'ground';
export interface InteractiveHit {
  id: string;
  type: InteractiveTargetType;
  point: THREE.Vector3;
}
