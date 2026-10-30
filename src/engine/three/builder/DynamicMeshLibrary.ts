import * as THREE from 'three';
import { GLTFAssetLoader } from '../GLTFAssetLoader';
import { StructureDefinition, StructureCategory } from '../../../types/cityBuilder';

export class DynamicMeshLibrary {
  private static templates: Map<string, THREE.Group> = new Map();
  private static loadingPromises: Map<string, Promise<THREE.Group>> = new Map();

  // Registry of all 22 CC0 placeable fantasy structures and props
  public static readonly CATALOG: StructureDefinition[] = [
    // ==========================================
    // 1. HOUSES & RESIDENTIAL BUILDINGS
    // ==========================================
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
    {
      id: 'structure_timber',
      name: 'Kho Gỗ Cảng Biển',
      description: 'Nhà kho khung gỗ thông lưu trữ nhu yếu phẩm.',
      category: 'houses',
      asset: 'structure.glb',
      pack: 'environment',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 3.8,
      iconName: 'Warehouse',
      tags: ['warehouse', 'storage', 'timber'],
    },
    {
      id: 'structure_roofed',
      name: 'Nhà Mái Đỏ Cảng',
      description: 'Nhà kho bến tàu lợp ngói đỏ kiên cố.',
      category: 'houses',
      asset: 'structure-roof.glb',
      pack: 'environment',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 3.8,
      iconName: 'Home',
      tags: ['dockhouse', 'roof', 'port'],
    },

    // ==========================================
    // 2. PRODUCTION & COMMERCE
    // ==========================================
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
    {
      id: 'resource_stone',
      name: 'Mỏ Khai Thác Đá',
      description: 'Khối đá sa thạch khai khoáng xây thành trì.',
      category: 'production',
      asset: 'resource_stone.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Mountain',
      tags: ['mine', 'stone', 'resource'],
    },
    {
      id: 'tool_shovel',
      name: 'Nông Cụ Cuốc Xẻng',
      description: 'Dụng cụ làm vườn và khai hoang đất cát ven biển.',
      category: 'production',
      asset: 'tool-shovel.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.0,
      iconName: 'Shovel',
      tags: ['shovel', 'tool', 'farming'],
    },

    // ==========================================
    // 3. FORTIFICATIONS & DEFENSE
    // ==========================================
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
      id: 'tower_large',
      name: 'Đại Pháo Đài Đá',
      description: 'Tháp canh pháo đài đá khổng lồ phòng thủ vịnh.',
      category: 'fortifications',
      asset: 'tower-complete-large.glb',
      pack: 'environment',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 2.8,
      iconName: 'Castle',
      tags: ['tower', 'fortress', 'castle'],
    },
    {
      id: 'tower_small',
      name: 'Pháo Đài Vừa',
      description: 'Tháp đá trung tâm bảo vệ lối vào quảng trường.',
      category: 'fortifications',
      asset: 'tower-complete-small.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Castle',
      tags: ['tower', 'stone', 'defense'],
    },
    {
      id: 'castle_gate',
      name: 'Cổng Thành Đá',
      description: 'Cổng thành kiên cố bằng đá vòm mở lối vào thị trấn.',
      category: 'fortifications',
      asset: 'castle-gate.glb',
      pack: 'environment',
      footprintWidth: 3,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Castle',
      tags: ['gate', 'castle', 'wall'],
    },
    {
      id: 'castle_wall',
      name: 'Tường Thành Đá',
      description: 'Đoạn tường thành đá granit chắn gió bão.',
      category: 'fortifications',
      asset: 'castle-wall.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Castle',
      tags: ['wall', 'fortress', 'defense'],
    },
    {
      id: 'castle_window',
      name: 'Tường Vọng Gác Cửa Sổ',
      description: 'Tường phòng thủ có lỗ châu mai ngắm bắn.',
      category: 'fortifications',
      asset: 'castle-window.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Castle',
      tags: ['window', 'lookout', 'wall'],
    },
    {
      id: 'castle_door',
      name: 'Cửa Hầm Pháo Đài',
      description: 'Cửa vòm bí mật tiến vào pháo đài ngầm.',
      category: 'fortifications',
      asset: 'castle-door.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Castle',
      tags: ['door', 'bunker', 'dungeon'],
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
    {
      id: 'flag_high',
      name: 'Cờ Lễ Hội Sunspire',
      description: 'Ngọn cờ hoàng gia tung bay trong gió biển.',
      category: 'fortifications',
      asset: 'flag-high.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Flag',
      tags: ['flag', 'banner', 'festival'],
    },

    // ==========================================
    // 4. DECORATIONS & WATERFRONT
    // ==========================================
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
      id: 'crate_open',
      name: 'Kiện Hàng Mở',
      description: 'Thùng gỗ chứa nông sản và vật phẩm giao thương.',
      category: 'decorations',
      asset: 'crate_open.gltf',
      pack: 'props',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.0,
      iconName: 'Boxes',
      tags: ['crate', 'goods', 'trade'],
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
    {
      id: 'bottle_large',
      name: 'Bình Dược Thuốc Lớn',
      description: 'Bình thủy tinh đựng dược dịch hồi phục của Anh Thi.',
      category: 'decorations',
      asset: 'bottle-large.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 1.8,
      iconName: 'Wine',
      tags: ['bottle', 'potion', 'druid'],
    },
    {
      id: 'platform_planks',
      name: 'Sàn Gỗ Thao Trường',
      description: 'Sàn ván gỗ phẳng lát lối đi hoặc bãi tập kensei.',
      category: 'decorations',
      asset: 'platform-planks.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.0,
      iconName: 'Layers',
      tags: ['platform', 'wood', 'walkway'],
    },
    {
      id: 'dock_platform',
      name: 'Bục Cầu Tàu Lớn',
      description: 'Cầu cảng gỗ neo đậu thuyền buồm.',
      category: 'decorations',
      asset: 'structure-platform-dock.glb',
      pack: 'environment',
      footprintWidth: 3,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Anchor',
      tags: ['dock', 'pier', 'harbor'],
    },
    {
      id: 'dock_platform_small',
      name: 'Bục Cầu Tàu Nhỏ',
      description: 'Thềm gỗ nhỏ đón thuyền cá.',
      category: 'decorations',
      asset: 'structure-platform-dock-small.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Anchor',
      tags: ['dock', 'small', 'pier'],
    },
    {
      id: 'boat_row_large',
      name: 'Thuyền Gỗ Lớn',
      description: 'Thuyền chèo gỗ dạo chơi vịnh biển Nha Trang.',
      category: 'decorations',
      asset: 'boat-row-large.glb',
      pack: 'environment',
      footprintWidth: 3,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Ship',
      tags: ['boat', 'vessel', 'sea'],
    },
    {
      id: 'boat_row_small',
      name: 'Thuyền Gỗ Câu Cá',
      description: 'Thuyền câu nhỏ xuôi chèo theo triều sóng.',
      category: 'decorations',
      asset: 'boat-row-small.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.0,
      iconName: 'Ship',
      tags: ['boat', 'rowboat', 'fishing'],
    },

    // ==========================================
    // 5. NATURE & LANDSCAPE
    // ==========================================
    {
      id: 'highland_pine',
      name: 'Cây Thông Cổ Thụ',
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
      id: 'pine_cluster',
      name: 'Cụm Thông Đôi',
      description: 'Cặp cây thông rừng cao nguyên đứng cạnh nhau.',
      category: 'nature',
      asset: 'trees_A_medium.gltf',
      pack: 'props',
      footprintWidth: 3,
      footprintDepth: 3,
      baseElevationOffset: 0,
      scale: 4.5,
      iconName: 'Trees',
      tags: ['tree', 'cluster', 'pine'],
    },
    {
      id: 'mountain_a',
      name: 'Ngọn Núi Thông Hùng Vĩ',
      description: 'Ngọn núi đá phủ cỏ và rặng thông kỳ vĩ.',
      category: 'nature',
      asset: 'mountain_A_grass_trees.gltf',
      pack: 'props',
      footprintWidth: 4,
      footprintDepth: 4,
      baseElevationOffset: 0,
      scale: 3.8,
      iconName: 'Mountain',
      tags: ['mountain', 'peak', 'highland'],
    },
    {
      id: 'mountain_b',
      name: 'Đỉnh Núi Cao Nguyên',
      description: 'Dãy núi đá nhấp nhô đón bình minh Sunspire.',
      category: 'nature',
      asset: 'mountain_B_grass_trees.gltf',
      pack: 'props',
      footprintWidth: 4,
      footprintDepth: 4,
      baseElevationOffset: 0,
      scale: 3.8,
      iconName: 'Mountain',
      tags: ['mountain', 'cliff', 'summit'],
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
      id: 'palm_straight',
      name: 'Dừa Biển Thẳng Đứng',
      description: 'Cây dừa thân thẳng hiên ngang trước gió cảng.',
      category: 'nature',
      asset: 'palm-detailed-straight.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.8,
      iconName: 'Palmtree',
      tags: ['palm', 'straight', 'tropical'],
    },
    {
      id: 'palm_bend',
      name: 'Dừa Cong Bãi Cát',
      description: 'Cây dừa lả bóng trên đồi cát vàng.',
      category: 'nature',
      asset: 'palm-bend.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.8,
      iconName: 'Palmtree',
      tags: ['palm', 'bend', 'sand'],
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
    {
      id: 'sea_rocks_b',
      name: 'Cụm Đá San Hô B',
      description: 'Cụm san hô đá vôi nhô lên mặt nước vịnh.',
      category: 'nature',
      asset: 'rocks-sand-b.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.4,
      iconName: 'Mountain',
      tags: ['rock', 'coral', 'sea'],
    },
    {
      id: 'sea_rocks_c',
      name: 'Rạn Đá San Hô C',
      description: 'Rạn đá ngầm vững chãi bảo vệ bến đỗ thuyền.',
      category: 'nature',
      asset: 'rocks-sand-c.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.5,
      iconName: 'Mountain',
      tags: ['rock', 'reef', 'coast'],
    },
    {
      id: 'mountain_rock_a',
      name: 'Tảng Đá Tự Nhiên A',
      description: 'Khối cự thạch rừng thông nguyên sinh.',
      category: 'nature',
      asset: 'rock_single_A.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.6,
      iconName: 'Mountain',
      tags: ['rock', 'boulder', 'highland'],
    },
    {
      id: 'mountain_rock_b',
      name: 'Tảng Đá Tự Nhiên B',
      description: 'Khối đá dốc đứng sườn núi mờ sương.',
      category: 'nature',
      asset: 'rock_single_B.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.6,
      iconName: 'Mountain',
      tags: ['rock', 'cliff', 'stone'],
    },
    {
      id: 'mountain_rock_c',
      name: 'Khối Đá Thẳng Đứng C',
      description: 'Cột đá tự nhiên trấn giữ cửa rừng.',
      category: 'nature',
      asset: 'rock_single_C.gltf',
      pack: 'props',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.6,
      iconName: 'Mountain',
      tags: ['rock', 'pillar', 'stone'],
    },
    {
      id: 'rocks_mossy_a',
      name: 'Đá Rêu Rừng Thông A',
      description: 'Tảng đá cổ phủ rêu phong thung lũng sương.',
      category: 'nature',
      asset: 'rocks-a.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Mountain',
      tags: ['rock', 'moss', 'forest'],
    },
    {
      id: 'rocks_mossy_b',
      name: 'Đá Rêu Rừng Thông B',
      description: 'Khối đá phiến phủ rêu xanh ven thảm cỏ.',
      category: 'nature',
      asset: 'rocks-b.glb',
      pack: 'environment',
      footprintWidth: 2,
      footprintDepth: 2,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Mountain',
      tags: ['rock', 'moss', 'green'],
    },
    {
      id: 'grass_tuft',
      name: 'Khóm Cỏ Xanh',
      description: 'Bụi cỏ thảo nguyên xanh mướt điểm xuyết lối đi.',
      category: 'nature',
      asset: 'grass.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.0,
      iconName: 'TreePine',
      tags: ['grass', 'lawn', 'nature'],
    },
    {
      id: 'grass_plant',
      name: 'Bụi Cây Hoa Cỏ',
      description: 'Bụi cây rậm rạp làm phong phú cảnh sắc sân vườn.',
      category: 'nature',
      asset: 'grass-plant.glb',
      pack: 'environment',
      footprintWidth: 1,
      footprintDepth: 1,
      baseElevationOffset: 0,
      scale: 2.2,
      iconName: 'Trees',
      tags: ['plant', 'shrub', 'wildflower'],
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
