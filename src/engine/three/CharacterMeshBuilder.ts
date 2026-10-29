import * as THREE from 'three';
import { Character } from '../../types/character';

export interface CharacterMeshHandle {
  id: string;
  character: Character;
  group: THREE.Group;
  pedestalMesh: THREE.Mesh;
  nameplateSprite: THREE.Sprite;
  baseY: number;
  update: (time: number, isSelected: boolean, hopProgress: number) => void;
  getHeadWorldPosition: () => THREE.Vector3;
}

export class CharacterMeshBuilder {
  public static buildCharacter(character: Character, scene: THREE.Scene): CharacterMeshHandle {
    const group = new THREE.Group();
    scene.add(group);

    // Open, prominent coordinates in the 3D diorama:
    // Thi @ Highlands clifftop clearing: (-2.8, 1.8, -3.0)
    // Phuong @ Coastal pier entrance: (0.5, 0.25, 2.4)
    let posX = -2.8;
    let posZ = -3.0;
    let baseY = 1.8;

    if (character.id === 'thanh-phuong-paladin') {
      posX = 0.5;
      posZ = 2.4;
      baseY = 0.25;
    }

    group.position.set(posX, baseY, posZ);
    group.userData = { interactiveId: character.id, interactiveType: 'character' };

    // 1. Glowing Hero Runic Pedestal on ground
    const pedestalGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 32);
    const pedestalMat = new THREE.MeshBasicMaterial({
      color: character.id === 'anh-thi-druid' ? 0x22ee66 : 0x33aaff,
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

    // 2. Build Sculpted Humanoid Hero
    let staffOrbMesh: THREE.Mesh | null = null;

    if (character.id === 'anh-thi-druid') {
      staffOrbMesh = this.buildDruidHero(group);
      group.rotation.y = Math.PI * 0.3; // Face viewer / plaza
    } else {
      this.buildPaladinHero(group);
      group.rotation.y = -Math.PI * 0.25; // Face viewer / docks
    }

    // 3. Floating In-World Nameplate Billboard Sprite
    const nameplateSprite = this.createNameplateSprite(
      character.name,
      character.classTitle,
      character.id === 'anh-thi-druid' ? '🌿' : '🛡️',
      character.id === 'anh-thi-druid' ? '#38d976' : '#4dabf7'
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

    return {
      id: character.id,
      character,
      group,
      pedestalMesh,
      nameplateSprite,
      baseY,
      update: (time: number, isSelected: boolean, hopProgress: number) => {
        // Idle breathing bob
        const bob = Math.sin(time * 0.003 + (character.id === 'anh-thi-druid' ? 0 : 2)) * 0.04;
        let hop = 0;
        if (hopProgress > 0) {
          hop = Math.sin(hopProgress * Math.PI) * 0.45;
        }

        group.position.y = baseY + bob + hop;

        // Pedestal glow pulse
        const pulse = Math.sin(time * 0.005) * 0.15;
        pedestalMat.opacity = isSelected ? 0.95 : 0.6 + pulse;
        ringMat.opacity = isSelected ? 1.0 : 0;

        // Staff orb magic pulse for Thi
        if (staffOrbMesh) {
          const orbMat = staffOrbMesh.material as THREE.MeshStandardMaterial;
          orbMat.emissiveIntensity = 0.8 + Math.sin(time * 0.008) * 0.4;
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
      ctx.font = 'bold 36px "Cinzel", "Times New Roman", serif';
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

  /**
   * Huỳnh Trần Anh Thi – The Wilderness Druid
   * Sculpted humanoid model with ivory tunic, emerald mantle, brunette hair, and druid staff
   */
  private static buildDruidHero(group: THREE.Group): THREE.Mesh {
    const matSkin = new THREE.MeshStandardMaterial({ color: 0xfbd2b0, roughness: 0.6 });
    const matHair = new THREE.MeshStandardMaterial({ color: 0x3b2214, roughness: 0.8 }); // Dark brunette
    const matTunic = new THREE.MeshStandardMaterial({ color: 0xf4ecd8, roughness: 0.6 }); // Ivory tunic
    const matMantle = new THREE.MeshStandardMaterial({ color: 0x226b38, roughness: 0.5 }); // Emerald cape
    const matLeather = new THREE.MeshStandardMaterial({ color: 0x54361e, roughness: 0.7 }); // Leather belt/boots
    const matGold = new THREE.MeshStandardMaterial({ color: 0xdfa642, metalness: 0.7, roughness: 0.3 });
    const matStaff = new THREE.MeshStandardMaterial({ color: 0x4a301a, roughness: 0.8 });
    const matOrb = new THREE.MeshStandardMaterial({
      color: 0x33ff77,
      emissive: 0x22cc55,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // 1. Legs & Leather Boots
    [-0.14, 0.14].forEach((lx) => {
      const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 8);
      const leg = new THREE.Mesh(legGeo, matLeather);
      leg.position.set(lx, 0.35, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    // 2. Ivory Tunic / Robe Dress
    const dressGeo = new THREE.CylinderGeometry(0.24, 0.38, 0.7, 10);
    const dress = new THREE.Mesh(dressGeo, matTunic);
    dress.position.y = 0.75;
    dress.castShadow = true;
    group.add(dress);

    // Gold filigree belt with herb pouch
    const beltGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 10);
    const belt = new THREE.Mesh(beltGeo, matGold);
    belt.position.y = 0.95;
    group.add(belt);

    const pouchGeo = new THREE.BoxGeometry(0.12, 0.14, 0.1);
    const pouch = new THREE.Mesh(pouchGeo, matLeather);
    pouch.position.set(0.24, 0.9, 0.12);
    group.add(pouch);

    // 3. Torso & Shoulders
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.45, 8);
    const torso = new THREE.Mesh(torsoGeo, matTunic);
    torso.position.y = 1.15;
    torso.castShadow = true;
    group.add(torso);

    // 4. Emerald Druid Cape / Mantle flowing behind
    const capeGeo = new THREE.BoxGeometry(0.5, 0.95, 0.08);
    const cape = new THREE.Mesh(capeGeo, matMantle);
    cape.position.set(0, 0.95, -0.16);
    cape.rotation.x = -0.12;
    cape.castShadow = true;
    group.add(cape);

    // Mantle shoulder cowl
    const cowlGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.18, 10);
    const cowl = new THREE.Mesh(cowlGeo, matMantle);
    cowl.position.y = 1.35;
    cowl.castShadow = true;
    group.add(cowl);

    // 5. Head, Face & Brunette Hair
    const headGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 1.52;
    head.castShadow = true;
    group.add(head);

    // Flowing wavy hair
    const hairTopGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const hairTop = new THREE.Mesh(hairTopGeo, matHair);
    hairTop.position.set(0, 1.56, -0.04);
    group.add(hairTop);

    const hairBackGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.45, 8);
    const hairBack = new THREE.Mesh(hairBackGeo, matHair);
    hairBack.position.set(0, 1.36, -0.14);
    hairBack.rotation.x = -0.2;
    group.add(hairBack);

    // Druid Headband with Emerald Gem
    const bandGeo = new THREE.TorusGeometry(0.17, 0.02, 6, 16);
    const band = new THREE.Mesh(bandGeo, matGold);
    band.position.set(0, 1.55, 0);
    band.rotation.x = Math.PI / 2;
    group.add(band);

    const gemGeo = new THREE.DodecahedronGeometry(0.04);
    const gem = new THREE.Mesh(gemGeo, matOrb);
    gem.position.set(0, 1.56, 0.17);
    group.add(gem);

    // 6. Right Arm holding Wooden Druid Staff
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.5, 6);
    const armRight = new THREE.Mesh(armGeo, matTunic);
    armRight.position.set(0.3, 1.15, 0.15);
    armRight.rotation.x = 0.4;
    group.add(armRight);

    // Wooden Staff
    const staffGeo = new THREE.CylinderGeometry(0.035, 0.03, 1.85, 8);
    const staff = new THREE.Mesh(staffGeo, matStaff);
    staff.position.set(0.42, 0.95, 0.35);
    staff.castShadow = true;
    group.add(staff);

    // Staff top gnarled branches holding glowing magical orb
    const staffOrb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matOrb);
    staffOrb.position.set(0.42, 1.9, 0.35);
    group.add(staffOrb);

    return staffOrb;
  }

  /**
   * Phạm Trần Thanh Phương – The Ronin / Paladin Guardian (she/her)
   * Sculpted paladin knight with steel armor, golden crescent kabuto, kite shield, and sword
   */
  private static buildPaladinHero(group: THREE.Group) {
    const matSteel = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.85,
      roughness: 0.25,
    });
    const matNavyPlate = new THREE.MeshStandardMaterial({
      color: 0x142c4c,
      metalness: 0.6,
      roughness: 0.4,
    });
    const matGoldTrim = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.9,
      roughness: 0.2,
    });
    const matRoyalCape = new THREE.MeshStandardMaterial({
      color: 0x184282,
      roughness: 0.5,
    });
    const matBlade = new THREE.MeshStandardMaterial({
      color: 0xeef2f7,
      metalness: 0.95,
      roughness: 0.1,
    });

    // 1. Armored Greaves & Sabatons
    [-0.16, 0.16].forEach((lx) => {
      const legGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.7, 8);
      const leg = new THREE.Mesh(legGeo, matSteel);
      leg.position.set(lx, 0.35, 0);
      leg.castShadow = true;
      group.add(leg);

      const kneeGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const knee = new THREE.Mesh(kneeGeo, matGoldTrim);
      knee.position.set(lx, 0.5, 0.1);
      group.add(knee);
    });

    // 2. Armored Faulds & Tassets (Lacquered Skirt)
    const tassetGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.45, 8);
    const tassets = new THREE.Mesh(tassetGeo, matNavyPlate);
    tassets.position.y = 0.75;
    tassets.castShadow = true;
    group.add(tassets);

    // 3. Silver Steel Cuirass (Breastplate)
    const chestGeo = new THREE.BoxGeometry(0.46, 0.48, 0.3);
    const chest = new THREE.Mesh(chestGeo, matSteel);
    chest.position.y = 1.15;
    chest.castShadow = true;
    group.add(chest);

    // Golden lion crest plaque on chest
    const plaqueGeo = new THREE.BoxGeometry(0.2, 0.22, 0.32);
    const plaque = new THREE.Mesh(plaqueGeo, matGoldTrim);
    plaque.position.set(0, 1.18, 0.02);
    group.add(plaque);

    // 4. Large Curved Shoulder Pauldrons (Sode)
    [-0.32, 0.32].forEach((px) => {
      const pGeo = new THREE.BoxGeometry(0.2, 0.24, 0.26);
      const p = new THREE.Mesh(pGeo, matNavyPlate);
      p.position.set(px, 1.34, 0);
      p.castShadow = true;
      group.add(p);

      const trimGeo = new THREE.BoxGeometry(0.22, 0.06, 0.28);
      const trim = new THREE.Mesh(trimGeo, matGoldTrim);
      trim.position.set(px, 1.44, 0);
      group.add(trim);
    });

    // 5. Flowing Royal-Navy Paladin Cape
    const capeGeo = new THREE.BoxGeometry(0.58, 1.05, 0.08);
    const cape = new THREE.Mesh(capeGeo, matRoyalCape);
    cape.position.set(0, 0.95, -0.2);
    cape.rotation.x = -0.15;
    cape.castShadow = true;
    group.add(cape);

    // 6. Knight Kabuto Helm with Golden Crescent Horn Crest
    const helmGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const helm = new THREE.Mesh(helmGeo, matSteel);
    helm.position.y = 1.55;
    helm.castShadow = true;
    group.add(helm);

    // Visor slit
    const visorGeo = new THREE.BoxGeometry(0.22, 0.05, 0.08);
    const visor = new THREE.Mesh(visorGeo, matGoldTrim);
    visor.position.set(0, 1.54, 0.16);
    group.add(visor);

    // Majestic Golden Crescent Horn Crest (Wakidate / Horn)
    const hornGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 20, Math.PI * 0.85);
    const horn = new THREE.Mesh(hornGeo, matGoldTrim);
    horn.rotation.x = Math.PI / 2;
    horn.rotation.z = -Math.PI * 0.42;
    horn.position.set(0, 1.78, 0.1);
    group.add(horn);

    // 7. Left Arm holding Towering Kite Shield
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.35, 1.05, 0.25);

    const shieldBodyGeo = new THREE.BoxGeometry(0.52, 0.95, 0.06);
    const shieldBody = new THREE.Mesh(shieldBodyGeo, matNavyPlate);
    shieldBody.castShadow = true;
    shieldGroup.add(shieldBody);

    const shieldRimGeo = new THREE.BoxGeometry(0.56, 0.99, 0.04);
    const shieldRim = new THREE.Mesh(shieldRimGeo, matGoldTrim);
    shieldRim.position.z = 0.02;
    shieldGroup.add(shieldRim);

    // Heraldic Cross on Shield
    const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.05), matGoldTrim);
    crossVert.position.z = 0.04;
    shieldGroup.add(crossVert);

    const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.05), matGoldTrim);
    crossHoriz.position.set(0, 0.15, 0.04);
    shieldGroup.add(crossHoriz);

    group.add(shieldGroup);

    // 8. Right Hand holding Gleaming Katana / Broadsword
    const swordGroup = new THREE.Group();
    swordGroup.position.set(0.36, 1.0, 0.2);

    const bladeGeo = new THREE.BoxGeometry(0.06, 0.9, 0.02);
    const blade = new THREE.Mesh(bladeGeo, matBlade);
    blade.position.y = -0.25;
    blade.castShadow = true;
    swordGroup.add(blade);

    const guardGeo = new THREE.BoxGeometry(0.16, 0.04, 0.08);
    const guard = new THREE.Mesh(guardGeo, matGoldTrim);
    guard.position.y = 0.22;
    swordGroup.add(guard);

    const hiltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.24, 6);
    const hilt = new THREE.Mesh(hiltGeo, matRoyalCape);
    hilt.position.y = 0.35;
    swordGroup.add(hilt);

    group.add(swordGroup);
  }
}
