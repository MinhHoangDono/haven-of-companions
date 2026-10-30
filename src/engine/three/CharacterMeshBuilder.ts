import * as THREE from 'three';
import { Character } from '../../types/character';
import { assetLoader } from './GLTFAssetLoader';
import { passabilityGrid } from '../map/passabilityMap';
import { EquipSlot, WieldType } from '../../types/inventory';
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

export interface GripTransform {
  socket: 'handslot.r' | 'handslot.l' | 'chest' | 'head';
  wieldType?: WieldType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export const WEAPON_GRIP_CONFIGS: Record<string, GripTransform> = {
  // --- 2H TWO-HANDED HEAVY WEAPONS ---
  'sword_2handed_color.gltf': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, 0.02, 0.02], rotation: [Math.PI / 2 - 0.25, 0, -0.1], scale: [0.9, 0.9, 0.9] },
  'proc:dragonflame_blade': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, 0.02, 0.02], rotation: [Math.PI / 2 - 0.25, 0, -0.1], scale: [0.9, 0.9, 0.9] },
  'proc:abyssal_scythe': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, 0.05, 0.04], rotation: [Math.PI / 2 - 0.15, 0.1, -0.1], scale: [0.82, 0.82, 0.82] },
  'staff.gltf': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, -0.05, 0.02], rotation: [Math.PI / 2 - 0.15, 0, 0], scale: [0.82, 0.82, 0.82] },
  'proc:celestial_staff': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, -0.05, 0.02], rotation: [Math.PI / 2 - 0.15, 0, 0], scale: [0.82, 0.82, 0.82] },
  'proc:ocean_trident': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, -0.05, 0.02], rotation: [Math.PI / 2 - 0.15, 0, 0], scale: [0.82, 0.82, 0.82] },
  'bow_withString.gltf': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [0.85, 0.85, 0.85] },
  'proc:abyssal_anchor': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, -0.05, 0.02], rotation: [Math.PI / 2 - 0.15, 0, 0], scale: [0.75, 0.75, 0.75] },
  'proc:moonlit_lute': { socket: 'handslot.r', wieldType: 'two_handed', position: [0, 0.1, 0.05], rotation: [0.3, -0.2, -0.5], scale: [0.82, 0.82, 0.82] },
  // --- 1H ONE-HANDED WEAPONS ---
  'dagger.gltf': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, -0.02, 0], rotation: [Math.PI / 2 - 0.25, 0, 0], scale: [0.85, 0.85, 0.85] },
  'sword_1handed.gltf': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, 0, 0], rotation: [Math.PI / 2 - 0.25, 0, 0], scale: [0.85, 0.85, 0.85] },
  'proc:glacial_katana': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, 0.02, 0], rotation: [Math.PI / 2 - 0.25, 0, -0.05], scale: [0.85, 0.85, 0.85] },
  'wand.gltf': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, 0, 0], rotation: [Math.PI / 2 - 0.25, 0, 0], scale: [0.85, 0.85, 0.85] },
  'proc:dawn_scepter': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, 0.05, 0], rotation: [Math.PI / 2 - 0.25, 0, 0], scale: [0.85, 0.85, 0.85] },
  'spellbook_open.gltf': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, 0.05, 0.05], rotation: [0, 0, 0], scale: [0.75, 0.75, 0.75] },
  'proc:nine_destinies_prism': { socket: 'handslot.r', wieldType: 'one_handed', position: [0, 0.12, 0.06], rotation: [0, 0, 0], scale: [0.85, 0.85, 0.85] },
  'proc:highland_chakrams': { socket: 'handslot.r', wieldType: 'dual_wield', position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.85, 0.85, 0.85] },
  // --- OFFHAND ONLY (SHIELDS ON OUTER FOREARM) ---
  'shield_square_color.gltf': { socket: 'handslot.l', wieldType: 'offhand_only', position: [0.05, 0.04, 0.02], rotation: [Math.PI / 2, -Math.PI / 2 - 0.3, 0], scale: [0.85, 0.85, 0.85] },
  'shield_badge_color.gltf': { socket: 'handslot.l', wieldType: 'offhand_only', position: [0.05, 0.04, 0.02], rotation: [Math.PI / 2, -Math.PI / 2 - 0.3, 0], scale: [0.85, 0.85, 0.85] },
  'shield_round_color.gltf': { socket: 'handslot.l', wieldType: 'offhand_only', position: [0.05, 0.04, 0.02], rotation: [Math.PI / 2, -Math.PI / 2 - 0.3, 0], scale: [0.85, 0.85, 0.85] },
  'quiver.gltf': { socket: 'chest', wieldType: 'offhand_only', position: [0, 0.1, -0.15], rotation: [0, Math.PI, 0.2], scale: [0.85, 0.85, 0.85] },
  'mug_full.gltf': { socket: 'handslot.l', wieldType: 'offhand_only', position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.8, 0.8, 0.8] },
  'proc:chronicles_sunspire': { socket: 'handslot.l', wieldType: 'offhand_only', position: [0.05, 0.08, 0.08], rotation: [0, 0, 0], scale: [0.85, 0.85, 0.85] },
  'proc:shared_hearth_aegis': { socket: 'handslot.l', wieldType: 'offhand_only', position: [0.05, 0.04, 0.02], rotation: [Math.PI / 2, -Math.PI / 2 - 0.3, 0], scale: [0.85, 0.85, 0.85] },
  // --- HEADGEAR ---
  'proc:wizard_hat': { socket: 'head', position: [0, 0.06, -0.02], rotation: [0, 0, 0], scale: [0.72, 0.72, 0.72] },
  'proc:knight_helm': { socket: 'head', position: [0, 0.05, 0.01], rotation: [0, 0, 0], scale: [0.8, 0.8, 0.8] },
  'proc:feather_cap': { socket: 'head', position: [0, 0.06, -0.02], rotation: [-0.05, 0, 0], scale: [0.76, 0.76, 0.76] },
  'proc:tricorn_hat': { socket: 'head', position: [0, 0.06, -0.01], rotation: [0, 0, 0], scale: [0.76, 0.76, 0.76] },
  'proc:golden_halo': { socket: 'head', position: [0, 0.22, -0.02], rotation: [0, 0, 0], scale: [0.75, 0.75, 0.75] },
  'proc:sunspire_halo': { socket: 'head', position: [0, 0.26, -0.02], rotation: [0, 0, 0], scale: [0.82, 0.82, 0.82] },
  // --- CAPES ---
  'proc:highland_cloak': { socket: 'chest', position: [0, 0.08, -0.14], rotation: [0, Math.PI, 0], scale: [0.88, 0.88, 0.88] },
  'proc:royal_mantle': { socket: 'chest', position: [0, 0.08, -0.14], rotation: [0, Math.PI, 0], scale: [0.88, 0.88, 0.88] },
  'proc:ocean_cape': { socket: 'chest', position: [0, 0.08, -0.14], rotation: [0, Math.PI, 0], scale: [0.88, 0.88, 0.88] },
  'proc:exhibition_cloak': { socket: 'chest', position: [0, 0.08, -0.14], rotation: [0, Math.PI, 0], scale: [0.88, 0.88, 0.88] },
  'proc:horizon_plate': { socket: 'chest', position: [0, 0.06, 0.02], rotation: [0, 0, 0], scale: [0.85, 0.85, 0.85] },
};

function applyGripTransform(mesh: THREE.Object3D, assetId: string, defaultSlot: EquipSlot): GripTransform {
  const grip = WEAPON_GRIP_CONFIGS[assetId];
  if (grip) {
    mesh.position.set(grip.position[0], grip.position[1], grip.position[2]);
    mesh.rotation.set(grip.rotation[0], grip.rotation[1], grip.rotation[2]);
    mesh.scale.set(grip.scale[0], grip.scale[1], grip.scale[2]);
    return grip;
  }
  if (defaultSlot === 'mainWeapon') {
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(0.85, 0.85, 0.85);
    return { socket: 'handslot.r', position: [0, 0, 0], rotation: [0, 0, 0], scale: [0.85, 0.85, 0.85] };
  } else if (defaultSlot === 'offhand') {
    mesh.position.set(0, 0, 0.05);
    mesh.rotation.set(0, Math.PI / 2, 0);
    mesh.scale.set(0.85, 0.85, 0.85);
    return { socket: 'handslot.l', position: [0, 0, 0.05], rotation: [0, Math.PI / 2, 0], scale: [0.85, 0.85, 0.85] };
  } else if (defaultSlot === 'headgear') {
    mesh.position.set(0, 0.05, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(0.75, 0.75, 0.75);
    return { socket: 'head', position: [0, 0.05, 0], rotation: [0, 0, 0], scale: [0.75, 0.75, 0.75] };
  } else {
    mesh.position.set(0, 0.08, -0.14);
    mesh.rotation.set(0, Math.PI, 0);
    mesh.scale.set(0.88, 0.88, 0.88);
    return { socket: 'chest', position: [0, 0.08, -0.14], rotation: [0, Math.PI, 0], scale: [0.88, 0.88, 0.88] };
  }
}
function findBone(scene: THREE.Object3D, ...names: string[]): THREE.Object3D | null {
  for (const n of names) {
    const found = scene.getObjectByName(n);
    if (found) return found;
  }
  let fallback: THREE.Object3D | null = null;
  scene.traverse((c) => {
    if (fallback) return;
    const lower = c.name.toLowerCase();
    for (const n of names) {
      if (lower === n.toLowerCase()) {
        fallback = c;
        return;
      }
    }
  });
  return fallback;
}

function getTargetModelForOutfit(outfitId: string | null, baseModel: string): string {
  if (outfitId === 'outfit_white_shirt_pants' || outfitId === 'model:white_shirt_pants' || outfitId === 'outfit_kensei_gi' || outfitId === 'model:kensei_gi') {
    return 'Rig_Medium_General.glb';
  }
  if (outfitId === 'outfit_mage_robe' || outfitId === 'model:mage_robe' || outfitId === 'outfit_tide_silks' || outfitId === 'model:tide_vestments') {
    return 'Mage.glb';
  }
  if (outfitId === 'outfit_highland_tunic' || outfitId === 'model:scout_leathers') {
    return 'Ranger.glb';
  }
  if (outfitId === 'outfit_ocean_corsair' || outfitId === 'model:swashbuckler_tunic') {
    return 'Rogue.glb';
  }
  if (outfitId === 'outfit_horizon_plate' || outfitId === 'model:horizon_plate' || outfitId === 'proc:horizon_plate') {
    return 'Knight.glb';
  }
  return baseModel;
}

function applyOutfitStyle(avatarScene: THREE.Object3D, outfitId: string | null) {
  const isCivilian = outfitId === 'outfit_white_shirt_pants' || outfitId === 'model:white_shirt_pants';
  const isKenseiGi = outfitId === 'outfit_kensei_gi' || outfitId === 'model:kensei_gi';
  const isMageRobe = outfitId === 'outfit_mage_robe' || outfitId === 'model:mage_robe';
  const isScoutLeathers = outfitId === 'outfit_highland_tunic' || outfitId === 'model:scout_leathers';
  const isCorsair = outfitId === 'outfit_ocean_corsair' || outfitId === 'model:swashbuckler_tunic';
  const isTideSilks = outfitId === 'outfit_tide_silks' || outfitId === 'model:tide_vestments';
  const isHorizonPlate = outfitId === 'outfit_horizon_plate' || outfitId === 'model:horizon_plate' || outfitId === 'proc:horizon_plate';

  if (isCivilian) {
    const whiteShirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
    const darkPantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5c6a5, roughness: 0.6 });

    const bodyMesh = avatarScene.getObjectByName('Mannequin_Body') as THREE.Mesh;
    if (bodyMesh) bodyMesh.material = whiteShirtMat;
    const leftLeg = avatarScene.getObjectByName('Mannequin_LegLeft') as THREE.Mesh;
    const rightLeg = avatarScene.getObjectByName('Mannequin_LegRight') as THREE.Mesh;
    if (leftLeg) leftLeg.material = darkPantsMat;
    if (rightLeg) rightLeg.material = darkPantsMat;
    const headMesh = avatarScene.getObjectByName('Mannequin_Head') as THREE.Mesh;
    if (headMesh) headMesh.material = skinMat;
    const leftArm = avatarScene.getObjectByName('Mannequin_ArmLeft') as THREE.Mesh;
    const rightArm = avatarScene.getObjectByName('Mannequin_ArmRight') as THREE.Mesh;
    if (leftArm) leftArm.material = skinMat;
    if (rightArm) rightArm.material = skinMat;
  } else if (isKenseiGi) {
    const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.85 });
    const darkHakamaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5c6a5, roughness: 0.6 });

    const bodyMesh = avatarScene.getObjectByName('Mannequin_Body') as THREE.Mesh;
    if (bodyMesh) bodyMesh.material = navyMat;
    const leftLeg = avatarScene.getObjectByName('Mannequin_LegLeft') as THREE.Mesh;
    const rightLeg = avatarScene.getObjectByName('Mannequin_LegRight') as THREE.Mesh;
    if (leftLeg) leftLeg.material = darkHakamaMat;
    if (rightLeg) rightLeg.material = darkHakamaMat;
    const headMesh = avatarScene.getObjectByName('Mannequin_Head') as THREE.Mesh;
    if (headMesh) headMesh.material = skinMat;
    const leftArm = avatarScene.getObjectByName('Mannequin_ArmLeft') as THREE.Mesh;
    const rightArm = avatarScene.getObjectByName('Mannequin_ArmRight') as THREE.Mesh;
    if (leftArm) leftArm.material = navyMat;
    if (rightArm) rightArm.material = navyMat;
  } else if (isTideSilks) {
    avatarScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color(0x38bdf8);
          if ('emissive' in mat) {
            mat.emissive = new THREE.Color(0x0284c7);
            mat.emissiveIntensity = 0.35;
          }
          mesh.material = mat;
        }
      }
    });
  } else if (isMageRobe) {
    avatarScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color(0xa855f7);
          if ('emissive' in mat) {
            mat.emissive = new THREE.Color(0x6b21a8);
            mat.emissiveIntensity = 0.3;
          }
          mesh.material = mat;
        }
      }
    });
  } else if (isScoutLeathers) {
    avatarScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color(0x22c55e);
          mesh.material = mat;
        }
      }
    });
  } else if (isCorsair) {
    avatarScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color(0xef4444);
          mesh.material = mat;
        }
      }
    });
  } else if (isHorizonPlate) {
    avatarScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).clone() as THREE.MeshStandardMaterial;
          mat.color = new THREE.Color(0x38bdf8);
          mesh.material = mat;
        }
      }
    });
  }
}
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
    const BUILTIN_HEADGEAR = ['Knight_Helmet', 'Knight_HelmetVisor', 'Mage_Hat', 'Barbarian_BearHat', 'RogueHooded_Mask'];
    const BUILTIN_CAPE = ['Knight_Cape', 'Mage_Cape', 'Ranger_Cape', 'Rogue_Cape', 'RogueHooded_Cape', 'Ranger_Quiver'];

    let currentMainWeaponMesh: THREE.Object3D | null = null;
    let currentOffhandMesh: THREE.Object3D | null = null;
    let currentHeadgearMesh: THREE.Object3D | null = null;
    let currentCapeMesh: THREE.Object3D | null = null;
    let currentOutfitMesh: THREE.Object3D | null = null;

    let currentAvatarScene: THREE.Object3D | null = null;
    let currentOutfitId: string | null = null;

    const avatarGroup = new THREE.Group();
    group.add(avatarGroup);

    const setupAvatarBody = async (outfitId: string | null) => {
      const targetModel = getTargetModelForOutfit(outfitId, config.model);

      if (currentAvatarScene) {
        avatarGroup.remove(currentAvatarScene);
        currentAvatarScene = null;
      }
      currentMainWeaponMesh = null;
      currentOffhandMesh = null;
      currentHeadgearMesh = null;
      currentCapeMesh = null;
      if (currentOutfitMesh && chest) {
        chest.remove(currentOutfitMesh);
        currentOutfitMesh = null;
      }

      const [{ scene: avatarScene }, anims] = await Promise.all([
        assetLoader.loadModel(`assets/models/characters/${targetModel}`, true),
        ensureAnimationsLoaded(),
      ]);

      currentAvatarScene = avatarScene;
      avatarScene.scale.set(config.scale, config.scale, config.scale);
      avatarGroup.add(avatarScene);

      // Locate skeletal bones (handling both 'handslotr' and 'handslot.r' formats)
      headBone = findBone(avatarScene, 'head', 'Head', 'head_bone');
      rightHand = findBone(avatarScene, 'handslotr', 'handslot.r', 'handr', 'hand.r', 'hand_r', 'RightHand');
      leftHand = findBone(avatarScene, 'handslotl', 'handslot.l', 'handl', 'hand.l', 'hand_l', 'LeftHand');
      chest = findBone(avatarScene, 'chest', 'Chest', 'spine', 'Spine', 'body');

      applyOutfitStyle(avatarScene, outfitId);

      // Procedural Horizon Plate attachment
      const isHorizonPlate = outfitId === 'outfit_horizon_plate' || outfitId === 'model:horizon_plate' || outfitId === 'proc:horizon_plate';
      if (isHorizonPlate && chest) {
        try {
          const plateMesh = await EquipmentGenerator.createEquipmentMesh('proc:horizon_plate');
          applyGripTransform(plateMesh, 'proc:horizon_plate', 'outfit');
          chest.add(plateMesh);
          currentOutfitMesh = plateMesh;
        } catch (e) {
          console.warn('[CharacterMeshBuilder] Failed to attach horizon plate', e);
        }
      }

      // Bind AnimationMixer
      mixer = new THREE.AnimationMixer(avatarScene);
      if (anims.idle) {
        idleAction = mixer.clipAction(anims.idle);
        idleAction.play();
        activeAction = idleAction;
      }
      if (anims.walk) {
        walkAction = mixer.clipAction(anims.walk);
      }

      currentOutfitId = outfitId;
    };

    const equipSlotFn = async (slot: EquipSlot, modelAsset: string | null) => {
      try {
        if (slot === 'mainWeapon') {
          if (currentMainWeaponMesh && rightHand) {
            rightHand.remove(currentMainWeaponMesh);
            currentMainWeaponMesh = null;
          }
          if (modelAsset && rightHand) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            applyGripTransform(mesh, modelAsset, 'mainWeapon');
            rightHand.add(mesh);
            currentMainWeaponMesh = mesh;
          }
        } else if (slot === 'offhand') {
          if (currentOffhandMesh) {
            if (leftHand) leftHand.remove(currentOffhandMesh);
            if (chest) chest.remove(currentOffhandMesh);
            currentOffhandMesh = null;
          }
          if (modelAsset) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            const grip = applyGripTransform(mesh, modelAsset, 'offhand');
            if (grip.socket === 'chest' && chest) {
              chest.add(mesh);
            } else if (leftHand) {
              leftHand.add(mesh);
            }
            currentOffhandMesh = mesh;
          }
        } else if (slot === 'headgear') {
          if (currentHeadgearMesh && headBone) {
            headBone.remove(currentHeadgearMesh);
            currentHeadgearMesh = null;
          }
          if (modelAsset && headBone) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            applyGripTransform(mesh, modelAsset, 'headgear');
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
            applyGripTransform(mesh, modelAsset, 'cape');
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
      const targetOutfit = equipped.outfit || 'outfit_class_armor';

      if (targetOutfit !== currentOutfitId || !currentAvatarScene) {
        await setupAvatarBody(targetOutfit);
      }

      // Hide baked-in class helmets/hats/capes so custom gear doesn't clip
      if (currentAvatarScene) {
        const hasCustomHead = !!equipped.headgear;
        const isMannequin = currentOutfitId === 'outfit_white_shirt_pants' || currentOutfitId === 'model:white_shirt_pants' || currentOutfitId === 'outfit_kensei_gi' || currentOutfitId === 'model:kensei_gi';
        BUILTIN_HEADGEAR.forEach((meshName) => {
          const m = currentAvatarScene!.getObjectByName(meshName);
          if (m) m.visible = !hasCustomHead && !isMannequin;
        });

        const hasCustomCape = !!equipped.cape;
        BUILTIN_CAPE.forEach((meshName) => {
          const m = currentAvatarScene!.getObjectByName(meshName);
          if (m) m.visible = !hasCustomCape && !isMannequin;
        });
      }

      const mainItemId = equipped.mainWeapon;
      const mainItem = mainItemId ? inventoryManager.getItem(mainItemId) : null;
      const mainAsset = mainItem?.modelAsset || config.mainWeapon || null;
      await equipSlotFn('mainWeapon', mainAsset);

      // 2H weapons: if two-handed, suppress hand-held shields to avoid clipping
      const is2H = mainItem?.wieldType === 'two_handed' || mainItem?.weaponType === 'greatsword' || mainItem?.weaponType === 'scythe' || mainItem?.weaponType === 'archmage_staff' || mainItem?.weaponType === 'elemental_bow' || mainItem?.weaponType === 'colossal_hammer' || mainItem?.weaponType === 'bardic_lute';
      const offItemId = equipped.offhand;
      const offItem = offItemId ? inventoryManager.getItem(offItemId) : null;
      const offAsset = (!is2H || offItem?.modelAsset === 'quiver.gltf') ? (offItem?.modelAsset || config.offhandWeapon || null) : null;
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

    // Initial equipment mount based on persistent inventory
    setupAvatarBody(inventoryManager.getEquipped(character.id).outfit || 'outfit_class_armor').then(() => {
      refreshEquipmentFn();
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

    const BUILTIN_HEADGEAR = ['Knight_Helmet', 'Knight_HelmetVisor', 'Mage_Hat', 'Barbarian_BearHat', 'RogueHooded_Mask'];
    const BUILTIN_CAPE = ['Knight_Cape', 'Mage_Cape', 'Ranger_Cape', 'Rogue_Cape', 'RogueHooded_Cape', 'Ranger_Quiver'];

    let mixer: THREE.AnimationMixer | null = null;
    let headBone: THREE.Object3D | null = null;
    let rightHand: THREE.Object3D | null = null;
    let leftHand: THREE.Object3D | null = null;
    let chest: THREE.Object3D | null = null;

    let currentMainMesh: THREE.Object3D | null = null;
    let currentOffMesh: THREE.Object3D | null = null;
    let currentHeadMesh: THREE.Object3D | null = null;
    let currentCapeMesh: THREE.Object3D | null = null;
    let currentOutfitMesh: THREE.Object3D | null = null;

    let currentAvatarScene: THREE.Object3D | null = null;
    let currentOutfitId: string | null = null;

    const setupAvatarBody = async (outfitId: string | null) => {
      const targetModel = getTargetModelForOutfit(outfitId, config.model);

      if (currentAvatarScene) {
        group.remove(currentAvatarScene);
        currentAvatarScene = null;
      }
      currentMainMesh = null;
      currentOffMesh = null;
      currentHeadMesh = null;
      currentCapeMesh = null;
      if (currentOutfitMesh && chest) {
        chest.remove(currentOutfitMesh);
        currentOutfitMesh = null;
      }

      const [{ scene: avatarScene }, anims] = await Promise.all([
        assetLoader.loadModel(`assets/models/characters/${targetModel}`, true),
        ensureAnimationsLoaded(),
      ]);

      currentAvatarScene = avatarScene;
      avatarScene.scale.set(config.scale, config.scale, config.scale);
      group.add(avatarScene);

      // Locate skeletal bones (handling both 'handslotr' and 'handslot.r' formats)
      headBone = findBone(avatarScene, 'head', 'Head', 'head_bone');
      rightHand = findBone(avatarScene, 'handslotr', 'handslot.r', 'handr', 'hand.r', 'hand_r', 'RightHand');
      leftHand = findBone(avatarScene, 'handslotl', 'handslot.l', 'handl', 'hand.l', 'hand_l', 'LeftHand');
      chest = findBone(avatarScene, 'chest', 'Chest', 'spine', 'Spine', 'body');

      applyOutfitStyle(avatarScene, outfitId);

      // Procedural Horizon Plate attachment
      const isHorizonPlate = outfitId === 'outfit_horizon_plate' || outfitId === 'model:horizon_plate' || outfitId === 'proc:horizon_plate';
      if (isHorizonPlate && chest) {
        try {
          const plateMesh = await EquipmentGenerator.createEquipmentMesh('proc:horizon_plate');
          applyGripTransform(plateMesh, 'proc:horizon_plate', 'outfit');
          chest.add(plateMesh);
          currentOutfitMesh = plateMesh;
        } catch (e) {
          console.warn('[CharacterMeshBuilder] Failed to attach horizon plate', e);
        }
      }

      mixer = new THREE.AnimationMixer(avatarScene);
      if (anims.idle) {
        mixer.clipAction(anims.idle).play();
      }

      currentOutfitId = outfitId;
    };

    const equipSlotFn = async (slot: EquipSlot, modelAsset: string | null) => {
      try {
        if (slot === 'mainWeapon') {
          if (currentMainMesh && rightHand) rightHand.remove(currentMainMesh);
          currentMainMesh = null;
          if (modelAsset && rightHand) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            applyGripTransform(mesh, modelAsset, 'mainWeapon');
            rightHand.add(mesh);
            currentMainMesh = mesh;
          }
        } else if (slot === 'offhand') {
          if (currentOffMesh) {
            if (leftHand) leftHand.remove(currentOffMesh);
            if (chest) chest.remove(currentOffMesh);
            currentOffMesh = null;
          }
          if (modelAsset) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            const grip = applyGripTransform(mesh, modelAsset, 'offhand');
            if (grip.socket === 'chest' && chest) {
              chest.add(mesh);
            } else if (leftHand) {
              leftHand.add(mesh);
            }
            currentOffMesh = mesh;
          }
        } else if (slot === 'headgear') {
          if (currentHeadMesh && headBone) headBone.remove(currentHeadMesh);
          currentHeadMesh = null;
          if (modelAsset && headBone) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            applyGripTransform(mesh, modelAsset, 'headgear');
            headBone.add(mesh);
            currentHeadMesh = mesh;
          }
        } else if (slot === 'cape') {
          if (currentCapeMesh && chest) chest.remove(currentCapeMesh);
          currentCapeMesh = null;
          if (modelAsset && chest) {
            const mesh = await EquipmentGenerator.createEquipmentMesh(modelAsset);
            applyGripTransform(mesh, modelAsset, 'cape');
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
      const targetOutfit = equipped.outfit || 'outfit_class_armor';

      if (targetOutfit !== currentOutfitId || !currentAvatarScene) {
        await setupAvatarBody(targetOutfit);
      }

      if (currentAvatarScene) {
        const hasCustomHead = !!equipped.headgear;
        const isMannequin = currentOutfitId === 'outfit_white_shirt_pants' || currentOutfitId === 'model:white_shirt_pants' || currentOutfitId === 'outfit_kensei_gi' || currentOutfitId === 'model:kensei_gi';
        BUILTIN_HEADGEAR.forEach((meshName) => {
          const m = currentAvatarScene!.getObjectByName(meshName);
          if (m) m.visible = !hasCustomHead && !isMannequin;
        });

        const hasCustomCape = !!equipped.cape;
        BUILTIN_CAPE.forEach((meshName) => {
          const m = currentAvatarScene!.getObjectByName(meshName);
          if (m) m.visible = !hasCustomCape && !isMannequin;
        });
      }

      const mainItemId = equipped.mainWeapon;
      const mainItem = mainItemId ? inventoryManager.getItem(mainItemId) : null;
      const mainAsset = mainItem?.modelAsset || config.mainWeapon || null;
      await equipSlotFn('mainWeapon', mainAsset);

      // 2H weapons: if two-handed, suppress hand-held shields to avoid clipping
      const is2H = mainItem?.wieldType === 'two_handed' || mainItem?.weaponType === 'greatsword' || mainItem?.weaponType === 'scythe' || mainItem?.weaponType === 'archmage_staff' || mainItem?.weaponType === 'elemental_bow' || mainItem?.weaponType === 'colossal_hammer' || mainItem?.weaponType === 'bardic_lute';
      const offItemId = equipped.offhand;
      const offItem = offItemId ? inventoryManager.getItem(offItemId) : null;
      const offAsset = (!is2H || offItem?.modelAsset === 'quiver.gltf') ? (offItem?.modelAsset || config.offhandWeapon || null) : null;
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

    setupAvatarBody(inventoryManager.getEquipped(charId).outfit || 'outfit_class_armor').then(() => {
      refreshEquipmentFn();
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
