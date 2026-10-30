import {
  InventoryItem,
  AllCompanionsEquipment,
  CharacterEquipment,
  EquipSlot,
  ActiveBuff,
} from '../../types/inventory';
import { INITIAL_ITEMS_CATALOG } from '../../data/itemsData';
import { audioManager } from '../../audio/audioManager';

const INVENTORY_STORAGE_KEY = 'haven_inventory_items_v2';
const EQUIPMENT_STORAGE_KEY = 'haven_equipment_v2';
const BUFFS_STORAGE_KEY = 'haven_active_buffs_v2';

export class InventoryManager {
  private static instance: InventoryManager;

  private items: Map<string, InventoryItem> = new Map();
  private equipment: AllCompanionsEquipment = {};
  private activeBuffs: ActiveBuff[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadState();
  }

  public static getInstance(): InventoryManager {
    if (!this.instance) {
      this.instance = new InventoryManager();
    }
    return this.instance;
  }

  /**
   * Subscribe to inventory and equipment changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Load state from localStorage or initialize defaults
   */
  private loadState() {
    // 1. Initialize items map from catalog
    INITIAL_ITEMS_CATALOG.forEach((item) => {
      this.items.set(item.id, { ...item });
    });

    // 2. Load custom item quantities from localStorage
    try {
      const savedItems = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (savedItems) {
        const parsed = JSON.parse(savedItems) as Record<string, number>;
        Object.entries(parsed).forEach(([id, qty]) => {
          if (this.items.has(id)) {
            this.items.get(id)!.quantity = qty;
          }
        });
      }
    } catch (e) {
      console.warn('[InventoryManager] Failed to load inventory from localStorage', e);
    }

    // 3. Load companion equipment
    const defaultEquipment: AllCompanionsEquipment = {
      'anh-thi-druid': { mainWeapon: 'weapon_druid_staff', cape: 'cape_highland_emerald', outfit: 'outfit_class_armor' },
      'phuong-quynh-ranger': { mainWeapon: 'weapon_elven_bow', offhand: 'offhand_quiver', headgear: 'headgear_feather_cap', outfit: 'outfit_class_armor' },
      'tram-anh-bard': { mainWeapon: 'weapon_rogue_dagger', offhand: 'offhand_festive_stein', outfit: 'outfit_class_armor' },
      'khai-van-sorcerer': { mainWeapon: 'weapon_sorcerer_grimoire', headgear: 'headgear_wizard_hat', outfit: 'outfit_class_armor' },
      'thao-uyen-cleric': { mainWeapon: 'weapon_starlight_wand', offhand: 'offhand_badge_shield', headgear: 'headgear_golden_halo', outfit: 'outfit_class_armor' },
      'ngoc-ha-monk': { mainWeapon: 'weapon_ronin_blade', outfit: 'outfit_class_armor' },
      'thanh-phuong-paladin': { mainWeapon: 'weapon_knight_sword', offhand: 'offhand_square_shield', headgear: 'headgear_knight_helm', cape: 'cape_royal_crimson', outfit: 'outfit_class_armor' },
      'xuan-minh-rogue': { mainWeapon: 'weapon_rogue_dagger', headgear: 'headgear_tricorn_hat', outfit: 'outfit_class_armor' },
      'anh-thu-cleric': { mainWeapon: 'weapon_ocean_trident', cape: 'cape_ocean_azure', outfit: 'outfit_class_armor' },
    };

    try {
      const savedEquip = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
      if (savedEquip) {
        this.equipment = { ...defaultEquipment, ...JSON.parse(savedEquip) };
      } else {
        this.equipment = defaultEquipment;
      }
    } catch {
      this.equipment = defaultEquipment;
    }

    // 4. Load or clean expired buffs
    try {
      const savedBuffs = localStorage.getItem(BUFFS_STORAGE_KEY);
      if (savedBuffs) {
        const parsed = JSON.parse(savedBuffs) as ActiveBuff[];
        const now = Date.now();
        this.activeBuffs = parsed.filter((b) => b.expiresAt > now);
      }
    } catch {
      this.activeBuffs = [];
    }
  }

  /**
   * Persist state to localStorage
   */
  private saveState() {
    try {
      // Save item quantities
      const itemQuantities: Record<string, number> = {};
      this.items.forEach((item, id) => {
        itemQuantities[id] = item.quantity;
      });
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(itemQuantities));

      // Save equipment
      localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(this.equipment));

      // Save active buffs
      const now = Date.now();
      const validBuffs = this.activeBuffs.filter((b) => b.expiresAt > now);
      localStorage.setItem(BUFFS_STORAGE_KEY, JSON.stringify(validBuffs));
    } catch (e) {
      console.warn('[InventoryManager] Failed to save state to localStorage', e);
    }
  }

  // ==========================================
  // ITEMS API
  // ==========================================

  public getItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  public getItem(id: string): InventoryItem | undefined {
    return this.items.get(id);
  }

  public addItem(id: string, count = 1): void {
    const item = this.items.get(id);
    if (item) {
      item.quantity += count;
    } else {
      const catalogItem = INITIAL_ITEMS_CATALOG.find((it) => it.id === id);
      if (catalogItem) {
        this.items.set(id, { ...catalogItem, quantity: count });
      }
    }
    this.notify();
  }

  public removeItem(id: string, count = 1): boolean {
    const item = this.items.get(id);
    if (!item || item.quantity < count) return false;
    item.quantity -= count;
    this.notify();
    return true;
  }

  /**
   * Automatically loot items picked up in the 3D diorama
   */
  public addLootFromWorld(lootType: string): InventoryItem | null {
    let targetId: string | null = null;
    switch (lootType) {
      case 'gold_coin':
        targetId = 'collectible_sunspire_gold';
        break;
      case 'tea_leaf':
        targetId = 'collectible_dalat_tea_leaf';
        break;
      case 'sea_bell':
      case 'sea_shell':
        targetId = 'collectible_nhatrang_shell';
        break;
      case 'fireworks_mortar':
      case 'firework_ember':
        targetId = 'collectible_firework_ember';
        break;
    }

    if (targetId) {
      this.addItem(targetId, 1);
      return this.items.get(targetId) || null;
    }
    return null;
  }

  // ==========================================
  // EQUIPMENT API
  // ==========================================

  public getEquipped(charId: string): CharacterEquipment {
    return this.equipment[charId] || {};
  }

  public equipItem(charId: string, slot: EquipSlot, itemId: string | null): void {
    if (!this.equipment[charId]) {
      this.equipment[charId] = {};
    }

    this.equipment[charId][slot] = itemId;
    audioManager.playTap();
    this.notify();
  }

  public unequipItem(charId: string, slot: EquipSlot): void {
    if (this.equipment[charId]) {
      this.equipment[charId][slot] = null;
      audioManager.playTap();
      this.notify();
    }
  }

  public getAllEquipment(): AllCompanionsEquipment {
    return JSON.parse(JSON.stringify(this.equipment));
  }

  public loadEquipment(newEquip: AllCompanionsEquipment): void {
    if (newEquip && typeof newEquip === 'object') {
      this.equipment = { ...this.equipment, ...newEquip };
      this.notify();
    }
  }

  public getInventoryRecord(): Record<string, number> {
    const record: Record<string, number> = {};
    this.items.forEach((item, id) => {
      record[id] = item.quantity;
    });
    return record;
  }

  public loadInventory(record: Record<string, number>): void {
    if (record && typeof record === 'object') {
      Object.entries(record).forEach(([id, qty]) => {
        if (this.items.has(id)) {
          this.items.get(id)!.quantity = qty;
        }
      });
      this.notify();
    }
  }

  // ==========================================
  // CONSUMABLES & BUFFS API
  // ==========================================

  public useConsumable(itemId: string): { success: boolean; message: string; effect?: string } {
    const item = this.items.get(itemId);
    if (!item || !item.usable || item.quantity <= 0) {
      return { success: false, message: 'Vật phẩm không khả dụng hoặc đã hết!' };
    }

    item.quantity -= 1;
    const now = Date.now();
    const duration = item.effectDuration || 15000;

    let buffName = item.name;
    let speedMul = 1.0;

    switch (item.useEffect) {
      case 'speed_boost':
        speedMul = 1.35;
        buffName = 'Tốc Biến Cao Nguyên (+35% tốc độ)';
        audioManager.playToast();
        break;
      case 'fireworks':
        buffName = 'Khúc Hỏa Giao Thừa';
        audioManager.playCelebrationCheer();
        break;
      case 'confetti':
        buffName = 'Đại Tiệc Tri Kỷ';
        audioManager.playCelebrationCheer();
        break;
      case 'healing_aura':
        buffName = 'Hải Thủy Thanh Khiết (Hồi phục & Bảo hộ)';
        audioManager.playToast();
        break;
      default:
        audioManager.playTap();
        break;
    }

    // Add or refresh active buff
    this.activeBuffs = this.activeBuffs.filter((b) => b.type !== item.useEffect && b.expiresAt > now);
    if (item.useEffect) {
      this.activeBuffs.push({
        id: `buff_${Date.now()}`,
        type: item.useEffect,
        name: buffName,
        icon: item.icon,
        expiresAt: now + duration,
        speedMultiplier: speedMul,
      });
    }

    this.notify();
    return {
      success: true,
      message: `Đã sử dụng ${item.name}!`,
      effect: item.useEffect,
    };
  }

  public getActiveBuffs(): ActiveBuff[] {
    const now = Date.now();
    this.activeBuffs = this.activeBuffs.filter((b) => b.expiresAt > now);
    return [...this.activeBuffs];
  }

  public getSpeedMultiplier(): number {
    const now = Date.now();
    const active = this.activeBuffs.find((b) => b.expiresAt > now && b.speedMultiplier && b.speedMultiplier > 1);
    return active?.speedMultiplier || 1.0;
  }
}

export const inventoryManager = InventoryManager.getInstance();
