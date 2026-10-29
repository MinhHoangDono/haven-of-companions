import React, { useEffect, useState } from 'react';
import { Character } from '../../types/character';
import { Sparkles, MessageCircle, ArrowRight, X } from 'lucide-react';

interface SpeechBubbleProps {
  character: Character;
  onClose: () => void;
  onTriggerAbility: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  character,
  onClose,
  onTriggerAbility,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  const currentQuote = character.dialogue[quoteIndex % character.dialogue.length];

  // Typewriter text effect
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < currentQuote.length) {
        setDisplayedText(currentQuote.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [currentQuote]);

  return (
    <div className="fixed bottom-4 left-3 z-30 pointer-events-auto select-none pb-safe animate-fade-in max-w-[calc(100vw-24px)]">
      <div className="relative w-72 sm:w-80 bg-paper-100/95 text-ink-900 border-2 border-paper-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-paper-200 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <MessageCircle className="w-3.5 h-3.5 text-fantasy-gold shrink-0" />
            <span className="text-[11px] font-serif font-bold tracking-wide uppercase text-ink-800 truncate max-w-[170px]" title={character.name}>
              {character.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] text-ink-400 hover:text-ink-900 font-sans p-1 rounded-full hover:bg-paper-200/80 active:scale-95 transition-all"
            title="Đóng hội thoại"
          >
            <X className="w-3 h-3 text-ink-600" />
          </button>
        </div>

        {/* Spoken Quote text */}
        <p className="text-xs font-sans text-ink-800 leading-relaxed min-h-[38px] mb-3">
          "{displayedText}"
        </p>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-paper-200">
          {/* Next Quote button */}
          <button
            onClick={() => setQuoteIndex((prev) => prev + 1)}
            className="flex items-center gap-1 text-[11px] font-sans font-semibold text-ink-700 hover:text-ink-900 bg-paper-200/90 px-2.5 py-1 rounded-lg active:scale-95 transition-all"
          >
            <span>Tiếp theo</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Signature ability cast button */}
          <button
            onClick={() => {
              onTriggerAbility();
              onClose();
            }}
            className="flex items-center gap-1.5 text-[11px] font-sans font-bold bg-fantasy-gold text-ink-950 px-3 py-1 rounded-lg shadow-sm active:scale-95 transition-all hover:brightness-105"
            title={`Thi triển kỹ năng ${character.signatureAbility.name}`}
          >
            <Sparkles className="w-3 h-3 text-ink-950" />
            <span>Thi triển</span>
          </button>
        </div>
      </div>
    </div>
  );
};
