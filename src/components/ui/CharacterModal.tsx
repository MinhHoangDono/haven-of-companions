import React from 'react';
import { Character } from '../../types/character';
import { Sparkles, Wine, X, Shield, Trees, Compass } from 'lucide-react';
import { CharacterPreview3D } from './CharacterPreview3D';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onTriggerAbility: () => void;
  onToast: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onClose,
  onTriggerAbility,
  onToast,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-up bottom sheet drawer */}
      <div className="relative w-full max-w-lg bg-ink-900 border-t-2 border-paper-800 rounded-t-3xl shadow-2xl p-5 pb-safe max-h-[85vh] overflow-y-auto transform transition-transform duration-300">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-paper-800 rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-ink-800 border border-paper-800 text-paper-200/70 hover:text-paper-100 active:scale-95 transition-all"
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              onTriggerAbility();
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 bg-fantasy-gold text-ink-900 font-sans font-bold text-xs py-2.5 px-3 rounded-xl active:scale-95 transition-all shadow-md min-w-0"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{character.signatureAbility.name}</span>
          </button>

          <button
            onClick={onToast}
            className="flex items-center justify-center gap-1.5 bg-ink-800 border border-paper-800 text-paper-100 font-sans font-semibold text-xs py-2.5 px-3 rounded-xl hover:bg-ink-700 active:scale-95 transition-all shadow-md"
          >
            <Wine className="w-3.5 h-3.5 text-amber-300" />
            <span>Raise a Toast</span>
          </button>
        </div>
      </div>
    </div>
  );
};
