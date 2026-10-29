import React, { useState } from 'react';
import { Crosshair, Copy, Check, X } from 'lucide-react';
import { InteractiveHit } from '../../types/threeEngine';
import { allCharacters } from '../../data/charactersData';

interface InspectorBarProps {
  activeHit: InteractiveHit | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const InspectorBar: React.FC<InspectorBarProps> = ({ activeHit, onClose, onToast }) => {
  const [copied, setCopied] = useState(false);

  // If Inspector mode is active but user hasn't clicked a target yet
  if (!activeHit) {
    return (
      <div className="fixed bottom-4 right-3 sm:right-6 z-40 pointer-events-auto select-none animate-fade-in max-w-xs">
        <div className="bg-ink-950/95 border-2 border-fantasy-gold/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-paper-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-fantasy-gold shrink-0 animate-spin-slow" />
            <div className="text-[11px] leading-tight">
              <span className="font-serif font-bold text-fantasy-gold block">Chế Độ Soi Tọa Độ (ON)</span>
              <span className="text-paper-200/70 text-[10px]">Chạm vào vật thể hoặc đất để soi</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-paper-200/60 hover:text-paper-100 p-1"
            title="Đóng chế độ soi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Resolve user-friendly name and category from activeHit
  let displayName = activeHit.id;
  let category = 'Đối tượng';

  if (activeHit.type === 'character') {
    const char = allCharacters.find((c) => c.id === activeHit.id);
    displayName = char ? `${char.name} (${char.classTitle})` : activeHit.id;
    category = 'Nhân Vật Bạn Bè';
  } else if (activeHit.type === 'stew_pot') {
    displayName = 'Nồi Lẩu Highland (Stew Pot)';
    category = 'Công Trình / Đạo Cụ';
  } else if (activeHit.type === 'sea_bell') {
    displayName = 'Chuông Triều Khí (Ocean Sea Bell)';
    category = 'Công Trình / Đạo Cụ';
  } else if (activeHit.type === 'fireworks_mortar') {
    displayName = 'Pháo Hoa Năm Mới (Fireworks Mortar)';
    category = 'Công Trình / Đạo Cụ';
  } else if (activeHit.type === 'tea_pavilion') {
    displayName = 'Vọng Lâu Trà Đạo (Tatami Pavilion)';
    category = 'Công Trình / Đạo Cụ';
  } else if (activeHit.type === 'ground') {
    displayName = 'Mặt Đất / Địa Hình Làng (Terrain)';
    category = 'Bản Đồ Grid';
  }

  const { x, y, z } = activeHit.point;

  const handleCopy = () => {
    const text = `Đối tượng [${displayName}] tại tọa độ (X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    onToast?.(`Đã chép: X: ${x.toFixed(2)}, Z: ${z.toFixed(2)}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-3 sm:right-6 z-40 pointer-events-auto select-none animate-fade-in max-w-sm">
      <div className="bg-ink-950/95 border-2 border-fantasy-gold/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-paper-100 flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-paper-800/80 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Crosshair className="w-4 h-4 text-fantasy-gold shrink-0 animate-pulse" />
            <h3 className="text-xs font-serif font-bold text-fantasy-gold truncate">
              {displayName}
            </h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-ink-800 border border-paper-800 text-paper-200/70 shrink-0">
              {category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-paper-200/60 hover:text-paper-100 p-1"
            title="Đóng bảng tọa độ"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Coordinates readout */}
        <div className="grid grid-cols-3 gap-1.5 bg-ink-900/90 border border-paper-800/80 rounded-xl p-2 text-center font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] font-sans text-rose-400 font-bold">Tọa độ X</span>
            <span className="text-paper-100 font-semibold">{x.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-sans text-emerald-400 font-bold">Độ cao Y</span>
            <span className="text-paper-100 font-semibold">{y.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-sans text-cyan-400 font-bold">Tọa độ Z</span>
            <span className="text-paper-100 font-semibold">{z.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Button: Copy Call-Out Prompt */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-fantasy-gold via-amber-400 to-fantasy-gold text-ink-950 font-sans font-bold text-xs py-1.5 px-3 rounded-xl shadow-md active:scale-95 transition-all hover:brightness-105"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-950" />
              <span>Đã sao chép prompt call-out!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-ink-950" />
              <span>Sao chép tọa độ & tên vật thể</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
