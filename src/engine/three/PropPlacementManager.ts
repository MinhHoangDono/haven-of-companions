import * as THREE from 'three';
import { assetLoader } from './GLTFAssetLoader';
import { DIORAMA_PROPS } from '../../data/propLayoutData';
import { InteractivePropRef } from './DioramaBuilder';

export class PropPlacementManager {
  /**
   * Spawns all declared diorama props asynchronously into the parent group.
   * Returns references to interactive props for raycast detection.
   */
  public static async instantiateProps(
    parentGroup: THREE.Group
  ): Promise<InteractivePropRef[]> {
    const interactiveRefs: InteractivePropRef[] = [];

    for (const def of DIORAMA_PROPS) {
      const fullPath = `/assets/models/${def.pack}/${def.asset}`;
      const { scene: propScene } = await assetLoader.loadModel(fullPath, false);

      propScene.position.set(def.pos[0], def.pos[1], def.pos[2]);

      if (def.rot) {
        propScene.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
      }

      if (def.scale) {
        if (typeof def.scale === 'number') {
          propScene.scale.set(def.scale, def.scale, def.scale);
        } else {
          propScene.scale.set(def.scale[0], def.scale[1], def.scale[2]);
        }
      }

      parentGroup.add(propScene);

      // Register interactive hit targets
      if (def.interactive) {
        propScene.userData = {
          interactiveId: def.interactive.id,
          interactiveType: def.interactive.type,
        };

        interactiveRefs.push({
          id: def.interactive.id,
          type: def.interactive.type,
          mesh: propScene,
          position: propScene.position.clone(),
        });
      }
    }

    return interactiveRefs;
  }
}
