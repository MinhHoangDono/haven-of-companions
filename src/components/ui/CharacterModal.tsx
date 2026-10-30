import React, { useState, useEffect } from 'react';
import { Character, AbilityEffectType } from '../../types/character';
import { allCharacters } from '../../data/charactersData';
import {
  Sparkles,
  X,
  Shield,
  Trees,
  Compass,
  Check,
  Heart,
  Zap,
  Wind,
  RotateCcw,
  BookOpen,
  Award,
  Users,
} from 'lucide-react';
import { CharacterPreview3D } from './CharacterPreview3D';
import { inventoryManager } from '../../engine/inventory/InventoryManager';
import { EquipSlot, InventoryItem } from '../../types/inventory';
import { audioManager } from '../../audio/audioManager';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onTriggerAbility: (effectType?: AbilityEffectType) => void;
  onSelectCharacter?: (char: Character) => void;
}

const SLOT_CONFIG: { slot: EquipSlot; label: string; icon: string; short: string }[] = [
  { slot: 'mainWeapon', label: 'Vũ Khí Chính (Primary)', icon: '⚔️', short: 'Vũ Khí' },
  { slot: 'offhand', label: 'Tay Phụ / Khiên (Secondary)', icon: '🛡️', short: 'Tay Phụ' },
  { slot: 'headgear', label: 'Mũ & Nón (Headgear)', icon: '🪖', short: 'Mũ' },
  { slot: 'cape', label: 'Áo Choàng (Cape)', icon: '🧣', short: 'Áo Choàng' },
  { slot: 'outfit', label: 'Y Phục & Giáp (Outfit)', icon: '👕', short: 'Y Phục' },
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onClose,
  onTriggerAbility,
  onSelectCharacter,
}) => {
  const [activeNavTab, setActiveNavTab] = useState<'inventory' | 'skills' | 'journal'>('inventory');
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot>('mainWeapon');
  const [inspectedItem, setInspectedItem] = useState<InventoryItem | null>(null);
  const [localCharacter, setLocalCharacter] = useState<Character | null>(character);
  const [, setEquipVersion] = useState(0);

  useEffect(() => {
    setLocalCharacter(character);
  }, [character]);

  useEffect(() => {
    const unsub = inventoryManager.subscribe(() => {
      setEquipVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const currentCharacter = localCharacter || character;
  if (!currentCharacter) return null;

  const equipped = inventoryManager.getEquipped(currentCharacter.id);
  const allItems: InventoryItem[] = inventoryManager.getItems();

  const getEquippedItem = (slot: EquipSlot): InventoryItem | undefined => {
    const itemId = equipped[slot];
    if (!itemId) return undefined;
    return inventoryManager.getItem(itemId);
  };

  const currentSlotItems = allItems.filter(
    (it: InventoryItem) => it.equippable && it.equipSlot === selectedSlot
  );

  // Default inspected item
  const currentlyEquippedInSlot = getEquippedItem(selectedSlot);
  const displayItem = inspectedItem || currentlyEquippedInSlot || currentSlotItems[0] || null;

  const getFactionIcon = () => {
    switch (currentCharacter.faction) {
      case 'highlands':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'vanguard':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Compass className="w-4 h-4 text-amber-400" />;
    }
  };

  const getFactionName = () => {
    switch (currentCharacter.faction) {
      case 'highlands':
        return 'Cao Nguyên Đà Lạt (Highlands)';
      case 'vanguard':
        return 'Vịnh Biển Nha Trang (Eastern Vanguard)';
      default:
        return 'Quảng Trường Pháo Hoa (Mystic Scholars)';
    }
  };

  const handleEquip = (item: InventoryItem) => {
    const targetSlot = item.equipSlot || selectedSlot;
    // If equipping a 2-handed weapon, unequip bulky shields to avoid clipping
    const is2H =
      item.wieldType === 'two_handed' ||
      item.weaponType === 'greatsword' ||
      item.weaponType === 'scythe' ||
      item.weaponType === 'archmage_staff' ||
      item.weaponType === 'elemental_bow';

    if (targetSlot === 'mainWeapon' && is2H) {
      const offItem = getEquippedItem('offhand');
      if (offItem && offItem.modelAsset !== 'quiver.gltf') {
        inventoryManager.unequipItem(currentCharacter.id, 'offhand');
      }
    }

    inventoryManager.equipItem(currentCharacter.id, targetSlot, item.id);
    setSelectedSlot(targetSlot);
    setInspectedItem(item);
  };

  const handleUnequip = (item?: InventoryItem) => {
    const targetSlot = item?.equipSlot || selectedSlot;
    inventoryManager.unequipItem(currentCharacter.id, targetSlot);
  };

  const handleSwitchCompanion = (c: Character) => {
    audioManager.playTap();
    setLocalCharacter(c);
    setInspectedItem(null);
    if (onSelectCharacter) {
      onSelectCharacter(c);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/85 backdrop-blur-md animate-fade-in p-0 sm:p-3 lg:p-6 select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 hidden sm:block" onClick={onClose} />

      {/* Main RPG Screen Container (Widescreen 2-Column Split Layout) */}
      <div className="relative w-full h-full sm:h-[94vh] sm:max-w-7xl bg-ink-950 border-0 sm:border sm:border-paper-800/80 rounded-none sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pt-safe pb-safe">
        {/* ======================================================== */}
        {/* TOP RPG NAVIGATION BAR                                   */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-ink-900 border-b border-paper-800/80 shrink-0 z-20">
          {/* Left: Back / Map */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-semibold text-paper-200/70 hover:text-paper-100 hover:bg-ink-800 transition-colors flex items-center gap-1.5"
              title="Quay lại bản đồ làng"
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Bản Đồ Làng</span>
            </button>
          </div>

          {/* Center: The 3 Primary Functional Tabs */}
          <div className="flex items-center bg-ink-950/80 p-1 rounded-xl border border-paper-800/60 gap-1 shadow-inner">
            <button
              onClick={() => {
                audioManager.playTap();
                setActiveNavTab('inventory');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeNavTab === 'inventory'
                  ? 'bg-fantasy-gold text-ink-950 shadow-md scale-[1.02]'
                  : 'text-paper-200/70 hover:text-paper-100 hover:bg-ink-900'
              }`}
            >
              <span>🎒</span>
              <span>Hành Trang & Tủ Đồ</span>
            </button>

            <button
              onClick={() => {
                audioManager.playTap();
                setActiveNavTab('skills');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeNavTab === 'skills'
                  ? 'bg-fantasy-gold text-ink-950 shadow-md scale-[1.02]'
                  : 'text-paper-200/70 hover:text-paper-100 hover:bg-ink-900'
              }`}
            >
              <span>⚡</span>
              <span>Kỹ Năng</span>
            </button>

            <button
              onClick={() => {
                audioManager.playTap();
                setActiveNavTab('journal');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeNavTab === 'journal'
                  ? 'bg-fantasy-gold text-ink-950 shadow-md scale-[1.02]'
                  : 'text-paper-200/70 hover:text-paper-100 hover:bg-ink-900'
              }`}
            >
              <span>📜</span>
              <span>Ký Ức Tri Kỷ</span>
            </button>
          </div>

          {/* Right: Level / Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-ink-950 px-3 py-1 rounded-full border border-fantasy-gold/50 text-fantasy-gold font-serif font-bold text-xs shadow-inner">
              <span>Cấp 42</span>
              <span className="text-paper-800">•</span>
              <span className="text-paper-200/70 font-sans text-[11px]">Max Tri Kỷ</span>
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
        {/* UNIFIED 9-COMPANION CAROUSEL STRIP (SHARED ARMORY)       */}
        {/* Allows instant 1-tap switching between all 9 friends!   */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2 bg-ink-950/95 border-b border-paper-800/60 overflow-x-auto scrollbar-none shrink-0 z-10">
          <div className="flex items-center gap-1 text-[11px] font-serif uppercase tracking-wider text-fantasy-gold shrink-0 mr-2">
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kho Đồ Tri Kỷ:</span>
          </div>

          {allCharacters.map((c) => {
            const isSelected = c.id === currentCharacter.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSwitchCompanion(c)}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all shrink-0 text-xs font-serif active:scale-95 ${
                  isSelected
                    ? 'bg-fantasy-gold text-ink-950 font-bold shadow-md ring-2 ring-fantasy-gold/60 scale-105'
                    : 'bg-ink-900 border border-paper-800/60 text-paper-200/70 hover:text-paper-100 hover:bg-ink-850'
                }`}
                title={`${c.name} - ${c.classTitle}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color.primary }} />
                <span>{c.nickname}</span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: 2-COLUMN VIEWPORT (3D HERO + TAB CONTENT)      */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* ------------------------------------------------------ */}
          {/* COLUMN 1: THE PROMINENT 3D 360 CHARACTER VIEWPORT       */}
          {/* Guaranteed visible on phones (top 40vh) and desktop!   */}
          {/* ------------------------------------------------------ */}
          <div className="w-full lg:flex-1 h-[40vh] lg:h-full min-h-[280px] relative bg-ink-950 flex flex-col border-b lg:border-b-0 lg:border-r border-paper-800/80 shrink-0 overflow-hidden">
            {/* Top Floating Character Info Header */}
            <div className="absolute top-3 left-4 right-4 z-10 flex items-start justify-between pointer-events-none">
              <div className="bg-ink-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-paper-800/80 shadow-lg pointer-events-auto">
                <div className="flex items-center gap-2">
                  {getFactionIcon()}
                  <h2 className="text-base sm:text-lg font-serif font-bold text-fantasy-gold leading-tight">
                    {currentCharacter.name}
                  </h2>
                </div>
                <p className="text-xs font-serif text-paper-200/80 flex items-center gap-1.5 mt-0.5">
                  <span className="text-fantasy-gold">{currentCharacter.classTitle}</span>
                  <span className="text-paper-800">•</span>
                  <span className="text-paper-200/50">{currentCharacter.nickname}</span>
                </p>
              </div>

              {/* Faction Pill */}
              <div className="hidden sm:flex items-center gap-1.5 bg-ink-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-paper-800/70 text-[11px] font-sans text-paper-200/80 shadow-md">
                <Award className="w-3.5 h-3.5 text-fantasy-gold" />
                <span>{getFactionName()}</span>
              </div>
            </div>

            {/* Quick Equipment Slot Badges Flanking the 3D Character (Positioned comfortably below the nameplate) */}
            <div className="absolute top-24 left-3 sm:left-4 z-10 flex flex-col gap-2">
              {SLOT_CONFIG.slice(0, 3).map(({ slot, icon, short }) => {
                const item = getEquippedItem(slot);
                const isSelected = activeNavTab === 'inventory' && selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      audioManager.playTap();
                      setActiveNavTab('inventory');
                      setSelectedSlot(slot);
                      if (item) setInspectedItem(item);
                    }}
                    className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-95 shadow-md ${
                      isSelected
                        ? 'bg-fantasy-gold text-ink-950 border-fantasy-gold ring-2 ring-fantasy-gold/50'
                        : 'bg-ink-900/85 border-paper-800/80 text-paper-200/90 hover:bg-ink-850'
                    }`}
                    title={`${short}: ${item?.name || 'Trống'}`}
                  >
                    <span className="text-base sm:text-lg">{icon}</span>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-[10px] font-serif uppercase tracking-wider opacity-60">
                        {short}
                      </span>
                      <span className="text-[11px] font-sans font-semibold truncate max-w-[90px]">
                        {item ? item.name : 'Trống'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="absolute top-24 right-3 sm:right-4 z-10 flex flex-col gap-2">
              {SLOT_CONFIG.slice(3).map(({ slot, icon, short }) => {
                const item = getEquippedItem(slot);
                const isSelected = activeNavTab === 'inventory' && selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      audioManager.playTap();
                      setActiveNavTab('inventory');
                      setSelectedSlot(slot);
                      if (item) setInspectedItem(item);
                    }}
                    className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-95 shadow-md ${
                      isSelected
                        ? 'bg-fantasy-gold text-ink-950 border-fantasy-gold ring-2 ring-fantasy-gold/50'
                        : 'bg-ink-900/85 border-paper-800/80 text-paper-200/90 hover:bg-ink-850'
                    }`}
                    title={`${short}: ${item?.name || 'Trống'}`}
                  >
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-[10px] font-serif uppercase tracking-wider opacity-60">
                        {short}
                      </span>
                      <span className="text-[11px] font-sans font-semibold truncate max-w-[90px]">
                        {item ? item.name : 'Trống'}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg">{icon}</span>
                  </button>
                );
              })}
            </div>

            {/* The 3D WebGL Canvas Component */}
            <div className="flex-1 w-full h-full relative">
              <CharacterPreview3D
                character={currentCharacter}
                className="w-full h-full border-0 rounded-none bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950"
              />
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* COLUMN 2: TAB CONTENT (INVENTORY / SKILLS / JOURNAL)   */}
          {/* ------------------------------------------------------ */}
          <div className="flex-1 lg:w-[480px] xl:w-[520px] lg:flex-none flex flex-col bg-ink-900/95 overflow-hidden">
            {/* ==================================================== */}
            {/* TAB 1: INVENTORY & WARDROBE                          */}
            {/* ==================================================== */}
            {activeNavTab === 'inventory' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
                {/* Active Slot Header Indicator */}
                <div className="px-3 sm:px-4 py-2 bg-ink-950/70 border-b border-paper-800/80 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{SLOT_CONFIG.find((s) => s.slot === selectedSlot)?.icon}</span>
                    <span className="text-xs font-serif font-bold text-fantasy-gold">
                      {SLOT_CONFIG.find((s) => s.slot === selectedSlot)?.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-sans text-paper-200/50">
                    Bấm phím tắt trên ảnh 3D để đổi ô
                  </span>
                </div>

                {/* Inspected Item Detail Card */}
                {displayItem && (
                  <div className="p-3 sm:p-4 bg-ink-950/60 border-b border-paper-800/60 shrink-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl shrink-0">{displayItem.icon}</span>
                          <h4 className="text-sm sm:text-base font-serif font-bold text-fantasy-gold truncate">
                            {displayItem.name}
                          </h4>
                        </div>

                        {/* Badges for Handedness (1H vs 2H) and Element */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {displayItem.wieldType === 'two_handed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-600/60">
                              2H (Hai Tay)
                            </span>
                          )}
                          {displayItem.wieldType === 'one_handed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-600/60">
                              1H (Một Tay)
                            </span>
                          )}
                          {displayItem.element && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-600/60">
                              Hệ {displayItem.element.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-sans text-paper-200/60 mt-1">
                          {displayItem.description}
                        </p>
                      </div>

                      {/* Equip / Unequip Action Button */}
                      {getEquippedItem(displayItem.equipSlot || selectedSlot)?.id === displayItem.id ? (
                        <button
                          onClick={() => handleUnequip(displayItem)}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-700/80 text-rose-300 font-serif font-bold text-xs hover:bg-rose-900 active:scale-95 transition-all shadow-md shrink-0"
                        >
                          Tháo Đồ
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquip(displayItem)}
                          className="px-4 py-1.5 rounded-xl bg-fantasy-gold text-ink-950 font-serif font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-fantasy-gold/20 shrink-0 flex items-center gap-1.5"
                        >
                          <span>Trang Bị</span>
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Stats Grid */}
                    {displayItem.stats && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-paper-800/40 text-[11px] font-sans">
                        {displayItem.stats.attack !== undefined && (
                          <div className="bg-ink-900/90 px-2 py-1 rounded-lg border border-paper-800/50 flex flex-col items-center">
                            <span className="text-rose-400 text-[10px]">Tấn Công</span>
                            <span className="font-bold text-paper-100">+{displayItem.stats.attack}</span>
                          </div>
                        )}
                        {displayItem.stats.defense !== undefined && (
                          <div className="bg-ink-900/90 px-2 py-1 rounded-lg border border-paper-800/50 flex flex-col items-center">
                            <span className="text-cyan-400 text-[10px]">Phòng Ngự</span>
                            <span className="font-bold text-paper-100">+{displayItem.stats.defense}</span>
                          </div>
                        )}
                        {displayItem.stats.magic !== undefined && (
                          <div className="bg-ink-900/90 px-2 py-1 rounded-lg border border-paper-800/50 flex flex-col items-center">
                            <span className="text-amber-400 text-[10px]">Ma Lực</span>
                            <span className="font-bold text-paper-100">+{displayItem.stats.magic}</span>
                          </div>
                        )}
                        {displayItem.stats.speed !== undefined && (
                          <div className="bg-ink-900/90 px-2 py-1 rounded-lg border border-paper-800/50 flex flex-col items-center">
                            <span className="text-emerald-400 text-[10px]">Tốc Độ</span>
                            <span className="font-bold text-paper-100">+{displayItem.stats.speed}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lore Quote */}
                    {displayItem.lore && (
                      <p className="mt-2 text-[10px] italic font-serif text-fantasy-gold/80 bg-ink-900/60 p-2 rounded-lg border border-paper-800/40">
                        "{displayItem.lore}"
                      </p>
                    )}
                  </div>
                )}

                {/* Available Gear List */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2">
                  <div className="text-[11px] font-serif uppercase tracking-wider text-paper-200/50 mb-1 flex items-center justify-between">
                    <span>Kho Trang Bị Toàn Đội ({currentSlotItems.length})</span>
                    <span className="text-emerald-400">Dùng chung cả nhóm</span>
                  </div>

                  {currentSlotItems.length === 0 ? (
                    <div className="text-center py-8 text-paper-200/40 text-xs font-serif">
                      Không có trang bị nào cho vị trí này.
                    </div>
                  ) : (
                    currentSlotItems.map((item: InventoryItem) => {
                      const isEquipped = getEquippedItem(item.equipSlot || selectedSlot)?.id === item.id;
                      const isInspected = displayItem?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            audioManager.playTap();
                            setInspectedItem(item);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isEquipped
                              ? 'bg-amber-950/30 border-fantasy-gold/80 ring-1 ring-fantasy-gold/30'
                              : isInspected
                              ? 'bg-ink-850 border-paper-700'
                              : 'bg-ink-950/60 border-paper-800/60 hover:bg-ink-850/80 hover:border-paper-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl p-1.5 rounded-lg bg-ink-900 border border-paper-800/80 shrink-0">
                              {item.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-serif font-bold text-paper-100 truncate">
                                  {item.name}
                                </h5>
                                {isEquipped && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-fantasy-gold text-ink-950">
                                    Đang Dùng
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-sans text-paper-200/50 truncate mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {isEquipped ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnequip(item);
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-serif font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900 active:scale-95"
                              >
                                Tháo
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEquip(item);
                                }}
                                className="px-3 py-1 rounded-lg text-[10px] font-serif font-bold bg-fantasy-gold text-ink-950 hover:brightness-110 active:scale-95 shadow-sm"
                              >
                                Đeo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 2: SKILLS & MAGICAL ARTS                         */}
            {/* ==================================================== */}
            {activeNavTab === 'skills' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 animate-fade-in">
                {/* Header */}
                <div className="border-b border-paper-800/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-fantasy-gold" />
                    <h3 className="text-base font-serif font-bold text-fantasy-gold">
                      Kỹ Năng & Pháp Thuật Trấn Phái
                    </h3>
                  </div>
                  <p className="text-xs font-sans text-paper-200/60 mt-0.5">
                    Hệ thống tuyệt kỹ chủ động và 2 nội tại độc bản gắn liền với kỷ niệm của {currentCharacter.name}.
                  </p>
                </div>

                {/* 1. Active Ability Card */}
                {currentCharacter.activeAbility && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-ink-950 via-ink-900 to-amber-950/30 border border-fantasy-gold/60 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-fantasy-gold/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-fantasy-gold/20 border border-fantasy-gold/80 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                          {currentCharacter.activeAbility.icon || '⚔️'}
                        </div>
                        <div>
                          <span className="text-[10px] font-serif uppercase tracking-widest text-fantasy-gold font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Kỹ Năng Chủ Động
                          </span>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-paper-100 leading-tight">
                            {currentCharacter.activeAbility.name}
                          </h4>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-ink-950/80 border border-fantasy-gold/60 text-fantasy-gold shadow-sm">
                        Hồi chiêu: {currentCharacter.activeAbility.cooldown}s
                      </span>
                    </div>

                    <p className="text-xs font-sans text-paper-200/80 mt-3 leading-relaxed bg-ink-950/60 p-3 rounded-xl border border-paper-800/50">
                      {currentCharacter.activeAbility.description}
                    </p>

                    <button
                      onClick={() => {
                        audioManager.playTap();
                        onTriggerAbility(currentCharacter.activeAbility.effectType);
                      }}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-fantasy-gold via-amber-400 to-fantasy-gold text-ink-950 font-serif font-bold text-sm shadow-lg shadow-fantasy-gold/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-ink-950 fill-ink-950" />
                      <span>Thi Triển Kỹ Năng Ngay</span>
                    </button>
                  </div>
                )}

                {/* 2. Ultimate Ability Card */}
                {currentCharacter.ultimateAbility && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-ink-950 via-purple-950/40 to-amber-950/40 border border-amber-400/80 shadow-2xl shadow-purple-950/30 relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/30 to-purple-500/30 border border-amber-400 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                          {currentCharacter.ultimateAbility.icon || '🌟'}
                        </div>
                        <div>
                          <span className="text-[10px] font-serif uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Tuyệt Kỹ Tối Thượng (Ultimate)
                          </span>
                          <h4 className="text-base sm:text-lg font-serif font-bold text-amber-100 leading-tight">
                            {currentCharacter.ultimateAbility.name}
                          </h4>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold bg-purple-950/90 border border-amber-400/80 text-amber-300 shadow-sm">
                        Nộ / Hồi chiêu: {currentCharacter.ultimateAbility.cooldown}s
                      </span>
                    </div>

                    <p className="text-xs font-sans text-paper-200/90 mt-3 leading-relaxed bg-ink-950/70 p-3 rounded-xl border border-amber-500/30">
                      {currentCharacter.ultimateAbility.description}
                    </p>

                    <button
                      onClick={() => {
                        audioManager.playTap();
                        onTriggerAbility(currentCharacter.ultimateAbility.effectType);
                      }}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 text-white font-serif font-bold text-sm shadow-lg shadow-purple-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
                      <span>Khai Mở Tuyệt Kỹ Tối Thượng</span>
                    </button>
                  </div>
                )}
                {/* The 2 Custom Passives from User */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-paper-800/40 pb-1.5">
                    <h4 className="text-xs font-serif uppercase tracking-wider text-fantasy-gold font-bold">
                      Nội Tại Độc Bản & Kỷ Niệm Tri Kỷ
                    </h4>
                    <span className="text-[10px] text-paper-200/50">Tự động kích hoạt</span>
                  </div>

                  {currentCharacter.passives && currentCharacter.passives.length > 0 ? (
                    currentCharacter.passives.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-ink-950/80 border border-paper-800/70 hover:border-fantasy-gold/60 transition-all shadow-md group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-ink-900 border border-paper-800/80 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                            {p.icon || '✨'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h5 className="text-xs sm:text-sm font-serif font-bold text-fantasy-gold">
                                {p.name}
                              </h5>
                              {p.loreAnchor && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-semibold bg-fantasy-gold/15 text-fantasy-gold border border-fantasy-gold/40 shrink-0">
                                  {p.loreAnchor}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-sans text-paper-200/70 mt-1 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-ink-950/70 border border-paper-800/60 text-center text-xs text-paper-200/50 font-serif">
                      Chưa có kỹ năng nội tại.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* TAB 3: JOURNAL & NOSTALGIC MEMORIES                  */}
            {/* ==================================================== */}
            {activeNavTab === 'journal' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 animate-fade-in">
                {/* Header */}
                <div className="border-b border-paper-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-fantasy-gold" />
                    <h3 className="text-base font-serif font-bold text-fantasy-gold">
                      Ký Ức Tri Kỷ & Nhật Ký Đồng Hành
                    </h3>
                  </div>
                  <p className="text-xs font-sans text-paper-200/60 mt-1">
                    Ghi chép hành trình thực tế gắn bó giữa các thành viên qua những vùng đất kỷ niệm.
                  </p>
                </div>

                {/* Biography & Memory Chronicle */}
                <div className="p-4 rounded-2xl bg-ink-950/80 border border-paper-800/70 space-y-3">
                  <div className="flex items-center gap-2 text-fantasy-gold font-serif font-bold text-xs uppercase tracking-wider">
                    <span>🏔️ Kỷ Niệm Địa Danh & Đời Thực</span>
                  </div>

                  <p className="text-xs font-serif leading-relaxed text-paper-100 bg-ink-900/60 p-3.5 rounded-xl border border-paper-800/50">
                    "{currentCharacter.bio}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-sans">
                    <div className="p-2.5 rounded-xl bg-ink-900/80 border border-paper-800/60">
                      <span className="text-paper-200/50 block text-[10px]">Vùng Đất Gắn Liền</span>
                      <span className="font-bold text-paper-100">
                        {currentCharacter.memoryLandmark ||
                          (currentCharacter.faction === 'highlands'
                            ? 'Đồi Thông Đà Lạt'
                            : currentCharacter.faction === 'vanguard'
                            ? 'Vịnh Biển Nha Trang'
                            : 'Pháo Hoa Năm Mới')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-ink-900/80 border border-paper-800/60">
                      <span className="text-paper-200/50 block text-[10px]">Gắn Kết Tri Kỷ</span>
                      <span className="font-bold text-emerald-400">
                        {currentCharacter.memoryBond || '100% Thuần Khiết'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Character RPG Attribute Summary */}
                <div className="p-4 rounded-2xl bg-ink-950/70 border border-paper-800/60 space-y-2.5">
                  <h4 className="text-xs font-serif uppercase tracking-wider text-paper-200/60">
                    Chỉ Số Nhân Vật Cơ Bản
                  </h4>

                  <div className="space-y-2 text-xs font-sans">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-rose-300 font-semibold flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Sinh Lực (HP)
                        </span>
                        <span className="font-bold text-paper-100">500 / 500</span>
                      </div>
                      <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-paper-800/80">
                        <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 w-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-cyan-300 font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Ma Lực (MP)
                        </span>
                        <span className="font-bold text-paper-100">930 / 930</span>
                      </div>
                      <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-paper-800/80">
                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-amber-300 font-semibold flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Phòng Ngự Vật Lý
                        </span>
                        <span className="font-bold text-paper-100">250</span>
                      </div>
                      <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-paper-800/80">
                        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 w-[65%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-emerald-300 font-semibold flex items-center gap-1">
                          <Wind className="w-3 h-3" /> Tốc Độ Di Chuyển
                        </span>
                        <span className="font-bold text-paper-100">110</span>
                      </div>
                      <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-paper-800/80">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[80%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM CONTROLLER BAR HINT                               */}
        {/* ======================================================== */}
        <div className="px-4 py-2 bg-ink-950 border-t border-paper-800/80 flex items-center justify-between text-[11px] font-sans text-paper-200/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-fantasy-gold" />
              <span>Xoay 360° tự do</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Chạm vào trang bị để đổi đồ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-paper-200/70">Tự động lưu ngoại trang</span>
          </div>
        </div>
      </div>
    </div>
  );
};
