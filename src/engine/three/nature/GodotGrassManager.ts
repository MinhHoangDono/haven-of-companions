import * as THREE from 'three';
import { VoxelTerrainBuilder } from '../VoxelTerrainBuilder';

/**
 * Port of Godot `grass.gdshader`, `ground.gdshader`, and `dither.gdshaderinc` from GodotGrass.zip.
 * Features:
 * - 3D Tri-Quad Star Tuft geometry (3 intersecting quads at 60° angles) eliminating flat paper appearance
 * - High-density clustering specifically on green terrain blocks (VoxelTerrainBuilder.getBlockType === 'GRASS')
 * - 2x2 Texture Atlas mapping from `grass_basic_atlas.png`
 * - Root-anchored wind sway (tips sway with wind, base anchored to terrain)
 * - 3-stop Ghibli color gradient from `palette_01.tres`
 * - Bayer 4x4 matrix ordered dithering on fringe edges with opaque solid core
 */
export class GodotGrassManager {
  private instancedMesh: THREE.InstancedMesh;
  private material: THREE.ShaderMaterial;

  /**
   * Generates a 3D volumetric grass tuft composed of 3 vertical quads
   * intersecting at 0°, 60°, and 120° angles with pivot at ground level (Y = 0).
   * This provides full 3D body and parallax from all isometric camera angles.
   */
  private static create3DGrassTuftGeometry(width = 0.44, height = 0.50): THREE.BufferGeometry {
    const halfW = width / 2;
    const angles = [0, Math.PI / 3, (Math.PI * 2) / 3];

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    angles.forEach((angle, quadIdx) => {
      const cosA = Math.cos(angle) * halfW;
      const sinA = Math.sin(angle) * halfW;
      const baseIdx = quadIdx * 4;

      // 4 vertices per quad:
      // 0: bottom-left, 1: bottom-right, 2: top-left, 3: top-right
      positions.push(
        -cosA, 0,      -sinA, // 0
         cosA, 0,       sinA, // 1
        -cosA, height, -sinA, // 2
         cosA, height,  sinA  // 3
      );

      uvs.push(
        0, 0,
        1, 0,
        0, 1,
        1, 1
      );

      // Two triangles per quad (double-sided)
      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx + 2, baseIdx + 1, baseIdx + 3
      );
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }

  constructor(scene: THREE.Scene) {
    const textureLoader = new THREE.TextureLoader();
    const atlasTexture = textureLoader.load('textures/environment/grass_basic_atlas.png');
    atlasTexture.magFilter = THREE.NearestFilter;
    atlasTexture.minFilter = THREE.NearestFilter;

    // 3D Tri-Quad Star Tuft geometry: eliminates flat paper look from all 360° camera angles
    const geometry = GodotGrassManager.create3DGrassTuftGeometry(0.44, 0.50);

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

          // Solid core with Bayer 4x4 ordered dithering on subtle outer contour
          if (shapeAlpha < 0.22) {
            discard;
          }
          if (shapeAlpha < 0.50 && shapeAlpha < bayer4(gl_FragCoord.xy) * 0.28 + 0.22) {
            discard;
          }

          // 3-stop Color Gradient from palette_01.tres
          // Stop 1: #468232 (0.275, 0.510, 0.196) - Deep forest green
          // Stop 2: #75a743 (0.459, 0.655, 0.263) - Vibrant meadow green
          // Stop 3: #a8ca58 (0.659, 0.792, 0.345) - Warm sunlit lime green
          vec3 colDark = vec3(0.275, 0.510, 0.196);
          vec3 colMid  = vec3(0.459, 0.655, 0.263);
          vec3 colLit  = vec3(0.659, 0.792, 0.345);

          // Spatial noise factor based on world XZ
          float spatialNoise = sin(vWorldPos.x * 0.22) * cos(vWorldPos.z * 0.22) * 0.5 + 0.5;
          vec3 gradientCol = mix(colDark, colMid, smoothstep(0.1, 0.55, spatialNoise));
          gradientCol = mix(gradientCol, colLit, smoothstep(0.55, 0.95, spatialNoise));

          // Natural darkening towards blade base for depth
          gradientCol *= (0.75 + 0.25 * vHeightFactor);

          gl_FragColor = vec4(gradientCol, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    // Populate dense, clustered instances across grass biome terrain
    const maxCount = 2400;
    this.instancedMesh = new THREE.InstancedMesh(geometry, this.material, maxCount);
    this.instancedMesh.castShadow = false; // Prevents solid quad shadow artifacts
    this.instancedMesh.receiveShadow = true;

    const tileIndices = new Float32Array(maxCount);
    const dummy = new THREE.Object3D();

    let placed = 0;
    // Iterate across candidate coordinates with deterministic pseudo-random distribution
    for (let i = 0; i < maxCount && placed < maxCount; i++) {
      const rx = (Math.sin(i * 12.9898 + 1.23) * 0.5 + 0.5) * 50 - 25; // [-25, 25]
      const rz = (Math.cos(i * 78.233 + 4.56) * 0.5 + 0.5) * 50 - 25;  // [-25, 25]

      // Strict biome filtering: only spawn on true GRASS blocks
      const blockType = VoxelTerrainBuilder.getBlockType(rx, rz);
      if (blockType !== 'GRASS') continue;

      const terrainY = VoxelTerrainBuilder.getTopElevation(rx, rz);
      if (terrainY <= 0.3) continue;

      // Small jitter for natural cluster appearance
      const jitterX = (Math.sin(i * 37.1) * 0.35);
      const jitterZ = (Math.cos(i * 53.7) * 0.35);

      dummy.position.set(rx + jitterX, terrainY, rz + jitterZ);

      // Random Y rotation for variety
      dummy.rotation.y = (Math.sin(i * 43.123) * 0.5 + 0.5) * Math.PI * 2;

      // Natural scale variation (0.85 to 1.35)
      const s = 0.85 + (Math.sin(i * 3.14) * 0.5 + 0.5) * 0.5;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(placed, dummy.matrix);
      tileIndices[placed] = placed % 4;
      placed++;
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
