export interface GridCoord {
  x: number;
  y: number;
  elevation?: number;
}

export interface ScreenCoord {
  x: number;
  y: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
  isPanning: boolean;
}

export interface Viewport {
  width: number;
  height: number;
  dpr: number;
}

export interface TileDimensions {
  width: number;
  height: number;
}

export const BASE_TILE: TileDimensions = {
  width: 128,
  height: 64,
};
