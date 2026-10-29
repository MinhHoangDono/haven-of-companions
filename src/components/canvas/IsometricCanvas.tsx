import React, { useEffect, useRef, useCallback } from 'react';
import { CameraState, ScreenCoord, Viewport } from '../../types/engine';
import { TouchController } from '../../engine/touchController';

interface IsometricCanvasProps {
  onTap?: (screenPos: ScreenCoord) => void;
  onCameraChange?: (camera: CameraState) => void;
  onInitController?: (controller: TouchController) => void;
  renderFrame: (
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    viewport: Viewport,
    time: number,
    deltaTime: number
  ) => void;
  className?: string;
}

export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({
  onTap,
  onCameraChange,
  onInitController,
  renderFrame,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<TouchController | null>(null);
  const rafIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const lastRenderTimeRef = useRef<number>(performance.now());
  const lastInteractionTimeRef = useRef<number>(performance.now());
  const viewportRef = useRef<Viewport>({ width: window.innerWidth, height: window.innerHeight, dpr: 1 });

  // Store latest callbacks in refs to prevent re-instantiating the TouchController
  const renderFrameRef = useRef(renderFrame);
  renderFrameRef.current = renderFrame;

  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  const onCameraChangeRef = useRef(onCameraChange);
  onCameraChangeRef.current = onCameraChange;

  const onInitControllerRef = useRef(onInitController);
  onInitControllerRef.current = onInitController;

  // Handle resizing and High-DPI setup
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.25);

    viewportRef.current = { width, height, dpr };

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    controllerRef.current?.updateViewport(viewportRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    updateCanvasSize();

    // Controller created once and preserved across React state renders
    const controller = new TouchController(
      viewportRef.current,
      {
        onTap: (pos) => onTapRef.current?.(pos),
        onCameraChange: (cam) => onCameraChangeRef.current?.(cam),
      },
      {
        x: viewportRef.current.width / 2,
        y: viewportRef.current.height * 0.35,
        zoom: 1.0,
      }
    );
    controllerRef.current = controller;
    onInitControllerRef.current?.(controller);

    const handlePointerDown = (e: PointerEvent) => {
      lastInteractionTimeRef.current = performance.now();
      canvas.setPointerCapture(e.pointerId);
      controller.handlePointerDown(e, canvas.getBoundingClientRect());
    };

    const handlePointerMove = (e: PointerEvent) => {
      lastInteractionTimeRef.current = performance.now();
      controller.handlePointerMove(e, canvas.getBoundingClientRect());
    };

    const handlePointerUp = (e: PointerEvent) => {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      controller.handlePointerUp(e, canvas.getBoundingClientRect());
    };

    const handleWheel = (e: WheelEvent) => {
      lastInteractionTimeRef.current = performance.now();
      controller.handleWheel(e);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);

    // Adaptive 60 FPS / 30 FPS RAF loop
    const loop = (currentTime: number) => {
      rafIdRef.current = requestAnimationFrame(loop);

      const isInteracting = currentTime - lastInteractionTimeRef.current < 3500;
      const minFrameInterval = isInteracting ? 14 : 31; // 60 FPS active vs 30 FPS idle

      if (currentTime - lastRenderTimeRef.current < minFrameInterval) {
        return;
      }

      const dt = Math.min(64, currentTime - lastTimeRef.current);
      lastTimeRef.current = currentTime;
      lastRenderTimeRef.current = currentTime;

      controller.tick(dt);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.scale(viewportRef.current.dpr, viewportRef.current.dpr);
        ctx.clearRect(0, 0, viewportRef.current.width, viewportRef.current.height);

        renderFrameRef.current(ctx, controller.getCamera(), viewportRef.current, currentTime, dt);

        ctx.restore();
      }
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full touch-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
