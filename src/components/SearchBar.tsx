'use client';

import { useState, useRef, useEffect } from 'react';
import { WordCard } from '@/data/words';

interface SearchBarProps {
  cards: WordCard[];
  onSelect: (index: number) => void;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-100 text-indigo-800 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar({ cards, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q.length >= 1
    ? cards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) =>
          card.word.toLowerCase().includes(q) ||
          card.turkish.toLowerCase().includes(q) ||
          card.definition.toLowerCase().includes(q)
        )
        .sort((a, b) => {
          // word-starts-with matches come first
          const aStarts = a.card.word.toLowerCase().startsWith(q) ? 0 : 1;
          const bStarts = b.card.word.toLowerCase().startsWith(q) ? 0 : 1;
          return aStarts - bStarts;
        })
        .slice(0, 8)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(index: number) {
    onSelect(index);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function clear() {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => q.length >= 1 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Search words, definitions or translations…"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition shadow-sm"
        />

        {query && (
          <button
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && q.length >= 1 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[11px] text-gray-300">ESC to close</span>
              </div>
              {results.map(({ card, index }) => (
                <button
                  key={card.id}
                  onClick={() => select(index)}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-4 border-b border-gray-50 last:border-0 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {highlight(card.word, query)}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {highlight(card.turkish, query)}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-300 shrink-0">#{index + 1}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">Try a different word or translation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
