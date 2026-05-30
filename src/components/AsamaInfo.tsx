'use client';

import { useLang } from './LanguageContext';
import { asamaForCardNumber } from '@/data/asamalar';
import type { Card as CardType } from '@/lib/types';

export function AsamaInfo({ card }: { card: CardType }) {
  const { lang } = useLang();
  const a = asamaForCardNumber(card.number);
  if (!a) {
    return (
      <div className="text-xs text-amber-200/50 italic">
        {lang === 'tr' ? 'Bu kart için Aşama metadata yok.' : 'No Aşama metadata for this card.'}
      </div>
    );
  }
  return (
    <div className="card-frame p-3 space-y-2 text-xs">
      <div className="flex items-baseline justify-between">
        <h4 className="font-display text-amber-100 text-base">
          <span className="text-amber-300/70 font-mono mr-1">{a.number}</span>
          {a.name[lang]}
        </h4>
        <span className="text-amber-200/40 font-mono">{a.puan}</span>
      </div>
      <p className="text-amber-200/85 leading-snug">{a.meaning[lang]}</p>
      <div className="text-amber-200/60 italic border-l-2 border-amber-900/40 pl-2">
        {a.notlar[lang]}
      </div>
      {a.jung.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {a.jung.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] bg-amber-900/30 text-amber-200/70 rounded px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1 text-[10px] text-amber-200/50">
        {a.phases.map((p, i) => (
          <span key={i} className="border border-amber-900/40 rounded px-1.5 py-0.5">
            {p === 'oyun-basi' ? (lang === 'tr' ? 'Oyun Başı' : 'Game Start') :
              p === 'oyun-ortasi' ? (lang === 'tr' ? 'Oyun Ortası' : 'Game Mid') :
              (lang === 'tr' ? 'Oyun Sonu' : 'Game End')}
          </span>
        ))}
      </div>
    </div>
  );
}
