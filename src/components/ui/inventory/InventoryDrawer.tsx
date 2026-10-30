import React, { useState, useEffect } from 'react';
import {
  InventoryItem,
  ItemCategory,
  ItemRarity,
  EquipSlot,
} from '../../../types/inventory';
import { Character } from '../../../types/character';
import { inventoryManager } from '../../../engine/inventory/InventoryManager';
import { audioManager } from '../../../audio/audioManager';
import { X, Shield, Sparkles, Check } from 'lucide-react';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  selectedCharId: string | null;
  onSelectCharacter?: (char: Character) => void;
  onToast?: (msg: string) => void;
}

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string }> = {
  common: { border: 'border-slate-500/50', bg: 'bg-slate-900/60', text: 'text-slate-300' },
  uncommon: { border: 'border-emerald-500/60', bg: 'bg-emerald-950/40', text: 'text-emerald-400' },
  rare: { border: 'border-blue-500/60', bg: 'bg-blue-950/40', text: 'text-blue-400' },
  epic: { border: 'border-purple-500/60', bg: 'bg-purple-950/40', text: 'text-purple-400' },
  legendary: { border: 'border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]', bg: 'bg-amber-950/40', text: 'text-amber-300' },
};

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  characters,
  selectedCharId,
  onToast,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [targetCharId, setTargetCharId] = useState<string>(selectedCharId || characters[0]?.id || '');

  // Keep items synced with inventoryManager
  useEffect(() => {
    setItems(inventoryManager.getItems());
    const unsub = inventoryManager.subscribe(() => {
      setItems(inventoryManager.getItems());
    });
    return unsub;
  }, []);

  // Sync target companion when selectedCharId changes
  useEffect(() => {
    if (selectedCharId) {
      setTargetCharId(selectedCharId);
    }
  }, [selectedCharId]);

  if (!isOpen) return null;

  const targetChar = characters.find((c) => c.id === targetCharId) || characters[0];
  const charEquip = targetChar ? inventoryManager.getEquipped(targetChar.id) : {};

  // Filter items by category
  const filteredItems = items.filter((it) => {
    if (it.quantity <= 0) return false;
    if (activeCategory === 'all') return true;
    return it.category === activeCategory;
  });

  const categories: { key: ItemCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất Cả', icon: '🎒' },
    { key: 'weapon', label: 'Vũ Khí', icon: '⚔️' },
    { key: 'offhand', label: 'Khiên & Phụ', icon: '🛡️' },
    { key: 'headgear', label: 'Mũ & Nón', icon: '🧙' },
    { key: 'cape', label: 'Áo Choàng', icon: '🧣' },
    { key: 'consumable', label: 'Tiêu Hao', icon: '🍵' },
    { key: 'collectible', label: 'Thu Thập', icon: '🪙' },
  ];

  const handleUseItem = (item: InventoryItem) => {
    const res = inventoryManager.useConsumable(item.id);
    if (res.success) {
      onToast?.(res.message);
    }
  };

  const handleEquipItem = (item: InventoryItem, slot?: EquipSlot) => {
    if (!targetChar || !item.equipSlot) return;
    const s = slot || item.equipSlot;
    inventoryManager.equipItem(targetChar.id, s, item.id);
    onToast?.(`Đã trang bị ${item.name} cho ${targetChar.name}!`);
  };

  const handleUnequipItem = (slot: EquipSlot) => {
    if (!targetChar) return;
    inventoryManager.unequipItem(targetChar.id, slot);
    onToast?.(`Đã gỡ trang bị ô ${slot} của ${targetChar.name}!`);
  };

  const isEquippedOnTarget = (itemId: string): boolean => {
    if (!charEquip) return false;
    return Object.values(charEquip).includes(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-0 sm:p-4 pointer-events-auto">
      {/* Click outside to close on desktop */}
      <div className="absolute inset-0 hidden sm:block" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-3xl bg-ink-950 border-t sm:border border-paper-800/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col pt-safe pb-safe">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-ink-900 border-b border-paper-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎒</span>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-fantasy-gold">
                Hành Trang & Rương Đồ Tri Kỷ
              </h2>
              <p className="text-[11px] font-sans text-paper-200/60">
                Chứa vũ khí, ngoại trang, báu vật và thảo mộc 3 vùng đất
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-ink-800 hover:bg-ink-700 text-paper-200/70 hover:text-paper-100 transition-all active:scale-95 border border-paper-800"
            title="Đóng hành trang"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Companion Target Selector */}
        <div className="px-4 sm:px-6 py-2.5 bg-ink-900/50 border-b border-paper-800/40 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-serif font-semibold text-paper-200">Trang bị cho:</span>
            <select
              value={targetCharId}
              onChange={(e) => setTargetCharId(e.target.value)}
              className="bg-ink-800 border border-fantasy-gold/40 text-fantasy-gold rounded-xl px-3 py-1 text-xs font-serif font-bold focus:outline-none focus:border-fantasy-gold"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.classTitle})
                </option>
              ))}
            </select>
          </div>

          {targetChar && (
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-sans text-paper-200/70">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: targetChar.color.primary }} />
              <span>{targetChar.classTitle}</span>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-6 py-2 bg-ink-950 border-b border-paper-800/40 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  audioManager.playTap();
                  setActiveCategory(cat.key);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? 'bg-fantasy-gold text-ink-950 font-bold shadow-md'
                    : 'bg-ink-900/90 text-paper-200/70 hover:text-paper-100 hover:bg-ink-800 border border-paper-800/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area: Left Items Grid + Right Details Panel */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Items Grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2.5 sm:gap-3 content-start">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-paper-200/50 text-xs font-sans">
                Chưa có vật phẩm trong danh mục này.
              </div>
            ) : (
              filteredItems.map((item) => {
                const rarityStyle = RARITY_COLORS[item.rarity];
                const isSelected = selectedItem?.id === item.id;
                const isEquipped = isEquippedOnTarget(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedItem(item);
                    }}
                    className={`relative p-2.5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all active:scale-95 min-h-[92px] ${
                      rarityStyle.bg
                    } ${rarityStyle.border} ${
                      isSelected ? 'ring-2 ring-fantasy-gold shadow-lg scale-[1.02]' : 'hover:brightness-110'
                    }`}
                  >
                    {/* Equipped Badge */}
                    {isEquipped && (
                      <div className="absolute top-1.5 left-1.5 bg-fantasy-gold text-ink-950 rounded-full p-0.5 shadow-md">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Quantity Badge */}
                    {item.quantity > 1 && (
                      <span className="absolute top-1.5 right-1.5 bg-ink-950/80 border border-paper-800/60 text-paper-100 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                        x{item.quantity}
                      </span>
                    )}

                    {/* Item Icon */}
                    <span className="text-3xl my-1">{item.icon}</span>

                    {/* Item Name */}
                    <span className="text-[11px] font-serif font-semibold text-paper-100 line-clamp-1 w-full" title={item.name}>
                      {item.name}
                    </span>

                    {/* Rarity Label */}
                    <span className={`text-[9px] font-sans font-medium uppercase tracking-wider ${rarityStyle.text}`}>
                      {item.rarity}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Details / Action Drawer */}
          {selectedItem && (
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-paper-800/60 bg-ink-900/95 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
              <div>
                {/* Details Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 ${RARITY_COLORS[selectedItem.rarity].bg} ${RARITY_COLORS[selectedItem.rarity].border}`}>
                    {selectedItem.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-serif font-bold text-paper-100 leading-snug">
                      {selectedItem.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-sans uppercase font-bold ${RARITY_COLORS[selectedItem.rarity].text}`}>
                        {selectedItem.rarity}
                      </span>
                      <span className="text-[10px] text-paper-200/50">•</span>
                      <span className="text-[10px] font-sans text-paper-200/70 capitalize">
                        {selectedItem.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat Bonuses */}
                {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                  <div className="bg-ink-950/80 rounded-xl p-2.5 mb-3 border border-paper-800/40">
                    <span className="text-[10px] font-serif uppercase tracking-wider text-fantasy-gold font-bold block mb-1">
                      Chỉ Số Thuộc Tính
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-sans">
                      {selectedItem.stats.attack && (
                        <div className="text-red-400">⚔️ Công: +{selectedItem.stats.attack}</div>
                      )}
                      {selectedItem.stats.defense && (
                        <div className="text-blue-400">🛡️ Thủ: +{selectedItem.stats.defense}</div>
                      )}
                      {selectedItem.stats.magic && (
                        <div className="text-purple-400">🔮 Phép: +{selectedItem.stats.magic}</div>
                      )}
                      {selectedItem.stats.speed && (
                        <div className="text-emerald-400">💨 Tốc: +{selectedItem.stats.speed}</div>
                      )}
                      {selectedItem.stats.healing && (
                        <div className="text-yellow-400">💚 Hồi phục: +{selectedItem.stats.healing}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs font-sans text-paper-200/90 leading-relaxed mb-2.5">
                  {selectedItem.description}
                </p>

                {/* Whimsical Lore */}
                <div className="p-2.5 rounded-xl bg-ink-950/50 border border-paper-800/30 text-[11px] font-sans text-paper-200/60 italic leading-relaxed mb-4">
                  "{selectedItem.lore}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-paper-800/40">
                {selectedItem.equippable && (
                  <div className="flex gap-2">
                    {isEquippedOnTarget(selectedItem.id) ? (
                      <button
                        onClick={() => handleUnequipItem(selectedItem.equipSlot!)}
                        className="flex-1 py-2 px-3 rounded-xl bg-ink-800 hover:bg-ink-700 text-red-300 border border-red-500/40 text-xs font-sans font-bold active:scale-95 transition-all"
                      >
                        Gỡ Trang Bị
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEquipItem(selectedItem)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-fantasy-gold to-amber-500 text-ink-950 text-xs font-sans font-bold shadow-md active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Trang bị cho {targetChar.name}</span>
                      </button>
                    )}
                  </div>
                )}

                {selectedItem.usable && (
                  <button
                    onClick={() => handleUseItem(selectedItem)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-paper-100 text-xs font-sans font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sử dụng ({selectedItem.quantity})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
