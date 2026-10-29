import { Character } from '../types/character';
import { CameraState, ScreenCoord, TileDimensions } from '../types/engine';
import { gridToScreen } from './isometric';

export function renderCharacter(
  ctx: CanvasRenderingContext2D,
  char: Character,
  camera: CameraState,
  tileDim: TileDimensions,
  time: number,
  isSelected: boolean = false
) {
  const elev = char.gridPos.elevation;
  const screenPos = gridToScreen({ x: char.gridPos.x, y: char.gridPos.y, elevation: elev }, camera, tileDim);

  const z = camera.zoom;
  // Center of the diamond tile
  const cx = screenPos.x;

  // Idle breathing cycle + spring hop
  const bobY = Math.sin(time * 0.003 + char.gridPos.x * 2) * 1.8 * z;
  let hopY = 0;
  if (char.hopProgress !== undefined && char.hopProgress > 0) {
    hopY = -Math.sin(char.hopProgress * Math.PI) * 14 * z;
  }

  const cy = screenPos.y + (tileDim.height / 2) * z + bobY + hopY;

  ctx.save();

  // 1. Ground Shadow (stays on ground, not hopping)
  ctx.fillStyle = 'rgba(15, 20, 25, 0.4)';
  ctx.beginPath();
  const shadowScale = char.hopProgress ? (1 - Math.sin(char.hopProgress * Math.PI) * 0.3) : 1;
  ctx.ellipse(cx, screenPos.y + (tileDim.height / 2) * z, 14 * z * shadowScale, 7 * z * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Selection Aura (if selected)
  if (isSelected) {
    ctx.strokeStyle = '#dfa642';
    ctx.lineWidth = 2 * z;
    ctx.beginPath();
    ctx.ellipse(cx, screenPos.y + (tileDim.height / 2) * z, 18 * z, 9 * z, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Floating selection diamond above head
    const markerY = cy - 42 * z;
    ctx.fillStyle = '#dfa642';
    ctx.beginPath();
    ctx.moveTo(cx, markerY);
    ctx.lineTo(cx + 4 * z, markerY - 5 * z);
    ctx.lineTo(cx, markerY - 10 * z);
    ctx.lineTo(cx - 4 * z, markerY - 5 * z);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Render Class Sprite Silhouette
  if (char.id === 'anh-thi-druid') {
    renderDruidSprite(ctx, cx, cy, z, char.color.primary, time);
  } else if (char.id === 'thanh-phuong-paladin') {
    renderPaladinSprite(ctx, cx, cy, z, char.color.primary, time);
  } else {
    renderGenericHeroSprite(ctx, cx, cy, z, char.color.primary);
  }

  ctx.restore();
}

/**
 * Huỳnh Trần Anh Thi – The Wilderness Druid
 * Emerald hooded cloak, curved wooden staff, sprouting leaves
 */
function renderDruidSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  z: number,
  primaryColor: string,
  time: number
) {
  const isFacingSE = true;
  const dir = isFacingSE ? 1 : -1;

  // 1. Flowing Emerald Druid Robe
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7 * z, cy);
  ctx.lineTo(cx - 5 * z, cy - 20 * z);
  ctx.lineTo(cx + 5 * z, cy - 20 * z);
  ctx.lineTo(cx + 7 * z, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1d3b23';
  ctx.lineWidth = 1 * z;
  ctx.stroke();

  // Robe hemlines / herbal satchel
  ctx.fillStyle = '#6e4c2c';
  ctx.fillRect(cx - 3 * z, cy - 12 * z, 5 * z, 4 * z);

  // 2. Druid Hood & Head
  ctx.fillStyle = '#265930';
  ctx.beginPath();
  ctx.arc(cx, cy - 22 * z, 6 * z, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#14301a';
  ctx.stroke();

  // Face peek inside hood
  ctx.fillStyle = '#fcebd5';
  ctx.beginPath();
  ctx.arc(cx + 1 * z * dir, cy - 21 * z, 3 * z, 0, Math.PI * 2);
  ctx.fill();

  // 3. Wooden Druid Staff (sprouting budding leaves)
  const staffX = cx + 8 * z * dir;
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 2 * z;
  ctx.beginPath();
  ctx.moveTo(staffX, cy + 2 * z);
  ctx.lineTo(staffX, cy - 32 * z);
  // Curved crook top
  ctx.quadraticCurveTo(staffX + 4 * z * dir, cy - 36 * z, staffX + 1 * z * dir, cy - 38 * z);
  ctx.stroke();

  // Glowing bud / sprouting leaf on staff top
  const leafGlow = Math.sin(time * 0.005) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(120, 240, 140, ${leafGlow})`;
  ctx.beginPath();
  ctx.arc(staffX + 1 * z * dir, cy - 38 * z, 3 * z, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Phạm Trần Thanh Phương – The Ronin / Paladin Guardian
 * Lacquered azure armor, kabuto/crest helm, towering crest kite shield
 */
function renderPaladinSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  z: number,
  primaryColor: string,
  time: number
) {
  const isFacingSW = true;
  const dir = isFacingSW ? -1 : 1;

  // 1. Armored Body & Tassets
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(cx - 8 * z, cy);
  ctx.lineTo(cx - 6 * z, cy - 20 * z);
  ctx.lineTo(cx + 6 * z, cy - 20 * z);
  ctx.lineTo(cx + 8 * z, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#12253d';
  ctx.lineWidth = 1 * z;
  ctx.stroke();

  // Gold armor trims on breastplate
  ctx.strokeStyle = '#d4aa48';
  ctx.lineWidth = 1 * z;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * z, cy - 14 * z);
  ctx.lineTo(cx, cy - 10 * z);
  ctx.lineTo(cx + 4 * z, cy - 14 * z);
  ctx.stroke();

  // 2. Kabuto / Crested Knight Helm
  ctx.fillStyle = '#1e385c';
  ctx.beginPath();
  ctx.arc(cx, cy - 23 * z, 6.5 * z, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f1f33';
  ctx.stroke();

  // Gold Crest Horn on Helm
  ctx.strokeStyle = '#dfa642';
  ctx.lineWidth = 1.8 * z;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * z, cy - 27 * z);
  ctx.lineTo(cx, cy - 31 * z);
  ctx.lineTo(cx + 4 * z, cy - 27 * z);
  ctx.stroke();

  // 3. Towering Crest Shield (held firmly in front/side)
  const shieldX = cx + 8 * z * dir;
  const shieldY = cy - 8 * z;

  // Shield body
  ctx.fillStyle = '#1b3861';
  ctx.beginPath();
  ctx.moveTo(shieldX - 5 * z, shieldY - 14 * z);
  ctx.lineTo(shieldX + 5 * z, shieldY - 14 * z);
  ctx.lineTo(shieldX + 4 * z, shieldY + 6 * z);
  ctx.lineTo(shieldX, shieldY + 12 * z);
  ctx.lineTo(shieldX - 4 * z, shieldY + 6 * z);
  ctx.closePath();
  ctx.fill();

  // Gold shield rim & crest cross
  ctx.strokeStyle = '#dfa642';
  ctx.lineWidth = 1.2 * z;
  ctx.stroke();

  // Radiant gleam on shield
  const gleamAlpha = 0.4 + Math.sin(time * 0.004) * 0.3;
  ctx.fillStyle = `rgba(255, 255, 255, ${gleamAlpha})`;
  ctx.fillRect(shieldX - 2 * z, shieldY - 10 * z, 4 * z, 4 * z);

  // 4. Sheathed Nodachi / Katana at opposite hip
  const swordX = cx - 8 * z * dir;
  ctx.strokeStyle = '#4a2f1b';
  ctx.lineWidth = 2 * z;
  ctx.beginPath();
  ctx.moveTo(swordX, cy - 12 * z);
  ctx.lineTo(swordX - 4 * z * dir, cy + 2 * z);
  ctx.stroke();
}

function renderGenericHeroSprite(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy - 14 * z, 6 * z, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Precision touch raycast for character selection
 */
export function hitTestCharacter(
  screenPos: ScreenCoord,
  char: Character,
  camera: CameraState,
  tileDim: TileDimensions
): boolean {
  const elev = char.gridPos.elevation;
  const charScreen = gridToScreen({ x: char.gridPos.x, y: char.gridPos.y, elevation: elev }, camera, tileDim);
  const z = camera.zoom;

  const charCenter = {
    x: charScreen.x,
    y: charScreen.y + (tileDim.height / 2) * z - 16 * z,
  };

  // 32px touch target radius for comfortable thumb tapping
  const radius = Math.max(30, 24 * z);
  const dist = Math.hypot(screenPos.x - charCenter.x, screenPos.y - charCenter.y);

  return dist <= radius;
}
