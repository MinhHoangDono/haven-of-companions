import * as THREE from 'three';
import { InteractiveHit } from '../../types/threeEngine';
import { passabilityGrid } from '../map/passabilityMap';
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
   public distance = 38;
   public minDistance = 14;
   public maxDistance = 85;

  // 3D Spherical Angles for Rotation
  public azimuthAngle = Math.PI / 4; // Initial classic 45-degree isometric view
  public targetAzimuth = Math.PI / 4;
  public elevationAngle = 0.61; // Approx 35-degree true isometric elevation

  // Touch tracking
  private pointers = new Map<number, { x: number; y: number }>();
  private startPointers = new Map<number, { x: number; y: number }>();
  private touchStartTime = 0;
  private lastMoveTime = 0;
  private lastPinchDist = 0;
  private lastPinchAngle = 0;
  private isMouseRotating = false;

  // Inertia
  private velocityX = 0;
  private velocityZ = 0;
  private friction = 0.92;
  public isPanning = false;

  // Bounds clamping for the compact diorama
   private bounds = {
     minX: -34,
     maxX: 34,
     minZ: -34,
     maxZ: 34,
   };

  constructor(
    camera: THREE.Camera,
    domElement: HTMLElement,
    callbacks: TouchControls3DCallbacks = {}
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    // Prevent default context menu for smooth desktop right-click rotation
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

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

  /**
   * Smoothly rotates the camera around the diorama by deltaRadians (e.g. +PI/4 or -PI/4)
   */
  public rotateBy(deltaRadians: number) {
    this.targetAzimuth += deltaRadians;
    this.callbacks.onCameraChange?.();
  }

  public updateCameraPosition() {
    const cosElev = Math.cos(this.elevationAngle);
    const sinElev = Math.sin(this.elevationAngle);

    // Direction vector from target to camera in spherical coordinates
    const xOffset = Math.sin(this.azimuthAngle) * cosElev;
    const yOffset = sinElev;
    const zOffset = Math.cos(this.azimuthAngle) * cosElev;

    const camDir = new THREE.Vector3(xOffset, yOffset, zOffset).normalize();

    this.camera.position.copy(this.target).addScaledVector(camDir, this.distance);
    this.camera.lookAt(this.target);
  }

  public handlePointerDown(e: PointerEvent) {
    const rect = this.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.pointers.set(e.pointerId, { x, y });
    this.startPointers.set(e.pointerId, { x, y });

    // Right-click drag rotates on PC
    if (e.button === 2) {
      this.isMouseRotating = true;
      return;
    }

    if (this.pointers.size === 1) {
      this.isPanning = true;
      this.touchStartTime = performance.now();
      this.lastMoveTime = this.touchStartTime;
      this.velocityX = 0;
      this.velocityZ = 0;
    } else if (this.pointers.size === 2) {
      const pts = Array.from(this.pointers.values());
      this.lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      this.lastPinchAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    }
  }

  public handlePointerMove(e: PointerEvent) {
    if (!this.pointers.has(e.pointerId)) return;

    const rect = this.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const prev = this.pointers.get(e.pointerId)!;
    this.pointers.set(e.pointerId, { x, y });

    const dx = x - prev.x;
    const dy = y - prev.y;

    // Right-click drag rotation on PC
    if (this.isMouseRotating) {
      this.azimuthAngle += dx * 0.008;
      this.targetAzimuth = this.azimuthAngle;
      this.updateCameraPosition();
      this.callbacks.onCameraChange?.();
      return;
    }

    const now = performance.now();
    const dt = Math.max(1, now - this.lastMoveTime);

    if (this.pointers.size === 1) {
      // Screen X moves along camera horizontal right vector
      // Screen Y moves along camera horizontal forward vector
      const rightX = Math.cos(this.azimuthAngle);
      const rightZ = -Math.sin(this.azimuthAngle);
      const fwdX = -Math.sin(this.azimuthAngle);
      const fwdZ = -Math.cos(this.azimuthAngle);

      const moveScale = (this.distance / 1000) * 0.9;
      const groundDX = (-dx * rightX + dy * fwdX) * moveScale;
      const groundDZ = (-dx * rightZ + dy * fwdZ) * moveScale;

      this.target.x = THREE.MathUtils.clamp(this.target.x + groundDX, this.bounds.minX, this.bounds.maxX);
      this.target.z = THREE.MathUtils.clamp(this.target.z + groundDZ, this.bounds.minZ, this.bounds.maxZ);

      this.velocityX = (groundDX / dt) * 16;
      this.velocityZ = (groundDZ / dt) * 16;
      this.lastMoveTime = now;

      this.updateCameraPosition();
      this.callbacks.onCameraChange?.();
    } else if (this.pointers.size === 2) {
      // 2-Finger Pinch Zoom + Twist Rotation on mobile
      const pts = Array.from(this.pointers.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const currentAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);

      // Pinch zoom
      if (this.lastPinchDist > 0) {
        const factor = this.lastPinchDist / currentDist;
        this.distance = THREE.MathUtils.clamp(this.distance * factor, this.minDistance, this.maxDistance);
      }
      this.lastPinchDist = currentDist;

      // Twist rotate
      let deltaAngle = currentAngle - this.lastPinchAngle;
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

      this.azimuthAngle += deltaAngle * 1.1;
      this.targetAzimuth = this.azimuthAngle;
      this.lastPinchAngle = currentAngle;

      this.updateCameraPosition();
      this.callbacks.onCameraChange?.();
    }
  }

  public handlePointerUp(e: PointerEvent) {
    if (e.button === 2) {
      this.isMouseRotating = false;
    }

    const startPos = this.startPointers.get(e.pointerId);
    const rect = this.domElement.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    if (startPos && !this.isMouseRotating) {
      const dist = Math.hypot(endX - startPos.x, endY - startPos.y);
      const duration = performance.now() - this.touchStartTime;

      // Clean tap detection
      if (dist < 12 && duration < 320) {
        this.raycastTap(endX, endY, rect.width, rect.height);
      }
    }

    this.pointers.delete(e.pointerId);
    this.startPointers.delete(e.pointerId);

    if (this.pointers.size === 0) {
      this.isPanning = false;
      this.isMouseRotating = false;
    }
  }

  public handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
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

    // Check if tapped ground with two-pass terrain elevation correction
    const roughGroundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5);
    const groundHit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(roughGroundPlane, groundHit)) {
      // Sample true terrain elevation at candidate coordinate to eliminate isometric parallax
      const trueY = passabilityGrid.getElevationAt(groundHit.x, groundHit.z);
      const correctedPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -trueY);
      this.raycaster.ray.intersectPlane(correctedPlane, groundHit);
      groundHit.y = passabilityGrid.getElevationAt(groundHit.x, groundHit.z);

      this.callbacks.onTap?.({
        id: 'ground',
        type: 'ground',
        point: groundHit,
      });
      return;
    }

    this.callbacks.onTap?.(null);
  }

  public tick() {
    // 1. Smooth Azimuth Interpolation (for rotate buttons)
    if (Math.abs(this.targetAzimuth - this.azimuthAngle) > 0.001) {
      this.azimuthAngle += (this.targetAzimuth - this.azimuthAngle) * 0.14;
      this.updateCameraPosition();
      this.callbacks.onCameraChange?.();
    }

    // 2. Inertia damping
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
