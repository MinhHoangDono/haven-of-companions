import React from 'react';
import { Character } from '../../types/character';
import { Compass, Shield, Trees } from 'lucide-react';

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
  const getFactionIcon = (faction: Character['faction']) => {
    switch (faction) {
      case 'highlands':
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'vanguard':
        return <Shield className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none px-3 pb-safe">
      <div className="max-w-md mx-auto pointer-events-auto flex items-center justify-start md:justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
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
              className={`flex-shrink-0 cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-2xl backdrop-blur-md transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-ink-800/95 border-fantasy-gold shadow-[0_0_15px_rgba(223,166,66,0.35)] scale-105'
                  : 'bg-ink-900/80 border-paper-800/50 hover:border-paper-800/80 shadow-md'
              }`}
            >
              {/* Avatar circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center border shadow-inner relative"
                style={{
                  backgroundColor: char.color.primary,
                  borderColor: isSelected ? char.color.accent : 'rgba(255,255,255,0.2)',
                }}
              >
                {getFactionIcon(char.faction)}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fantasy-gold border border-ink-900 animate-ping" />
                )}
              </div>

              {/* Info text */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-serif font-bold text-paper-100 whitespace-nowrap">
                    {char.nickname}
                  </h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-sans bg-ink-700/80 text-paper-200/80">
                    {char.pronoun}
                  </span>
                </div>
                <p className="text-[10px] text-paper-200/70 font-sans truncate max-w-[120px]">
                  {char.classTitle}
                </p>
              </div>

              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(char);
                  }}
                  className="ml-1 text-[10px] font-sans font-semibold bg-fantasy-gold/20 text-amber-300 border border-fantasy-gold/50 px-2 py-1 rounded-lg hover:bg-fantasy-gold/30 active:scale-90 transition-all"
                >
                  Sheet
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
