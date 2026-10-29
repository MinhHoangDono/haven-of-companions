import { CameraState, ScreenCoord, Viewport } from '../types/engine';
import { clamp, lerp } from './isometric';

export interface TouchControllerCallbacks {
  onTap?: (screenPos: ScreenCoord) => void;
  onCameraChange?: (camera: CameraState) => void;
}

export class TouchController {
  private camera: CameraState;
  private viewport: Viewport;
  private pointers = new Map<number, ScreenCoord>();
  private startPointerPositions = new Map<number, ScreenCoord>();
  private pointerStartTime = 0;
  private lastPinchDistance = 0;

  // Velocity tracking for inertia
  private velocityX = 0;
  private velocityY = 0;
  private lastMoveTime = 0;

  // Configuration
  private minZoom = 0.55;
  private maxZoom = 2.2;
  private friction = 0.92;
  private callbacks: TouchControllerCallbacks;

  // Map boundary clamping (in world pixel space)
  private bounds = {
    minX: -1600,
    maxX: 1600,
    minY: -400,
    maxY: 1800,
  };

  constructor(
    viewport: Viewport,
    callbacks: TouchControllerCallbacks = {},
    initialCamera?: Partial<CameraState>
  ) {
    this.viewport = viewport;
    this.callbacks = callbacks;
    this.camera = {
      x: initialCamera?.x ?? viewport.width / 2,
      y: initialCamera?.y ?? viewport.height / 3,
      zoom: initialCamera?.zoom ?? 1.0,
      targetX: initialCamera?.targetX ?? viewport.width / 2,
      targetY: initialCamera?.targetY ?? viewport.height / 3,
      targetZoom: initialCamera?.targetZoom ?? 1.0,
      isPanning: false,
    };
    this.clampCamera(this.camera);
  }

  private clampCamera(c: { x: number; y: number }) {
    const { width, height } = this.viewport;
    const z = this.camera.zoom;
    const { minX, maxX, minY, maxY } = this.bounds;

    const xHi = -minX * z;
    const xLo = width - maxX * z;
    const yHi = -minY * z;
    const yLo = height - maxY * z;

    c.x = xLo > xHi ? (xLo + xHi) / 2 : clamp(c.x, xLo, xHi);
    c.y = yLo > yHi ? (yLo + yHi) / 2 : clamp(c.y, yLo, yHi);
  }

  public updateViewport(viewport: Viewport) {
    this.viewport = viewport;
    this.clampCamera(this.camera);
  }

  public getCamera(): CameraState {
    return this.camera;
  }

  public panTo(targetX: number, targetY: number, targetZoom?: number) {
    if (targetZoom !== undefined) {
      this.camera.targetZoom = clamp(targetZoom, this.minZoom, this.maxZoom);
    }
    const target = { x: targetX, y: targetY };
    this.clampCamera(target);
    this.camera.targetX = target.x;
    this.camera.targetY = target.y;
  }

  public handlePointerDown(e: PointerEvent, canvasRect: DOMRect) {
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    this.pointers.set(e.pointerId, { x, y });
    this.startPointerPositions.set(e.pointerId, { x, y });

    if (this.pointers.size === 1) {
      this.camera.isPanning = true;
      this.pointerStartTime = performance.now();
      this.lastMoveTime = this.pointerStartTime;
      this.velocityX = 0;
      this.velocityY = 0;
    } else if (this.pointers.size === 2) {
      const pts = Array.from(this.pointers.values());
      this.lastPinchDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  }

  public handlePointerMove(e: PointerEvent, canvasRect: DOMRect) {
    if (!this.pointers.has(e.pointerId)) return;

    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    const prev = this.pointers.get(e.pointerId)!;
    this.pointers.set(e.pointerId, { x, y });

    const now = performance.now();
    const dt = Math.max(1, now - this.lastMoveTime);

    if (this.pointers.size === 1) {
      const dx = x - prev.x;
      const dy = y - prev.y;

      this.camera.x += dx;
      this.camera.y += dy;
      this.camera.targetX = this.camera.x;
      this.camera.targetY = this.camera.y;

      // Track velocity for smooth throw / inertia
      this.velocityX = (dx / dt) * 16;
      this.velocityY = (dy / dt) * 16;
      this.lastMoveTime = now;

      this.clampCamera(this.camera);
    } else if (this.pointers.size === 2) {
      const pts = Array.from(this.pointers.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

      if (this.lastPinchDistance > 0) {
        const pinchCenter = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2,
        };

        const zoomDelta = currentDist / this.lastPinchDistance;
        const newZoom = clamp(this.camera.zoom * zoomDelta, this.minZoom, this.maxZoom);

        // Zoom towards pinch center
        const worldX = (pinchCenter.x - this.camera.x) / this.camera.zoom;
        const worldY = (pinchCenter.y - this.camera.y) / this.camera.zoom;

        this.camera.zoom = newZoom;
        this.camera.targetZoom = newZoom;
        this.camera.x = pinchCenter.x - worldX * newZoom;
        this.camera.y = pinchCenter.y - worldY * newZoom;
        this.camera.targetX = this.camera.x;
        this.camera.targetY = this.camera.y;

        this.clampCamera(this.camera);
      }
      this.lastPinchDistance = currentDist;
    }

    this.callbacks.onCameraChange?.(this.camera);
  }

  public handlePointerUp(e: PointerEvent, canvasRect: DOMRect) {
    const startPos = this.startPointerPositions.get(e.pointerId);
    const endX = e.clientX - canvasRect.left;
    const endY = e.clientY - canvasRect.top;
    const duration = performance.now() - this.pointerStartTime;

    if (startPos && duration < 300) {
      const dist = Math.hypot(endX - startPos.x, endY - startPos.y);
      if (dist < 10) {
        // Dispatched as a clean tap
        this.callbacks.onTap?.({ x: endX, y: endY });
      }
    }
    const timeSinceLastMove = performance.now() - this.lastMoveTime;
    if (timeSinceLastMove > 75) {
      this.velocityX = 0;
      this.velocityY = 0;
    }

    this.pointers.delete(e.pointerId);
    this.startPointerPositions.delete(e.pointerId);
    if (this.pointers.size === 0) {
      this.camera.isPanning = false;
    } else if (this.pointers.size === 1) {
      this.lastPinchDistance = 0;
    }
  }

  public handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = clamp(this.camera.zoom * zoomFactor, this.minZoom, this.maxZoom);

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const worldX = (mouseX - this.camera.x) / this.camera.zoom;
    const worldY = (mouseY - this.camera.y) / this.camera.zoom;

    this.camera.zoom = newZoom;
    this.camera.targetZoom = newZoom;
    this.camera.x = mouseX - worldX * newZoom;
    this.camera.y = mouseY - worldY * newZoom;
    this.camera.targetX = this.camera.x;
    this.camera.targetY = this.camera.y;

    this.clampCamera(this.camera);
    this.callbacks.onCameraChange?.(this.camera);
  }

  /**
   * Per-frame physics update (inertia decay + smooth camera targeting)
   */
  public tick(deltaTime: number) {
    let moved = false;

    // Apply inertia when not actively holding touch
    if (!this.camera.isPanning && (Math.abs(this.velocityX) > 0.05 || Math.abs(this.velocityY) > 0.05)) {
      this.camera.x += this.velocityX;
      this.camera.y += this.velocityY;
      this.camera.targetX = this.camera.x;
      this.camera.targetY = this.camera.y;

      this.velocityX *= this.friction;
      this.velocityY *= this.friction;

      this.clampCamera(this.camera);
      moved = true;
    }

    // Smooth lerp to programmatic targets (e.g. avatar pan-to)
    if (!this.camera.isPanning) {
      const lerpSpeed = Math.min(1, 0.12 * (deltaTime / 16.66));
      const dist = Math.hypot(this.camera.targetX - this.camera.x, this.camera.targetY - this.camera.y);
      if (dist > 0.5) {
        this.camera.x = lerp(this.camera.x, this.camera.targetX, lerpSpeed);
        this.camera.y = lerp(this.camera.y, this.camera.targetY, lerpSpeed);
        moved = true;
      }
      const zoomDiff = Math.abs(this.camera.targetZoom - this.camera.zoom);
      if (zoomDiff > 0.005) {
        this.camera.zoom = lerp(this.camera.zoom, this.camera.targetZoom, lerpSpeed);
        moved = true;
      }
    }

    if (moved) {
      this.callbacks.onCameraChange?.(this.camera);
    }
  }
}
