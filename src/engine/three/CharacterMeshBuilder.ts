import * as THREE from 'three';
import { Character } from '../../types/character';
import { assetLoader } from './GLTFAssetLoader';
import { passabilityGrid } from '../map/passabilityMap';

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
  faceTowards?: (x: number, z: number) => void;
  rotateBy?: (deltaAngle: number) => void;
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
    baseY: 3.0,
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
    baseY: 3.0,
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
    baseY: 1.05,
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
    baseY: 1.05,
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
    baseY: 1.05,
    rotationY: Math.PI * 0.25,
    emoji: '✨',
    accentColor: '#ffd43b',
    pedestalColor: 0xfcc419,
    offhandWeapon: 'shield_badge_color.gltf',
  },
  // 6. Nguyễn Thị Ngọc Hà – Way of the Kensei Monk (Tatami Tea Pavilion)
  'ngoc-ha-monk': {
    model: 'Barbarian.glb',
    scale: 0.65,
    posX: 6.5,
    posZ: 7.5,
    baseY: 0.25,
    rotationY: -Math.PI * 0.75,
    emoji: '🥋',
    accentColor: '#20c997',
    pedestalColor: 0x12b886,
  },
  // 7. Phạm Trần Thanh Phương – The Ronin / Paladin (Harbor Gatehouse Armory)
  'thanh-phuong-paladin': {
    model: 'Knight.glb',
    scale: 0.68,
    posX: -2.5,
    posZ: 6.0,
    baseY: 0.25,
    rotationY: Math.PI * 0.15,
    emoji: '🛡️',
    accentColor: '#4dabf7',
    pedestalColor: 0x339af0,
    mainWeapon: 'sword_2handed_color.gltf',
    offhandWeapon: 'shield_square_color.gltf',
  },
  // 8. Phạm Xuân Minh – Swashbuckler Rogue (Deepwater Boardwalk Pier)
  'xuan-minh-rogue': {
    model: 'Rogue_Hooded.glb',
    scale: 0.65,
    posX: -2.5,
    posZ: 16.5,
    baseY: 0.25,
    rotationY: Math.PI * 0.5,
    emoji: '🗡️',
    accentColor: '#ff6b6b',
    pedestalColor: 0xfa5252,
    mainWeapon: 'dagger.gltf',
  },
  // 9. Lâm Anh Thư – The Ocean Cleric (Outer Lighthouse Cape Promontory)
  'anh-thu-cleric': {
    model: 'Mage.glb',
    scale: 0.65,
    posX: 21.0,
    posZ: 18.0,
    baseY: 1.45,
    rotationY: -Math.PI * 0.3,
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
    assetLoader.loadModel('/assets/models/characters/Rig_Medium_General.glb', false),
    assetLoader.loadModel('/assets/models/characters/Rig_Medium_MovementBasic.glb', false),
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

    const avatarGroup = new THREE.Group();
    group.add(avatarGroup);

    // 5. Asynchronously Load Model, Weapons & Setup Animation Mixer
    Promise.all([
      assetLoader.loadModel(`/assets/models/characters/${config.model}`, true),
      ensureAnimationsLoaded(),
    ]).then(([{ scene: avatarScene }, anims]) => {
      avatarScene.scale.set(config.scale, config.scale, config.scale);
      avatarGroup.add(avatarScene);

      // Locate skeletal bones
      headBone = avatarScene.getObjectByName('head') || null;
      const rightHand = avatarScene.getObjectByName('handslot.r') || avatarScene.getObjectByName('hand.r');
      const leftHand = avatarScene.getObjectByName('handslot.l') || avatarScene.getObjectByName('hand.l');
      const chest = avatarScene.getObjectByName('chest') || avatarScene.getObjectByName('spine');

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

      // Attach mainhand weapon to right hand socket
      if (config.mainWeapon && rightHand) {
        assetLoader.loadModel(`/assets/models/characters/${config.mainWeapon}`, false).then(({ scene: weapon }) => {
          weapon.scale.set(0.9, 0.9, 0.9);
          weapon.rotation.x = Math.PI / 2;
          rightHand.add(weapon);
        });
      }

      // Attach offhand weapon / shield to left hand socket
      if (config.offhandWeapon && leftHand) {
        assetLoader.loadModel(`/assets/models/characters/${config.offhandWeapon}`, false).then(({ scene: shield }) => {
          shield.scale.set(0.9, 0.9, 0.9);
          shield.rotation.y = Math.PI;
          leftHand.add(shield);
        });
      }

      // Attach back accessory (quiver) to chest/spine
      if (config.backAccessory && chest) {
        assetLoader.loadModel(`/assets/models/characters/${config.backAccessory}`, false).then(({ scene: accessory }) => {
          accessory.scale.set(0.9, 0.9, 0.9);
          accessory.position.set(0, 0, -0.18);
          accessory.rotation.y = Math.PI;
          chest.add(accessory);
        });
      }
    });

    let homeX = config.posX;
    let homeZ = config.posZ;
    let targetX = homeX;
    let targetZ = homeZ;
    let isMoving = false;
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
      moveTo: (x: number, z: number) => {
        // Enforce passability: blocks walking into deep ocean water or off cliffs
        const validPos = passabilityGrid.clampToWalkable(x, z);
        targetX = validPos.x;
        targetZ = validPos.z;
        homeX = targetX;
        homeZ = targetZ;
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
              group.position.x = nextX;
              group.position.z = nextZ;
              targetHeading = Math.atan2(dx, dz);
              currentBaseY = passabilityGrid.getElevationAt(nextX, nextZ);
              group.position.y = currentBaseY;
            } else {
              isMoving = false;
            }
          } else {
            isMoving = false;
            group.position.x = targetX;
            group.position.z = targetZ;
            currentBaseY = passabilityGrid.getElevationAt(targetX, targetZ);
            group.position.y = currentBaseY;
          }
        } else {
          // Subtle breathing bob
          const bob = Math.sin(time * 0.003 + homeX) * 0.02;
          let hop = 0;
          if (hopProgress > 0) {
            hop = Math.sin(hopProgress * Math.PI) * 0.45;
          }
          group.position.y = currentBaseY + bob + hop;

          // Flexible idle behaviors
          if (isSelected) {
            // When selected, gently face south-southeast towards the isometric camera
            targetHeading = Math.PI * 0.25;
          } else {
            // Natural occasional gaze shifts (turning left/right looking around the village)
            turnTimer += dt;
            if (turnTimer > 4.5 + Math.random() * 4.0) {
              turnTimer = 0;
              targetHeading = config.rotationY + (Math.random() - 0.5) * 1.4;
            }

            // Ambient village wandering strictly on walkable dry land
            idleTimer += dt;
            if (idleTimer > 8.0 + Math.random() * 4.0) {
              idleTimer = 0;
              for (let attempt = 0; attempt < 8; attempt++) {
                const wanderAngle = Math.random() * Math.PI * 2;
                const wanderDist = 0.5 + Math.random() * 1.0;
                const tryX = group.position.x + Math.cos(wanderAngle) * wanderDist;
                const tryZ = group.position.z + Math.sin(wanderAngle) * wanderDist;
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
  public static buildClassModel(charId: string, group: THREE.Group): { update: (dt: number) => void } {
    const config = CHARACTER_CONFIGS[charId] || {
      model: 'Knight.glb',
      scale: 0.65,
      mainWeapon: 'sword_2handed_color.gltf',
    };

    let mixer: THREE.AnimationMixer | null = null;

    Promise.all([
      assetLoader.loadModel(`/assets/models/characters/${config.model}`, true),
      ensureAnimationsLoaded(),
    ]).then(([{ scene: avatarScene }, anims]) => {
      avatarScene.scale.set(config.scale, config.scale, config.scale);
      group.add(avatarScene);

      mixer = new THREE.AnimationMixer(avatarScene);
      if (anims.idle) {
        mixer.clipAction(anims.idle).play();
      }

      const rightHand = avatarScene.getObjectByName('handslot.r') || avatarScene.getObjectByName('hand.r');
      const leftHand = avatarScene.getObjectByName('handslot.l') || avatarScene.getObjectByName('hand.l');

      if (config.mainWeapon && rightHand) {
        assetLoader.loadModel(`/assets/models/characters/${config.mainWeapon}`, false).then(({ scene: weapon }) => {
          weapon.scale.set(0.9, 0.9, 0.9);
          weapon.rotation.x = Math.PI / 2;
          rightHand.add(weapon);
        });
      }

      if (config.offhandWeapon && leftHand) {
        assetLoader.loadModel(`/assets/models/characters/${config.offhandWeapon}`, false).then(({ scene: shield }) => {
          shield.scale.set(0.9, 0.9, 0.9);
          shield.rotation.y = Math.PI;
          leftHand.add(shield);
        });
      }
    });

    return {
      update: (dt: number) => {
        if (mixer) mixer.update(dt);
      },
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
