import { TileData } from '../types/map';
import { CameraState, TileDimensions } from '../types/engine';
import { gridToScreen } from './isometric';

export function renderTile(
  ctx: CanvasRenderingContext2D,
  tile: TileData,
  camera: CameraState,
  tileDim: TileDimensions,
  time: number
) {
  const elev = tile.elevation;
  const screenPos = gridToScreen({ x: tile.x, y: tile.y, elevation: elev }, camera, tileDim);

  const halfW = (tileDim.width / 2) * camera.zoom;
  const halfH = (tileDim.height / 2) * camera.zoom;

  // Four vertices of the isometric diamond (top, right, bottom, left)
  const topX = screenPos.x;
  const topY = screenPos.y;
  const rightX = screenPos.x + halfW;
  const rightY = screenPos.y + halfH;
  const botX = screenPos.x;
  const botY = screenPos.y + halfH * 2;
  const leftX = screenPos.x - halfW;
  const leftY = screenPos.y + halfH;

  // 1. If elevated, render side walls first (back to front)
  if (elev > 0) {
    const wallHeight = elev * halfH * 1.5;

    // Left wall (darker shadow side)
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(botX, botY);
    ctx.lineTo(botX, botY + wallHeight);
    ctx.lineTo(leftX, leftY + wallHeight);
    ctx.closePath();
    ctx.fillStyle = getTileWallColor(tile.type, 'left');
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 20, 15, 0.4)';
    ctx.lineWidth = 1 * camera.zoom;
    ctx.stroke();

    // Right wall (mid-tone side)
    ctx.beginPath();
    ctx.moveTo(botX, botY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(rightX, rightY + wallHeight);
    ctx.lineTo(botX, botY + wallHeight);
    ctx.closePath();
    ctx.fillStyle = getTileWallColor(tile.type, 'right');
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 20, 15, 0.4)';
    ctx.lineWidth = 1 * camera.zoom;
    ctx.stroke();
  }

  // 2. Render top diamond surface
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.lineTo(rightX, rightY);
  ctx.lineTo(botX, botY);
  ctx.lineTo(leftX, leftY);
  ctx.closePath();

  // Watercolor base fill
  ctx.fillStyle = getTileFillColor(tile, time);
  ctx.fill();

  // Soft storybook ink outline
  ctx.strokeStyle = getTileOutlineColor(tile.type);
  ctx.lineWidth = Math.max(0.75, 1.1 * camera.zoom);
  ctx.stroke();

  // Subtle interior watercolor texture / grain detail
  renderTileTexture(ctx, tile, topX, topY, halfW, halfH, camera.zoom, time);
}

function getTileFillColor(tile: TileData, time: number): string {
  const { type, variation = 0 } = tile;
  switch (type) {
    case 'highland_grass':
      return ['#457a41', '#3d7039', '#4d8349', '#376433'][variation];
    case 'alpine_dirt':
      return ['#875f3e', '#7c5435', '#916744', '#704c30'][variation];
    case 'plaza_cobble':
      return ['#9b9487', '#918b7f', '#a69e90', '#888277'][variation];
    case 'plaza_stone':
      return ['#b0a99c', '#a59e91', '#b8b1a4', '#9e978b'][variation];
    case 'sand':
      return ['#d9bb82', '#d0b178', '#e0c38c', '#c7a86f'][variation];
    case 'shallow_water': {
      // Gentle animated sine wave shimmer
      const wave = Math.sin(time * 0.002 + (tile.x + tile.y) * 0.5) * 8;
      const r = Math.floor(55 + wave);
      const g = Math.floor(150 + wave);
      const b = Math.floor(165 + wave);
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'deep_water': {
      const wave = Math.sin(time * 0.0015 + (tile.x + tile.y) * 0.4) * 6;
      const r = Math.floor(30 + wave);
      const g = Math.floor(75 + wave);
      const b = Math.floor(115 + wave);
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'wood_pier':
      return ['#784e2a', '#6e4522', '#825530', '#633d1d'][variation];
    default:
      return '#6b7280';
  }
}

function getTileWallColor(type: TileData['type'], side: 'left' | 'right'): string {
  const isLeft = side === 'left';
  switch (type) {
    case 'highland_grass':
    case 'alpine_dirt':
      return isLeft ? '#4a331f' : '#61432a';
    case 'plaza_cobble':
    case 'plaza_stone':
      return isLeft ? '#575249' : '#6e685f';
    case 'wood_pier':
      return isLeft ? '#3d2511' : '#52341a';
    default:
      return isLeft ? '#374151' : '#4b5563';
  }
}

function getTileOutlineColor(type: TileData['type']): string {
  switch (type) {
    case 'shallow_water':
    case 'deep_water':
      return 'rgba(25, 75, 110, 0.35)';
    case 'sand':
      return 'rgba(150, 110, 60, 0.4)';
    default:
      return 'rgba(25, 20, 15, 0.35)';
  }
}

function renderTileTexture(
  ctx: CanvasRenderingContext2D,
  tile: TileData,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  zoom: number,
  time: number
) {
  // Wood plank lines on piers
  if (tile.type === 'wood_pier') {
    ctx.strokeStyle = 'rgba(40, 20, 8, 0.35)';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx - halfW * 0.5, cy + halfH * 0.5);
    ctx.lineTo(cx + halfW * 0.5, cy + halfH * 1.5);
    ctx.moveTo(cx - halfW * 0.2, cy + halfH * 0.2);
    ctx.lineTo(cx + halfW * 0.8, cy + halfH * 1.2);
    ctx.stroke();
  }
  // Cobblestone mortar lines
  else if (tile.type === 'plaza_cobble') {
    ctx.strokeStyle = 'rgba(40, 35, 30, 0.25)';
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(cx, cy + halfH, 6 * zoom, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Water foam along shoreline
  else if (tile.type === 'shallow_water') {
    const foamOffset = Math.sin(time * 0.003 + tile.x) * 4 * zoom;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + halfH + foamOffset, halfW * 0.4, halfH * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
