import { PlacedStructure, CityLayoutSaveData } from '../../../types/cityBuilder';
import { DynamicMeshLibrary } from './DynamicMeshLibrary';

export class CitySaveManager {
  public static readonly STORAGE_KEY = 'haven_city_layout_v1';

  /**
   * Serializes player structures into browser localStorage
   */
  public static saveToLocalStorage(structures: PlacedStructure[]): void {
    try {
      const payload: CityLayoutSaveData = {
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mapDimensions: { width: 70, depth: 70 },
        structures,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to save city layout to localStorage:', err);
    }
  }

  /**
   * Loads and validates player structures from browser localStorage
   */
  public static loadFromLocalStorage(): PlacedStructure[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as CityLayoutSaveData;
      if (!parsed || !Array.isArray(parsed.structures)) {
        return [];
      }

      // Filter and validate each structure entry
      return parsed.structures.filter((item) => {
        if (!item || typeof item.structureId !== 'string') return false;
        const def = DynamicMeshLibrary.getDefinition(item.structureId);
        return !!def;
      });
    } catch (err) {
      console.warn('Failed to load city layout from localStorage, returning empty layout:', err);
      return [];
    }
  }

  /**
   * Serializes current village structures to formatted JSON string
   */
  public static exportToJsonString(structures: PlacedStructure[]): string {
    const payload: CityLayoutSaveData = {
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mapDimensions: { width: 70, depth: 70 },
      structures,
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Triggers a browser download of the village layout as a .json file
   */
  public static downloadJsonFile(structures: PlacedStructure[], filename = 'haven_village_layout.json'): void {
    const jsonStr = this.exportToJsonString(structures);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Parses and validates an imported JSON string from file or clipboard
   */
  public static importFromJsonString(jsonStr: string): PlacedStructure[] {
    try {
      const parsed = JSON.parse(jsonStr) as CityLayoutSaveData;
      if (!parsed || !Array.isArray(parsed.structures)) {
        throw new Error('Dữ liệu JSON không hợp lệ hoặc thiếu mảng structures.');
      }

      const validList = parsed.structures.filter((item) => {
        if (!item || typeof item.structureId !== 'string') return false;
        const def = DynamicMeshLibrary.getDefinition(item.structureId);
        return !!def;
      });

      return validList;
    } catch (err) {
      throw new Error(`Lỗi đọc tập tin JSON: ${(err as Error).message}`);
    }
  }

  /**
   * Clears saved village layout from localStorage
   */
  public static clearLocalStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear localStorage:', err);
    }
  }
}
