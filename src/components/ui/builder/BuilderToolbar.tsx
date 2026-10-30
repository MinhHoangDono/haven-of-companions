import React, { useState } from 'react';
import {
  RotateCw,
  Trash2,
  Hammer,
  Save,
  X,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { StructureCard } from './StructureCard';
import { DynamicMeshLibrary } from '../../../engine/three/builder/DynamicMeshLibrary';
import {
  BuilderTool,
  PlacedStructure,
  StructureCategory,
  StructureDefinition,
} from '../../../types/cityBuilder';

interface BuilderToolbarProps {
  isOpen: boolean;
  activeTool: BuilderTool;
  activeStructureId: string;
  structures: PlacedStructure[];
  onSelectTool: (tool: BuilderTool) => void;
  onSelectStructure: (def: StructureDefinition) => void;
  onRotate: () => void;
  onCenterPlaza: () => void;
  onOpenSaveModal: () => void;
  onClose: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  isOpen,
  activeTool,
  activeStructureId,
  structures,
  onSelectTool,
  onSelectStructure,
  onRotate,
  onCenterPlaza,
  onOpenSaveModal,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<StructureCategory | 'all'>('all');

  if (!isOpen) return null;

  const filteredStructures = DynamicMeshLibrary.getByCategory(activeCategory);

  const categories: Array<{ id: StructureCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'Tất Cả', icon: '✨' },
    { id: 'houses', label: 'Nhà Cửa', icon: '🏠' },
    { id: 'production', label: 'Nông & Chợ', icon: '🌾' },
    { id: 'fortifications', label: 'Phòng Thủ', icon: '🛡️' },
    { id: 'decorations', label: 'Trang Trí', icon: '⛺' },
    { id: 'nature', label: 'Thiên Nhiên', icon: '🌲' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex flex-col items-center">
      {/* Top Floating Action Bar */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 mb-2 p-1.5 bg-ink-950/90 backdrop-blur-md border border-paper-800/80 rounded-2xl shadow-2xl">
        {/* Tool Mode: Place */}
        <button
          onClick={() => onSelectTool('place')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'place'
              ? 'bg-fantasy-gold text-ink-950 shadow-md font-bold'
              : 'text-paper-300 hover:text-paper-100 hover:bg-ink-850'
          }`}
          title="Đặt công trình (Nhấp chuột hoặc chạm màn hình để xây)"
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Xây Dựng</span>
        </button>

        {/* Rotate Button */}
        <button
          onClick={onRotate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-paper-200 hover:text-paper-100 bg-ink-900 border border-paper-800/60 hover:bg-ink-850 active:scale-95 transition-all shadow-sm"
          title="Xoay công trình 90 độ (Phím tắt: R hoặc Space)"
        >
          <RotateCw className="w-3.5 h-3.5 text-fantasy-gold" />
          <span className="hidden sm:inline">Xoay 90°</span>
        </button>

        {/* Tool Mode: Demolish */}
        <button
          onClick={() => onSelectTool('demolish')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTool === 'demolish'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-paper-300 hover:text-rose-300 hover:bg-rose-950/30'
          }`}
          title="Chế độ phá hủy (Nhấp vào công trình để dỡ bỏ)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Phá Hủy</span>
        </button>

        {/* Center Camera on Plaza */}
        <button
          onClick={onCenterPlaza}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-paper-300 hover:text-paper-100 bg-ink-900 border border-paper-800/60 hover:bg-ink-850 active:scale-95 transition-all"
          title="Đưa góc nhìn về trung tâm quảng trường làng (Phím F)"
        >
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Trung Tâm (F)</span>
        </button>

        <div className="w-[1px] h-4 bg-paper-800/80 mx-0.5" />

        {/* Structure Count Pill */}
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold bg-ink-900 border border-paper-800/60 text-paper-300 shadow-inner"
          title="Số công trình tối đa bảo đảm 30+ FPS"
        >
          <Sparkles className="w-3 h-3 text-fantasy-gold" />
          <span>{structures.length}</span>
          <span className="text-paper-600">/</span>
          <span className="text-paper-500">100</span>
        </div>

        {/* Save / Export Modal Trigger */}
        <button
          onClick={onOpenSaveModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-paper-200 hover:text-paper-100 bg-ink-900 border border-paper-800/60 hover:bg-ink-850 active:scale-95 transition-all shadow-sm"
          title="Lưu, tải về hoặc nhập mã bản đồ"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Lưu / Xuất</span>
        </button>

        {/* Close Build Mode Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-paper-400 hover:text-paper-100 hover:bg-ink-850 transition-colors ml-0.5"
          title="Đóng chế độ xây dựng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Bottom Catalog Drawer */}
      <div className="pointer-events-auto w-full max-w-5xl bg-ink-950/95 backdrop-blur-xl border-t border-x border-paper-800/80 rounded-t-3xl p-3 sm:p-4 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] flex flex-col gap-2.5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                activeCategory === cat.id
                  ? 'bg-ink-800 text-fantasy-gold border border-fantasy-gold/60 font-bold shadow-sm'
                  : 'text-paper-400 hover:text-paper-200 hover:bg-ink-900 border border-transparent'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Horizontal Structure Cards Grid */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1 px-1 scroll-smooth">
          {filteredStructures.map((def) => (
            <StructureCard
              key={def.id}
              structure={def}
              isSelected={activeStructureId === def.id && activeTool === 'place'}
              onSelect={(selected) => {
                onSelectStructure(selected);
                onSelectTool('place');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
