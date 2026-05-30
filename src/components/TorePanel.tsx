'use client';

import { useState } from 'react';
import { useLang } from './LanguageContext';
import { TORE } from '@/data/tore';

export function TorePanel({ compact = false }: { compact?: boolean }) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="card-frame p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-amber-100 text-lg">
          {lang === 'tr' ? 'Töre' : 'Töre (Code)'}
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-amber-200/50">
          {lang === 'tr' ? "Ölçey'in 10 maddesi" : "Ölçey's 10 articles"}
        </span>
      </div>
      <ol className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
        {TORE.map((a) => {
          const isOpen = expanded === a.number;
          return (
            <li key={a.number} className="border-b border-amber-900/20 last:border-0 pb-1">
              <button
                type="button"
                className="w-full text-left flex items-baseline gap-2 hover:text-amber-100 text-amber-200/85"
                onClick={() => setExpanded(isOpen ? null : a.number)}
              >
                <span className="font-mono text-amber-300/70 w-5 shrink-0">{a.number}.</span>
                <span className="font-medium">{lang === 'tr' ? a.shortTr : a.shortEn}</span>
                <span className="text-amber-200/40 ml-auto text-xs">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="ml-7 mt-1 text-amber-200/70 italic text-xs leading-snug">
                  {lang === 'tr' ? a.fullTr : a.fullEn}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
