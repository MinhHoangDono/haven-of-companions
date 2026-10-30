import * as THREE from 'three';
import { VoxelTerrainBuilder } from '../VoxelTerrainBuilder';

/**
 * Port of Godot `grass.gdshader`, `ground.gdshader`, and `dither.gdshaderinc` from GodotGrass.zip.
 * Features:
 * - High-performance THREE.InstancedMesh (1,200 grass blades across town & highlands)
 * - 2x2 Texture Atlas mapping from `grass_basic_atlas.png`
 * - Root-anchored wind sway (tips sway with wind, base anchored to terrain)
 * - 3-stop Ghibli color gradient from `palette_01.tres`
 * - Bayer 4x4 matrix ordered dithering to eliminate alpha sorting artifacts
 */
export class GodotGrassManager {
  private instancedMesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;

  constructor(scene: THREE.Scene) {
    const textureLoader = new THREE.TextureLoader();
    const atlasTexture = textureLoader.load('textures/environment/grass_basic_atlas.png');
    atlasTexture.magFilter = THREE.NearestFilter;
    atlasTexture.minFilter = THREE.NearestFilter;

    // Grass blade geometry: centered quad of width 0.35m, height 0.45m, pivot at bottom center
    const geometry = new THREE.PlaneGeometry(0.35, 0.45);
    geometry.translate(0, 0.225, 0); // shift pivot to bottom edge

    // Material with custom shaders porting grass.gdshader & dither.gdshaderinc
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uShapeAtlas: { value: atlasTexture },
        uWindVelocity: { value: new THREE.Vector2(0.3, 0.2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uWindVelocity;

        attribute float aTileIndex;

        varying vec2 vAtlasUv;
        varying vec3 vWorldPos;
        varying float vHeightFactor;

        void main() {
          vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vHeightFactor = uv.y;

          // 2x2 Atlas UV selection
          float tile = mod(aTileIndex, 4.0);
          float col = mod(tile, 2.0);
          float row = floor(tile / 2.0);
          vAtlasUv = uv * 0.5 + vec2(col * 0.5, row * 0.5);

          // Root-anchored wind sway (pow(uv.y, 1.8) keeps base fixed at 0 displacement)
          vec3 transformed = position;
          float windNoise = sin(uTime * 3.2 + worldPos.x * 0.6 + worldPos.z * 0.7);
          float windStrength = pow(uv.y, 1.8) * 0.14;
          transformed.x += uWindVelocity.x * windNoise * windStrength;
          transformed.z += uWindVelocity.y * windNoise * windStrength;

          gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uShapeAtlas;

        varying vec2 vAtlasUv;
        varying vec3 vWorldPos;
        varying float vHeightFactor;

        // Constant 4x4 Bayer Matrix lookup without dynamic array allocations
        float bayer4(vec2 frag) {
          int x = int(mod(frag.x, 4.0));
          int y = int(mod(frag.y, 4.0));
          float v = 0.0;
          if (y == 0) {
            v = (x == 0) ? 0.0 : (x == 1) ? 8.0 : (x == 2) ? 2.0 : 10.0;
          } else if (y == 1) {
            v = (x == 0) ? 12.0 : (x == 1) ? 4.0 : (x == 2) ? 14.0 : 6.0;
          } else if (y == 2) {
            v = (x == 0) ? 3.0 : (x == 1) ? 11.0 : (x == 2) ? 1.0 : 9.0;
          } else {
            v = (x == 0) ? 15.0 : (x == 1) ? 7.0 : (x == 2) ? 13.0 : 5.0;
          }
          return v / 16.0;
        }
        void main() {
          vec4 texColor = texture2D(uShapeAtlas, vAtlasUv);
          float shapeAlpha = texColor.a > 0.0 ? texColor.a : texColor.r;

          // Bayer 4x4 ordered dithering on alpha cutoff
          float ditherThreshold = bayer4(gl_FragCoord.xy) * 0.4 + 0.35;
          if (shapeAlpha < ditherThreshold) {
            discard;
          }

          // 3-stop Color Gradient from palette_01.tres
          // Stop 1: #468232 (0.275, 0.510, 0.196)
          // Stop 2: #75a743 (0.459, 0.655, 0.263)
          // Stop 3: #a8ca58 (0.659, 0.792, 0.345)
          vec3 colDark = vec3(0.275, 0.510, 0.196);
          vec3 colMid  = vec3(0.459, 0.655, 0.263);
          vec3 colLit  = vec3(0.659, 0.792, 0.345);

          // Spatial noise factor based on world XZ
          float spatialNoise = sin(vWorldPos.x * 0.2) * cos(vWorldPos.z * 0.2) * 0.5 + 0.5;
          vec3 gradientCol = mix(colDark, colMid, smoothstep(0.1, 0.55, spatialNoise));
          gradientCol = mix(gradientCol, colLit, smoothstep(0.55, 0.95, spatialNoise));

          // Slight darkening towards blade base
          gradientCol *= (0.75 + 0.25 * vHeightFactor);

          gl_FragColor = vec4(gradientCol, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    // Populate instances across valid grass terrain coordinates
    const count = 1200;
    this.instancedMesh = new THREE.InstancedMesh(geometry, this.material, count);
    this.instancedMesh.castShadow = false; // Prevents solid quad shadow artifacts on ground
    this.instancedMesh.receiveShadow = true;

    const tileIndices = new Float32Array(count);
    const dummy = new THREE.Object3D();

    let placed = 0;
    // Distribute grass instances across the terrain tiers
    // Highlands Tier: X [-25, -5], Z [-25, -5]
    // Town Greenery & Coastline: X [-10, 15], Z [-15, 10]
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random distribution
      const rx = (Math.sin(i * 12.9898) * 0.5 + 0.5) * 44 - 24; // [-24, 20]
      const rz = (Math.cos(i * 78.233) * 0.5 + 0.5) * 44 - 24;  // [-24, 20]

      // Sample height from VoxelTerrainBuilder
      const terrainY = VoxelTerrainBuilder.getTopElevation(rx, rz);

      // Only place grass on non-water terrain (elevation > 0.3)
      if (terrainY > 0.3) {
        dummy.position.set(rx, terrainY, rz);
        // Random Y rotation for variety
        dummy.rotation.y = (Math.sin(i * 43.123) * 0.5 + 0.5) * Math.PI * 2;
        // Slight scale variation
        const s = 0.8 + (Math.sin(i * 3.14) * 0.5 + 0.5) * 0.4;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        this.instancedMesh.setMatrixAt(placed, dummy.matrix);
        tileIndices[placed] = placed % 4;
        placed++;
      }
    }

    this.instancedMesh.count = placed;
    geometry.setAttribute('aTileIndex', new THREE.InstancedBufferAttribute(tileIndices, 1));
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    scene.add(this.instancedMesh);
  }

  public update(timeInSeconds: number): void {
    this.material.uniforms.uTime.value = timeInSeconds;
  }

  public dispose(scene: THREE.Scene): void {
    scene.remove(this.instancedMesh);
    this.instancedMesh.geometry.dispose();
    this.material.dispose();
  }
}
