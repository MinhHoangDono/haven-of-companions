import { PropData } from '../types/map';
import { Character } from '../types/character';
import { CameraState, TileDimensions } from '../types/engine';
import { calculateDepthKey } from './isometric';
import { renderProp } from './propRenderer';
import { renderCharacter, hitTestCharacter } from './characterRenderer';

export type RenderableEntity =
  | { kind: 'prop'; data: PropData }
  | { kind: 'character'; data: Character };

export class EntityPipeline {
  public static getSortedEntities(props: PropData[], characters: Character[]): RenderableEntity[] {
    const list: RenderableEntity[] = [
      ...props.map((p) => ({ kind: 'prop' as const, data: p })),
      ...characters.map((c) => ({ kind: 'character' as const, data: c })),
    ];

    list.sort((a, b) => {
      const posA = a.kind === 'prop' ? { x: a.data.x, y: a.data.y, elev: a.data.elevation } : { x: a.data.gridPos.x, y: a.data.gridPos.y, elev: a.data.gridPos.elevation };
      const posB = b.kind === 'prop' ? { x: b.data.x, y: b.data.y, elev: b.data.elevation } : { x: b.data.gridPos.x, y: b.data.gridPos.y, elev: b.data.gridPos.elevation };

      return calculateDepthKey(posA.x, posA.y, posA.elev) - calculateDepthKey(posB.x, posB.y, posB.elev);
    });

    return list;
  }

  public static renderEntities(
    ctx: CanvasRenderingContext2D,
    entities: RenderableEntity[],
    camera: CameraState,
    tileDim: TileDimensions,
    time: number,
    selectedCharacterId: string | null
  ) {
    for (const ent of entities) {
      if (ent.kind === 'prop') {
        renderProp(ctx, ent.data, camera, tileDim, time);
      } else {
        const isSelected = ent.data.id === selectedCharacterId;
        renderCharacter(ctx, ent.data, camera, tileDim, time, isSelected);
      }
    }
  }

  public static raycastCharacters(
    screenPos: { x: number; y: number },
    characters: Character[],
    camera: CameraState,
    tileDim: TileDimensions
  ): Character | null {
    // Reverse order (top-most in depth tested first)
    for (let i = characters.length - 1; i >= 0; i--) {
      const char = characters[i];
      if (hitTestCharacter(screenPos, char, camera, tileDim)) {
        return char;
      }
    }
    return null;
  }
}
