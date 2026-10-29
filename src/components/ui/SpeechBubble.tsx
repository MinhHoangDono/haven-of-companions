import React, { useEffect, useState } from 'react';
import { Character } from '../../types/character';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

interface SpeechBubbleProps {
  character: Character;
  screenPos: { x: number; y: number };
  onOpenDetails: () => void;
  onClose: () => void;
  onTriggerAbility: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  character,
  screenPos,
  onOpenDetails,
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

  const bubbleX = screenPos.x;
  const bubbleY = screenPos.y - 12;
  return (
    <div
      className="absolute z-20 pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-transform duration-75 select-none"
      style={{
        left: `${bubbleX}px`,
        top: `${bubbleY}px`,
      }}
    >
      <div className="relative w-64 md:w-72 bg-paper-100 text-ink-900 border-2 border-paper-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-sm">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-paper-200 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <MessageCircle className="w-3.5 h-3.5 text-fantasy-gold shrink-0" />
            <span className="text-[11px] font-serif font-bold tracking-wide uppercase text-ink-800 truncate max-w-[160px] sm:max-w-[200px]" title={character.name}>
              {character.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-ink-400 hover:text-ink-900 font-sans px-1"
          >
            ✕
          </button>
        </div>

        {/* Spoken Quote text */}
        <p className="text-xs font-sans text-ink-800 leading-relaxed min-h-[38px] mb-3">
          "{displayedText}"
        </p>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-paper-200">
          {/* Next Quote button */}
          <button
            onClick={() => setQuoteIndex((prev) => prev + 1)}
            className="flex items-center gap-1 text-[10px] font-sans font-semibold text-ink-700 hover:text-ink-900 bg-paper-200/80 px-2 py-1 rounded-lg active:scale-95 transition-all"
          >
            <span>Next</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>

          <div className="flex items-center gap-1">
            {/* Signature ability button */}
            <button
              onClick={onTriggerAbility}
              className="flex items-center gap-1 text-[10px] font-sans font-semibold bg-fantasy-gold text-ink-900 px-2.5 py-1 rounded-lg shadow-sm active:scale-95 transition-all"
              title={character.signatureAbility.name}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Cast</span>
            </button>

            {/* Profile modal button */}
            <button
              onClick={onOpenDetails}
              className="text-[10px] font-sans font-semibold bg-ink-800 text-paper-100 px-2.5 py-1 rounded-lg active:scale-95 transition-all"
            >
              Sheet
            </button>
          </div>
        </div>

        {/* Speech bubble tail pointer */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-paper-800" />
        <div className="absolute left-1/2 bottom-[2px] transform -translate-x-1/2 translate-y-full w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-paper-100" />
      </div>
    </div>
  );
};
