import React from 'react';
import { Character } from '../../types/character';
import { Sparkles, X, Shield, Trees, Compass } from 'lucide-react';
import { CharacterPreview3D } from './CharacterPreview3D';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onTriggerAbility: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onClose,
  onTriggerAbility,
}) => {
  if (!character) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center items-stretch justify-center pointer-events-auto bg-black/75 backdrop-blur-md animate-fade-in p-0 sm:p-4">
      {/* Click outside backdrop to close on desktop */}
      <div className="absolute inset-0 hidden sm:block" onClick={onClose} />

      {/* Modal Box: Full screen on phone, centered modal card on web */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl bg-ink-900 border-0 sm:border sm:border-paper-800/80 rounded-none sm:rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto flex flex-col pt-safe pb-safe">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-full bg-ink-800/90 border border-paper-800 text-paper-200/70 hover:text-paper-100 active:scale-95 transition-all z-10"
          title="Đóng bảng nhân vật"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-3.5 mb-4 pr-10">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg shrink-0"
            style={{
              backgroundColor: character.color.primary,
              borderColor: character.color.accent,
            }}
          >
            {getFactionIcon()}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-paper-100 truncate max-w-full" title={character.name}>
                {character.name}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-sans bg-ink-800 border border-paper-800 text-paper-200/80 shrink-0">
                {character.pronoun}
              </span>
            </div>
            <p className="text-xs font-serif font-semibold text-amber-300 truncate max-w-full" title={character.classTitle}>
              {character.classTitle}
            </p>
            <p className="text-[11px] font-sans text-paper-200/60 flex items-center gap-1 mt-0.5 truncate">
              <span>{character.factionName}</span>
            </p>
          </div>
        </div>
        {/* Primary Skill Cast Button (Positioned at the top above 360 view) */}
        <button
          onClick={() => {
            onTriggerAbility();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fantasy-gold via-amber-400 to-fantasy-gold text-ink-950 font-sans font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-[0_4px_16px_rgba(223,166,66,0.35)] active:scale-95 transition-all mb-3.5 hover:brightness-105 border border-yellow-200 shrink-0"
          title={`Thi triển kỹ năng đặc trưng ${character.signatureAbility.name}`}
        >
          <Sparkles className="w-4 h-4 text-ink-950 shrink-0" />
          <span className="truncate">Thi triển: {character.signatureAbility.name}</span>
        </button>

        {/* 3D Interactive Character Model Viewport */}
        <CharacterPreview3D character={character} />
        {/* RPG Stat Bars */}
        <div className="bg-ink-800/80 border border-paper-800/60 rounded-2xl p-3.5 mb-4 shadow-inner">
          <h3 className="text-xs font-serif font-bold tracking-wider uppercase text-fantasy-gold mb-2.5">
            Companion Attributes
          </h3>
          <div className="space-y-2">
            {character.stats.map((stat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-[11px] font-sans text-paper-200/80 mb-1">
                  <span>{stat.label}</span>
                  <span className="font-semibold text-paper-100">{stat.value}/{stat.max}</span>
                </div>
                <div className="w-full h-1.5 bg-ink-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(stat.value / stat.max) * 100}%`,
                      backgroundColor: character.color.secondary,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Chronicler's Lore (Real-Life Inspired Memories) */}
        <div className="bg-paper-100 text-ink-900 border border-paper-800/80 rounded-2xl p-3.5 mb-4 shadow-md">
          <h3 className="text-xs font-serif font-bold tracking-wider uppercase text-ink-800 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Chronicle of Adventures</span>
          </h3>
          <p className="text-xs font-sans text-ink-800 leading-relaxed italic">
            "{character.bio}"
          </p>
        </div>
      </div>
    </div>
  );
};
