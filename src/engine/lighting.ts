import { TimeOfDay } from '../components/ui/TopBar';
import { CameraState, Viewport, BASE_TILE } from '../types/engine';
import { gridToScreen } from './isometric';

export interface PointLight {
  x: number;
  y: number;
  elevation: number;
  radius: number;
  color: string;
  flicker?: boolean;
}

export const villagePointLights: PointLight[] = [
  // 1. Highland Campsite Hearth
  { x: 6, y: 7, elevation: 1, radius: 85, color: 'rgba(255, 140, 40, 0.75)', flicker: true },
  // 2. Druid Altar
  { x: 8, y: 4, elevation: 1, radius: 45, color: 'rgba(90, 230, 130, 0.55)', flicker: true },
  // 3. Plaza Lanterns
  { x: 16, y: 6, elevation: 0.5, radius: 60, color: 'rgba(255, 205, 70, 0.7)', flicker: true },
  { x: 26, y: 6, elevation: 0.5, radius: 60, color: 'rgba(255, 205, 70, 0.7)', flicker: true },
  { x: 16, y: 14, elevation: 0.5, radius: 60, color: 'rgba(255, 205, 70, 0.7)', flicker: true },
  { x: 26, y: 14, elevation: 0.5, radius: 60, color: 'rgba(255, 205, 70, 0.7)', flicker: true },
  // 4. Coastal Tide Shrine Pearl
  { x: 25, y: 21, elevation: 0, radius: 55, color: 'rgba(70, 220, 230, 0.65)', flicker: true },
  // 5. Tatami Tea Pavilion
  { x: 8, y: 19, elevation: 0, radius: 65, color: 'rgba(255, 185, 90, 0.6)', flicker: true },
];

export function renderLightingPass(
  ctx: CanvasRenderingContext2D,
  timeOfDay: TimeOfDay,
  camera: CameraState,
  viewport: Viewport,
  time: number
) {
  if (timeOfDay === 'day') {
    // Subtle watercolor warm parchment sunlight
    ctx.fillStyle = 'rgba(255, 245, 215, 0.04)';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    return;
  }

  ctx.save();

  // 1. Draw ambient sky tint
  let ambientColor = 'rgba(16, 22, 54, 0.58)'; // Night
  if (timeOfDay === 'dawn') {
    ambientColor = 'rgba(255, 170, 120, 0.18)';
  } else if (timeOfDay === 'sunset') {
    ambientColor = 'rgba(255, 115, 35, 0.28)';
  }

  ctx.fillStyle = ambientColor;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  // 2. Carve out warm point lights at Night or Sunset
  if (timeOfDay === 'night' || timeOfDay === 'sunset') {
    ctx.globalCompositeOperation = 'screen';

    for (const light of villagePointLights) {
      const pos = gridToScreen({ x: light.x, y: light.y, elevation: light.elevation }, camera, BASE_TILE);
      const z = camera.zoom;
      const cx = pos.x;
      const cy = pos.y + (BASE_TILE.height / 2) * z;

      let radius = light.radius * z;
      if (light.flicker) {
        radius += Math.sin(time * 0.007 + light.x * 10) * 3 * z;
      }

      // Check if light is within screen bounds
      if (cx + radius < 0 || cx - radius > viewport.width || cy + radius < 0 || cy - radius > viewport.height) {
        continue;
      }

      const grad = ctx.createRadialGradient(cx, cy, 2 * z, cx, cy, radius);
      grad.addColorStop(0, light.color);
      grad.addColorStop(0.5, light.color.replace(/[\d\.]+\)$/, '0.35)'));
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
