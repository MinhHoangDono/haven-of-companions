import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export interface LoadedModelResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export class GLTFAssetLoader {
  private static instance: GLTFAssetLoader;
  private loader: GLTFLoader;
  private cache: Map<string, Promise<LoadedModelResult>> = new Map();
  private parsedCache: Map<string, LoadedModelResult> = new Map();

  private constructor() {
    this.loader = new GLTFLoader();
  }

  public static getInstance(): GLTFAssetLoader {
    if (!GLTFAssetLoader.instance) {
      GLTFAssetLoader.instance = new GLTFAssetLoader();
    }
    return GLTFAssetLoader.instance;
  }

  /**
   * Resolves model URL ensuring subpath hosting (GitHub Pages, Vercel, localhost) works seamlessly.
   */
  public resolveAssetUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const clean = url.replace(/^\.?\//, '');
    const base = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || './';
    return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
  }

  /**
   * Loads a GLB or GLTF model with caching.
   * If isSkinned is true (rigged characters), SkeletonUtils.clone is strictly used.
   */
  public async loadModel(url: string, isSkinned: boolean = false): Promise<LoadedModelResult> {
    const targetUrl = this.resolveAssetUrl(url);

    if (!this.cache.has(targetUrl)) {
      const loadPromise = new Promise<LoadedModelResult>((resolve) => {
        this.loader.load(
          targetUrl,
          (gltf) => {
            // Traverse meshes and configure materials & shadows
            gltf.scene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                if (mesh.material) {
                  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                  mats.forEach((mat) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.roughness = Math.max(mat.roughness, 0.4);
                    }
                  });
                }
              }
            });

            const result: LoadedModelResult = {
              scene: gltf.scene,
              animations: gltf.animations || [],
            };

            this.parsedCache.set(targetUrl, result);
            resolve(result);
          },
          undefined,
          (err) => {
            console.error(`[GLTFAssetLoader] Failed to load model at ${targetUrl}:`, err);
            resolve(this.createFallbackModel());
          }
        );
      });

      this.cache.set(targetUrl, loadPromise);
    }

    const cached = await this.cache.get(targetUrl)!;

    // Clone safely: SkinnedMesh requires SkeletonUtils to preserve bone bindings
    const clonedScene = isSkinned
      ? (SkeletonUtils.clone(cached.scene) as THREE.Group)
      : (cached.scene.clone(true) as THREE.Group);

    return {
      scene: clonedScene,
      animations: cached.animations,
    };
  }

  /**
   * Pre-warms the cache with an array of URLs
   */
  public async preloadBatch(urls: string[], isSkinned: boolean = false): Promise<void> {
    await Promise.all(urls.map((url) => this.loadModel(url, isSkinned)));
  }

  /**
   * Fallback object to ensure scene never crashes on network/asset failure
   */
  private createFallbackModel(): LoadedModelResult {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0xdfa642, roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.6;
    mesh.castShadow = true;
    group.add(mesh);
    return { scene: group, animations: [] };
  }
}

export const assetLoader = GLTFAssetLoader.getInstance();
