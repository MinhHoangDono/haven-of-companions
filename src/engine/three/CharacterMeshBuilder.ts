import * as THREE from 'three';
import { Character } from '../../types/character';
import { assetLoader } from './GLTFAssetLoader';
import { passabilityGrid } from '../map/passabilityMap';
import { EquipSlot } from '../../types/inventory';
import { EquipmentGenerator } from './equipment/EquipmentGenerator';
import { inventoryManager } from '../inventory/InventoryManager';
export interface CharacterMeshHandle {
  id: string;
  character: Character;
  group: THREE.Group;
  pedestalMesh: THREE.Mesh;
  nameplateSprite: THREE.Sprite;
  baseY: number;
  update: (dt: number, time: number, isSelected: boolean, hopProgress: number) => void;
  getHeadWorldPosition: () => THREE.Vector3;
  moveTo: (x: number, z: number) => void;
  moveByDirection?: (dx: number, dz: number, dt: number) => void;
  faceTowards?: (x: number, z: number) => void;
  rotateBy?: (deltaAngle: number) => void;
  jump?: (customVelocity?: number) => void;
  launchJump?: (velocity: number) => void;
  isJumping?: () => boolean;
  equipSlot?: (slot: EquipSlot, modelAsset: string | null) => Promise<void>;
  refreshEquipment?: () => Promise<void>;
}
export interface CharacterModelConfig {
  model: string;
  scale: number;
  posX: number;
  posZ: number;
  baseY: number;
  rotationY: number;
  emoji: string;
  accentColor: string;
  pedestalColor: number;
  mainWeapon?: string;
  offhandWeapon?: string;
  backAccessory?: string;
}

export const CHARACTER_CONFIGS: Record<string, CharacterModelConfig> = {
  // 1. Huỳnh Trần Anh Thi – The Wilderness Druid (Highlands Hearth Campsite)
  'anh-thi-druid': {
    model: 'Mage.glb',
    scale: 0.65,
    posX: -15.0,
    posZ: -14.0,
    baseY: 3.5,
    rotationY: Math.PI * 0.3,
    emoji: '🌿',
    accentColor: '#38d976',
    pedestalColor: 0x22ee66,
    mainWeapon: 'staff.gltf',
  },
  // 2. Lê Nguyễn Phương Quỳnh – The Elven Ranger (Highlands Overlook Ridge)
  'phuong-quynh-ranger': {
    model: 'Ranger.glb',
    scale: 0.65,
    posX: -19.0,
    posZ: -10.0,
    baseY: 3.5,
    rotationY: Math.PI * 0.45,
    emoji: '🏹',
    accentColor: '#69db7c',
    pedestalColor: 0x40c057,
    mainWeapon: 'bow_withString.gltf',
    backAccessory: 'quiver.gltf',
  },
  // 3. Trần Nguyễn Trâm Anh – The Lore Bard (Town Square Stage)
  'tram-anh-bard': {
    model: 'Rogue.glb',
    scale: 0.65,
    posX: 3.5,
    posZ: -13.0,
    baseY: 1.5,
    rotationY: -Math.PI * 0.65,
    emoji: '🪕',
    accentColor: '#f06595',
    pedestalColor: 0xe64980,
    mainWeapon: 'dagger.gltf',
  },
  // 4. Nguyễn Khải Vạn – The Pyromancy Sorcerer (Mortar Battery)
  'khai-van-sorcerer': {
    model: 'Mage.glb',
    scale: 0.65,
    posX: 13.0,
    posZ: -2.5,
    baseY: 1.5,
    rotationY: -Math.PI * 0.5,
    emoji: '🔥',
    accentColor: '#ff922b',
    pedestalColor: 0xfd7e14,
    mainWeapon: 'spellbook_open.gltf',
  },
  // 5. Nguyễn Trần Thảo Uyên – Cleric of the Light (Plaza Fountain Steps)
  'thao-uyen-cleric': {
    model: 'Knight.glb',
    scale: 0.65,
    posX: 3.8,
    posZ: -2.5,
    baseY: 1.5,
    rotationY: Math.PI * 0.25,
    emoji: '✨',
    accentColor: '#ffd43b',
    pedestalColor: 0xfcc419,
    offhandWeapon: 'shield_badge_color.gltf',
  },
  // 6. Nguyễn Thị Ngọc Hà – Way of the Kensei Monk (Coastal Shoreline Encampment)
  'ngoc-ha-monk': {
    model: 'Barbarian.glb',
    scale: 0.65,
    posX: 18.5,
    posZ: 7.5,
    baseY: 0.5,
    rotationY: -Math.PI * 0.6,
    emoji: '🥋',
    accentColor: '#20c997',
    pedestalColor: 0x12b886,
  },
  // 7. Phạm Trần Thanh Phương – The Ronin / Paladin (Coastal Shoreline Guardian)
  'thanh-phuong-paladin': {
    model: 'Knight.glb',
    scale: 0.68,
    posX: 17.0,
    posZ: 6.8,
    baseY: 0.5,
    rotationY: Math.PI * 0.3,
    emoji: '🛡️',
    accentColor: '#4dabf7',
    pedestalColor: 0x339af0,
    mainWeapon: 'sword_2handed_color.gltf',
    offhandWeapon: 'shield_square_color.gltf',
  },
  // 8. Phạm Xuân Minh – Swashbuckler Rogue (Coastal Shoreline Outpost)
  'xuan-minh-rogue': {
    model: 'Rogue_Hooded.glb',
    scale: 0.65,
    posX: 19.8,
    posZ: 8.5,
    baseY: 0.5,
    rotationY: -Math.PI * 0.8,
    emoji: '🗡️',
    accentColor: '#ff6b6b',
    pedestalColor: 0xfa5252,
    mainWeapon: 'dagger.gltf',
  },
  // 9. Lâm Anh Thư – The Ocean Cleric (Coastal Shoreline Sanctuary)
  'anh-thu-cleric': {
    model: 'Mage.glb',
    scale: 0.65,
    posX: 18.0,
    posZ: 9.2,
    baseY: 0.5,
    rotationY: Math.PI * 0.1,
    emoji: '🌊',
    accentColor: '#22b8cf',
    pedestalColor: 0x15aabf,
    mainWeapon: 'staff.gltf',
  },
};

// Cached animation clips shared across all KayKit Rig_Medium avatars
let cachedIdleClip: THREE.AnimationClip | null = null;
let cachedWalkClip: THREE.AnimationClip | null = null;

async function ensureAnimationsLoaded(): Promise<{ idle: THREE.AnimationClip | null; walk: THREE.AnimationClip | null }> {
  if (cachedIdleClip && cachedWalkClip) {
    return { idle: cachedIdleClip, walk: cachedWalkClip };
  }

  const [generalRes, movementRes] = await Promise.all([
    assetLoader.loadModel('assets/models/characters/Rig_Medium_General.glb', false),
    assetLoader.loadModel('assets/models/characters/Rig_Medium_MovementBasic.glb', false),
  ]);

  if (generalRes.animations.length > 0) {
    cachedIdleClip = generalRes.animations.find((a) => a.name === 'Idle_A') || generalRes.animations[0];
  }
  if (movementRes.animations.length > 0) {
    cachedWalkClip = movementRes.animations.find((a) => a.name === 'Walking_A') || movementRes.animations[0];
  }

  return { idle: cachedIdleClip, walk: cachedWalkClip };
}

export class CharacterMeshBuilder {
  public static buildCharacter(character: Character, scene: THREE.Scene): CharacterMeshHandle {
    const group = new THREE.Group();
    scene.add(group);

    const config = CHARACTER_CONFIGS[character.id] || {
      model: 'Knight.glb',
      scale: 0.65,
      posX: 0,
      posZ: 0,
      baseY: 1.0,
      rotationY: 0,
      emoji: '⚔️',
      accentColor: '#ffd700',
      pedestalColor: 0xffffff,
    };

    let currentBaseY = config.baseY;
    group.position.set(config.posX, currentBaseY, config.posZ);
    group.rotation.y = config.rotationY;
    group.userData = { interactiveId: character.id, interactiveType: 'character' };

    // 1. Glowing Hero Runic Pedestal on ground
    const pedestalGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32);
    const pedestalMat = new THREE.MeshBasicMaterial({
      color: config.pedestalColor,
      transparent: true,
      opacity: 0.75,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = 0.02;
    group.add(pedestalMesh);

    // Outer Selection Ring (Gold pulse when selected)
    const ringGeo = new THREE.RingGeometry(0.58, 0.66, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.03;
    group.add(selectionRing);

    // 2. Floating In-World Nameplate Billboard Sprite (Standardized on Inter font)
    const nameplateSprite = this.createNameplateSprite(
      character.name,
      character.classTitle,
      config.emoji,
      config.accentColor
    );
    nameplateSprite.position.set(0, 2.35, 0);
    group.add(nameplateSprite);

    // 3. Large Touch Raycast Click Target
    const hitGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.4, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 1.2;
    hitMesh.userData = { interactiveId: character.id, interactiveType: 'character' };
    group.add(hitMesh);

    // 4. Animation State Machine Variables
    let mixer: THREE.AnimationMixer | null = null;
    let activeAction: THREE.AnimationAction | null = null;
    let idleAction: THREE.AnimationAction | null = null;
    let walkAction: THREE.AnimationAction | null = null;
    let headBone: THREE.Object3D | null = null;
    let rightHand: THREE.Object3D | null = null;
    let leftHand: THREE.Object3D | null = null;
    let chest: THREE.Object3D | null = null;

    let currentMainWeaponMesh: THREE.Object3D | null = null;
    let currentOffhandMesh: THREE.Object3D | null = null;
    let currentHeadgearMesh: THREE.Object3D | null = null;
    let currentCapeMesh: THREE.Object3D | null = null;

    const equipSlotFn = async (slot: EquipSlot, modelAsset: string | null) => {
      try {
        if (slot === 'mainWeapon') {
          if (currentMainWeaponMesh && rightHand) {
            rightHand.remove(currentMainWeaponMesh);
            currentMainWeaponMesh = null;
          }
          if (modelAsset && rightHand) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.scale.set(0.9, 0.9, 0.9);
            mesh.rotation.x = Math.PI / 2;
            rightHand.add(mesh);
            currentMainWeaponMesh = mesh;
          }
        } else if (slot === 'offhand') {
          if (currentOffhandMesh && leftHand) {
            leftHand.remove(currentOffhandMesh);
            currentOffhandMesh = null;
          }
          if (modelAsset && leftHand) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.scale.set(0.9, 0.9, 0.9);
            mesh.rotation.y = Math.PI;
            leftHand.add(mesh);
            currentOffhandMesh = mesh;
          }
        } else if (slot === 'headgear') {
          if (currentHeadgearMesh && headBone) {
            headBone.remove(currentHeadgearMesh);
            currentHeadgearMesh = null;
          }
          if (modelAsset && headBone) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.position.set(0, 0.28, 0);
            headBone.add(mesh);
            currentHeadgearMesh = mesh;
          }
        } else if (slot === 'cape') {
          if (currentCapeMesh && chest) {
            chest.remove(currentCapeMesh);
            currentCapeMesh = null;
          }
          if (modelAsset && chest) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.position.set(0, 0.08, -0.16);
            mesh.rotation.y = Math.PI;
            chest.add(mesh);
            currentCapeMesh = mesh;
          }
        }
      } catch (err) {
        console.warn(`[CharacterMeshBuilder] Failed to equip ${slot}:`, err);
      }
    };

    const refreshEquipmentFn = async () => {
      const equipped = inventoryManager.getEquipped(character.id);

      const mainItemId = equipped.mainWeapon;
      const mainItem = mainItemId ? inventoryManager.getItem(mainItemId) : null;
      const mainAsset = mainItem?.modelAsset || config.mainWeapon || null;
      await equipSlotFn('mainWeapon', mainAsset);

      const offItemId = equipped.offhand;
      const offItem = offItemId ? inventoryManager.getItem(offItemId) : null;
      const offAsset = offItem?.modelAsset || config.offhandWeapon || null;
      await equipSlotFn('offhand', offAsset);

      const headItemId = equipped.headgear;
      const headItem = headItemId ? inventoryManager.getItem(headItemId) : null;
      const headAsset = headItem?.modelAsset || null;
      await equipSlotFn('headgear', headAsset);

      const capeItemId = equipped.cape;
      const capeItem = capeItemId ? inventoryManager.getItem(capeItemId) : null;
      const capeAsset = capeItem?.modelAsset || config.backAccessory || null;
      await equipSlotFn('cape', capeAsset);
    };

    const avatarGroup = new THREE.Group();
    group.add(avatarGroup);

    // 5. Asynchronously Load Model, Weapons & Setup Animation Mixer
    Promise.all([
      assetLoader.loadModel(`assets/models/characters/${config.model}`, true),
      ensureAnimationsLoaded(),
    ]).then(async ([{ scene: avatarScene }, anims]) => {
      avatarScene.scale.set(config.scale, config.scale, config.scale);
      avatarGroup.add(avatarScene);

      // Locate skeletal bones
      headBone = avatarScene.getObjectByName('head') || null;
      rightHand = avatarScene.getObjectByName('handslot.r') || avatarScene.getObjectByName('hand.r') || null;
      leftHand = avatarScene.getObjectByName('handslot.l') || avatarScene.getObjectByName('hand.l') || null;
      chest = avatarScene.getObjectByName('chest') || avatarScene.getObjectByName('spine') || null;

      // Bind AnimationMixer to eliminate T-Pose!
      mixer = new THREE.AnimationMixer(avatarScene);

      if (anims.idle) {
        idleAction = mixer.clipAction(anims.idle);
        idleAction.play();
        activeAction = idleAction;
      }
      if (anims.walk) {
        walkAction = mixer.clipAction(anims.walk);
      }

      // Initial equipment mount based on persistent inventory
      await refreshEquipmentFn();
    });

    let currentSpotX = config.posX;
    let currentSpotZ = config.posZ;
    let targetX = currentSpotX;
    let targetZ = currentSpotZ;
    let isMoving = false;
    let keyboardMoveTimer = 0;
    let jumpHeight = 0;
    let jumpVelocity = 0;
    let isJumping = false;
    let idleTimer = Math.random() * 5.0;
    let turnTimer = Math.random() * 4.0;
    let targetHeading = config.rotationY;

    return {
      id: character.id,
      character,
      group,
      pedestalMesh,
      nameplateSprite,
      baseY: currentBaseY,
      faceTowards: (x: number, z: number) => {
        targetHeading = Math.atan2(x - group.position.x, z - group.position.z);
      },
      rotateBy: (deltaAngle: number) => {
        targetHeading += deltaAngle;
      },
      jump: (customVelocity?: number) => {
        if (!isJumping) {
          isJumping = true;
          jumpVelocity = customVelocity || 6.2;
        }
      },
      launchJump: (velocity: number) => {
        isJumping = true;
        jumpVelocity = velocity;
      },
      isJumping: () => isJumping,
      equipSlot: equipSlotFn,
      refreshEquipment: refreshEquipmentFn,
      moveByDirection: (dx: number, dz: number, dt: number) => {
        if (Math.abs(dx) < 0.001 && Math.abs(dz) < 0.001) return;
        const len = Math.hypot(dx, dz);
        const normX = dx / len;
        const normZ = dz / len;
        const speed = (isJumping ? 3.8 : 3.2) * inventoryManager.getSpeedMultiplier();
        const step = speed * dt;
        const nextX = group.position.x + normX * step;
        const nextZ = group.position.z + normZ * step;

        if (passabilityGrid.isWalkable(nextX, nextZ)) {
          const targetElev = passabilityGrid.getElevationAt(nextX, nextZ);
          const currentActualY = currentBaseY + jumpHeight;
          const heightDiff = targetElev - currentBaseY;

          // Jump allows clearing higher elevation up to 2.8m; walking allows 0.85m steps
          const canStep = isJumping
            ? (currentActualY >= targetElev - 0.4 || heightDiff <= 2.8)
            : (heightDiff <= 0.85 && heightDiff >= -1.6);

          if (canStep) {
            group.position.x = nextX;
            group.position.z = nextZ;
            currentSpotX = nextX;
            currentSpotZ = nextZ;
            targetX = nextX;
            targetZ = nextZ;
            targetHeading = Math.atan2(normX, normZ);
            isMoving = true;
            keyboardMoveTimer = 0.14;

            if (isJumping) {
              if (currentActualY <= targetElev) {
                currentBaseY = targetElev;
                jumpHeight = 0;
                isJumping = false;
                jumpVelocity = 0;
              }
            } else {
              currentBaseY = THREE.MathUtils.lerp(currentBaseY, targetElev, Math.min(1.0, dt * 14.0));
            }
          }
        }
      },
      moveTo: (x: number, z: number) => {
        // Enforce passability: blocks walking into deep ocean water or off cliffs
        const validPos = passabilityGrid.clampToWalkable(x, z);
        targetX = validPos.x;
        targetZ = validPos.z;
        currentSpotX = validPos.x; // Permanently updates their spot so they stay where guided!
        currentSpotZ = validPos.z;
        targetHeading = Math.atan2(targetX - group.position.x, targetZ - group.position.z);
        isMoving = true;
      },
      update: (dt: number, time: number, isSelected: boolean, hopProgress: number) => {
        // Update skeletal animation mixer
        if (mixer) {
          mixer.update(dt);

          if (isMoving && walkAction && activeAction !== walkAction) {
            activeAction?.fadeOut(0.2);
            walkAction.reset().fadeIn(0.2).play();
            activeAction = walkAction;
          } else if (!isMoving && idleAction && activeAction !== idleAction) {
            activeAction?.fadeOut(0.25);
            idleAction.reset().fadeIn(0.25).play();
            activeAction = idleAction;
          }
        }
        // Smooth rotational turning towards targetHeading (flexible orientation)
        let diff = targetHeading - group.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        const turnSpeed = isMoving ? 12 : 3.5;
        group.rotation.y += diff * Math.min(1.0, dt * turnSpeed);

        if (keyboardMoveTimer > 0) {
          keyboardMoveTimer -= dt;
          if (keyboardMoveTimer <= 0 && !isJumping) {
            isMoving = false;
          }
        }

        if (isJumping) {
          jumpVelocity -= 16.0 * dt;
          jumpHeight += jumpVelocity * dt;
          const currentGroundElev = passabilityGrid.getElevationAt(group.position.x, group.position.z);
          const totalY = currentBaseY + jumpHeight;

          if (totalY <= currentGroundElev && jumpVelocity <= 0) {
            currentBaseY = currentGroundElev;
            jumpHeight = 0;
            isJumping = false;
            jumpVelocity = 0;
            group.position.y = currentBaseY;
          } else {
            group.position.y = totalY;
          }
        }

        if (isMoving) {
          const dx = targetX - group.position.x;
          const dz = targetZ - group.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 0.08) {
            const speed = 2.4;
            const step = Math.min(dist, speed * dt);
            const nextX = group.position.x + (dx / dist) * step;
            const nextZ = group.position.z + (dz / dist) * step;

            // Strictly verify next step is walkable land or pier; avoid water / non-tile
            if (passabilityGrid.isWalkable(nextX, nextZ)) {
              const targetElev = passabilityGrid.getElevationAt(nextX, nextZ);
              const stepHeight = targetElev - currentBaseY;

              // Step climbing envelope: max 0.85m up (2.8m when jumping), max 1.60m down
              if (stepHeight <= (isJumping ? 2.8 : 0.85) && stepHeight >= -1.60) {
                group.position.x = nextX;
                group.position.z = nextZ;
                targetHeading = Math.atan2(dx, dz);
                currentBaseY = THREE.MathUtils.lerp(currentBaseY, targetElev, Math.min(1.0, dt * 12.0));
                group.position.y = currentBaseY + jumpHeight;
              } else {
                isMoving = false;
              }
            } else {
              isMoving = false;
            }
          } else {
            isMoving = false;
            group.position.x = targetX;
            group.position.z = targetZ;
            const targetElev = passabilityGrid.getElevationAt(targetX, targetZ);
            currentBaseY = THREE.MathUtils.lerp(currentBaseY, targetElev, Math.min(1.0, dt * 12.0));
            group.position.y = currentBaseY;
          }
        } else {
          // Subtle breathing bob
          const bob = Math.sin(time * 0.003 + config.posX) * 0.02;
          let hop = 0;
          if (hopProgress > 0) {
            hop = Math.sin(hopProgress * Math.PI) * 0.45;
          }
          group.position.y = currentBaseY + bob + hop + jumpHeight;

          // Flexible idle behaviors
          if (isSelected) {
            // When selected, gently face south-southeast towards the isometric camera
            targetHeading = Math.PI * 0.25;
          } else {
            // Natural occasional gaze shifts (turning left/right looking around the village)
            turnTimer += dt;
            if (turnTimer > 4.5 + Math.random() * 4.0) {
              turnTimer = 0;
              targetHeading = targetHeading + (Math.random() - 0.5) * 1.2;
            }

            // Ambient village wandering strictly on walkable dry land around their current spot
            idleTimer += dt;
            if (idleTimer > 8.0 + Math.random() * 4.0) {
              idleTimer = 0;
              for (let attempt = 0; attempt < 8; attempt++) {
                const wanderAngle = Math.random() * Math.PI * 2;
                const wanderDist = 0.5 + Math.random() * 1.0;
                const tryX = currentSpotX + Math.cos(wanderAngle) * wanderDist;
                const tryZ = currentSpotZ + Math.sin(wanderAngle) * wanderDist;
                if (passabilityGrid.isWalkable(tryX, tryZ)) {
                  targetX = tryX;
                  targetZ = tryZ;
                  targetHeading = Math.atan2(tryX - group.position.x, tryZ - group.position.z);
                  isMoving = true;
                  break;
                }
              }
            }
          }
        }
        // Pedestal glow pulse
        const pulse = Math.sin(time * 0.005) * 0.15;
        pedestalMat.opacity = isSelected ? 0.95 : 0.6 + pulse;
        ringMat.opacity = isSelected ? 1.0 : 0;
      },
      getHeadWorldPosition: () => {
        const headPos = new THREE.Vector3();
        if (headBone) {
          headBone.getWorldPosition(headPos);
          headPos.y += 0.45;
        } else {
          group.getWorldPosition(headPos);
          headPos.y += 2.0;
        }
        return headPos;
      },
    };
  }

  /**
   * Helper used by CharacterPreview3D.tsx to render animated model in sheet modal
   */
  public static buildClassModel(charId: string, group: THREE.Group): {
    update: (dt: number) => void;
    equipSlot?: (slot: EquipSlot, modelAsset: string | null) => Promise<void>;
    refreshEquipment?: () => Promise<void>;
  } {
    const config = CHARACTER_CONFIGS[charId] || {
      model: 'Knight.glb',
      scale: 0.65,
      mainWeapon: 'sword_2handed_color.gltf',
    };

    let mixer: THREE.AnimationMixer | null = null;
    let headBone: THREE.Object3D | null = null;
    let rightHand: THREE.Object3D | null = null;
    let leftHand: THREE.Object3D | null = null;
    let chest: THREE.Object3D | null = null;

    let currentMainMesh: THREE.Object3D | null = null;
    let currentOffMesh: THREE.Object3D | null = null;
    let currentHeadMesh: THREE.Object3D | null = null;
    let currentCapeMesh: THREE.Object3D | null = null;

    const equipSlotFn = async (slot: EquipSlot, modelAsset: string | null) => {
      try {
        if (slot === 'mainWeapon') {
          if (currentMainMesh && rightHand) rightHand.remove(currentMainMesh);
          currentMainMesh = null;
          if (modelAsset && rightHand) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.scale.set(0.9, 0.9, 0.9);
            mesh.rotation.x = Math.PI / 2;
            rightHand.add(mesh);
            currentMainMesh = mesh;
          }
        } else if (slot === 'offhand') {
          if (currentOffMesh && leftHand) leftHand.remove(currentOffMesh);
          currentOffMesh = null;
          if (modelAsset && leftHand) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.scale.set(0.9, 0.9, 0.9);
            mesh.rotation.y = Math.PI;
            leftHand.add(mesh);
            currentOffMesh = mesh;
          }
        } else if (slot === 'headgear') {
          if (currentHeadMesh && headBone) headBone.remove(currentHeadMesh);
          currentHeadMesh = null;
          if (modelAsset && headBone) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.position.set(0, 0.28, 0);
            headBone.add(mesh);
            currentHeadMesh = mesh;
          }
        } else if (slot === 'cape') {
          if (currentCapeMesh && chest) chest.remove(currentCapeMesh);
          currentCapeMesh = null;
          if (modelAsset && chest) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            mesh.position.set(0, 0.08, -0.16);
            mesh.rotation.y = Math.PI;
            chest.add(mesh);
            currentCapeMesh = mesh;
          }
        }
      } catch (e) {
        console.warn(`[buildClassModel] Failed to equip ${slot}`, e);
      }
    };

    const refreshEquipmentFn = async () => {
      const equipped = inventoryManager.getEquipped(charId);

      const mainItemId = equipped.mainWeapon;
      const mainItem = mainItemId ? inventoryManager.getItem(mainItemId) : null;
      const mainAsset = mainItem?.modelAsset || config.mainWeapon || null;
      await equipSlotFn('mainWeapon', mainAsset);

      const offItemId = equipped.offhand;
      const offItem = offItemId ? inventoryManager.getItem(offItemId) : null;
      const offAsset = offItem?.modelAsset || config.offhandWeapon || null;
      await equipSlotFn('offhand', offAsset);

      const headItemId = equipped.headgear;
      const headItem = headItemId ? inventoryManager.getItem(headItemId) : null;
      const headAsset = headItem?.modelAsset || null;
      await equipSlotFn('headgear', headAsset);

      const capeItemId = equipped.cape;
      const capeItem = capeItemId ? inventoryManager.getItem(capeItemId) : null;
      const capeAsset = capeItem?.modelAsset || config.backAccessory || null;
      await equipSlotFn('cape', capeAsset);
    };

    Promise.all([
      assetLoader.loadModel(`assets/models/characters/${config.model}`, true),
      ensureAnimationsLoaded(),
    ]).then(async ([{ scene: avatarScene }, anims]) => {
      avatarScene.scale.set(config.scale, config.scale, config.scale);
      group.add(avatarScene);

      headBone = avatarScene.getObjectByName('head') || null;
      rightHand = avatarScene.getObjectByName('handslot.r') || avatarScene.getObjectByName('hand.r') || null;
      leftHand = avatarScene.getObjectByName('handslot.l') || avatarScene.getObjectByName('hand.l') || null;
      chest = avatarScene.getObjectByName('chest') || avatarScene.getObjectByName('spine') || null;

      mixer = new THREE.AnimationMixer(avatarScene);
      if (anims.idle) {
        mixer.clipAction(anims.idle).play();
      }

      await refreshEquipmentFn();
    });

    return {
      update: (dt: number) => {
        if (mixer) mixer.update(dt);
      },
      equipSlot: equipSlotFn,
      refreshEquipment: refreshEquipmentFn,
    };
  }

  /**
   * Generates high-contrast in-world billboard sprite with Inter font
   */
  private static createNameplateSprite(
    name: string,
    classTitle: string,
    emoji: string,
    accentColor: string
  ): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, 512, 160);

      // Card Pill Background
      ctx.fillStyle = 'rgba(12, 16, 24, 0.88)';
      ctx.beginPath();
      ctx.roundRect(16, 12, 480, 136, 28);
      ctx.fill();

      // Golden Accent Border
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Class Title
      ctx.font = 'bold 24px "Inter", system-ui, sans-serif';
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(`${emoji} ${classTitle.toUpperCase()}`, 256, 52);

      // Character Name
      ctx.font = 'bold 36px "Inter", system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, 256, 106);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.75, 1.0);
    return sprite;
  }
}
