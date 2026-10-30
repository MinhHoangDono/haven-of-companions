import * as THREE from 'three';
import { DynamicMeshLibrary } from './DynamicMeshLibrary';
import { VoxelTerrainBuilder } from '../VoxelTerrainBuilder';
import { passabilityGrid } from '../../map/passabilityMap';
import { audioManager } from '../../../audio/audioManager';
import { BuilderTool, PlacedStructure, StructureDefinition } from '../../../types/cityBuilder';

export interface CityBuilderCallbacks {
  onStructuresChange?: (structures: PlacedStructure[]) => void;
  onStructureSelect?: (def: StructureDefinition) => void;
  onNotice?: (message: string) => void;
}

export class CityBuilderController {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private callbacks: CityBuilderCallbacks;

  public userStructuresGroup: THREE.Group;
  private ghostContainer: THREE.Group;
  private ghostGroup: THREE.Group | null = null;
  private currentGhostId: string | null = null;
  private hasPointerIntersection: boolean = false;
  public activeTool: BuilderTool = 'place';
  public activeStructureId: string = 'cottage_small';
  public currentRotation: number = 0; // 0, PI/2, PI, 1.5*PI
  public isBuildMode: boolean = false;

  private raycaster = new THREE.Raycaster();
  private pointerPos = new THREE.Vector2();
  private roughGroundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5);

  private currentGridX: number = 0;
  private currentGridZ: number = 0;
  private currentElevationY: number = 1.0;
  private isCurrentPlacementValid: boolean = false;

  // Key: instanceId -> { instance: THREE.Group, data: PlacedStructure }
  private placedMap = new Map<string, { instance: THREE.Group; data: PlacedStructure }>();

  // Throttling for 30+ FPS mobile performance
  private lastRaycastTime: number = 0;
  private readonly raycastIntervalMs: number = 33; // 30 Hz

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    callbacks: CityBuilderCallbacks = {}
  ) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    this.userStructuresGroup = new THREE.Group();
    this.userStructuresGroup.name = 'userStructuresGroup';
    this.scene.add(this.userStructuresGroup);

    this.ghostContainer = new THREE.Group();
    this.ghostContainer.name = 'cityBuilderGhostContainer';
    this.ghostContainer.visible = false;
    this.scene.add(this.ghostContainer);
  }

  public setBuildMode(enabled: boolean): void {
    this.isBuildMode = enabled;
    if (!enabled) {
      this.clearGhost();
      this.hasPointerIntersection = false;
    } else {
      this.updateGhostMesh();
    }
  }

  public setTool(tool: BuilderTool): void {
    this.activeTool = tool;
    if (tool !== 'place') {
      this.hideGhost();
    } else {
      this.updateGhostMesh();
    }
  }

  public setActiveStructure(structureId: string): void {
    this.activeStructureId = structureId;
    this.currentRotation = 0;
    const def = DynamicMeshLibrary.getDefinition(structureId);
    if (def) {
      this.callbacks.onStructureSelect?.(def);
    }
    if (this.isBuildMode && this.activeTool === 'place') {
      this.updateGhostMesh();
    }
  }

  public rotateCurrentStructure(): void {
    this.currentRotation = (this.currentRotation + Math.PI / 2) % (Math.PI * 2);
    if (this.ghostGroup) {
      this.ghostGroup.rotation.y = this.currentRotation;
    }
    if (this.hasPointerIntersection) {
      this.validateCurrentGridPosition();
    }
  }

  private clearGhost(): void {
    this.ghostContainer.visible = false;
    while (this.ghostContainer.children.length > 0) {
      const child = this.ghostContainer.children[0];
      this.ghostContainer.remove(child);
      child.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const mesh = c as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    }
    this.ghostGroup = null;
    this.currentGhostId = null;
  }

  private async updateGhostMesh(): Promise<void> {
    if (!this.isBuildMode || this.activeTool !== 'place' || !this.activeStructureId) {
      this.clearGhost();
      return;
    }

    if (this.ghostGroup && this.currentGhostId === this.activeStructureId) {
      this.ghostContainer.visible = this.hasPointerIntersection;
      return;
    }

    const targetStructureId = this.activeStructureId;
    this.clearGhost();

    try {
      const ghost = await DynamicMeshLibrary.createGhostMesh(targetStructureId);
      if (!this.isBuildMode || this.activeTool !== 'place' || this.activeStructureId !== targetStructureId) {
        return;
      }

      this.ghostGroup = ghost;
      this.currentGhostId = targetStructureId;
      this.ghostGroup.rotation.y = this.currentRotation;
      this.ghostContainer.add(this.ghostGroup);

      if (this.hasPointerIntersection) {
        const def = DynamicMeshLibrary.getDefinition(targetStructureId);
        const yOffset = def?.baseElevationOffset || 0;
        this.ghostContainer.position.set(this.currentGridX, this.currentElevationY + yOffset, this.currentGridZ);
        this.ghostContainer.visible = true;
        this.validateCurrentGridPosition();
      } else {
        this.ghostContainer.visible = false;
      }
    } catch (e) {
      console.warn('Failed to generate ghost mesh for:', targetStructureId, e);
    }
  }

  public hideGhost(): void {
    this.hasPointerIntersection = false;
    this.ghostContainer.visible = false;
  }

  /**
   * Handles pointer move event for raycasting onto terrain voxels
   */
  public onPointerMove(clientX: number, clientY: number): void {
    if (!this.isBuildMode) return;

    const now = performance.now();
    if (now - this.lastRaycastTime < this.raycastIntervalMs) return;
    this.lastRaycastTime = now;

    const rect = this.domElement.getBoundingClientRect();
    this.pointerPos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerPos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerPos, this.camera);
    const hitPoint = new THREE.Vector3();

    if (this.raycaster.ray.intersectPlane(this.roughGroundPlane, hitPoint)) {
      // Snap to integer coordinates
      const gx = Math.round(hitPoint.x);
      const gz = Math.round(hitPoint.z);

      // Re-project on exact voxel elevation
      const trueY = passabilityGrid.getElevationAt(gx, gz);
      this.currentGridX = gx;
      this.currentGridZ = gz;
      this.currentElevationY = trueY;
      this.hasPointerIntersection = true;

      if (this.ghostGroup && this.activeTool === 'place') {
        const def = DynamicMeshLibrary.getDefinition(this.activeStructureId);
        const yOffset = def?.baseElevationOffset || 0;
        this.ghostContainer.position.set(gx, trueY + yOffset, gz);
        this.ghostContainer.visible = true;
        this.validateCurrentGridPosition();
      }
    } else {
      this.hasPointerIntersection = false;
      this.ghostContainer.visible = false;
    }
  }

  /**
   * Validates whether current grid position is suitable for structure placement
   */
  private validateCurrentGridPosition(): boolean {
    const def = DynamicMeshLibrary.getDefinition(this.activeStructureId);
    if (!def) {
      this.isCurrentPlacementValid = false;
      return false;
    }

    const gx = this.currentGridX;
    const gz = this.currentGridZ;

    // 1. Boundary limits within diorama footprint
    if (gx < -32 || gx > 32 || gz < -32 || gz > 32) {
      this.setValidityState(false);
      return false;
    }

    // 2. Water and deep ocean check (strictly Y >= 0.5 for dry construction land)
    const blockType = VoxelTerrainBuilder.getBlockType(gx, gz);
    const topY = VoxelTerrainBuilder.getTopElevation(gx, gz);

    if (blockType === 'WATER' || topY <= 0) {
      this.setValidityState(false);
      return false;
    }

    // 3. Multi-tile footprint clearance check
    const halfW = Math.floor(def.footprintWidth / 2);
    const halfD = Math.floor(def.footprintDepth / 2);

    for (let dx = -halfW; dx <= halfW; dx++) {
      for (let dz = -halfD; dz <= halfD; dz++) {
        const checkX = gx + dx;
        const checkZ = gz + dz;
        const tileElev = VoxelTerrainBuilder.getTopElevation(checkX, checkZ);

        // Uneven slope difference > 1.2m prevents placing massive buildings on vertical cliffs
        if (Math.abs(tileElev - topY) > 1.2 || tileElev <= 0) {
          this.setValidityState(false);
          return false;
        }

        // Check if overlapping an already placed user structure
        for (const item of this.placedMap.values()) {
          const itemDef = DynamicMeshLibrary.getDefinition(item.data.structureId);
          const iHalfW = Math.floor((itemDef?.footprintWidth || 1) / 2);
          const iHalfD = Math.floor((itemDef?.footprintDepth || 1) / 2);

          if (
            Math.abs(item.data.gridX - checkX) <= iHalfW &&
            Math.abs(item.data.gridZ - checkZ) <= iHalfD
          ) {
            this.setValidityState(false);
            return false;
          }
        }
      }
    }

    this.setValidityState(true);
    return true;
  }

  private setValidityState(isValid: boolean): void {
    this.isCurrentPlacementValid = isValid;
    if (this.ghostGroup) {
      DynamicMeshLibrary.setGhostValidity(this.ghostGroup, isValid);
    }
  }

  /**
   * Places the active structure at the current validated grid coordinates
   */
  public async placeStructure(): Promise<boolean> {
    if (!this.isBuildMode || this.activeTool !== 'place') return false;

    if (!this.isCurrentPlacementValid) {
      this.callbacks.onNotice?.('Vị trí này không hợp lệ (gần nước, vách đá hoặc trùng vật cản)!');
      return false;
    }

    if (this.placedMap.size >= 100) {
      this.callbacks.onNotice?.('Đã đạt giới hạn tối đa 100 công trình để bảo đảm mượt mà (30+ FPS)!');
      return false;
    }

    const def = DynamicMeshLibrary.getDefinition(this.activeStructureId);
    if (!def) return false;

    const instanceId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const instance = await DynamicMeshLibrary.instantiateStructure(this.activeStructureId);

    const yOffset = def.baseElevationOffset || 0;
    instance.position.set(this.currentGridX, this.currentElevationY + yOffset, this.currentGridZ);
    instance.rotation.y = this.currentRotation;
    instance.userData = {
      instanceId,
      structureId: def.id,
      gridX: this.currentGridX,
      gridZ: this.currentGridZ,
      elevationY: this.currentElevationY,
      rotationY: this.currentRotation,
      isUserPlaced: true,
    };

    this.userStructuresGroup.add(instance);

    // Block footprint in passabilityMap so companions pathfind around new building
    const halfW = Math.floor(def.footprintWidth / 2);
    const halfD = Math.floor(def.footprintDepth / 2);
    passabilityGrid.markCustomObstacle(
      this.currentGridX - halfW,
      this.currentGridX + halfW,
      this.currentGridZ - halfD,
      this.currentGridZ + halfD,
      true
    );

    const record: PlacedStructure = {
      instanceId,
      structureId: def.id,
      gridX: this.currentGridX,
      gridZ: this.currentGridZ,
      elevationY: this.currentElevationY,
      rotationY: this.currentRotation,
      placedAt: Date.now(),
    };

    this.placedMap.set(instanceId, { instance, data: record });
    audioManager.playBuildPlaceSound();
    this.callbacks.onStructuresChange?.(this.getPlacedList());
    this.hasPointerIntersection = false;
    this.ghostContainer.visible = false;
    return true;
  }

  /**
   * Demolishes a user-placed structure at screen pointer coordinates
   */
  public demolishAtPointer(clientX: number, clientY: number): boolean {
    if (!this.isBuildMode || this.activeTool !== 'demolish') return false;

    const rect = this.domElement.getBoundingClientRect();
    this.pointerPos.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerPos.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerPos, this.camera);
    const intersects = this.raycaster.intersectObjects(this.userStructuresGroup.children, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData?.instanceId && obj.parent !== this.userStructuresGroup) {
        obj = obj.parent;
      }

      if (obj && obj.userData?.instanceId) {
        const instanceId = obj.userData.instanceId;
        this.removeStructure(instanceId);
        return true;
      }
    }

    return false;
  }

  /**
   * Removes a specific structure instance by ID
   */
  public removeStructure(instanceId: string): void {
    const entry = this.placedMap.get(instanceId);
    if (!entry) return;

    const { instance, data } = entry;
    const def = DynamicMeshLibrary.getDefinition(data.structureId);

    // Unblock footprint in passabilityMap
    if (def) {
      const halfW = Math.floor(def.footprintWidth / 2);
      const halfD = Math.floor(def.footprintDepth / 2);
      passabilityGrid.markCustomObstacle(
        data.gridX - halfW,
        data.gridX + halfW,
        data.gridZ - halfD,
        data.gridZ + halfD,
        false
      );
    }

    // Remove from scene and dispose
    this.userStructuresGroup.remove(instance);
    instance.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
      }
    });

    this.placedMap.delete(instanceId);
    audioManager.playDemolishSound();
    this.callbacks.onStructuresChange?.(this.getPlacedList());
  }

  /**
   * Clears all player-placed structures and restores pristine diorama state
   */
  public clearAllStructures(): void {
    for (const { instance, data } of this.placedMap.values()) {
      const def = DynamicMeshLibrary.getDefinition(data.structureId);
      if (def) {
        const halfW = Math.floor(def.footprintWidth / 2);
        const halfD = Math.floor(def.footprintDepth / 2);
        passabilityGrid.markCustomObstacle(
          data.gridX - halfW,
          data.gridX + halfW,
          data.gridZ - halfD,
          data.gridZ + halfD,
          false
        );
      }
      this.userStructuresGroup.remove(instance);
      instance.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
    }

    this.placedMap.clear();
    this.callbacks.onStructuresChange?.([]);
  }

  /**
   * Asynchronously reconstitutes a list of saved structures (e.g. from localStorage or JSON)
   */
  public async reconstituteStructures(structures: PlacedStructure[]): Promise<void> {
    this.clearAllStructures();

    for (const record of structures) {
      const def = DynamicMeshLibrary.getDefinition(record.structureId);
      if (!def) continue;

      try {
        const instance = await DynamicMeshLibrary.instantiateStructure(record.structureId);
        const yOffset = def.baseElevationOffset || 0;
        instance.position.set(record.gridX, record.elevationY + yOffset, record.gridZ);
        instance.rotation.y = record.rotationY;
        instance.userData = {
          instanceId: record.instanceId,
          structureId: record.structureId,
          gridX: record.gridX,
          gridZ: record.gridZ,
          elevationY: record.elevationY,
          rotationY: record.rotationY,
          isUserPlaced: true,
        };

        this.userStructuresGroup.add(instance);

        const halfW = Math.floor(def.footprintWidth / 2);
        const halfD = Math.floor(def.footprintDepth / 2);
        passabilityGrid.markCustomObstacle(
          record.gridX - halfW,
          record.gridX + halfW,
          record.gridZ - halfD,
          record.gridZ + halfD,
          true
        );

        this.placedMap.set(record.instanceId, { instance, data: record });
      } catch (err) {
        console.warn('Could not reconstitute structure:', record.structureId, err);
      }
    }

    this.callbacks.onStructuresChange?.(this.getPlacedList());
  }

  public getPlacedList(): PlacedStructure[] {
    return Array.from(this.placedMap.values()).map((v) => v.data);
  }

  public getPlacedCount(): number {
    return this.placedMap.size;
  }

  public destroy(): void {
    this.clearGhost();
    this.scene.remove(this.ghostContainer);
    this.clearAllStructures();
    this.scene.remove(this.userStructuresGroup);
  }
}
