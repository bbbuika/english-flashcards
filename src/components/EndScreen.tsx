'use client';

import Link from 'next/link';
import { useLang } from './LanguageContext';
import type { PublicGameState } from '@/lib/types';
import { getCard } from '@/lib/cards';
import { CardImage } from './Card';

export function EndScreen({
  state,
  myId,
  sendAction,
}: {
  state: PublicGameState;
  myId: string;
  sendAction: (action: object) => Promise<void>;
}) {
  const { t, lang, strings } = useLang();
  const winner = state.players.find((p) => p.id === state.winnerId);
  const me = state.players.find((p) => p.id === myId);
  const isHost = me?.isHost ?? false;
  const sorted = [...state.players].sort((a, b) =>
    state.niyet === 'strateji' ? a.score - b.score : b.score - a.score,
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-amber-200/60">{t('winner')}</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-amber-100 mt-2">
            {winner?.name ?? '—'}
          </h1>
        </div>

        {state.storySequence.length > 0 && (
          <div className="card-frame p-4">
            <h3 className="font-display text-lg text-amber-100 mb-3">{t('story')}</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {state.storySequence.map((p, i) => {
                const c = getCard(p.cardId);
                return (
                  <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                    <div className="text-[10px] text-amber-200/50 uppercase">
                      {strings.steps[p.step as keyof typeof strings.steps]?.[lang]}
                    </div>
                    <CardImage card={c} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card-frame p-4">
          <h3 className="font-display text-lg text-amber-100 mb-3">{t('finalScores')}</h3>
          <ul className="space-y-2">
            {sorted.map((p, idx) => (
              <li
                key={p.id}
                className={`flex items-center justify-between p-2 rounded ${
                  p.id === state.winnerId ? 'bg-amber-700/30' : 'bg-stone-900/40'
                }`}
              >
                <span className="font-medium">
                  {idx + 1}. {p.name}
                </span>
                <span className="font-mono text-lg text-amber-100">{p.score}</span>
              </li>
            ))}
          </ul>
        </div>

        {isHost && (
          <button
            className="btn-primary w-full"
            onClick={() => sendAction({ type: 'new_game', playerId: myId })}
          >
            {t('newGame')}
          </button>
        )}
        <Link href="/" className="btn-ghost block">
          {t('leaveRoom')}
        </Link>
      </div>
    </main>
  );
}
