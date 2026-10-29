import { CameraState, Viewport, BASE_TILE } from '../types/engine';
import { WeatherType } from '../components/ui/TopBar';
import { gridToScreen } from './isometric';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'mist' | 'ember' | 'wave_spray' | 'ability_nature' | 'ability_aegis' | 'ability_firework' | 'ability_water';
  alpha: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 180;

  public spawnEmber(gridX: number, gridY: number) {
    if (this.particles.length >= this.maxParticles) return;

    this.particles.push({
      x: gridX + (Math.random() - 0.5) * 0.4,
      y: gridY + (Math.random() - 0.5) * 0.4,
      vx: (Math.random() - 0.5) * 0.008,
      vy: -0.015 - Math.random() * 0.02,
      life: 0,
      maxLife: 80 + Math.random() * 40,
      size: 2 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#ff8020' : '#ffb030',
      type: 'ember',
      alpha: 0.9,
    });
  }

  public spawnMist(gridX: number, gridY: number) {
    if (this.particles.length >= this.maxParticles) return;

    this.particles.push({
      x: gridX,
      y: gridY + (Math.random() - 0.5) * 2,
      vx: 0.012 + Math.random() * 0.015,
      vy: (Math.random() - 0.5) * 0.005,
      life: 0,
      maxLife: 220 + Math.random() * 80,
      size: 40 + Math.random() * 30,
      color: 'rgba(225, 240, 245, 0.14)',
      type: 'mist',
      alpha: 0.14,
    });
  }

  public triggerAbilityBurst(gridX: number, gridY: number, type: 'nature_bloom' | 'aegis_shield' | 'firework_burst' | 'water_slash') {
    const count = type === 'firework_burst' ? 50 : 35;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
      const speed = type === 'firework_burst' ? (0.04 + Math.random() * 0.06) : (0.03 + Math.random() * 0.04);

      let color = '#4ade80';
      let pType: Particle['type'] = 'ability_nature';

      if (type === 'nature_bloom') {
        color = Math.random() > 0.4 ? '#4ade80' : '#facc15';
        pType = 'ability_nature';
      } else if (type === 'aegis_shield') {
        color = Math.random() > 0.3 ? '#38bdf8' : '#e0e7ff';
        pType = 'ability_aegis';
      } else if (type === 'firework_burst') {
        const palette = ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7'];
        color = palette[Math.floor(Math.random() * palette.length)];
        pType = 'ability_firework';
      } else if (type === 'water_slash') {
        color = Math.random() > 0.3 ? '#06b6d4' : '#bae6fd';
        pType = 'ability_water';
      }

      this.particles.push({
        x: gridX,
        y: gridY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 30,
        size: 3 + Math.random() * 3,
        color,
        type: pType,
        alpha: 1.0,
      });
    }
  }

  public update(weather: WeatherType) {
    // 1. Natural ambient spawns
    // Campfire embers (at grid 6, 7)
    if (Math.random() < 0.35) {
      this.spawnEmber(6, 7);
    }

    // Highland mist if weather is mist
    if (weather === 'mist' && Math.random() < 0.25) {
      this.spawnMist(Math.random() * 4, Math.random() * 12);
    }

    // 2. Physics & lifetime integration
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      if (p.type === 'ember') {
        p.vx += (Math.random() - 0.5) * 0.002;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      } else if (p.type === 'mist') {
        p.alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.16;
      } else {
        // Ability particles
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    camera: CameraState,
    _viewport: Viewport
  ) {
    const z = camera.zoom;

    for (const p of this.particles) {
      const screenPos = gridToScreen({ x: p.x, y: p.y, elevation: 0 }, camera, BASE_TILE);
      const cx = screenPos.x;
      const cy = screenPos.y + (BASE_TILE.height / 2) * z;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'mist') {
        const radGrad = ctx.createRadialGradient(cx, cy, 2 * z, cx, cy, p.size * z);
        radGrad.addColorStop(0, 'rgba(230, 245, 250, 0.2)');
        radGrad.addColorStop(1, 'rgba(230, 245, 250, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size * z, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ember') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size * z, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Ability sparkle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size * z, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
