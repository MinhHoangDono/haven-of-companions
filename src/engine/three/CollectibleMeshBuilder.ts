import * as THREE from 'three';
import { CollectibleItem, CollectibleType } from '../../types/platformer';
import { passabilityGrid } from '../map/passabilityMap';

export class CollectibleMeshBuilder {
  private static matGold = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0x664400,
  });

  private static matTea = new THREE.MeshStandardMaterial({
    color: 0x38d976,
    metalness: 0.2,
    roughness: 0.4,
    emissive: 0x114422,
  });

  private static matConch = new THREE.MeshStandardMaterial({
    color: 0x7ee7f8,
    metalness: 0.4,
    roughness: 0.3,
    emissive: 0x113344,
  });

  private static matEmber = new THREE.MeshStandardMaterial({
    color: 0xff922b,
    metalness: 0.5,
    roughness: 0.2,
    emissive: 0xaa3300,
  });

  private static matGlow = new THREE.MeshBasicMaterial({
    color: 0xffe066,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });

  /**
   * Builds the 3D procedural mesh for a collectible node
   */
  public static createCollectibleMesh(type: CollectibleType): THREE.Group {
    const group = new THREE.Group();

    // 1. Ground halo aura ring
    const ringGeo = new THREE.RingGeometry(0.25, 0.36, 16);
    const ring = new THREE.Mesh(ringGeo, this.matGlow.clone());
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    group.add(ring);

    // 2. Floating Gem/Token Mesh
    const floatingGroup = new THREE.Group();
    floatingGroup.name = 'floatingItem';

    if (type === 'gold_coin') {
      const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12);
      const coin = new THREE.Mesh(coinGeo, this.matGold);
      coin.rotation.z = Math.PI / 2;
      coin.castShadow = true;
      floatingGroup.add(coin);
    } else if (type === 'dalat_tea') {
      // 3-leaf emerald cluster
      for (let i = 0; i < 3; i++) {
        const leafGeo = new THREE.ConeGeometry(0.12, 0.32, 4);
        const leaf = new THREE.Mesh(leafGeo, this.matTea);
        leaf.rotation.z = 0.4;
        leaf.rotation.y = (i * Math.PI * 2) / 3;
        leaf.position.y = 0.05;
        leaf.castShadow = true;
        floatingGroup.add(leaf);
      }
    } else if (type === 'sea_conch') {
      // Spiral pearl conch shape
      const conchGeo = new THREE.TorusGeometry(0.16, 0.08, 8, 16);
      const conch = new THREE.Mesh(conchGeo, this.matConch);
      conch.rotation.x = Math.PI / 3;
      conch.castShadow = true;
      floatingGroup.add(conch);
    } else if (type === 'firework_ember') {
      // Sparking octahedron star
      const emberGeo = new THREE.OctahedronGeometry(0.22, 0);
      const ember = new THREE.Mesh(emberGeo, this.matEmber);
      ember.castShadow = true;
      floatingGroup.add(ember);
    }

    floatingGroup.position.y = 0.38;
    group.add(floatingGroup);

    return group;
  }

  /**
   * Initializes the 12 default collectibles scattered throughout the 3 biomes
   */
  public static getInitialCollectibles(scene: THREE.Scene): CollectibleItem[] {
    const rawDefs: Array<{ id: string; type: CollectibleType; name: string; desc: string; val: number; x: number; z: number }> = [
      // 1. Sunspire Plaza & Town Square Coins (4)
      { id: 'coin_plaza_1', type: 'gold_coin', name: 'Đồng Tiền Hội Làng', desc: 'Đồng xu lễ hội Sunspire sáng bóng mang lại may mắn.', val: 10, x: 4.5, z: -6.5 },
      { id: 'coin_plaza_2', type: 'gold_coin', name: 'Đồng Tiền Hội Làng', desc: 'Đồng xu lễ hội lấp lánh tại quảng trường.', val: 10, x: 6.8, z: -12.0 },
      { id: 'coin_plaza_3', type: 'gold_coin', name: 'Đồng Tiền Hội Làng', desc: 'Đồng xu rơi gần thềm quán rượu Guildhall.', val: 10, x: 11.5, z: -8.0 },
      { id: 'coin_plaza_4', type: 'gold_coin', name: 'Đồng Tiền Hội Làng', desc: 'Đồng xu cổ trên lối lát đá trung tâm.', val: 10, x: -0.5, z: -10.0 },

      // 2. Đà Lạt Highlands Wild Tea Leaves (3)
      { id: 'tea_highland_1', type: 'dalat_tea', name: 'Búp Trà Atisô Đà Lạt', desc: 'Lá trà xanh mát từ sương sớm cao nguyên của Anh Thi.', val: 15, x: -17.5, z: -12.0 },
      { id: 'tea_highland_2', type: 'dalat_tea', name: 'Búp Trà Rừng Cổ Thụ', desc: 'Búp trà thượng hạng trên dốc thông nhìn xuống làng.', val: 15, x: -21.0, z: -8.5 },
      { id: 'tea_highland_3', type: 'dalat_tea', name: 'Trà Tiên Đỉnh Núi', desc: 'Trà tiên mọc ở vách đá cao nhất của Phương Quỳnh.', val: 25, x: -24.0, z: -18.0 },

      // 3. Nha Trang Coastal Bay Seashells (3)
      { id: 'conch_coast_1', type: 'sea_conch', name: 'Vỏ Ốc Biển Nha Trang', desc: 'Vỏ ốc xà cừ óng ánh từ bờ biển của Ngọc Hà.', val: 15, x: 16.5, z: 6.2 },
      { id: 'conch_coast_2', type: 'sea_conch', name: 'Ốc Triều Âm', desc: 'Vỏ ốc lắng nghe tiếng sóng rì rào gần miếu thờ.', val: 15, x: 20.0, z: 9.8 },
      { id: 'conch_coast_3', type: 'sea_conch', name: 'Ngọc Trai Cầu Cảng', desc: 'Viên ngọc trai bí mật giấu ở đầu cầu tàu của Xuân Minh.', val: 20, x: -2.5, z: 8.5 },

      // 4. New Year Fireworks Embers (2)
      { id: 'ember_fest_1', type: 'firework_ember', name: 'Tàn Pháo Hoa Giao Thừa', desc: 'Tàn lửa phép thuật bốc cháy rực rỡ từ khẩu pháo của Khải Vạn.', val: 30, x: 14.5, z: -3.5 },
      { id: 'ember_fest_2', type: 'firework_ember', name: 'Tia Lửa Hải Đăng', desc: 'Tinh thể ánh sáng bảo hộ lấy từ đỉnh ngọn hải đăng của Anh Thư.', val: 30, x: 23.0, z: 18.5 },
    ];

    const items: CollectibleItem[] = [];

    rawDefs.forEach((def) => {
      const elev = passabilityGrid.getElevationAt(def.x, def.z);
      const pos = new THREE.Vector3(def.x, elev, def.z);
      const mesh = this.createCollectibleMesh(def.type);
      mesh.position.copy(pos);
      scene.add(mesh);

      items.push({
        id: def.id,
        type: def.type,
        name: def.name,
        description: def.desc,
        value: def.val,
        position: pos.clone(),
        spawnPosition: pos.clone(),
        mesh,
        collected: false,
        respawnTimer: 0,
      });
    });

    return items;
  }
}
