import { PropData } from '../types/map';
import { CameraState, TileDimensions } from '../types/engine';
import { gridToScreen } from './isometric';

export function renderProp(
  ctx: CanvasRenderingContext2D,
  prop: PropData,
  camera: CameraState,
  tileDim: TileDimensions,
  time: number
) {
  const elev = prop.elevation;
  const screenPos = gridToScreen({ x: prop.x, y: prop.y, elevation: elev }, camera, tileDim);

  const z = camera.zoom;
  // Center of the diamond tile
  const cx = screenPos.x;
  const cy = screenPos.y + (tileDim.height / 2) * z;

  ctx.save();

  switch (prop.type) {
    case 'pine_tree_large':
    case 'pine_tree_small':
      renderPineTree(ctx, cx, cy, z, prop.type === 'pine_tree_large');
      break;

    case 'camp_tent':
      renderCampTent(ctx, cx, cy, z);
      break;

    case 'campfire_stew':
      renderCampfireStew(ctx, cx, cy, z, time);
      break;

    case 'druid_altar':
      renderDruidAltar(ctx, cx, cy, z, time);
      break;

    case 'ranger_easel':
      renderRangerEasel(ctx, cx, cy, z);
      break;

    case 'sunspire_base':
      renderSunspireBase(ctx, cx, cy, z);
      break;

    case 'fireworks_mortar':
      renderFireworksMortar(ctx, cx, cy, z, time);
      break;

    case 'market_stall':
      renderMarketStall(ctx, cx, cy, z);
      break;

    case 'festival_lantern':
      renderFestivalLantern(ctx, cx, cy, z, time);
      break;

    case 'tatami_pavilion':
      renderTatamiPavilion(ctx, cx, cy, z);
      break;

    case 'harbor_armory':
      renderHarborArmory(ctx, cx, cy, z);
      break;

    case 'moored_boat':
      renderMooredBoat(ctx, cx, cy, z, time);
      break;

    case 'tide_shrine':
      renderTideShrine(ctx, cx, cy, z, time);
      break;

    case 'sea_bell':
      renderSeaBell(ctx, cx, cy, z);
      break;

    case 'wooden_dock_pillar':
      renderDockPillar(ctx, cx, cy, z);
      break;

    default:
      break;
  }

  ctx.restore();
}

/**
 * Highland Pine Tree with watercolor tiered needle clusters
 */
function renderPineTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, isLarge: boolean) {
  const h = (isLarge ? 70 : 48) * z;
  const w = (isLarge ? 32 : 22) * z;

  // Ground shadow
  ctx.fillStyle = 'rgba(20, 30, 20, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.7, w * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = '#4a2f1b';
  ctx.fillRect(cx - 3 * z, cy - 14 * z, 6 * z, 14 * z);

  // Layered foliage tiers (bottom to top)
  const tiers = isLarge ? 4 : 3;
  for (let i = 0; i < tiers; i++) {
    const tierY = cy - (12 + i * (h / tiers)) * 0.8;
    const tierW = w * (1 - i * 0.18);
    const tierH = (h / tiers) * 1.3;

    ctx.fillStyle = ['#284e2a', '#2f5b32', '#3a6f3e', '#48854d'][i % 4];
    ctx.beginPath();
    ctx.moveTo(cx, tierY - tierH);
    ctx.lineTo(cx + tierW, tierY);
    ctx.lineTo(cx - tierW, tierY);
    ctx.closePath();
    ctx.fill();

    // Ink outline
    ctx.strokeStyle = 'rgba(15, 30, 15, 0.45)';
    ctx.lineWidth = 1 * z;
    ctx.stroke();
  }
}

/**
 * Highland Campsite Tent
 */
function renderCampTent(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  const w = 34 * z;
  const h = 28 * z;

  // Shadow
  ctx.fillStyle = 'rgba(25, 20, 15, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.6, w * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Canvas tent roof
  ctx.fillStyle = '#c7b28a';
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx + w * 0.6, cy);
  ctx.lineTo(cx - w * 0.6, cy);
  ctx.closePath();
  ctx.fill();

  // Shaded side
  ctx.fillStyle = '#aa9369';
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx - w * 0.6, cy);
  ctx.lineTo(cx - w * 0.1, cy);
  ctx.closePath();
  ctx.fill();

  // Entrance opening
  ctx.fillStyle = '#3a2e1d';
  ctx.beginPath();
  ctx.moveTo(cx, cy - h * 0.7);
  ctx.lineTo(cx + w * 0.2, cy);
  ctx.lineTo(cx - w * 0.2, cy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(30, 25, 15, 0.5)';
  ctx.lineWidth = 1 * z;
  ctx.stroke();
}

/**
 * Campfire with simmering stew cauldron
 */
function renderCampfireStew(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, time: number) {
  // Fire glow
  const glow = 18 * z + Math.sin(time * 0.01) * 3 * z;
  const radGrad = ctx.createRadialGradient(cx, cy - 8 * z, 2 * z, cx, cy - 8 * z, glow);
  radGrad.addColorStop(0, 'rgba(255, 160, 40, 0.5)');
  radGrad.addColorStop(1, 'rgba(255, 120, 20, 0)');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - 8 * z, glow, 0, Math.PI * 2);
  ctx.fill();

  // Stone ring
  ctx.fillStyle = '#5a544c';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const sx = cx + Math.cos(a) * 10 * z;
    const sy = cy + Math.sin(a) * 5 * z;
    ctx.beginPath();
    ctx.arc(sx, sy, 3 * z, 0, Math.PI * 2);
    ctx.fill();
  }

  // Iron tripod stand
  ctx.strokeStyle = '#22201d';
  ctx.lineWidth = 1.5 * z;
  ctx.beginPath();
  ctx.moveTo(cx - 8 * z, cy + 2 * z);
  ctx.lineTo(cx, cy - 22 * z);
  ctx.lineTo(cx + 8 * z, cy + 2 * z);
  ctx.stroke();

  // Copper Cauldron
  ctx.fillStyle = '#8f4f2e';
  ctx.beginPath();
  ctx.arc(cx, cy - 10 * z, 6 * z, 0, Math.PI * 2);
  ctx.fill();

  // Simmering stew surface & bubbles
  ctx.fillStyle = '#4c873f';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 12 * z, 5 * z, 2.5 * z, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rising steam puffs
  const steamY = cy - 18 * z - (time * 0.02 % (14 * z));
  const steamAlpha = 0.5 * (1 - (time * 0.02 % (14 * z)) / (14 * z));
  ctx.fillStyle = `rgba(230, 240, 220, ${steamAlpha})`;
  ctx.beginPath();
  ctx.arc(cx + Math.sin(time * 0.005) * 3 * z, steamY, 3 * z, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Druid Altar with Lichen & Nature Runes
 */
function renderDruidAltar(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, time: number) {
  // Stone plinth
  ctx.fillStyle = '#4c5249';
  ctx.fillRect(cx - 14 * z, cy - 14 * z, 28 * z, 14 * z);
  ctx.fillStyle = '#5c6459';
  ctx.fillRect(cx - 16 * z, cy - 18 * z, 32 * z, 6 * z);

  // Glowing nature rune
  const runeGlow = 0.5 + Math.sin(time * 0.003) * 0.4;
  ctx.strokeStyle = `rgba(100, 235, 120, ${runeGlow})`;
  ctx.lineWidth = 1.5 * z;
  ctx.beginPath();
  ctx.arc(cx, cy - 8 * z, 4 * z, 0, Math.PI * 2);
  ctx.moveTo(cx, cy - 12 * z);
  ctx.lineTo(cx, cy - 4 * z);
  ctx.stroke();
}

/**
 * Ranger Easel with Art Canvas
 */
function renderRangerEasel(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  // Tripod legs
  ctx.strokeStyle = '#5a3d28';
  ctx.lineWidth = 1.5 * z;
  ctx.beginPath();
  ctx.moveTo(cx - 8 * z, cy);
  ctx.lineTo(cx, cy - 22 * z);
  ctx.lineTo(cx + 8 * z, cy);
  ctx.moveTo(cx + 2 * z, cy - 20 * z);
  ctx.lineTo(cx + 4 * z, cy);
  ctx.stroke();

  // Canvas
  ctx.fillStyle = '#f2ebd9';
  ctx.fillRect(cx - 9 * z, cy - 19 * z, 18 * z, 12 * z);
  ctx.strokeStyle = '#3d2a1b';
  ctx.strokeRect(cx - 9 * z, cy - 19 * z, 18 * z, 12 * z);

  // Painted landscape lines
  ctx.fillStyle = '#49754b';
  ctx.fillRect(cx - 7 * z, cy - 11 * z, 14 * z, 3 * z);
}

/**
 * Sunspire Base / Arcane Tower Foundation
 */
function renderSunspireBase(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  const w = 48 * z;
  const h = 56 * z;

  // Stone tower foundation
  ctx.fillStyle = '#827a70';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.5, cy);
  ctx.lineTo(cx - w * 0.4, cy - h);
  ctx.lineTo(cx + w * 0.4, cy - h);
  ctx.lineTo(cx + w * 0.5, cy);
  ctx.closePath();
  ctx.fill();

  // Spire roof cone
  ctx.fillStyle = '#9b3c3c';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.45, cy - h);
  ctx.lineTo(cx, cy - h - 35 * z);
  ctx.lineTo(cx + w * 0.45, cy - h);
  ctx.closePath();
  ctx.fill();

  // Stained glass rose window
  ctx.fillStyle = '#dfa642';
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.55, 7 * z, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#34291f';
  ctx.lineWidth = 1 * z;
  ctx.stroke();
}

/**
 * Fireworks Mortar Stand
 */
function renderFireworksMortar(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, time: number) {
  // Wooden frame
  ctx.fillStyle = '#5c4028';
  ctx.fillRect(cx - 12 * z, cy - 8 * z, 24 * z, 8 * z);

  // Brass mortar barrels
  [-6, 0, 6].forEach((offset) => {
    ctx.fillStyle = '#a6823c';
    ctx.fillRect(cx + (offset - 2) * z, cy - 20 * z, 4 * z, 14 * z);
  });

  // Small dancing ember spark
  const sparkY = cy - 22 * z + Math.sin(time * 0.02) * 2 * z;
  ctx.fillStyle = '#ff8822';
  ctx.beginPath();
  ctx.arc(cx, sparkY, 2 * z, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Festival Market Stall
 */
function renderMarketStall(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  const w = 36 * z;
  const h = 32 * z;

  // Wooden counter
  ctx.fillStyle = '#6e4a2c';
  ctx.fillRect(cx - w * 0.45, cy - 14 * z, w * 0.9, 14 * z);

  // Striped festive awning (crimson & cream)
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#b53b3b' : '#ede2cb';
    const stripeW = (w / 4);
    ctx.fillRect(cx - w * 0.5 + i * stripeW, cy - h, stripeW, 10 * z);
  }

  // Wooden support poles
  ctx.fillStyle = '#3f2814';
  ctx.fillRect(cx - w * 0.48, cy - h, 2.5 * z, h);
  ctx.fillRect(cx + w * 0.44, cy - h, 2.5 * z, h);
}

/**
 * Festival Street Lantern Post
 */
function renderFestivalLantern(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, time: number) {
  // Iron lamp post
  ctx.fillStyle = '#262422';
  ctx.fillRect(cx - 1.5 * z, cy - 26 * z, 3 * z, 26 * z);

  // Crossbar arm
  ctx.fillRect(cx - 6 * z, cy - 26 * z, 12 * z, 2 * z);

  // Lantern glass with pulsing warm glow
  const flicker = Math.sin(time * 0.008 + cx) * 0.15;
  ctx.fillStyle = `rgba(255, 210, 80, ${0.85 + flicker})`;
  ctx.fillRect(cx - 3.5 * z, cy - 24 * z, 7 * z, 9 * z);
  ctx.strokeStyle = '#1b1917';
  ctx.lineWidth = 1 * z;
  ctx.strokeRect(cx - 3.5 * z, cy - 24 * z, 7 * z, 9 * z);
}

/**
 * Coastal Tatami Tea Pavilion (Nha Trang Japanese Banquet Vibe)
 */
function renderTatamiPavilion(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  const w = 46 * z;
  const h = 38 * z;

  // Cedar deck platform
  ctx.fillStyle = '#54361e';
  ctx.fillRect(cx - w * 0.5, cy - 8 * z, w, 8 * z);

  // Green tatami mat
  ctx.fillStyle = '#5d7554';
  ctx.fillRect(cx - w * 0.45, cy - 9 * z, w * 0.9, 3 * z);

  // Bamboo pillars
  ctx.fillStyle = '#6b4f2c';
  ctx.fillRect(cx - w * 0.46, cy - h, 3 * z, h - 8 * z);
  ctx.fillRect(cx + w * 0.42, cy - h, 3 * z, h - 8 * z);

  // Shoji paper screens
  ctx.fillStyle = 'rgba(240, 235, 220, 0.7)';
  ctx.fillRect(cx - w * 0.35, cy - h * 0.8, w * 0.7, h * 0.5);

  // Curved pagoda cedar roof
  ctx.fillStyle = '#34261c';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, cy - h);
  ctx.quadraticCurveTo(cx, cy - h - 16 * z, cx + w * 0.6, cy - h);
  ctx.lineTo(cx + w * 0.45, cy - h - 6 * z);
  ctx.lineTo(cx - w * 0.45, cy - h - 6 * z);
  ctx.closePath();
  ctx.fill();
}

/**
 * Harbor Armory & Gatehouse (Phuong's Steadfast Guardian Post)
 */
function renderHarborArmory(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  const w = 42 * z;
  const h = 36 * z;

  // Stone battlements
  ctx.fillStyle = '#666158';
  ctx.fillRect(cx - w * 0.45, cy - h, w * 0.9, h);

  // Crenellations on top
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(cx - w * 0.45 + i * (w * 0.25), cy - h - 6 * z, w * 0.15, 6 * z);
  }

  // Heavy oak door
  ctx.fillStyle = '#382517';
  ctx.fillRect(cx - 7 * z, cy - 16 * z, 14 * z, 16 * z);

  // Mounted crest shield on the wall
  ctx.fillStyle = '#2f558a';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 24 * z);
  ctx.lineTo(cx + 5 * z, cy - 22 * z);
  ctx.lineTo(cx + 4 * z, cy - 16 * z);
  ctx.lineTo(cx, cy - 13 * z);
  ctx.lineTo(cx - 4 * z, cy - 16 * z);
  ctx.lineTo(cx - 5 * z, cy - 22 * z);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d4aa48';
  ctx.lineWidth = 1 * z;
  ctx.stroke();
}

/**
 * Moored Harbor Skiff / Boat gently bobbing
 */
function renderMooredBoat(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, time: number) {
  const bobY = Math.sin(time * 0.002) * 2.5 * z;
  const py = cy + bobY;

  // Wooden hull
  ctx.fillStyle = '#613b1f';
  ctx.beginPath();
  ctx.moveTo(cx - 24 * z, py);
  ctx.quadraticCurveTo(cx, py + 8 * z, cx + 24 * z, py);
  ctx.lineTo(cx + 18 * z, py - 8 * z);
  ctx.lineTo(cx - 18 * z, py - 8 * z);
  ctx.closePath();
  ctx.fill();

  // Mast
  ctx.fillStyle = '#3d2514';
  ctx.fillRect(cx - 1.5 * z, py - 32 * z, 3 * z, 26 * z);

  // Furled sail
  ctx.fillStyle = '#ded5be';
  ctx.fillRect(cx - 10 * z, py - 26 * z, 20 * z, 5 * z);

  // Mooring rope to pier
  ctx.strokeStyle = '#8c7657';
  ctx.lineWidth = 1 * z;
  ctx.beginPath();
  ctx.moveTo(cx - 18 * z, py - 6 * z);
  ctx.quadraticCurveTo(cx - 28 * z, py - 12 * z, cx - 35 * z, py - 14 * z);
  ctx.stroke();
}

/**
 * Coastal Tide Shrine & Pearl
 */
function renderTideShrine(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number, time: number) {
  // Shrine stone torii posts
  ctx.fillStyle = '#7a3832';
  ctx.fillRect(cx - 12 * z, cy - 30 * z, 3 * z, 30 * z);
  ctx.fillRect(cx + 9 * z, cy - 30 * z, 3 * z, 30 * z);
  // Top lintel
  ctx.fillRect(cx - 16 * z, cy - 32 * z, 32 * z, 4 * z);

  // Floating bioluminescent ocean pearl
  const pearlY = cy - 16 * z + Math.sin(time * 0.003) * 3 * z;
  const radGrad = ctx.createRadialGradient(cx, pearlY, 1 * z, cx, pearlY, 10 * z);
  radGrad.addColorStop(0, '#e6ffff');
  radGrad.addColorStop(0.5, '#40d0d0');
  radGrad.addColorStop(1, 'rgba(64, 208, 208, 0)');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(cx, pearlY, 10 * z, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Sea Bell
 */
function renderSeaBell(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  // Wooden frame
  ctx.fillStyle = '#4a331f';
  ctx.fillRect(cx - 8 * z, cy - 24 * z, 3 * z, 24 * z);
  ctx.fillRect(cx + 5 * z, cy - 24 * z, 3 * z, 24 * z);
  ctx.fillRect(cx - 10 * z, cy - 26 * z, 20 * z, 3 * z);

  // Bronze bell
  ctx.fillStyle = '#8f7738';
  ctx.beginPath();
  ctx.arc(cx, cy - 16 * z, 5 * z, Math.PI, 0);
  ctx.lineTo(cx + 6 * z, cy - 10 * z);
  ctx.lineTo(cx - 6 * z, cy - 10 * z);
  ctx.closePath();
  ctx.fill();
}

/**
 * Dock Pillar
 */
function renderDockPillar(ctx: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  ctx.fillStyle = '#452b14';
  ctx.fillRect(cx - 2 * z, cy - 10 * z, 4 * z, 20 * z);
  ctx.fillStyle = '#2b1a0c';
  ctx.fillRect(cx - 3 * z, cy - 12 * z, 6 * z, 3 * z);
}
