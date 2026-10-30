import React, { useState, useEffect } from 'react';
import { Character } from '../../types/character';
import { Sparkles, X, Shield, Trees, Compass, Check, Heart, Zap, Weight, Wind } from 'lucide-react';
import { CharacterPreview3D } from './CharacterPreview3D';
import { inventoryManager } from '../../engine/inventory/InventoryManager';
import { EquipSlot, InventoryItem } from '../../types/inventory';
import { audioManager } from '../../audio/audioManager';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onTriggerAbility: () => void;
}

const SLOT_CONFIG: { slot: EquipSlot; label: string; icon: string; category: string }[] = [
  { slot: 'mainWeapon', label: 'Vũ Khí Chính (Primary)', icon: '⚔️', category: 'weapon' },
  { slot: 'offhand', label: 'Tay Phụ / Khiên (Secondary)', icon: '🛡️', category: 'offhand' },
  { slot: 'headgear', label: 'Mũ & Nón (Headgear)', icon: '🪖', category: 'headgear' },
  { slot: 'cape', label: 'Áo Choàng (Cape & Mantle)', icon: '🧣', category: 'cape' },
  { slot: 'outfit', label: 'Y Phục & Giáp (Outfit / Robe)', icon: '👕', category: 'outfit' },
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onClose,
  onTriggerAbility,
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'inventory' | 'skills' | 'journal'>('inventory');
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot>('mainWeapon');
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);
  const [, setEquipVersion] = useState(0);

  // Auto-sync with inventoryManager state
  useEffect(() => {
    const unsub = inventoryManager.subscribe(() => {
      setEquipVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  if (!character) return null;

  const equipped = inventoryManager.getEquipped(character.id);
  const allItems = inventoryManager.getItems();

  const getEquippedItem = (slot: EquipSlot): InventoryItem | undefined => {
    const id = equipped[slot];
    return id ? inventoryManager.getItem(id) : undefined;
  };

  const currentSlotItems = allItems.filter((it) => it.equippable && it.equipSlot === selectedSlot);

  // Set default inspected item for the slot
  const currentlyEquippedInSlot = getEquippedItem(selectedSlot);
  const displayItem = inspectedItem || currentlyEquippedInSlot || currentSlotItems[0] || null;

  const getFactionIcon = () => {
    switch (character.faction) {
      case 'highlands':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'vanguard':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Compass className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleEquip = (item: InventoryItem) => {
    inventoryManager.equipItem(character.id, selectedSlot, item.id);
    setInspectedItem(item);
  };

  const handleUnequip = () => {
    inventoryManager.unequipItem(character.id, selectedSlot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/85 backdrop-blur-md animate-fade-in p-0 sm:p-3 lg:p-6 select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 hidden sm:block" onClick={onClose} />

      {/* Main RPG Screen Container (Widescreen Exodus Rising Style) */}
      <div className="relative w-full h-full sm:h-[92vh] sm:max-w-7xl bg-ink-950 border-0 sm:border sm:border-paper-800/80 rounded-none sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pt-safe pb-safe">
        {/* ======================================================== */}
        {/* TOP RPG NAVIGATION BAR (World Map, Skills, Inventory...) */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-ink-900 border-b border-paper-800/80 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-semibold text-paper-200/70 hover:text-paper-100 hover:bg-ink-800 transition-colors flex items-center gap-1.5"
              title="Quay lại bản đồ làng"
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Bản Đồ Làng</span>
            </button>

            <button
              onClick={() => {
                audioManager.playTap();
                setActiveNavTab('skills');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeNavTab === 'skills'
                  ? 'bg-fantasy-gold text-ink-950 shadow-md'
                  : 'text-paper-200/70 hover:text-paper-100 hover:bg-ink-800'
              }`}
            >
              <span>⚡</span>
              <span>Kỹ Năng</span>
            </button>

            <button
              onClick={() => {
                audioManager.playTap();
                setActiveNavTab('inventory');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeNavTab === 'inventory'
                  ? 'bg-fantasy-gold text-ink-950 shadow-md'
                  : 'text-paper-200/70 hover:text-paper-100 hover:bg-ink-800'
              }`}
            >
              <span>🎒</span>
              <span>Hành Trang & Tủ Đồ</span>
            </button>

            <button
              onClick={() => {
                audioManager.playTap();
                setActiveNavTab('journal');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeNavTab === 'journal'
                  ? 'bg-fantasy-gold text-ink-950 shadow-md'
                  : 'text-paper-200/70 hover:text-paper-100 hover:bg-ink-800'
              }`}
            >
              <span>📜</span>
              <span className="hidden sm:inline">Ký Ức Tri Kỷ</span>
            </button>
          </div>

          {/* Level / Close */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-ink-950 px-3 py-1 rounded-full border border-fantasy-gold/50 text-fantasy-gold font-serif font-bold text-xs shadow-inner">
              <span>Cấp 42</span>
              <span className="text-paper-800">•</span>
              <span className="text-paper-200/70 font-sans text-[11px]">5 EXP</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-paper-200 hover:text-paper-100 border border-paper-800 active:scale-95 transition-all"
              title="Đóng (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: 3-COLUMN EXODUS RISING RPG LAYOUT */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* ---------------------------------------------------- */}
          {/* COLUMN 1: INVENTORY & EQUIPMENT SELECTOR (LEFT) */}
          {/* ---------------------------------------------------- */}
          <div className="w-full lg:w-[380px] xl:w-[420px] bg-ink-950/90 border-b lg:border-b-0 lg:border-r border-paper-800/80 flex shrink-0 min-h-0 overflow-hidden">
            {/* Leftmost Vertical Slot Strip */}
            <div className="w-13 sm:w-14 bg-ink-950 border-r border-paper-800/60 flex flex-col items-center py-3 gap-2 shrink-0 overflow-y-auto scrollbar-none">
              {SLOT_CONFIG.map(({ slot, icon, label }) => {
                const isSelected = selectedSlot === slot;
                const isEquipped = !!getEquippedItem(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedSlot(slot);
                      setInspectedItem(null);
                    }}
                    className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-fantasy-gold text-ink-950 shadow-[0_0_12px_rgba(223,166,66,0.5)] scale-105'
                        : 'bg-ink-900 border border-paper-800/70 text-paper-200/70 hover:text-paper-100 hover:bg-ink-850'
                    }`}
                    title={label}
                  >
                    <span>{icon}</span>
                    {isEquipped && (
                      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Middle Inspection & Items List Panel */}
            <div className="flex-1 flex flex-col p-3 sm:p-4 min-w-0 bg-ink-900/60 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-paper-800/40">
                <h3 className="text-xs sm:text-sm font-serif font-bold text-fantasy-gold uppercase tracking-wider">
                  {SLOT_CONFIG.find((s) => s.slot === selectedSlot)?.label}
                </h3>
                <span className="text-[11px] font-sans text-paper-200/60 font-mono">
                  {currentSlotItems.length} vật phẩm
                </span>
              </div>

              {/* Upper Item Inspection Card */}
              {displayItem ? (
                <div className="bg-ink-950/80 border border-paper-800/60 rounded-2xl p-3 mb-3 shrink-0 shadow-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-ink-900 border border-paper-800/80 flex items-center justify-center text-2xl shrink-0 shadow-md">
                      {displayItem.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-paper-100 truncate">
                        {displayItem.name}
                      </h4>
                      <p className="text-[10px] font-sans text-paper-200/60 capitalize mt-0.5">
                        Phẩm cấp: <span className="text-fantasy-gold font-semibold uppercase">{displayItem.rarity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Attributes */}
                  {displayItem.stats && Object.keys(displayItem.stats).length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 bg-ink-900/80 rounded-lg p-2 mb-2 text-[11px] font-sans border border-paper-800/30">
                      {displayItem.stats.attack && <span className="text-red-400">⚔️ Công: +{displayItem.stats.attack}</span>}
                      {displayItem.stats.defense && <span className="text-blue-400">🛡️ Thủ: +{displayItem.stats.defense}</span>}
                      {displayItem.stats.magic && <span className="text-purple-400">🔮 Phép: +{displayItem.stats.magic}</span>}
                      {displayItem.stats.speed && <span className="text-emerald-400">💨 Tốc: +{displayItem.stats.speed}</span>}
                      {displayItem.stats.healing && <span className="text-yellow-400">💚 Hồi: +{displayItem.stats.healing}</span>}
                    </div>
                  )}

                  {/* Description & Lore */}
                  <p className="text-[11px] font-sans text-paper-200/80 leading-relaxed mb-1.5 line-clamp-2">
                    {displayItem.description}
                  </p>
                  <p className="text-[10px] font-sans text-paper-200/50 italic truncate">
                    "{displayItem.lore}"
                  </p>

                  {/* Action Button */}
                  <div className="mt-2.5 pt-2 border-t border-paper-800/40 flex gap-2">
                    {equipped[selectedSlot] === displayItem.id ? (
                      <button
                        onClick={handleUnequip}
                        className="w-full py-1.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-red-400 border border-red-500/30 text-xs font-sans font-bold active:scale-95 transition-all"
                      >
                        Gỡ Trang Bị
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEquip(displayItem)}
                        className="w-full py-1.5 rounded-xl bg-gradient-to-r from-fantasy-gold to-amber-500 text-ink-950 text-xs font-sans font-bold shadow-md active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Trang Bị Vào Ô Này</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-paper-200/40 text-xs font-sans bg-ink-950/40 rounded-xl mb-3">
                  Chọn một vật phẩm bên dưới để xem chi tiết
                </div>
              )}

              {/* Lower Scrollable Gear List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-0">
                {/* Unequip / Bare option */}
                <button
                  onClick={() => {
                    handleUnequip();
                    setInspectedItem(null);
                  }}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                    !equipped[selectedSlot]
                      ? 'bg-fantasy-gold/15 border-fantasy-gold text-fantasy-gold'
                      : 'bg-ink-950/60 border-paper-800/40 hover:bg-ink-900 text-paper-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚫</span>
                    <span className="text-xs font-serif font-bold">(Để Trống / Tháo Ra)</span>
                  </div>
                  {!equipped[selectedSlot] && (
                    <span className="text-[10px] font-mono font-bold bg-fantasy-gold text-ink-950 px-1.5 py-0.5 rounded">
                      [E]
                    </span>
                  )}
                </button>

                {currentSlotItems.map((item) => {
                  const isEquipped = equipped[selectedSlot] === item.id;
                  const isInspected = displayItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        audioManager.playTap();
                        setInspectedItem(item);
                      }}
                      onDoubleClick={() => handleEquip(item)}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                        isInspected
                          ? 'ring-1 ring-fantasy-gold bg-ink-900 border-fantasy-gold/80'
                          : 'bg-ink-950/70 border-paper-800/40 hover:bg-ink-900 text-paper-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-serif font-bold text-paper-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-sans text-paper-200/50 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {isEquipped && (
                        <div className="flex items-center gap-1 bg-fantasy-gold text-ink-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>[E]</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* COLUMN 2: CENTER 3D TALL CHARACTER VIEWPORT */}
          {/* ---------------------------------------------------- */}
          <div className="flex-1 flex flex-col relative bg-ink-950/95 overflow-hidden min-h-[360px] lg:min-h-0">
            {/* 3D Character Canvas */}
            <div className="w-full h-full relative">
              <CharacterPreview3D character={character} className="w-full h-full min-h-[360px] lg:min-h-full border-0 rounded-none" />

              {/* Quick Equipped Slots HUD Flanking the Character */}
              {/* Left Flank: Primary Weapon & Secondary Shield */}
              <div className="absolute top-6 left-4 flex flex-col gap-3 pointer-events-auto">
                <div className="bg-ink-950/85 backdrop-blur-md border border-paper-800/80 rounded-2xl p-2 shadow-xl flex flex-col items-center">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-paper-200/50 mb-1">
                    PRIMARY
                  </span>
                  <button
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedSlot('mainWeapon');
                    }}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all active:scale-95 ${
                      selectedSlot === 'mainWeapon'
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-md ring-1 ring-fantasy-gold'
                        : 'border-paper-800/60 bg-ink-900/80 hover:border-paper-700'
                    }`}
                    title="Vũ khí chính"
                  >
                    <span>{getEquippedItem('mainWeapon')?.icon || '⚔️'}</span>
                  </button>
                </div>

                <div className="bg-ink-950/85 backdrop-blur-md border border-paper-800/80 rounded-2xl p-2 shadow-xl flex flex-col items-center">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-paper-200/50 mb-1">
                    SECONDARY
                  </span>
                  <button
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedSlot('offhand');
                    }}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all active:scale-95 ${
                      selectedSlot === 'offhand'
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-md ring-1 ring-fantasy-gold'
                        : 'border-paper-800/60 bg-ink-900/80 hover:border-paper-700'
                    }`}
                    title="Tay phụ / Khiên"
                  >
                    <span>{getEquippedItem('offhand')?.icon || '🛡️'}</span>
                  </button>
                </div>
              </div>

              {/* Right Flank: Headgear, Cape, Outfit */}
              <div className="absolute top-6 right-4 flex flex-col gap-3 pointer-events-auto">
                <div className="bg-ink-950/85 backdrop-blur-md border border-paper-800/80 rounded-2xl p-2 shadow-xl flex flex-col items-center">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-paper-200/50 mb-1">
                    HELMET
                  </span>
                  <button
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedSlot('headgear');
                    }}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all active:scale-95 ${
                      selectedSlot === 'headgear'
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-md ring-1 ring-fantasy-gold'
                        : 'border-paper-800/60 bg-ink-900/80 hover:border-paper-700'
                    }`}
                    title="Mũ & Nón"
                  >
                    <span>{getEquippedItem('headgear')?.icon || '🪖'}</span>
                  </button>
                </div>

                <div className="bg-ink-950/85 backdrop-blur-md border border-paper-800/80 rounded-2xl p-2 shadow-xl flex flex-col items-center">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-paper-200/50 mb-1">
                    CAPE
                  </span>
                  <button
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedSlot('cape');
                    }}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all active:scale-95 ${
                      selectedSlot === 'cape'
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-md ring-1 ring-fantasy-gold'
                        : 'border-paper-800/60 bg-ink-900/80 hover:border-paper-700'
                    }`}
                    title="Áo choàng"
                  >
                    <span>{getEquippedItem('cape')?.icon || '🧣'}</span>
                  </button>
                </div>

                <div className="bg-ink-950/85 backdrop-blur-md border border-paper-800/80 rounded-2xl p-2 shadow-xl flex flex-col items-center">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-paper-200/50 mb-1">
                    OUTFIT
                  </span>
                  <button
                    onClick={() => {
                      audioManager.playTap();
                      setSelectedSlot('outfit');
                    }}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all active:scale-95 ${
                      selectedSlot === 'outfit'
                        ? 'border-fantasy-gold bg-fantasy-gold/20 shadow-md ring-1 ring-fantasy-gold'
                        : 'border-paper-800/60 bg-ink-900/80 hover:border-paper-700'
                    }`}
                    title="Trang phục & Giáp"
                  >
                    <span>{getEquippedItem('outfit')?.icon || '👕'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* COLUMN 3: CHARACTER DETAILS & RPG STATS (RIGHT) */}
          {/* ---------------------------------------------------- */}
          <div className="w-full lg:w-[340px] xl:w-[380px] bg-ink-900/95 border-t lg:border-t-0 lg:border-l border-paper-800/80 p-4 sm:p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-paper-800/60 mb-3.5">
                <span className="text-xs font-serif font-bold text-fantasy-gold uppercase tracking-wider">
                  Chi Tiết Nhân Vật
                </span>
                <div className="flex items-center gap-1.5">
                  {getFactionIcon()}
                  <span className="text-[11px] font-sans text-paper-200/60 font-semibold">
                    {character.factionName}
                  </span>
                </div>
              </div>

              {/* Name & Title */}
              <div className="mb-3.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-paper-100 truncate">
                    {character.name}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-sans bg-ink-800 border border-paper-800 text-paper-200/80 shrink-0">
                    {character.pronoun}
                  </span>
                </div>
                <p className="text-xs font-serif font-semibold text-amber-300">
                  {character.classTitle}
                </p>
              </div>

              {/* Experience Bar (Level 42 -> 43) */}
              <div className="bg-ink-950/80 border border-paper-800/40 rounded-xl p-2.5 mb-4 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-sans text-paper-200/70 mb-1">
                  <span>Cấp Độ: <strong className="text-fantasy-gold font-serif">42</strong></span>
                  <span>Tiến độ EXP: 75%</span>
                </div>
                <div className="w-full h-2 bg-ink-900 rounded-full overflow-hidden flex items-center p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-fantasy-gold transition-all duration-500 shadow-sm"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>

              {/* Big RPG Attribute Stat Blocks (Matching Exodus Rising Layout) */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-ink-950/70 border border-paper-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans uppercase text-paper-200/50 font-bold">Sinh Lực (HP)</p>
                      <p className="text-xs font-serif font-bold text-paper-100">Khỏe mạnh</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-red-400">500</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-ink-950/70 border border-paper-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans uppercase text-paper-200/50 font-bold">Ma Lực (Mana)</p>
                      <p className="text-xs font-serif font-bold text-paper-100">Dồi dào</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-purple-400">930</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-ink-950/70 border border-paper-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Weight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans uppercase text-paper-200/50 font-bold">Phòng Ngự & Giáp</p>
                      <p className="text-xs font-serif font-bold text-paper-100">Kiên cố</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-400">250</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-ink-950/70 border border-paper-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans uppercase text-paper-200/50 font-bold">Tốc Độ Di Chuyển</p>
                      <p className="text-xs font-serif font-bold text-paper-100">Nhanh nhẹn</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">110</span>
                </div>
              </div>

              {/* Chronicler's Lore (Real-Life Inspired Memories) */}
              <div className="p-3 rounded-xl bg-paper-100 text-ink-900 border border-paper-800/80 shadow-md mb-4">
                <h4 className="text-[11px] font-serif font-bold uppercase tracking-wider text-ink-800 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Kỷ Niệm Tri Kỷ</span>
                </h4>
                <p className="text-xs font-sans text-ink-800 leading-relaxed italic">
                  "{character.bio}"
                </p>
              </div>
            </div>

            {/* Signature Spell Trigger Button */}
            <button
              onClick={() => {
                onTriggerAbility();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-fantasy-gold via-amber-400 to-fantasy-gold text-ink-950 font-sans font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(223,166,66,0.35)] active:scale-95 transition-all hover:brightness-105 border border-yellow-200 flex items-center justify-center gap-2 shrink-0"
              title={`Thi triển kỹ năng đặc trưng ${character.signatureAbility.name}`}
            >
              <Sparkles className="w-4 h-4 text-ink-950 shrink-0" />
              <span className="truncate">Thi triển: {character.signatureAbility.name}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM PROMPT HINTS BAR (Matching Exodus Rising Style) */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 py-2 bg-ink-950 border-t border-paper-800/80 flex items-center justify-between text-[11px] font-sans text-paper-200/60 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-ink-800 border border-paper-800 font-mono text-[10px] text-paper-200 font-bold">RS</span>
              <span>Vuốt chuột/tay để xoay 360°</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-ink-800 border border-paper-800 font-mono text-[10px] text-paper-200 font-bold">LS</span>
              <span>Cuộn danh sách trang bị</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-ink-800 border border-paper-800 font-mono text-[10px] text-paper-200 font-bold">Y</span>
              <span>Nhấp đúp hoặc chạm để trang bị</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-paper-200/50">Tự động lưu ngoại trang</span>
          </div>
        </div>
      </div>
    </div>
  );
};
