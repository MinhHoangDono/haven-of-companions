import * as THREE from 'three';
import { Character } from '../../types/character';

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
}

export class CharacterMeshBuilder {
  public static buildCharacter(character: Character, scene: THREE.Scene): CharacterMeshHandle {
    const group = new THREE.Group();
    scene.add(group);

    // Coordinate mapping for all 9 characters across the 3 diorama tiers
    let posX = 0;
    let posZ = 0;
    let baseY = 0.9;
    let rotationY = 0;
    let emoji = '⚔️';
    let accentColor = '#ffd700';
    let pedestalColor = 0xffffff;

    switch (character.id) {
      // 1. Huỳnh Trần Anh Thi – The Wilderness Druid (Highlands Hearth)
      case 'anh-thi-druid':
        posX = -2.8;
        posZ = -3.0;
        baseY = 1.8;
        rotationY = Math.PI * 0.3;
        emoji = '🌿';
        accentColor = '#38d976';
        pedestalColor = 0x22ee66;
        break;

      // 2. Lê Nguyễn Phương Quỳnh – The Elven Ranger (Highlands Overlook)
      case 'phuong-quynh-ranger':
        posX = -4.8;
        posZ = -1.2;
        baseY = 1.8;
        rotationY = Math.PI * 0.45;
        emoji = '🏹';
        accentColor = '#69db7c';
        pedestalColor = 0x40c057;
        break;

      // 3. Trần Nguyễn Trâm Anh – The Lore Bard (Town Square Stage)
      case 'tram-anh-bard':
        posX = 2.4;
        posZ = -4.0;
        baseY = 0.9;
        rotationY = -Math.PI * 0.65;
        emoji = '🪕';
        accentColor = '#f06595';
        pedestalColor = 0xe64980;
        break;

      // 4. Nguyễn Khải Vạn – The Pyromancy Sorcerer (Mortar Battery)
      case 'khai-van-sorcerer':
        posX = 4.2;
        posZ = -1.5;
        baseY = 0.9;
        rotationY = -Math.PI * 0.5;
        emoji = '🔥';
        accentColor = '#ff922b';
        pedestalColor = 0xfd7e14;
        break;

      // 5. Nguyễn Trần Thảo Uyên – Cleric of the Light (Plaza Steps)
      case 'thao-uyen-cleric':
        posX = 0.8;
        posZ = -1.2;
        baseY = 0.9;
        rotationY = Math.PI * 0.25;
        emoji = '✨';
        accentColor = '#ffd43b';
        pedestalColor = 0xfcc419;
        break;

      // 6. Nguyễn Thị Ngọc Hà – Way of the Kensei Monk (Tatami Pavilion)
      // 6. Nguyễn Thị Ngọc Hà – Way of the Kensei Monk (Seaside Pier by the Waves)
      case 'ngoc-ha-monk':
        posX = -0.5;
        posZ = 4.8;
        baseY = 0.15;
        rotationY = -Math.PI * 0.2;
        emoji = '🥋';
        accentColor = '#20c997';
        pedestalColor = 0x12b886;
        break;

      // 7. Phạm Trần Thanh Phương – Ronin / Paladin (Pier Entrance)
      case 'thanh-phuong-paladin':
        posX = 0.5;
        posZ = 2.4;
        baseY = 0.25;
        rotationY = -Math.PI * 0.25;
        emoji = '🛡️';
        accentColor = '#4dabf7';
        pedestalColor = 0x339af0;
        break;

      // 8. Phạm Xuân Minh – Swashbuckler Rogue (Ship Gangway)
      case 'xuan-minh-rogue':
        posX = 2.6;
        posZ = 4.2;
        baseY = 0.25;
        rotationY = -Math.PI * 0.7;
        emoji = '⚔️';
        accentColor = '#ff6b6b';
        pedestalColor = 0xfa5252;
        break;

      // 9. Lâm Anh Thư – Ocean Cleric (Tidal Rocks in Ocean Surf)
      case 'anh-thu-cleric':
        posX = 5.0;
        posZ = 5.2;
        baseY = 0.05;
        rotationY = -Math.PI * 0.45;
        emoji = '🌊';
        accentColor = '#22b8cf';
        pedestalColor = 0x15aabf;
        break;
    }

    group.position.set(posX, baseY, posZ);
    group.rotation.y = rotationY;
    group.userData = { interactiveId: character.id, interactiveType: 'character' };

    // 1. Glowing Hero Runic Pedestal on ground
    const pedestalGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32);
    const pedestalMat = new THREE.MeshBasicMaterial({
      color: pedestalColor,
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

    // 2. Build Sculpted Humanoid Character Model
    const animatedMesh = this.buildClassModel(character.id, group);

    // 3. Floating In-World Nameplate Billboard Sprite
    const nameplateSprite = this.createNameplateSprite(
      character.name,
      character.classTitle,
      emoji,
      accentColor
    );
    nameplateSprite.position.set(0, 2.35, 0);
    group.add(nameplateSprite);

    // 4. Large Touch Raycast Click Target
    const hitGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.5, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 1.25;
    hitMesh.userData = { interactiveId: character.id, interactiveType: 'character' };
    group.add(hitMesh);

    const homeX = posX;
    const homeZ = posZ;
    let targetX = posX;
    let targetZ = posZ;
    let isMoving = false;
    let walkCycle = 0;
    let idleTimer = Math.random() * 5.0;

    return {
      id: character.id,
      character,
      group,
      pedestalMesh,
      nameplateSprite,
      baseY,
      moveTo: (x: number, z: number) => {
        targetX = THREE.MathUtils.clamp(x, -7.5, 7.5);
        targetZ = THREE.MathUtils.clamp(z, -7.5, 6.5);
        isMoving = true;
      },
      update: (dt: number, time: number, isSelected: boolean, hopProgress: number) => {
        if (isMoving) {
          const dx = targetX - group.position.x;
          const dz = targetZ - group.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 0.08) {
            const speed = 2.4;
            const step = Math.min(dist, speed * dt);
            group.position.x += (dx / dist) * step;
            group.position.z += (dz / dist) * step;
            group.rotation.y = Math.atan2(dx, dz);

            walkCycle += dt * 12;
            const stepBob = Math.abs(Math.sin(walkCycle)) * 0.08;
            group.position.y = baseY + stepBob;
          } else {
            isMoving = false;
            group.position.x = targetX;
            group.position.z = targetZ;
            group.rotation.y = rotationY;
          }
        } else {
          // Breathing bob
          const bob = Math.sin(time * 0.003 + homeX) * 0.04;
          let hop = 0;
          if (hopProgress > 0) {
            hop = Math.sin(hopProgress * Math.PI) * 0.45;
          }
          group.position.y = baseY + bob + hop;

          // Ambient village wandering (only if not selected and idle for > 8s)
          if (!isSelected) {
            idleTimer += dt;
            if (idleTimer > 9.0 + Math.random() * 5.0) {
              idleTimer = 0;
              const wanderAngle = Math.random() * Math.PI * 2;
              const wanderDist = 0.5 + Math.random() * 0.6;
              targetX = homeX + Math.cos(wanderAngle) * wanderDist;
              targetZ = homeZ + Math.sin(wanderAngle) * wanderDist;
              isMoving = true;
            }
          }
        }

        // Pedestal glow pulse
        const pulse = Math.sin(time * 0.005) * 0.15;
        pedestalMat.opacity = isSelected ? 0.95 : 0.6 + pulse;
        ringMat.opacity = isSelected ? 1.0 : 0;

        // Animated item pulse if available
        if (animatedMesh) {
          const m = animatedMesh.material as THREE.MeshStandardMaterial;
          if (m.emissive) {
            m.emissiveIntensity = 0.8 + Math.sin(time * 0.008) * 0.4;
          }
        }
      },
      getHeadWorldPosition: () => {
        const headPos = new THREE.Vector3();
        group.getWorldPosition(headPos);
        headPos.y += 2.0;
        return headPos;
      },
    };
  }

  /**
   * Helper that dispatches to the correct class humanoid model
   */
  public static buildClassModel(id: string, group: THREE.Group): THREE.Mesh | null {
    switch (id) {
      case 'anh-thi-druid':
        return this.buildDruid(group);
      case 'phuong-quynh-ranger':
        return this.buildRanger(group);
      case 'tram-anh-bard':
        return this.buildBard(group);
      case 'khai-van-sorcerer':
        return this.buildSorcerer(group);
      case 'thao-uyen-cleric':
        return this.buildCleric(group);
      case 'ngoc-ha-monk':
        return this.buildMonk(group);
      case 'thanh-phuong-paladin':
        return this.buildPaladin(group);
      case 'xuan-minh-rogue':
        return this.buildRogue(group);
      case 'anh-thu-cleric':
        return this.buildOceanCleric(group);
      default:
        return this.buildDruid(group);
    }
  }

  /**
   * Shared Humanoid Base Generator (Boots, Torso, Arms, Head)
   */
  private static buildHumanoidBase(
    group: THREE.Group,
    skinColor = 0xfbd2b0,
    legsColor = 0x333333,
    tunicColor = 0xf4ecd8
  ) {
    const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    const matLegs = new THREE.MeshStandardMaterial({ color: legsColor, roughness: 0.7 });
    const matTunic = new THREE.MeshStandardMaterial({ color: tunicColor, roughness: 0.6 });

    // Legs & Boots
    [-0.14, 0.14].forEach((lx) => {
      const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 8);
      const leg = new THREE.Mesh(legGeo, matLegs);
      leg.position.set(lx, 0.35, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    // Lower Body / Tunic
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.36, 0.65, 8);
    const body = new THREE.Mesh(bodyGeo, matTunic);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    // Torso Chest
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.45, 8);
    const torso = new THREE.Mesh(torsoGeo, matTunic);
    torso.position.y = 1.15;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 1.52;
    head.castShadow = true;
    group.add(head);

    return { matSkin, matTunic, head };
  }

  // 1. Huỳnh Trần Anh Thi – The Wilderness Druid
  private static buildDruid(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x54361e, 0xf4ecd8);
    const matMantle = new THREE.MeshStandardMaterial({ color: 0x226b38, roughness: 0.5 });
    const matHair = new THREE.MeshStandardMaterial({ color: 0x3b2214, roughness: 0.8 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x4a301a, roughness: 0.8 });
    const matOrb = new THREE.MeshStandardMaterial({
      color: 0x33ff77,
      emissive: 0x22cc55,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // Cape
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.95, 0.08), matMantle);
    cape.position.set(0, 0.95, -0.16);
    cape.rotation.x = -0.12;
    group.add(cape);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), matHair);
    hair.position.set(0, 1.56, -0.04);
    group.add(hair);

    // Staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 1.85, 8), matWood);
    staff.position.set(0.42, 0.95, 0.35);
    staff.castShadow = true;
    group.add(staff);

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matOrb);
    orb.position.set(0.42, 1.9, 0.35);
    group.add(orb);

    return orb;
  }

  // 2. Lê Nguyễn Phương Quỳnh – The Elven Ranger
  private static buildRanger(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x2e482e, 0x3d6a3d);
    const matLeather = new THREE.MeshStandardMaterial({ color: 0x6e4a2e, roughness: 0.7 });
    const matBow = new THREE.MeshStandardMaterial({ color: 0x8a5528, roughness: 0.6 });
    const matFeather = new THREE.MeshStandardMaterial({ color: 0xe0d6b5, roughness: 0.5 });

    // Quiver on Back
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.7, 8), matLeather);
    quiver.position.set(-0.16, 1.15, -0.18);
    quiver.rotation.z = -0.3;
    group.add(quiver);

    // Recurve Longbow in Hand
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.025, 8, 20, Math.PI * 0.9), matBow);
    bow.position.set(0.38, 1.1, 0.2);
    bow.rotation.y = Math.PI * 0.4;
    group.add(bow);

    // Scout Headband with Feather
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 5), matFeather);
    feather.position.set(-0.16, 1.68, 0);
    feather.rotation.z = 0.5;
    group.add(feather);

    return bow;
  }

  // 3. Trần Nguyễn Trâm Anh – The Lore Bard
  private static buildBard(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x4a182e, 0x8a244c);
    const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x6e3b1c, roughness: 0.5 });
    const matBeret = new THREE.MeshStandardMaterial({ color: 0xb52b5b, roughness: 0.7 });

    // Bardic Feathered Beret
    const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.1, 12), matBeret);
    beret.position.set(0.04, 1.68, 0);
    beret.rotation.z = 0.15;
    group.add(beret);

    // Golden Lute in Hands
    const luteGroup = new THREE.Group();
    luteGroup.position.set(0.15, 1.1, 0.25);
    luteGroup.rotation.z = 0.4;

    const luteBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), matWood);
    luteBody.scale.set(1, 1.4, 0.5);
    luteGroup.add(luteBody);

    const luteNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), matGold);
    luteNeck.position.y = 0.45;
    luteGroup.add(luteNeck);
    group.add(luteGroup);

    return luteBody;
  }

  // 4. Nguyễn Khải Vạn – The Pyromancy Sorcerer
  private static buildSorcerer(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x4a1515, 0xb82e1f);
    const matHat = new THREE.MeshStandardMaterial({ color: 0x221528, roughness: 0.6 });
    const matFire = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff6600,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });

    // Pointed Sorcerer Hat
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 12), matHat);
    brim.position.y = 1.62;
    group.add(brim);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 10), matHat);
    cone.position.set(0, 1.88, -0.05);
    cone.rotation.x = -0.15;
    group.add(cone);

    // Floating Fireball in Hand
    const fireball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matFire);
    fireball.position.set(0.36, 1.15, 0.32);
    group.add(fireball);

    return fireball;
  }

  // 5. Nguyễn Trần Thảo Uyên – Cleric of the Light
  private static buildCleric(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x8a7230, 0xfaf3dc);
    const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 });
    const matHalo = new THREE.MeshStandardMaterial({
      color: 0xfff0aa,
      emissive: 0xffe066,
      emissiveIntensity: 0.9,
    });

    // Radiant Sun Halo floating behind head
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 24), matHalo);
    halo.position.set(0, 1.6, -0.15);
    group.add(halo);

    // Golden Healing Chalice / Scepter
    const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), matGold);
    scepter.position.set(0.35, 1.1, 0.2);
    group.add(scepter);

    const chalice = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.15, 8), matGold);
    chalice.position.set(0.35, 1.65, 0.2);
    group.add(chalice);

    return chalice;
  }

  // 6. Nguyễn Thị Ngọc Hà – Way of the Kensei Monk
  private static buildMonk(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x16382c, 0xf0f7f4);
    const matBelt = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const matWood = new THREE.MeshStandardMaterial({ color: 0x82542a, roughness: 0.6 });

    // Black Obi Sash
    const obi = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 10), matBelt);
    obi.position.y = 0.95;
    group.add(obi);

    // Dual Bokken / Wooden Practice Blades
    [-0.28, 0.28].forEach((bx) => {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 0.03), matWood);
      blade.position.set(bx, 0.75, -0.1);
      blade.rotation.x = -0.4;
      group.add(blade);
    });

    return obi;
  }

  // 7. Phạm Trần Thanh Phương – The Ronin / Paladin Guardian
  private static buildPaladin(group: THREE.Group): THREE.Mesh {
    const matSteel = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85, roughness: 0.25 });
    const matNavy = new THREE.MeshStandardMaterial({ color: 0x142c4c, metalness: 0.6, roughness: 0.4 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.9, roughness: 0.2 });
    const matBlade = new THREE.MeshStandardMaterial({ color: 0xeef2f7, metalness: 0.95, roughness: 0.1 });

    this.buildHumanoidBase(group, 0xfbd2b0, 0x142c4c, 0xcfd8dc);

    // Kabuto Helm with Golden Crescent Horn
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), matSteel);
    helm.position.y = 1.55;
    group.add(helm);

    const horn = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 20, Math.PI * 0.85), matGold);
    horn.rotation.x = Math.PI / 2;
    horn.rotation.z = -Math.PI * 0.42;
    horn.position.set(0, 1.78, 0.1);
    group.add(horn);

    // Towering Kite Shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.95, 0.06), matNavy);
    shield.position.set(-0.35, 1.05, 0.25);
    group.add(shield);

    // Drawn Katana
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.02), matBlade);
    sword.position.set(0.36, 0.75, 0.2);
    group.add(sword);

    return sword;
  }

  // 8. Phạm Xuân Minh – The Swashbuckler Rogue
  private static buildRogue(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x222222, 0x8a2b2b);
    const matHat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const matSteel = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.2 });

    // Pirate Tricorn Hat
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.12, 3), matHat);
    hat.position.y = 1.66;
    group.add(hat);

    // Dueling Rapier
    const rapier = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6), matSteel);
    rapier.position.set(0.38, 0.8, 0.2);
    rapier.rotation.x = 0.3;
    group.add(rapier);

    // Shiny Gold Doubloon Coin in Hand
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), matGold);
    coin.position.set(-0.25, 1.15, 0.25);
    coin.rotation.x = Math.PI / 2;
    group.add(coin);

    return coin;
  }

  // 9. Lâm Anh Thư – The Ocean Cleric
  private static buildOceanCleric(group: THREE.Group): THREE.Mesh {
    this.buildHumanoidBase(group, 0xfbd2b0, 0x134e70, 0x3882ab);
    const matCyan = new THREE.MeshStandardMaterial({
      color: 0x44ddff,
      emissive: 0x2288cc,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const matCoral = new THREE.MeshStandardMaterial({ color: 0xf08080, roughness: 0.5 });

    // Coral Headdress
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 12), matCoral);
    crown.position.set(0, 1.65, 0);
    crown.rotation.x = Math.PI / 2;
    group.add(crown);

    // Sacred Tidal Bell Trident
    const trident = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), matCyan);
    trident.position.set(0.36, 0.95, 0.25);
    group.add(trident);

    return trident;
  }

  /**
   * Generates a stylized floating 3D Nameplate badge
   */
  private static createNameplateSprite(
    name: string,
    classTitle: string,
    emoji: string,
    accentColor: string
  ): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Rounded pill container
      ctx.fillStyle = 'rgba(12, 16, 26, 0.92)';
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 5;

      const r = 24;
      const x = 8;
      const y = 8;
      const w = 512 - 16;
      const h = 128 - 16;

      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Emoji Badge circle
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 60, 64);

      // Character Name
      ctx.font = 'bold 34px "Cinzel", "Times New Roman", serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(name, 115, 48);

      // Class Subtitle
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText(classTitle.toUpperCase(), 118, 86);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.6, 1);
    return sprite;
  }
}
