---
title: "Phase 2: Asset Pipeline & GLTF Asset Loader"
status: pending
priority: P1
effort: 2h
tags: [threejs, gltf, loader, caching, skeleton-utils]
---

# Phase 2: Asset Pipeline & GLTF Asset Loader

## 1. Overview

In Three.js applications, naive repeated calls to `new GLTFLoader().load()` create duplicate network requests, inflate memory usage, and break skinned character meshes when using standard `.clone()`.

This phase implements a dedicated, robust asset manager in **`src/engine/three/GLTFAssetLoader.ts`** that provides:
1. **Singleton Pre-Caching**: Fetches each `.glb` file once and stores the parsed scene in memory.
2. **Safe Skeletal Cloning**: Uses `SkeletonUtils.clone()` from `three/addons/utils/SkeletonUtils.js` for rigged character models so bone rigs and animations are preserved on duplicate instances.
3. **Automatic Shadow Traversal**: Traverses all geometry meshes to enable `castShadow = true` and `receiveShadow = true`.
4. **Batch Pre-loading**: Pre-warms the cache during initial game boot to eliminate model pop-in.
5. **Fail-Safe Fallbacks**: Returns a lightweight fallback object if a network error occurs, ensuring the game never crashes.

---

## 2. File Implementation Specification

**Target File**: `src/engine/three/GLTFAssetLoader.ts`

```typescript
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
   * Loads a GLB model or returns a cached clone.
   * If isSkinned is true (characters), uses SkeletonUtils to clone bones cleanly.
   */
  public async loadModel(url: string, isSkinned: boolean = false): Promise<LoadedModelResult> {
    if (!this.cache.has(url)) {
      const loadPromise = new Promise<LoadedModelResult>((resolve, reject) => {
        this.loader.load(
          url,
          (gltf) => {
            // Traverse meshes and configure materials & shadows
            gltf.scene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // Ensure materials respond accurately to ACESFilmic tone mapping
                if (mesh.material) {
                  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                  mats.forEach((mat) => {
                    mat.roughness = Math.max(mat.roughness ?? 0.6, 0.4);
                  });
                }
              }
            });

            const result: LoadedModelResult = {
              scene: gltf.scene,
              animations: gltf.animations || [],
            };

            this.parsedCache.set(url, result);
            resolve(result);
          },
          undefined,
          (err) => {
            console.error(`[GLTFAssetLoader] Error loading model ${url}:`, err);
            // Return safe fallback cube on error
            resolve(this.createFallbackModel());
          }
        );
      });

      this.cache.set(url, loadPromise);
    }

    const cached = await this.cache.get(url)!;

    // Clone instance safely
    const clonedScene = isSkinned
      ? (SkeletonUtils.clone(cached.scene) as THREE.Group)
      : (cached.scene.clone(true) as THREE.Group);

    return {
      scene: clonedScene,
      animations: cached.animations,
    };
  }

  /**
   * Pre-warms the cache with an array of URLs.
   */
  public async preloadBatch(urls: string[], isSkinned: boolean = false): Promise<void> {
    await Promise.all(urls.map((url) => this.loadModel(url, isSkinned)));
  }

  /**
   * Emergency fallback placeholder if network fails.
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
```

---

## 3. Key Invariants

1. **Skeleton Clone Safety**: Normal `group.clone(true)` breaks skeletal animation weights and disconnects bone matrices. `SkeletonUtils.clone()` is strictly required for `character-*.glb` humanoid meshes.
2. **Shadow Enablement**: Shadows are enabled during the initial parse pass so clones inherit valid shadow configurations without re-traversal overhead.
3. **No Double Fetch**: Promise caching prevents duplicate HTTP requests even if multiple components request the same model concurrently.

---

## 4. Verification Gate

- Run unit test / build check: `npm run build`.
- Verify `GLTFAssetLoader` instantiates and loads `character-f.glb` cleanly.
- Verify cloning an already-loaded model completes in $< 2\text{ms}$ synchronously from memory.
