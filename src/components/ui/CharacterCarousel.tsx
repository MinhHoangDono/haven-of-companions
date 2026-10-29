import React, { useState } from 'react';
import { Character } from '../../types/character';
import { Compass, Shield, Trees, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface CharacterCarouselProps {
  characters: Character[];
  selectedCharId: string | null;
  onSelectCharacter: (char: Character) => void;
  onOpenDetails: (char: Character) => void;
}

export const CharacterCarousel: React.FC<CharacterCarouselProps> = ({
  characters,
  selectedCharId,
  onSelectCharacter,
  onOpenDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getFactionIcon = (faction: Character['faction']) => {
    switch (faction) {
      case 'highlands':
        return <Trees className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'vanguard':
        return <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
  };

  return (
    <aside className="absolute top-[58px] left-3 z-30 pointer-events-none flex flex-col max-h-[calc(100vh-76px)]">
      {/* Quick Collapse / Expand Toggle Button under Haven of Companions card */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="pointer-events-auto mb-1.5 self-start flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-900/90 backdrop-blur-md border border-paper-800/80 text-fantasy-gold shadow-md text-[11px] font-sans font-semibold active:scale-95 transition-all hover:bg-ink-800"
        title="Đóng / Mở danh sách Tri Kỷ"
      >
        <Users className="w-3.5 h-3.5 text-fantasy-gold" />
        <span>9 Tri Kỷ</span>
        {isExpanded ? <ChevronUp className="w-3 h-3 text-paper-200/80" /> : <ChevronDown className="w-3 h-3 text-paper-200/80" />}
      </button>

      {/* Character List Column */}
      {isExpanded && (
        <div className="pointer-events-auto flex flex-col gap-1 p-1.5 bg-ink-900/85 backdrop-blur-md border border-paper-800/60 rounded-2xl shadow-2xl overflow-y-auto scrollbar-none w-40 sm:w-48 max-h-[calc(100vh-120px)] animate-fade-in">
          {characters.map((char) => {
            const isSelected = char.id === selectedCharId;

            return (
              <div
                key={char.id}
                onClick={() => {
                  onSelectCharacter(char);
                  if (isSelected) {
                    onOpenDetails(char);
                  }
                }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-ink-800/95 border-fantasy-gold shadow-[0_0_12px_rgba(223,166,66,0.3)]'
                    : 'bg-ink-900/60 border-paper-800/40 hover:border-paper-800/80 hover:bg-ink-800/60'
                }`}
                title={`${char.name} – ${char.classTitle}`}
              >
                {/* Character Avatar Circle */}
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border shadow-inner relative shrink-0"
                  style={{
                    backgroundColor: char.color.primary,
                    borderColor: isSelected ? char.color.accent : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {getFactionIcon(char.faction)}
                  {isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-fantasy-gold border border-ink-900 animate-ping" />
                  )}
                </div>

                {/* Nickname & Class Info */}
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] sm:text-xs font-sans font-bold text-paper-100 truncate">
                      {char.nickname}
                    </h4>
                    {isSelected && (
                      <span className="text-[9px] font-sans font-semibold text-fantasy-gold bg-fantasy-gold/20 px-1 py-0.2 rounded border border-fantasy-gold/40 shrink-0">
                        Xem
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-paper-200/60 font-sans truncate">
                    {char.classTitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};
