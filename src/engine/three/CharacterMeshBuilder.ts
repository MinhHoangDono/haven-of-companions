import * as THREE from 'three';
import { Character } from '../../types/character';

export interface CharacterMeshHandle {
  id: string;
  character: Character;
  group: THREE.Group;
  selectionRing: THREE.Mesh;
  baseY: number;
  update: (time: number, isSelected: boolean, hopProgress: number) => void;
  getHeadWorldPosition: () => THREE.Vector3;
}

export class CharacterMeshBuilder {
  public static buildCharacter(character: Character, scene: THREE.Scene): CharacterMeshHandle {
    const group = new THREE.Group();
    scene.add(group);

    // Coordinate mapping into the 3D diorama
    // Thi @ Highlands hearth: (-3.5, 1.8, -4.0)
    // Phuong @ Harbor Armory: (3.2, 0.3, 1.8)
    let posX = -3.5;
    let posZ = -4.0;
    let baseY = 1.8;

    if (character.id === 'thanh-phuong-paladin') {
      posX = 3.2;
      posZ = 1.8;
      baseY = 0.3;
    }

    group.position.set(posX, baseY, posZ);
    group.userData = { interactiveId: character.id, interactiveType: 'character' };

    // Selection Ring (gold circle on ground)
    const ringGeo = new THREE.RingGeometry(0.38, 0.44, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xdfa642,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.02;
    group.add(selectionRing);

    // Build unique class model
    if (character.id === 'anh-thi-druid') {
      this.buildDruid(group);
      group.rotation.y = Math.PI * 0.25; // Face SE toward plaza
    } else {
      this.buildPaladin(group);
      group.rotation.y = -Math.PI * 0.75; // Face SW toward harbor
    }

    // Touch Raycast Click Target (invisible capsule)
    const hitGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 0.7;
    hitMesh.userData = { interactiveId: character.id, interactiveType: 'character' };
    group.add(hitMesh);

    return {
      id: character.id,
      character,
      group,
      selectionRing,
      baseY,
      update: (time: number, isSelected: boolean, hopProgress: number) => {
        // Breathing bob
        const bob = Math.sin(time * 0.003 + (character.id === 'anh-thi-druid' ? 0 : 2)) * 0.035;
        let hop = 0;
        if (hopProgress > 0) {
          hop = Math.sin(hopProgress * Math.PI) * 0.35;
        }

        group.position.y = baseY + bob + hop;

        // Selection ring visibility
        (selectionRing.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.9 : 0;
      },
      getHeadWorldPosition: () => {
        const headPos = new THREE.Vector3();
        group.getWorldPosition(headPos);
        headPos.y += 1.4; // Top of character head
        return headPos;
      },
    };
  }

  /**
   * Huỳnh Trần Anh Thi – The Wilderness Druid
   */
  private static buildDruid(group: THREE.Group) {
    const matRobe = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, // Royal Amethyst Violet (contrasts sharply with green pine trees)
      roughness: 0.8,
    });

    const matHood = new THREE.MeshStandardMaterial({
      color: 0x5b21b6,
      roughness: 0.75,
    });

    const matSkin = new THREE.MeshStandardMaterial({
      color: 0xfbd9b8,
      roughness: 0.6,
    });

    const matWood = new THREE.MeshStandardMaterial({
      color: 0x54361e,
      roughness: 0.8,
    });

    const matLeaf = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });

    // Robe lower body (cone)
    const robeGeo = new THREE.ConeGeometry(0.32, 0.75, 8);
    const robe = new THREE.Mesh(robeGeo, matRobe);
    robe.position.y = 0.38;
    robe.castShadow = true;
    group.add(robe);

    // Torso & Cloak
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.35, 8);
    const torso = new THREE.Mesh(torsoGeo, matRobe);
    torso.position.y = 0.72;
    torso.castShadow = true;
    group.add(torso);

    // Head / Face
    const headGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 0.96;
    head.castShadow = true;
    group.add(head);

    // Druid Hood Cowl
    const hoodGeo = new THREE.ConeGeometry(0.22, 0.3, 8);
    const hood = new THREE.Mesh(hoodGeo, matHood);
    hood.position.y = 1.05;
    hood.rotation.x = -0.2;
    hood.castShadow = true;
    group.add(hood);

    // Wooden Druid Staff
    const staffGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 6);
    const staff = new THREE.Mesh(staffGeo, matWood);
    staff.position.set(0.28, 0.6, 0.15);
    staff.rotation.z = -0.1;
    staff.castShadow = true;
    group.add(staff);

    // Sprouting Leaf bud on staff top
    const crystalGeo = new THREE.DodecahedronGeometry(0.1);
    const crystal = new THREE.Mesh(crystalGeo, matLeaf);
    crystal.position.set(0.35, 1.25, 0.15);
    group.add(crystal);
  }

  /**
   * Phạm Trần Thanh Phương – The Ronin / Paladin Guardian (she/her)
   */
  private static buildPaladin(group: THREE.Group) {
    const matArmor = new THREE.MeshStandardMaterial({
      color: 0x1f3c66, // Dark azure lacquer
      roughness: 0.45,
      metalness: 0.6,
    });

    const matGoldTrim = new THREE.MeshStandardMaterial({
      color: 0xdfa642,
      roughness: 0.3,
      metalness: 0.8,
    });

    const matShieldBlue = new THREE.MeshStandardMaterial({
      color: 0x18345c,
      roughness: 0.4,
      metalness: 0.5,
    });

    const matDarkIron = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.5,
      metalness: 0.7,
    });

    // Armored Skirt / Tassets
    const legsGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.65, 8);
    const legs = new THREE.Mesh(legsGeo, matArmor);
    legs.position.y = 0.33;
    legs.castShadow = true;
    group.add(legs);

    // Breastplate Torso
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.4, 0.24);
    const torso = new THREE.Mesh(torsoGeo, matArmor);
    torso.position.y = 0.75;
    torso.castShadow = true;
    group.add(torso);

    // Gold Chest Crest Trim
    const trimGeo = new THREE.BoxGeometry(0.4, 0.06, 0.26);
    const trim = new THREE.Mesh(trimGeo, matGoldTrim);
    trim.position.y = 0.82;
    group.add(trim);

    // Curved Shoulder Pauldrons (Sode)
    [-0.24, 0.24].forEach((px) => {
      const pGeo = new THREE.BoxGeometry(0.14, 0.18, 0.2);
      const p = new THREE.Mesh(pGeo, matArmor);
      p.position.set(px, 0.88, 0);
      p.castShadow = true;
      group.add(p);
    });

    // Kabuto / Knight Crested Helm
    const helmGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const helm = new THREE.Mesh(helmGeo, matArmor);
    helm.position.y = 1.05;
    helm.castShadow = true;
    group.add(helm);

    // Gold Crescent Horn Crest on Helm
    const hornGeo = new THREE.TorusGeometry(0.14, 0.02, 6, 12, Math.PI * 0.75);
    const horn = new THREE.Mesh(hornGeo, matGoldTrim);
    horn.rotation.x = Math.PI / 2;
    horn.rotation.z = -Math.PI * 0.38;
    horn.position.set(0, 1.2, 0.06);
    group.add(horn);

    // Towering Crest Kite Shield (held firmly in front)
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(0.24, 0.55, 0.2);

    const shieldBodyGeo = new THREE.BoxGeometry(0.36, 0.7, 0.05);
    const shieldBody = new THREE.Mesh(shieldBodyGeo, matShieldBlue);
    shieldBody.castShadow = true;
    shieldGroup.add(shieldBody);

    const shieldRimGeo = new THREE.BoxGeometry(0.38, 0.72, 0.03);
    const shieldRim = new THREE.Mesh(shieldRimGeo, matGoldTrim);
    shieldRim.position.z = 0.02;
    shieldGroup.add(shieldRim);

    group.add(shieldGroup);

    // Katana / Nodachi Sheathed at Opposite Hip
    const swordGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 6);
    const sword = new THREE.Mesh(swordGeo, matDarkIron);
    sword.position.set(-0.25, 0.5, -0.05);
    sword.rotation.x = 0.4;
    sword.castShadow = true;
    group.add(sword);
  }
}
