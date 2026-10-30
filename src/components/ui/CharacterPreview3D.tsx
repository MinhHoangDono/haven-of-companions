import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Character } from '../../types/character';
import { CharacterMeshBuilder } from '../../engine/three/CharacterMeshBuilder';
import { inventoryManager } from '../../engine/inventory/InventoryManager';
import { RotateCcw } from 'lucide-react';

interface CharacterPreview3DProps {
  character: Character;
  className?: string;
}

export const CharacterPreview3D: React.FC<CharacterPreview3DProps> = ({ character, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c111c);

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 520;
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(aspect < 1 ? 42 : 36, aspect, 0.1, 20);
    camera.position.set(0, 1.05, aspect < 1 ? 3.3 : 3.0);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x70a1ff, 1.2);
    rimLight.position.set(-2, 3, -2);
    scene.add(rimLight);

    // 3. Mount Character Model & Pedestal
    const rotGroup = new THREE.Group();
    scene.add(rotGroup);

    // Glowing Circular Pedestal on floor
    const pedestalGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1f2b3e,
      roughness: 0.5,
      metalness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.04;
    rotGroup.add(pedestal);

    // Pedestal Glowing Rim Ring
    const rimRingGeo = new THREE.RingGeometry(0.68, 0.74, 32);
    const rimRingMat = new THREE.MeshBasicMaterial({
      color: character.color.accent,
      side: THREE.DoubleSide,
    });
    const rimRing = new THREE.Mesh(rimRingGeo, rimRingMat);
    rimRing.rotation.x = -Math.PI / 2;
    rimRing.position.y = 0.085;
    const charMeshGroup = new THREE.Group();
    rotGroup.add(charMeshGroup);
    const previewHandle = CharacterMeshBuilder.buildClassModel(character.id, charMeshGroup);

    // Auto-refresh 3D equipment when user customizes gear
    const unsub = inventoryManager.subscribe(() => {
      previewHandle.refreshEquipment?.();
    });
    let isDragging = false;
    let prevX = 0;
    let velocityY = 0;
    let autoRotate = true;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX;
      velocityY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      rotGroup.rotation.y += dx * 0.018;
      velocityY = dx * 0.018;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 5. Render Loop with gentle idle bob & rotation
    let rafId = 0;
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      rafId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastFrameTime) * 0.001, 0.1);
      lastFrameTime = currentTime;
      previewHandle.update(dt);

      // Rotation inertia & auto-rotation
      if (isDragging) {
        // user rotating
      } else {
        if (Math.abs(velocityY) > 0.0005) {
          rotGroup.rotation.y += velocityY;
          velocityY *= 0.92;
        } else if (autoRotate) {
          rotGroup.rotation.y += 0.006; // Slow turntable rotate
        }
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    const updateSize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 450;
      const a = w / h;
      camera.aspect = a;
      camera.fov = a < 1 ? 42 : 36;
      camera.position.set(0, 1.05, a < 1 ? 3.3 : 3.0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);
    return () => {
      unsub();
      cancelAnimationFrame(rafId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [character]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 border border-paper-800/80 shadow-2xl group select-none ${className || 'h-64'}`}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={containerRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" />

      {/* Swipe hint chip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1 rounded-full bg-ink-950/85 border border-paper-800/80 text-[11px] font-sans text-paper-200/80 flex items-center gap-1.5 backdrop-blur-md shadow-lg whitespace-nowrap">
        <RotateCcw className="w-3.5 h-3.5 text-fantasy-gold animate-spin-slow" />
        <span>Vuốt chuột/tay để xoay 360°</span>
      </div>
    </div>
  );
};
