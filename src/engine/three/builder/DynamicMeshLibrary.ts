import * as THREE from 'three';
import { GLTFAssetLoader } from '../GLTFAssetLoader';
import { StructureDefinition, StructureCategory } from '../../../types/cityBuilder';

export class DynamicMeshLibrary {
  private static templates: Map<string, THREE.Group> = new Map();
  private static loadingPromises: Map<string, Promise<THREE.Group>> = new Map();

  // Registry of all 22 CC0 placeable fantasy structures and props
  public static readonly CATALOG: StructureDefinition[] = [
    // --- HOUSES ---
    {
      id: 'cottage_small',
      name: 'Nhà Mái Vàng (Nhỏ)',
      description: 'Ngôi nhà gỗ ấm cúng mái ngói vàng cho dân làng.',
      category: 'houses',
      asset: 'building_home_A_yellow.gltf',
      pack: 'props',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 4.0,
      iconName: 'Home',
      tags: ['house', 'residential', 'cottage'],
    },
    {
      id: 'cottage_large',
      name: 'Nhà Mái Vàng (Lớn)',
      description: 'Dinh thự hai tầng có ống khói và ban công.',
      category: 'houses',
      asset: 'building_home_B_yellow.gltf',
      pack: 'props',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 4.2,
      iconName: 'Building',
      tags: ['house', 'mansion', 'large'],
    },
    {
      id: 'inn_tavern',
      name: 'Quán Trọ Lữ Khách',
      description: 'Nơi dừng chân, thưởng trà và nâng ly của 9 người bạn.',
      category: 'houses',
      asset: 'building_tavern_yellow.gltf',
      pack: 'props',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 4.6,
      iconName: 'Beer',
      tags: ['tavern', 'inn', 'social'],
    },
    {
      id: 'blacksmith',
      name: 'Lò Rèn Làng',
      description: 'Xưởng rèn vũ khí và giáp trụ bằng đá kiên cố.',
      category: 'houses',
      asset: 'building_blacksmith_yellow.gltf',
      pack: 'props',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 4.2,
      iconName: 'Anvil',
      tags: ['blacksmith', 'forge', 'craft'],
    },
    {
      id: 'cathedral',
      name: 'Nhà Thờ Cổ',
      description: 'Thánh đường đá mái chuông linh thiêng nhìn ra thung lũng.',
      category: 'houses',
      asset: 'building_church_yellow.gltf',
      pack: 'props',
      footprintWidth: 4,
      footprintDepth: 4,
      baseElevationOffset: 0,
      scale: 5.2,
      iconName: 'Church',
      tags: ['church', 'sanctuary', 'holy'],
    },

    // --- PRODUCTION ---
    {
      id: 'windmill',
      name: 'Cối Xay Gió',
      description: 'Cánh quạt quay đều đón gió mát trên đồi cỏ cao.',
      category: 'production',
      asset: 'building_windmill_yellow.gltf',
      pack: 'props',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 4.6,
      iconName: 'Wind',
      tags: ['windmill', 'grain', 'farm'],
    },
    {
      id: 'market_stall',
      name: 'Gian Hàng Chợ',
      description: 'Quầy bán đồ gốm, hoa quả và dược thảo núi.',
      category: 'production',
      asset: 'building_market_yellow.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.6,
      iconName: 'ShoppingBag',
      tags: ['market', 'bazaar', 'trade'],
    },
    {
      id: 'wheelbarrow',
      name: 'Xe Đẩy Nông Sản',
      description: 'Xe cút kít gỗ chở lương thực và hoa cỏ.',
      category: 'production',
      asset: 'wheelbarrow.gltf',
      pack: 'props',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.8,
      iconName: 'Truck',
      tags: ['cart', 'farm', 'food'],
    },

    // --- FORTIFICATIONS ---
    {
      id: 'watchtower',
      name: 'Tháp Canh Gỗ',
      description: 'Vọng gác cao nhìn bao quát toàn bộ vịnh biển và núi.',
      category: 'fortifications',
      asset: 'tower-watch.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.6,
      iconName: 'ShieldAlert',
      tags: ['tower', 'defense', 'lookout'],
    },
    {
      id: 'stockade_fence',
      name: 'Hàng Rào Gỗ',
      description: 'Hàng rào cọc nhọn bảo vệ lối vào trang trại.',
      category: 'fortifications',
      asset: 'structure-fence.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.6,
      iconName: 'Fence',
      tags: ['fence', 'wall', 'boundary'],
    },
    {
      id: 'weapon_rack',
      name: 'Giá Vũ Khí',
      description: 'Giá gỗ xếp kiếm, giáo và khiên hiệp sĩ.',
      category: 'fortifications',
      asset: 'weaponrack.gltf',
      pack: 'props',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.8,
      iconName: 'Sword',
      tags: ['weapon', 'armory', 'guard'],
    },
    {
      id: 'target_dummy',
      name: 'Bia Tập Bắn',
      description: 'Bia rơm cho cung thủ luyện tiễn thuật.',
      category: 'fortifications',
      asset: 'target.gltf',
      pack: 'props',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.8,
      iconName: 'Target',
      tags: ['target', 'archery', 'training'],
    },

    // --- DECORATIONS ---
    {
      id: 'tent_camp',
      name: 'Lều Du Mục',
      description: 'Lều vải ấm áp cắm trại ngắm sao ban đêm.',
      category: 'decorations',
      asset: 'tent.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Tent',
      tags: ['tent', 'camp', 'nomad'],
    },
    {
      id: 'treasure_chest',
      name: 'Rương Báu Vàng',
      description: 'Rương gỗ nạm đồng đựng châu báu bí mật.',
      category: 'decorations',
      asset: 'chest.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.6,
      iconName: 'Coins',
      tags: ['chest', 'treasure', 'gold'],
    },
    {
      id: 'rum_crate',
      name: 'Thùng Rượu Rum',
      description: 'Kiện hàng hải tặc chứa rượu hoa quả lên men.',
      category: 'decorations',
      asset: 'crate-bottles.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.6,
      iconName: 'Wine',
      tags: ['crate', 'rum', 'bottles'],
    },
    {
      id: 'barrel_wood',
      name: 'Thùng Gỗ Sồi',
      description: 'Thùng ủ nước thanh lương và lương khô.',
      category: 'decorations',
      asset: 'barrel.gltf',
      pack: 'props',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.6,
      iconName: 'Package',
      tags: ['barrel', 'storage', 'wood'],
    },
    {
      id: 'lumber_stack',
      name: 'Đống Gỗ Xẻ',
      description: 'Gỗ thông xẻ thanh cất trữ xây dựng nhà mới.',
      category: 'decorations',
      asset: 'resource_lumber.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Layers',
      tags: ['lumber', 'wood', 'resource'],
    },

    // --- NATURE ---
    {
      id: 'highland_pine',
      name: 'Cây Thông Lớn',
      description: 'Cây thông cổ thụ tán rộng xanh ngát Đà Lạt.',
      category: 'nature',
      asset: 'trees_A_large.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 4.8,
      iconName: 'Trees',
      tags: ['tree', 'pine', 'nature'],
    },
    {
      id: 'pine_medium',
      name: 'Cây Thông Xanh',
      description: 'Cây lá kim mọc ven sườn đồi thoai thoải.',
      category: 'nature',
      asset: 'tree_single_A.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 3.6,
      iconName: 'TreePine',
      tags: ['tree', 'nature', 'green'],
    },
    {
      id: 'coastal_palm',
      name: 'Dừa Nghiêng Biển',
      description: 'Cây dừa nhiệt đới vươn mình đón gió vịnh.',
      category: 'nature',
      asset: 'palm-detailed-bend.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.8,
      iconName: 'Palmtree',
      tags: ['palm', 'tropical', 'beach'],
    },
    {
      id: 'sea_boulder',
      name: 'Đá San Hô Biển',
      description: 'Tảng đá ven bờ lấp lánh cát vàng dưới nắng.',
      category: 'nature',
      asset: 'rocks-sand-a.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Mountain',
      tags: ['rock', 'reef', 'sand'],
    },
  ];

  public static getDefinition(structureId: string): StructureDefinition | undefined {
    return this.CATALOG.find((def) => def.id === structureId);
  }

  public static getByCategory(category: StructureCategory | 'all'): StructureDefinition[] {
    if (category === 'all') return this.CATALOG;
    return this.CATALOG.filter((def) => def.category === category);
  }

  /**
   * Resolves the full public path to the 3D model asset.
   */
  public static getAssetPath(def: StructureDefinition): string {
    return `assets/models/${def.pack}/${def.asset}`;
  }

  /**
   * Loads and caches the base template group for a structure.
   */
  public static async loadTemplate(structureId: string): Promise<THREE.Group> {
    const cached = this.templates.get(structureId);
    if (cached) return cached;

    const inFlight = this.loadingPromises.get(structureId);
    if (inFlight) return inFlight;

    const def = this.getDefinition(structureId);
    if (!def) {
      throw new Error(`Structure definition not found: ${structureId}`);
    }

    const loader = GLTFAssetLoader.getInstance();
    const fullPath = this.getAssetPath(def);

    const promise = loader.loadModel(fullPath, false).then((res) => {
      const template = res.scene;
      template.name = `template_${structureId}`;
      this.templates.set(structureId, template);
      this.loadingPromises.delete(structureId);
      return template;
    });

    this.loadingPromises.set(structureId, promise);
    return promise;
  }

  /**
   * Instantiates a fully rendered clone of a structure ready for placement in the scene.
   */
  public static async instantiateStructure(structureId: string): Promise<THREE.Group> {
    const def = this.getDefinition(structureId);
    if (!def) throw new Error(`Invalid structure ID: ${structureId}`);

    const template = await this.loadTemplate(structureId);
    const instance = template.clone(true);
    instance.scale.set(def.scale, def.scale, def.scale);
    instance.userData = {
      structureId: def.id,
      category: def.category,
      isUserPlaced: true,
      footprintWidth: def.footprintWidth,
      footprintDepth: def.footprintDepth,
    };

    instance.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return instance;
  }

  /**
   * Creates a semi-transparent ghost preview mesh used during placement mode.
   */
  public static async createGhostMesh(structureId: string): Promise<THREE.Group> {
    const def = this.getDefinition(structureId);
    if (!def) throw new Error(`Invalid structure ID: ${structureId}`);

    const template = await this.loadTemplate(structureId);
    const ghost = template.clone(true);
    ghost.name = `ghost_${structureId}`;
    ghost.scale.set(def.scale, def.scale, def.scale);

    // Replace materials with translucent ghost materials
    ghost.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.material = new THREE.MeshBasicMaterial({
          color: 0x20c997, // default emerald green (valid)
          transparent: true,
          opacity: 0.65,
          wireframe: false,
          depthWrite: false,
        });
      }
    });

    return ghost;
  }

  /**
   * Sets ghost preview color tint to Green (Valid) or Red (Invalid/Blocked).
   */
  public static setGhostValidity(ghostGroup: THREE.Group, isValid: boolean): void {
    const targetColor = isValid ? 0x20c997 : 0xfa5252;
    ghostGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.color.setHex(targetColor);
        }
      }
    });
  }
}
