'use client';

import { useLang } from './LanguageContext';
import { TorePanel } from './TorePanel';
import type { PublicGameState, Niyet, Zorluk } from '@/lib/types';

type Props = {
  state: PublicGameState;
  myId: string;
  sendAction: (action: object) => Promise<void>;
};

export function Lobby({ state, myId, sendAction }: Props) {
  const { t, lang } = useLang();
  const me = state.players.find((p) => p.id === myId);
  const isHost = me?.isHost ?? false;

  const setNiyet = (n: Niyet) =>
    sendAction({ type: 'set_niyet', playerId: myId, niyet: n });
  const setZorluk = (z: Zorluk) =>
    sendAction({ type: 'set_zorluk', playerId: myId, zorluk: z });
  const setSk = (targetId: string) =>
    sendAction({ type: 'set_scorekeeper', playerId: myId, targetId });
  const start = () => sendAction({ type: 'start_game', playerId: myId });

  const canStart = isHost && state.players.length >= 2;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="text-center">
        <p className="text-amber-200/60 text-sm uppercase tracking-widest">{t('roomCode')}</p>
        <div className="flex items-center justify-center gap-3 mt-1">
          <h2 className="font-mono text-4xl md:text-5xl font-bold text-amber-100 tracking-widest">
            {state.code}
          </h2>
          <button
            className="btn-ghost text-xs"
            onClick={() => navigator.clipboard.writeText(state.code)}
          >
            {t('copy')}
          </button>
        </div>
      </header>

      <section className="card-frame p-4">
        <h3 className="font-display text-xl text-amber-100 mb-3">
          {t('players')} ({state.players.length}/4)
        </h3>
        <ul className="space-y-2">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 bg-stone-900/40 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    p.connected ? 'bg-emerald-400' : 'bg-stone-600'
                  }`}
                />
                <span className="font-medium truncate">{p.name}</span>
                {p.isHost && (
                  <span className="text-[10px] uppercase tracking-wide bg-amber-700/40 text-amber-200 px-1.5 py-0.5 rounded">
                    {t('host')}
                  </span>
                )}
                {p.isScorekeeper && (
                  <span
                    className="text-[10px] uppercase tracking-wide bg-emerald-700/40 text-emerald-200 px-1.5 py-0.5 rounded"
                    title={t('scorekeeperFull')}
                  >
                    {t('scorekeeper')}
                  </span>
                )}
              </div>
              {isHost && p.id !== myId && (
                <button
                  className="btn-ghost text-xs"
                  onClick={() => setSk(p.id)}
                  title={t('scorekeeperFull')}
                >
                  {t('scorekeeper')}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-frame p-4 space-y-3">
        <h3 className="font-display text-xl text-amber-100">{t('niyet')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['strateji', 'uzlasma'] as const).map((n) => (
            <button
              key={n}
              onClick={() => isHost && setNiyet(n)}
              disabled={!isHost}
              className={`p-3 rounded-lg border text-left transition ${
                state.niyet === n
                  ? 'border-amber-300 bg-amber-100/10'
                  : 'border-amber-900/40 hover:border-amber-700/60'
              } ${!isHost && 'cursor-not-allowed opacity-80'}`}
            >
              <div className="font-display text-lg">{t(n)}</div>
              <div className="text-xs text-amber-200/60 mt-1">
                {n === 'strateji' ? t('strategiDesc') : t('uzlasmaDesc')}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="card-frame p-4 space-y-3">
        <h3 className="font-display text-xl text-amber-100">{t('zorluk')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['kolay', 'zor'] as const).map((z) => (
            <button
              key={z}
              onClick={() => isHost && setZorluk(z)}
              disabled={!isHost}
              className={`p-3 rounded-lg border text-center transition ${
                state.zorluk === z
                  ? 'border-amber-300 bg-amber-100/10'
                  : 'border-amber-900/40 hover:border-amber-700/60'
              } ${!isHost && 'cursor-not-allowed opacity-80'}`}
            >
              <div className="font-display text-lg">{t(z)}</div>
            </button>
          ))}
        </div>
      </section>

      <TorePanel />

      {isHost ? (
        <button className="btn-primary w-full text-lg" onClick={start} disabled={!canStart}>
          {t('startGame')}
        </button>
      ) : (
        <p className="text-center text-amber-200/60 text-sm italic">
          {lang === 'tr' ? 'Kurucu oyunu başlatmayı bekliyor...' : 'Waiting for host to start...'}
        </p>
      )}
      {!canStart && isHost && (
        <p className="text-center text-amber-200/60 text-sm">{t('startNeedsTwo')}</p>
      )}
    </div>
  );
}
