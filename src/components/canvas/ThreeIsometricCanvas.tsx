import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Character } from '../../types/character';
import { InteractiveHit } from '../../types/threeEngine';
import { TimeOfDay, WeatherType } from '../ui/TopBar';
import { TouchControls3D } from '../../engine/three/TouchControls3D';
import { DioramaBuilder, InteractivePropRef } from '../../engine/three/DioramaBuilder';
import { CharacterMeshBuilder, CharacterMeshHandle } from '../../engine/three/CharacterMeshBuilder';
import { LightingManager } from '../../engine/three/LightingManager';

interface ThreeIsometricCanvasProps {
  characters: Character[];
  selectedCharId: string | null;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  onSelectCharacter: (char: Character) => void;
  onInteractProp: (propType: string, position: THREE.Vector3) => void;
  onCameraUpdate?: (screenPositions: Map<string, { x: number; y: number }>) => void;
  onInitControls?: (controls: TouchControls3D) => void;
}

export const ThreeIsometricCanvas: React.FC<ThreeIsometricCanvasProps> = ({
  characters,
  selectedCharId,
  timeOfDay,
  weather,
  onSelectCharacter,
  onInteractProp,
  onCameraUpdate,
  onInitControls,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<TouchControls3D | null>(null);
  const lightingRef = useRef<LightingManager | null>(null);
  const characterHandlesRef = useRef<Map<string, CharacterMeshHandle>>(new Map());
  const interactivePropsRef = useRef<InteractivePropRef[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const boatGroupRef = useRef<THREE.Group | null>(null);

  const charactersRef = useRef(characters);
  charactersRef.current = characters;

  const selectedCharIdRef = useRef(selectedCharId);
  selectedCharIdRef.current = selectedCharId;

  const onSelectCharacterRef = useRef(onSelectCharacter);
  onSelectCharacterRef.current = onSelectCharacter;

  const onInteractPropRef = useRef(onInteractProp);
  onInteractPropRef.current = onInteractProp;

  const onCameraUpdateRef = useRef(onCameraUpdate);
  onCameraUpdateRef.current = onCameraUpdate;

  // React to TimeOfDay changes
  useEffect(() => {
    lightingRef.current?.setTimeOfDay(timeOfDay);
  }, [timeOfDay]);

  // React to Weather changes
  useEffect(() => {
    // Weather effects handled in scene
  }, [weather]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();

    // 32-degree low-FOV perspective camera gives the ideal tactical DOS2 isometric view
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    // 2. Build 3-Tiered Village Diorama
    const { interactiveProps, waterMesh, boatGroup } = DioramaBuilder.buildDiorama(scene);
    interactivePropsRef.current = interactiveProps;
    waterMeshRef.current = waterMesh;
    boatGroupRef.current = boatGroup;

    // 3. Build Character 3D Avatars (Thi & Thanh Phương)
    const handles = new Map<string, CharacterMeshHandle>();
    charactersRef.current.forEach((char) => {
      const handle = CharacterMeshBuilder.buildCharacter(char, scene);
      handles.set(char.id, handle);
    });
    characterHandlesRef.current = handles;

    // 4. Lighting & Day/Night Manager
    const lighting = new LightingManager(scene);
    lightingRef.current = lighting;

    // 5. Setup Touch & Mouse Controls
    const controls = new TouchControls3D(
      camera,
      renderer.domElement,
      {
        onTap: (hit: InteractiveHit | null) => {
          if (!hit) return;

          if (hit.type === 'character') {
            const char = charactersRef.current.find((c) => c.id === hit.id);
            if (char) {
              onSelectCharacterRef.current(char);
            }
          } else {
            // Interactive Prop tapped!
            onInteractPropRef.current(hit.type, hit.point);
          }
        },
        onCameraChange: () => {
          // Update screen projections for 2D speech bubbles
          updateScreenProjections(camera);
        },
      }
    );
    controlsRef.current = controls;
    onInitControls?.(controls);

    // Gather all clickable 3D meshes for raycaster
    const clickables: THREE.Object3D[] = [];
    handles.forEach((h) => clickables.push(h.group));
    interactiveProps.forEach((p) => clickables.push(p.mesh));
    controls.setInteractiveObjects(clickables);

    // Event listeners
    const onDown = controls.handlePointerDown.bind(controls);
    const onMove = controls.handlePointerMove.bind(controls);
    const onUp = controls.handlePointerUp.bind(controls);
    const onWheel = controls.handleWheel.bind(controls);

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
      updateScreenProjections(camera);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Project 3D character heads to 2D screen pixels for speech bubbles
    const updateScreenProjections = (cam: THREE.Camera) => {
      const positions = new Map<string, { x: number; y: number }>();
      handles.forEach((handle, id) => {
        const headWorld = handle.getHeadWorldPosition();
        headWorld.project(cam);

        // Convert normalized device coords to CSS pixels
        const sx = (headWorld.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-(headWorld.y * 0.5) + 0.5) * window.innerHeight;

        positions.set(id, { x: sx, y: sy });
      });

      onCameraUpdateRef.current?.(positions);
    };

    // 6. Adaptive Animation Loop
    let rafId = 0;
    let lastRenderTime = performance.now();

    const animate = (currentTime: number) => {
      rafId = requestAnimationFrame(animate);

      // 60 FPS active vs 30 FPS idle throttling
      const minInterval = controls.isPanning ? 14 : 28;
      if (currentTime - lastRenderTime < minInterval) return;
      lastRenderTime = currentTime;

      // Update camera physics
      controls.tick();

      // Update lighting flicker
      lighting.update(currentTime);

      // Animate gentle water wave & boat bobbing
      if (boatGroupRef.current) {
        boatGroupRef.current.position.y = -0.15 + Math.sin(currentTime * 0.002) * 0.05;
        boatGroupRef.current.rotation.z = Math.sin(currentTime * 0.0018) * 0.03;
      }

      // Update character models (breathing bob & hop progress)
      handles.forEach((handle) => {
        const charData = charactersRef.current.find((c) => c.id === handle.id);
        const isSelected = handle.id === selectedCharIdRef.current;
        const hop = charData?.hopProgress || 0;
        handle.update(currentTime, isSelected, hop);
      });

      // Render 3D Scene
      renderer.render(scene, camera);

      // Keep screen projections updated during movements
      updateScreenProjections(camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full touch-none select-none overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};
