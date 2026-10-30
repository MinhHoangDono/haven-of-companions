import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Character, CharacterSignatureAbility } from '../../types/character';
import { InteractiveHit } from '../../types/threeEngine';
import { TimeOfDay, WeatherType } from '../ui/TopBar';
import { TouchControls3D } from '../../engine/three/TouchControls3D';
import { DioramaBuilder, InteractivePropRef } from '../../engine/three/DioramaBuilder';
import { CharacterMeshBuilder, CharacterMeshHandle } from '../../engine/three/CharacterMeshBuilder';
import { LightingManager } from '../../engine/three/LightingManager';
import { SpellEffect3D } from '../../engine/three/SpellEffect3D';
import { passabilityGrid } from '../../engine/map/passabilityMap';
import { CollectibleMeshBuilder } from '../../engine/three/CollectibleMeshBuilder';
import { DynamicPlatformManager } from '../../engine/three/DynamicPlatformManager';
import { CollectibleItem } from '../../types/platformer';
import { audioManager } from '../../audio/audioManager';
import { inventoryManager } from '../../engine/inventory/InventoryManager';
import { CityBuilderController } from '../../engine/three/builder/CityBuilderController';
import { CitySaveManager } from '../../engine/three/builder/CitySaveManager';
import { BuilderTool, PlacedStructure } from '../../types/cityBuilder';


interface ThreeIsometricCanvasProps {
  characters: Character[];
  selectedCharId: string | null;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  isInspectorActive?: boolean;
  onSelectCharacter: (char: Character) => void;
  onInteractProp: (propType: string, position: THREE.Vector3) => void;
  onCameraUpdate?: (screenPositions: Map<string, { x: number; y: number }>) => void;
  onInitControls?: (controls: TouchControls3D) => void;
  onInitSpellCaster?: (castFn: (effectType: CharacterSignatureAbility['effectType'], charId: string) => void) => void;
  onInspectHit?: (hit: InteractiveHit | null) => void;
  onInitJumper?: (jumpFn: () => void) => void;
  onCollectItem?: (item: CollectibleItem) => void;
  onPlatformToast?: (msg: string) => void;
  isBuildMode?: boolean;
  activeTool?: BuilderTool;
  activeStructureId?: string;
  onInitBuilder?: (builder: CityBuilderController) => void;
  onBuilderStructuresChange?: (structures: PlacedStructure[]) => void;
}

export const ThreeIsometricCanvas: React.FC<ThreeIsometricCanvasProps> = ({
  characters,
  selectedCharId,
  timeOfDay,
  weather,
  isInspectorActive,
  onSelectCharacter,
  onInteractProp,
  onCameraUpdate,
  onInitControls,
  onInitSpellCaster,
  onInspectHit,
  onInitJumper,
  onCollectItem,
  onPlatformToast,
  isBuildMode = false,
  activeTool = 'place',
  activeStructureId = 'cottage_small',
  onInitBuilder,
  onBuilderStructuresChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<TouchControls3D | null>(null);
  const builderControllerRef = useRef<CityBuilderController | null>(null);
  const isBuildModeRef = useRef(isBuildMode);
  isBuildModeRef.current = isBuildMode;
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;
  const activeStructureIdRef = useRef(activeStructureId);
  activeStructureIdRef.current = activeStructureId;
  const onBuilderStructuresChangeRef = useRef(onBuilderStructuresChange);
  onBuilderStructuresChangeRef.current = onBuilderStructuresChange;

  useEffect(() => {
    if (builderControllerRef.current) {
      builderControllerRef.current.setBuildMode(!!isBuildMode);
      controlsRef.current?.setBuilderMode(!!isBuildMode);
    }
  }, [isBuildMode]);

  useEffect(() => {
    if (builderControllerRef.current && activeTool) {
      builderControllerRef.current.setTool(activeTool);
    }
  }, [activeTool]);

  useEffect(() => {
    if (builderControllerRef.current && activeStructureId) {
      builderControllerRef.current.setActiveStructure(activeStructureId);
    }
  }, [activeStructureId]);
  const lightingRef = useRef<LightingManager | null>(null);

  const characterHandlesRef = useRef<Map<string, CharacterMeshHandle>>(new Map());
  const interactivePropsRef = useRef<InteractivePropRef[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const boatGroupRef = useRef<THREE.Group | null>(null);
  const largeShipRef = useRef<THREE.Group | null>(null);
  const lighthouseLightRef = useRef<THREE.PointLight | null>(null);
  const spellEffectsRef = useRef<SpellEffect3D | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
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

  const isInspectorActiveRef = useRef(isInspectorActive);
  isInspectorActiveRef.current = isInspectorActive;

  const onInspectHitRef = useRef(onInspectHit);
  onInspectHitRef.current = onInspectHit;

  const onCollectItemRef = useRef(onCollectItem);
  onCollectItemRef.current = onCollectItem;

  const onPlatformToastRef = useRef(onPlatformToast);
  onPlatformToastRef.current = onPlatformToast;
  // React to TimeOfDay changes
  useEffect(() => {
    lightingRef.current?.setTimeOfDay(timeOfDay);
  }, [timeOfDay]);

  // React to Weather changes
  useEffect(() => {
    // Weather effects handled in scene
  }, [weather]);

  // React to Inspector Mode toggle
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = !!isInspectorActive;
    }
    if (!isInspectorActive && boxHelperRef.current && sceneRef.current) {
      sceneRef.current.remove(boxHelperRef.current);
      boxHelperRef.current = null;
    }
  }, [isInspectorActive]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
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

    // 2. Build 3-Tiered Village Diorama with Coastal Expansion
    const {
      interactiveProps,
      waterMesh,
      boatGroup,
      largeShipGroup,
      lighthouseBeaconLight,
      fireMesh,
      waterMat,
      grassManager,
    } = DioramaBuilder.buildDiorama(scene);

    interactivePropsRef.current = interactiveProps;
    waterMeshRef.current = waterMesh;
    boatGroupRef.current = boatGroup;
    largeShipRef.current = largeShipGroup;
    lighthouseLightRef.current = lighthouseBeaconLight;
    // 3. Build Character 3D Avatars (Thi & Thanh Phương)
    const handles = new Map<string, CharacterMeshHandle>();
    charactersRef.current.forEach((char) => {
      const handle = CharacterMeshBuilder.buildCharacter(char, scene);
      handles.set(char.id, handle);
    });
    characterHandlesRef.current = handles;

    // 3b. Auto-sync equipment changes across all in-world character avatars
    const unsubInventory = inventoryManager.subscribe(() => {
      characterHandlesRef.current.forEach((h) => {
        h.refreshEquipment?.();
      });
    });
    // 4. Lighting & Day/Night Manager
    const lighting = new LightingManager(scene);
    lightingRef.current = lighting;


    // 4b. 3D Spell Particle Effect Manager
    const spellEffects = new SpellEffect3D(scene);
    spellEffectsRef.current = spellEffects;

    // 4c. 3D Collectibles & Dynamic Platforms (Falling Pier Planks & High-Jump Vents)
    const collectibles = CollectibleMeshBuilder.getInitialCollectibles(scene);
    const dynamicPlatforms = new DynamicPlatformManager(scene);

    // Waypoint Destination Marker Ring
    const waypointGeo = new THREE.RingGeometry(0.28, 0.44, 24);
    const waypointMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const waypointMesh = new THREE.Mesh(waypointGeo, waypointMat);
    waypointMesh.rotation.x = -Math.PI / 2;
    waypointMesh.position.y = 0.05;
    scene.add(waypointMesh);
    let waypointTimer = 0;

    // 3D Grid Helper for Inspector Mode
    const gridHelper = new THREE.GridHelper(32, 32, 0xdfa642, 0x555555);
    gridHelper.position.y = 0.05;
    gridHelper.visible = !!isInspectorActive;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;
    onInitSpellCaster?.((effectType, charId) => {
      const handle = handles.get(charId);
      const origin = handle ? handle.group.position.clone() : new THREE.Vector3(0, 0.8, 0);
      spellEffects.castSpell(effectType, origin);
    });
    onInitJumper?.(() => {
      const activeId = selectedCharIdRef.current || charactersRef.current[0]?.id;
      if (activeId) {
        handles.get(activeId)?.jump?.();
      }
    });
    // 4c. Setup City Builder Controller & LocalStorage Auto-Load
    let lastPointerX = 0;
    let lastPointerY = 0;

    const builderController = new CityBuilderController(
      scene,
      camera,
      renderer.domElement,
      {
        onStructuresChange: (structures) => {
          CitySaveManager.saveToLocalStorage(structures);
          onBuilderStructuresChangeRef.current?.(structures);
        },
        onNotice: (msg) => {
          onPlatformToastRef.current?.(msg);
        },
      }
    );
    builderControllerRef.current = builderController;
    builderController.setBuildMode(!!isBuildModeRef.current);
    builderController.setTool(activeToolRef.current);
    builderController.setActiveStructure(activeStructureIdRef.current);
    onInitBuilder?.(builderController);

    // Reconstitute saved player structures from localStorage
    const savedStructures = CitySaveManager.loadFromLocalStorage();
    if (savedStructures.length > 0) {
      builderController.reconstituteStructures(savedStructures);
    }

    // 5. Setup Touch & Mouse Controls
    const controls = new TouchControls3D(
      camera,
      renderer.domElement,
      {
        onTap: (hit: InteractiveHit | null) => {
          if (isBuildModeRef.current) {
            if (activeToolRef.current === 'demolish') {
              builderController.demolishAtPointer(lastPointerX, lastPointerY);
            } else if (activeToolRef.current === 'rotate') {
              builderController.rotateCurrentStructure();
            } else {
              builderController.placeStructure();
            }
            return;
          }

          if (isInspectorActiveRef.current) {
            onInspectHitRef.current?.(hit);
            if (hit && sceneRef.current) {
              const clickedObj = sceneRef.current.getObjectByProperty('uuid', hit.id) || handles.get(hit.id)?.group;
              if (clickedObj) {
                if (boxHelperRef.current) sceneRef.current.remove(boxHelperRef.current);
                const newBox = new THREE.BoxHelper(clickedObj as THREE.Object3D, 0xdfa642);
                sceneRef.current.add(newBox);
                boxHelperRef.current = newBox;
              }
            }
            return;
          }

          if (!hit) return;

          if (hit.type === 'character') {
            const char = charactersRef.current.find((c) => c.id === hit.id);
            if (char) {
              onSelectCharacterRef.current(char);
            }
          } else if (hit.type === 'ground') {
            // Tap-to-Move for active selected character with water blocking!
            if (selectedCharIdRef.current) {
              const activeHandle = handles.get(selectedCharIdRef.current);
              if (activeHandle) {
                const validTarget = passabilityGrid.clampToWalkable(hit.point.x, hit.point.z);
                activeHandle.moveTo(validTarget.x, validTarget.z);

                // Position and trigger pulsing golden waypoint ring
                waypointMesh.position.set(validTarget.x, validTarget.y + 0.04, validTarget.z);
                waypointMat.opacity = 0.95;
                waypointMesh.scale.setScalar(1.2);
                waypointTimer = 1.0;
              }
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
    const onDown = (e: PointerEvent) => {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      controls.handlePointerDown(e);
    };
    const onMove = (e: PointerEvent) => {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      if (isBuildModeRef.current) {
        builderController.onPointerMove(e.clientX, e.clientY);
      }
      controls.handlePointerMove(e);
    };
    const onUp = (e: PointerEvent) => {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      controls.handlePointerUp(e);
    };
    const onWheel = controls.handleWheel.bind(controls);
    const onLeave = () => {
      if (isBuildModeRef.current) {
        builderController.hideGhost();
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointerleave', onLeave);
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

    const keysPressed: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      keysPressed[e.code] = true;
      if (isBuildModeRef.current) {
        if (e.code === 'KeyR' || e.code === 'Space') {
          e.preventDefault();
          builderController.rotateCurrentStructure();
          return;
        }
        if (e.code === 'KeyQ') {
          controls.rotateBy(-Math.PI / 4);
          return;
        }
        if (e.code === 'KeyE') {
          controls.rotateBy(Math.PI / 4);
          return;
        }
        if (e.code === 'KeyF') {
          controls.centerOnPlaza();
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        const activeId = selectedCharIdRef.current || charactersRef.current[0]?.id;
        if (activeId) {
          const handle = handles.get(activeId);
          handle?.jump?.();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

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

      // 30 FPS frame throttling (approx 33.3ms)
      const minInterval = 33.3;
      if (currentTime - lastRenderTime < minInterval) return;
      lastRenderTime = currentTime;

      // Update camera physics
      controls.tick();

      // Update 3D spells
      spellEffects.update(minInterval / 1000);

      // Update lighting flicker
      lighting.update(currentTime);
      // Update cartoon fire shader and ember particles
      fireMesh.update(currentTime, minInterval / 1000);

      // Update Godot Toon Water & Grass Shaders
      const tSec = currentTime * 0.001;
      waterMat.update(tSec);
      grassManager.update(tSec);
      // Animate Large Galleon ship oceanic roll
      if (largeShipRef.current) {
        largeShipRef.current.position.y = -0.15 + Math.sin(currentTime * 0.0014) * 0.06;
        largeShipRef.current.rotation.z = -0.15 + Math.sin(currentTime * 0.0011) * 0.04;
        largeShipRef.current.rotation.x = Math.cos(currentTime * 0.0013) * 0.025;
      }
      if (boatGroupRef.current) {
        boatGroupRef.current.position.y = -0.15 + Math.sin(currentTime * 0.002) * 0.05;
        boatGroupRef.current.rotation.z = Math.sin(currentTime * 0.0018) * 0.03;
      }
      // Animate Lighthouse rotating beacon beam
      if (lighthouseLightRef.current) {
        const bAngle = currentTime * 0.0025;
         lighthouseLightRef.current.position.x = 24.0 + Math.cos(bAngle) * 1.8;
         lighthouseLightRef.current.position.z = 20.0 + Math.sin(bAngle) * 1.8;
      }
      // Animate waypoint destination marker
      if (waypointTimer > 0) {
        waypointTimer -= minInterval / 1000;
        waypointMat.opacity = Math.max(0, waypointTimer * 0.95);
        waypointMesh.scale.setScalar(1.0 + waypointTimer * 0.25);
      }

      // Update character models (walking, idle wandering, breathing, hop progress)
      const dt = minInterval / 1000;

      // Process keyboard movement for active character
      const activeId = selectedCharIdRef.current || charactersRef.current[0]?.id;
      const activeHandle = activeId ? handles.get(activeId) : null;

      if (activeHandle) {
        let dirX = 0;
        let dirZ = 0;

        // Camera forward and right vectors projected onto ground plane (XZ)
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0;
        camDir.normalize();

        const camRight = new THREE.Vector3();
        camRight.crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

        if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
          dirX += camDir.x;
          dirZ += camDir.z;
        }
        if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
          dirX -= camDir.x;
          dirZ -= camDir.z;
        }
        if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
          dirX += camRight.x;
          dirZ += camRight.z;
        }
        if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
          dirX -= camRight.x;
          dirZ -= camRight.z;
        }

        if (Math.abs(dirX) > 0.001 || Math.abs(dirZ) > 0.001) {
          activeHandle.moveByDirection?.(dirX, dirZ, dt);
          controls.followTarget(activeHandle.group.position.x, activeHandle.group.position.z, 0.06);
        }
      }

      // Update 3D Collectibles (Bobbing, Rotating & Magnetic Proximity Pickup)
      collectibles.forEach((item) => {
        if (item.collected) {
          item.respawnTimer -= dt;
          if (item.respawnTimer <= 0) {
            item.collected = false;
            if (item.mesh) {
              item.mesh.visible = true;
              item.mesh.position.copy(item.spawnPosition);
            }
          }
          return;
        }

        if (!item.mesh) return;

        const floatGroup = item.mesh.getObjectByName('floatingItem');
        if (floatGroup) {
          floatGroup.rotation.y += dt * 2.2;
          floatGroup.position.y = 0.38 + Math.sin(currentTime * 0.003 + item.position.x * 2.0) * 0.08;
        }

        if (activeHandle) {
          const cPos = activeHandle.group.position;
          const dist = Math.hypot(cPos.x - item.position.x, cPos.z - item.position.z);
          if (dist < 1.35 && Math.abs(cPos.y - item.position.y) < 1.2) {
            item.collected = true;
            item.respawnTimer = 25.0; // Respawns after 25s
            if (item.mesh) item.mesh.visible = false;
            audioManager.playPickup(item.type);
            onCollectItemRef.current?.(item);
          }
        }
      });

      // Update Dynamic Platforms (Falling Plank & Highland High-Jump Wind Vent)
      if (activeHandle) {
        dynamicPlatforms.update(
          dt,
          currentTime,
          activeHandle.group.position,
          (boostVelocity) => {
            activeHandle.launchJump?.(boostVelocity);
          },
          (msg) => {
            onPlatformToastRef.current?.(msg);
          }
        );
      }
      handles.forEach((handle) => {
        const charData = charactersRef.current.find((c) => c.id === handle.id);
        const isSelected = handle.id === selectedCharIdRef.current;
        const hop = charData?.hopProgress || 0;
        handle.update(dt, currentTime, isSelected, hop);
      });

      // Render 3D Scene
      renderer.render(scene, camera);

      // Keep screen projections updated during movements
      updateScreenProjections(camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      unsubInventory();
      cancelAnimationFrame(rafId);
      dynamicPlatforms.dispose(scene);
      fireMesh.dispose();
      grassManager.dispose(scene);
      scene.remove(spellEffects.batchRenderer);
      collectibles.forEach((c) => c.mesh && scene.remove(c.mesh));
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.removeEventListener('pointerleave', onLeave);
      dom.removeEventListener('wheel', onWheel);
      builderController.destroy();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
