import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Volume2, VolumeX, CloudFog, Crosshair, Hammer } from 'lucide-react';

export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';
export type WeatherType = 'clear' | 'mist';

interface TopBarProps {
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  isMuted: boolean;
  isInspectorActive?: boolean;
  coinScore?: number;
  inventoryCount?: number;
  activeBuffs?: { icon: string; name: string }[];
  isBuildMode?: boolean;
  onToggleTimeOfDay: () => void;
  onToggleWeather: () => void;
  onToggleMute: () => void;
  onToggleInspector?: () => void;
  onToggleBuildMode?: () => void;
  onOpenInventory?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  timeOfDay,
  weather,
  isMuted,
  isInspectorActive,
  coinScore,
  inventoryCount,
  activeBuffs,
  isBuildMode,
  onToggleTimeOfDay,
  onToggleWeather,
  onToggleMute,
  onToggleInspector,
  onToggleBuildMode,
  onOpenInventory,
}) => {
  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'dawn':
        return <Sunrise className="w-4 h-4 text-amber-300" />;
      case 'day':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'sunset':
        return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-300" />;
    }
  };

  const getTimeLabel = () => {
    switch (timeOfDay) {
      case 'dawn': return 'Dawn';
      case 'day': return 'Day';
      case 'sunset': return 'Sunset';
      case 'night': return 'Night';
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 pt-safe flex items-center justify-between">
      {/* Title Badge */}
      <div className="pointer-events-auto flex items-center gap-2 bg-ink-900/85 backdrop-blur-md border border-paper-800/60 rounded-full px-3.5 py-1.5 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-fantasy-gold animate-pulse" />
        <div>
          <h1 className="text-xs font-serif font-bold tracking-wider text-paper-100 uppercase">
            Haven of Companions
          </h1>
          <p className="text-[10px] text-paper-200/60 font-sans tracking-wide">
            Làng Tri Kỷ
          </p>
        </div>
      </div>

      {/* Control Pills */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        {/* Active Buff Indicator */}
        {activeBuffs && activeBuffs.length > 0 && (
          <div
            className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 px-2.5 py-1.5 rounded-full text-xs font-serif font-bold shadow-md animate-pulse"
            title={activeBuffs[0].name}
          >
            <span className="text-sm">{activeBuffs[0].icon}</span>
            <span className="text-[11px] truncate max-w-[85px] sm:max-w-none">{activeBuffs[0].name}</span>
          </div>
        )}

        {/* Backpack Inventory Button */}
        {onOpenInventory && (
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1.5 bg-ink-900/90 hover:bg-ink-800 backdrop-blur-md border border-fantasy-gold/60 text-fantasy-gold px-2.5 py-1.5 rounded-full text-xs font-serif font-bold active:scale-95 transition-all shadow-md"
            title="Mở Túi Đồ & Hành Trang Tri Kỷ (Inventory)"
          >
            <span className="text-sm">🎒</span>
            <span className="text-[11px] font-mono text-paper-100">{inventoryCount ?? 0}</span>
          </button>
        )}

        {/* Collectible Coin Pouch Counter */}
        {coinScore !== undefined && (
          <div
            className="flex items-center gap-1.5 bg-ink-900/90 backdrop-blur-md border border-fantasy-gold/60 text-fantasy-gold px-2.5 py-1.5 rounded-full text-xs font-serif font-bold shadow-md"
            title="Điểm thu thập báu vật làng"
          >
            <span className="text-sm">🪙</span>
            <span className="text-[11px] font-mono text-paper-100">{coinScore}</span>
          </div>
        )}
        <button
          onClick={onToggleTimeOfDay}
          className="flex items-center gap-1.5 bg-ink-900/85 backdrop-blur-md border border-paper-800/60 text-paper-100 px-2.5 py-1.5 rounded-full text-xs font-sans font-medium active:scale-95 transition-all shadow-md"
          title="Toggle Time of Day"
        >
          {getTimeIcon()}
          <span className="capitalize text-[11px] font-semibold">{getTimeLabel()}</span>
        </button>

        {/* Weather Toggle */}
        <button
          onClick={onToggleWeather}
          className={`flex items-center gap-1.5 backdrop-blur-md border px-2.5 py-1.5 rounded-full text-xs font-sans font-medium active:scale-95 transition-all shadow-md ${
            weather === 'mist'
              ? 'bg-fantasy-druid/30 border-fantasy-druid/60 text-emerald-200'
              : 'bg-ink-900/85 border-paper-800/60 text-paper-100'
          }`}
          title="Toggle Weather"
        >
          <CloudFog className="w-4 h-4 text-cyan-300" />
          <span className="capitalize text-[11px] font-semibold">
            {weather === 'mist' ? 'Mist' : 'Clear'}
          </span>
        </button>

        {/* Inspector Toggle Button */}
        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            className={`flex items-center gap-1.5 backdrop-blur-md border px-2.5 py-1.5 rounded-full text-xs font-sans font-medium active:scale-95 transition-all shadow-md ${
              isInspectorActive
                ? 'bg-fantasy-gold border-fantasy-gold text-ink-950 font-bold shadow-[0_0_15px_rgba(223,166,66,0.5)]'
                : 'bg-ink-900/85 border-paper-800/60 text-paper-100'
            }`}
            title="Toggle 3D Coordinate & Object Inspector"
          >
            <Crosshair className="w-4 h-4 text-fantasy-gold" />
            <span className="text-[11px]">Tọa Độ</span>
          </button>
        )}

        {/* Build Mode Toggle Button */}
        {onToggleBuildMode && (
          <button
            onClick={onToggleBuildMode}
            className={`flex items-center gap-1.5 backdrop-blur-md border px-2.5 py-1.5 rounded-full text-xs font-sans font-medium active:scale-95 transition-all shadow-md ${
              isBuildMode
                ? 'bg-fantasy-gold border-fantasy-gold text-ink-950 font-bold shadow-[0_0_15px_rgba(223,166,66,0.6)]'
                : 'bg-ink-900/85 border-paper-800/60 text-paper-100 hover:border-fantasy-gold/50'
            }`}
            title="Bật/Tắt chế độ xây dựng công trình (Build Mode)"
          >
            <Hammer className={`w-4 h-4 ${isBuildMode ? 'text-ink-950 animate-bounce' : 'text-fantasy-gold'}`} />
            <span className="text-[11px] font-semibold">Xây Dựng</span>
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-full backdrop-blur-md border active:scale-95 transition-all shadow-md ${
            isMuted
              ? 'bg-ink-900/85 border-paper-800/60 text-paper-200/60'
              : 'bg-fantasy-gold/20 border-fantasy-gold/60 text-amber-300'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
