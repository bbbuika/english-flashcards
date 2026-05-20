'use client';

import { useState } from 'react';
import { WordCard } from '@/data/words';
import { getWordEmoji, getWordGradient } from '@/lib/wordEmoji';

interface FlashcardProps {
  card: WordCard;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function Flashcard({ card, isFlipped, onFlip }: FlashcardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const emoji = getWordEmoji(card.word);
  const gradient = getWordGradient(card.word);
  const imageUrl = card.imageUrl || `https://loremflickr.com/640/320/${encodeURIComponent(card.word)},english/all`;

  return (
    <div
      className="w-full cursor-pointer select-none"
      style={{ perspective: '1200px', height: '500px' }}
      onClick={onFlip}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Image area */}
          <div className={`relative h-52 flex-shrink-0 bg-gradient-to-br ${gradient} overflow-hidden`}>
            {/* Emoji shown while loading or on error */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imgLoaded && !imgError ? 'opacity-0' : 'opacity-100'}`}
            >
              <span className="text-8xl drop-shadow-md">{emoji}</span>
            </div>

            {/* Actual photo */}
            {!imgError && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={card.id}
                src={imageUrl}
                alt={card.word}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}

            {/* Gradient overlay so text on top stays readable */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/30 to-transparent" />

            {/* Flip hint */}
            <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-white text-[10px] font-medium">flip</span>
            </div>

            {/* Custom card badge */}
            {card.isCustom && (
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-[10px] font-semibold text-indigo-600">Custom</span>
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="flex flex-col flex-1 p-5 gap-3 overflow-hidden">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight truncate">{card.word}</h2>
              <span className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase shrink-0">EN</span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{card.definition}</p>

            <p className="text-xs text-gray-400 italic border-l-2 border-indigo-200 pl-3 line-clamp-2">
              &ldquo;{card.example}&rdquo;
            </p>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className={`absolute inset-0 rounded-2xl shadow-xl bg-gradient-to-br ${gradient} overflow-hidden flex flex-col`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10" />

          {/* Top label */}
          <div className="flex items-center justify-between p-5 relative z-10">
            <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">Türkçe</span>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-white text-[10px] font-medium">flip</span>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 relative z-10 text-center">
            <span className="text-7xl drop-shadow-lg">{emoji}</span>
            <p className="text-lg font-medium text-white/70">{card.word}</p>
            <h2 className="text-3xl font-bold text-white leading-tight">{card.turkish}</h2>
          </div>

          {/* Bottom spacer */}
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
