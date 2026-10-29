import * as THREE from 'three';
import { InteractiveHit } from '../../types/threeEngine';

export interface TouchControls3DCallbacks {
  onTap?: (hit: InteractiveHit | null) => void;
  onCameraChange?: () => void;
}

export class TouchControls3D {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private callbacks: TouchControls3DCallbacks;
  private raycaster = new THREE.Raycaster();
  private interactiveObjects: THREE.Object3D[] = [];

  // Camera Target (center point the camera orbits / looks at)
  public target = new THREE.Vector3(0, 0.8, 0);
  public distance = 18; // Closer default so characters and tactical details are prominent
  public minDistance = 9;
  public maxDistance = 32;

  // Touch tracking
  private pointers = new Map<number, { x: number; y: number }>();
  private startPointers = new Map<number, { x: number; y: number }>();
  private touchStartTime = 0;
  private lastMoveTime = 0;
  private lastPinchDist = 0;

  // Inertia
  private velocityX = 0;
  private velocityZ = 0;
  private friction = 0.92;
  public isPanning = false;

  // Bounds clamping for the compact diorama
  private bounds = {
    minX: -8,
    maxX: 8,
    minZ: -8,
    maxZ: 8,
  };

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    callbacks: TouchControls3DCallbacks = {}
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    this.updateCameraPosition();
  }

  public setInteractiveObjects(objects: THREE.Object3D[]) {
    this.interactiveObjects = objects;
  }

  public panTo(targetX: number, targetZ: number) {
    this.target.x = THREE.MathUtils.clamp(targetX, this.bounds.minX, this.bounds.maxX);
    this.target.z = THREE.MathUtils.clamp(targetZ, this.bounds.minZ, this.bounds.maxZ);
    this.updateCameraPosition();
    this.callbacks.onCameraChange?.();
  }

  public updateCameraPosition() {
    // True isometric vector (azimuth 45 deg, elevation ~35.26 deg)
    // Normalized isometric direction: (1, 1.15, 1) normalized
    const isoDir = new THREE.Vector3(1, 1.15, 1).normalize();

    this.camera.position.copy(this.target).addScaledVector(isoDir, this.distance);
    this.camera.lookAt(this.target);
  }

  public handlePointerDown(e: PointerEvent) {
    const rect = this.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.pointers.set(e.pointerId, { x, y });
    this.startPointers.set(e.pointerId, { x, y });

    if (this.pointers.size === 1) {
      this.isPanning = true;
      this.touchStartTime = performance.now();
      this.lastMoveTime = this.touchStartTime;
      this.velocityX = 0;
      this.velocityZ = 0;
    } else if (this.pointers.size === 2) {
      const pts = Array.from(this.pointers.values());
      this.lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  }

  public handlePointerMove(e: PointerEvent) {
    if (!this.pointers.has(e.pointerId)) return;

    const rect = this.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const prev = this.pointers.get(e.pointerId)!;
    this.pointers.set(e.pointerId, { x, y });

    const now = performance.now();
    const dt = Math.max(1, now - this.lastMoveTime);

    if (this.pointers.size === 1) {
      const dx = x - prev.x;
      const dy = y - prev.y;

      // Translate 2D screen delta along isometric ground axes
      // Screen X moves diagonally (X - Z); Screen Y moves diagonally (X + Z)
      const moveScale = (this.distance / 1000) * 0.9;
      const groundDX = (-dx + dy) * moveScale;
      const groundDZ = (dx + dy) * moveScale;

      this.target.x = THREE.MathUtils.clamp(this.target.x + groundDX, this.bounds.minX, this.bounds.maxX);
      this.target.z = THREE.MathUtils.clamp(this.target.z + groundDZ, this.bounds.minZ, this.bounds.maxZ);

      this.velocityX = (groundDX / dt) * 16;
      this.velocityZ = (groundDZ / dt) * 16;
      this.lastMoveTime = now;

      this.updateCameraPosition();
      this.callbacks.onCameraChange?.();
    } else if (this.pointers.size === 2) {
      const pts = Array.from(this.pointers.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

      if (this.lastPinchDist > 0) {
        const factor = this.lastPinchDist / currentDist;
        this.distance = THREE.MathUtils.clamp(this.distance * factor, this.minDistance, this.maxDistance);
        this.updateCameraPosition();
        this.callbacks.onCameraChange?.();
      }
      this.lastPinchDist = currentDist;
    }
  }

  public handlePointerUp(e: PointerEvent) {
    const startPos = this.startPointers.get(e.pointerId);
    const rect = this.domElement.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const duration = performance.now() - this.touchStartTime;

    // Detect Tap
    if (startPos && duration < 300) {
      const dist = Math.hypot(endX - startPos.x, endY - startPos.y);
      if (dist < 10) {
        this.raycastTap(endX, endY, rect.width, rect.height);
      }
    }

    const timeSinceLastMove = performance.now() - this.lastMoveTime;
    if (timeSinceLastMove > 75) {
      this.velocityX = 0;
      this.velocityZ = 0;
    }

    this.pointers.delete(e.pointerId);
    this.startPointers.delete(e.pointerId);

    if (this.pointers.size === 0) {
      this.isPanning = false;
    } else if (this.pointers.size === 1) {
      this.lastPinchDist = 0;
    }
  }

  public handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    this.distance = THREE.MathUtils.clamp(this.distance * zoomFactor, this.minDistance, this.maxDistance);
    this.updateCameraPosition();
    this.callbacks.onCameraChange?.();
  }

  private raycastTap(screenX: number, screenY: number, width: number, height: number) {
    const mouse = new THREE.Vector2(
      (screenX / width) * 2 - 1,
      -(screenY / height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      // Find top interactive object with userData
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.interactiveId) {
        obj = obj.parent;
      }

      if (obj && obj.userData?.interactiveId) {
        this.callbacks.onTap?.({
          id: obj.userData.interactiveId,
          type: obj.userData.interactiveType || 'character',
          point: intersects[0].point,
        });
        return;
      }
    }

    // Tapped ground / nothing interactive
    this.callbacks.onTap?.(null);
  }

  public tick() {
    // Apply inertia damping
    if (!this.isPanning && (Math.abs(this.velocityX) > 0.001 || Math.abs(this.velocityZ) > 0.001)) {
      this.target.x = THREE.MathUtils.clamp(this.target.x + this.velocityX, this.bounds.minX, this.bounds.maxX);
      this.target.z = THREE.MathUtils.clamp(this.target.z + this.velocityZ, this.bounds.minZ, this.bounds.maxZ);

      this.velocityX *= this.friction;
      this.velocityZ *= this.friction;

      this.updateCameraPosition();
      this.callbacks.onCameraChange?.();
    }
  }
}
