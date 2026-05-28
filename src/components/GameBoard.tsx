'use client';

import { useState } from 'react';
import { useLang } from './LanguageContext';
import { CardImage, CardBack } from './Card';
import type { PublicGameState } from '@/lib/types';
import { getCard, cardMatchesStep } from '@/lib/cards';

type Props = {
  state: PublicGameState;
  myId: string;
  sendAction: (action: object) => Promise<void>;
};

export function GameBoard({ state, myId, sendAction }: Props) {
  const { t, lang, strings } = useLang();
  const me = state.players.find((p) => p.id === myId);
  const isMyTurn = state.currentTurnPlayerId === myId;
  const themeRune = state.themeRuneId ? getCard(state.themeRuneId) : null;
  const [selected, setSelected] = useState<string | null>(null);
  const [tokenMode, setTokenMode] = useState<null | 'didnt' | 'did'>(null);

  const playSelected = () => {
    if (!selected) return;
    sendAction({ type: 'play_card', playerId: myId, cardId: selected });
    setSelected(null);
  };

  const onUseToken = (targetId: string) => {
    if (!tokenMode) return;
    sendAction({
      type: tokenMode === 'didnt' ? 'didnt_happen' : 'did_happen',
      playerId: myId,
      targetId,
    });
    setTokenMode(null);
  };

  const currentStep = state.currentStep;
  const currentPlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2 border-b border-amber-900/40 bg-stone-950/80 shrink-0">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono tracking-widest text-amber-300">{state.code}</span>
          <span className="text-amber-200/60">·</span>
          <span className="text-amber-200/80">{t(state.niyet)}</span>
          <span className="text-amber-200/60">·</span>
          <span className="text-amber-200/80">{t(state.zorluk)}</span>
        </div>
        <div className="flex items-center gap-2">
          {currentStep && (
            <div className="text-xs text-amber-200/80 hidden sm:block">
              <span className="text-amber-200/50">{t('step')}:</span>{' '}
              <span className="text-amber-100 font-medium">{strings.steps[currentStep as keyof typeof strings.steps]?.[lang]}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-rows-[auto_1fr_auto] min-h-0">
        <section className="px-3 py-3 border-b border-amber-900/30">
          <PlayersStrip
            state={state}
            myId={myId}
            tokenMode={tokenMode}
            onPickTarget={onUseToken}
          />
        </section>

        <section className="overflow-y-auto px-3 py-3 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-amber-100">{t('story')}</h3>
              <div className="flex items-center gap-2 text-xs text-amber-200/60">
                {currentPlayer && (
                  <span>
                    {t('currentTurn')}: <span className="text-amber-100">{currentPlayer.name}</span>
                  </span>
                )}
                {isMyTurn && (
                  <span className="text-emerald-300 font-semibold animate-pulse">
                    {t('yourTurn')}
                  </span>
                )}
              </div>
            </div>

            {currentStep && isMyTurn && (
              <div className="text-sm text-amber-200/80 bg-amber-900/15 border border-amber-900/30 rounded-lg p-3">
                <span className="font-medium">{strings.steps[currentStep as keyof typeof strings.steps]?.[lang]}:</span>{' '}
                {strings.stepHints[currentStep as keyof typeof strings.stepHints]?.[lang]}
              </div>
            )}

            {state.storySequence.length === 0 ? (
              <p className="text-amber-200/40 italic text-center py-8">{t('storyEmpty')}</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
                {state.storySequence.map((played, i) => {
                  const card = getCard(played.cardId);
                  const player = state.players.find((p) => p.id === played.playedBy);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                      <div className="text-[10px] uppercase tracking-wide text-amber-200/50">
                        {strings.steps[played.step as keyof typeof strings.steps]?.[lang]}
                      </div>
                      <CardImage card={card} size="md" />
                      {player && (
                        <div className="text-[10px] text-amber-200/60 truncate max-w-[100px]">
                          {player.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-start pt-2">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-amber-200/60">{t('themeRune')}</div>
                {themeRune ? <CardImage card={themeRune} size="md" /> : <CardBack size="md" />}
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-amber-200/60">{t('deck')}</div>
                <div className="relative">
                  <CardBack size="md" />
                  <div className="absolute inset-x-0 bottom-1 text-center text-[10px] text-amber-200 bg-stone-950/80 mx-1 py-0.5 rounded">
                    {state.deckCount} {t('cardsRemaining')}
                  </div>
                </div>
              </div>
              {state.discardPile.length > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs text-amber-200/60">{t('discardPile')}</div>
                  <CardImage
                    card={getCard(state.discardPile[state.discardPile.length - 1])}
                    size="md"
                  />
                  <div className="text-[10px] text-amber-200/60">{state.discardPile.length}</div>
                </div>
              )}
            </div>

            <details className="mt-4">
              <summary className="text-xs text-amber-200/60 cursor-pointer hover:text-amber-200">
                {t('log')}
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-amber-200/70 max-h-40 overflow-y-auto scrollbar-thin font-mono">
                {state.log.slice(-30).reverse().map((entry, i) => (
                  <li key={i}>· {entry.message[lang]}</li>
                ))}
              </ul>
            </details>
          </div>
        </section>

        <section className="border-t border-amber-900/40 bg-stone-950/60 px-3 py-3 shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm text-amber-100">
                {t('yourHand')}{' '}
                <span className="text-amber-200/50">({state.you?.hand.length ?? 0})</span>
              </h3>
              <div className="flex items-center gap-2">
                {isMyTurn && (
                  <>
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => sendAction({ type: 'draw_card', playerId: myId })}
                      disabled={state.deckCount === 0}
                    >
                      {t('drawCard')}
                    </button>
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => sendAction({ type: 'pass_turn', playerId: myId })}
                    >
                      {t('passTurn')}
                    </button>
                    <button
                      className="btn-primary text-xs"
                      onClick={playSelected}
                      disabled={!selected}
                    >
                      {t('playCard')}
                    </button>
                  </>
                )}
                <TokenBar me={me} tokenMode={tokenMode} setTokenMode={setTokenMode} />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {state.you?.hand.map((cardId) => {
                const card = getCard(cardId);
                if (!card) return null;
                const valid = currentStep ? cardMatchesStep(card, currentStep) : true;
                return (
                  <CardImage
                    key={cardId}
                    card={card}
                    size="lg"
                    selected={selected === cardId}
                    onClick={() => setSelected(selected === cardId ? null : cardId)}
                    dimmed={isMyTurn && !valid}
                  />
                );
              })}
              {(!state.you || state.you.hand.length === 0) && (
                <div className="text-amber-200/40 italic text-sm py-8 px-3">
                  {lang === 'tr' ? 'Elinde kart yok.' : 'No cards in hand.'}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlayersStrip({
  state,
  myId,
  tokenMode,
  onPickTarget,
}: {
  state: PublicGameState;
  myId: string;
  tokenMode: null | 'didnt' | 'did';
  onPickTarget: (id: string) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-thin">
      {state.players.map((p) => {
        const isMe = p.id === myId;
        const isCurrent = p.id === state.currentTurnPlayerId;
        const targetable = !!tokenMode && p.id !== myId;
        return (
          <button
            key={p.id}
            disabled={!targetable}
            onClick={() => targetable && onPickTarget(p.id)}
            className={`shrink-0 min-w-[110px] rounded-lg border p-2 text-left transition ${
              isCurrent
                ? 'border-amber-300 bg-amber-100/10'
                : 'border-amber-900/40 bg-stone-900/40'
            } ${targetable ? 'cursor-pointer hover:border-amber-200' : 'cursor-default'} ${
              !p.connected && 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${p.connected ? 'bg-emerald-400' : 'bg-stone-600'}`}
              />
              <span className="text-xs font-medium truncate flex-1">{p.name}</span>
              {isMe && (
                <span className="text-[9px] uppercase text-amber-300">
                  {state.niyet === 'strateji' ? '↓' : '↑'}
                </span>
              )}
            </div>
            <div className="font-mono text-lg text-amber-100">
              {p.score}
              <span className="text-[10px] text-amber-200/50 ml-1">{t('yourScore')}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-amber-200/70 mt-1">
              <span>🂠 {p.handCount}</span>
              <span>❌ {p.tokens.didntHappen}</span>
              <span>✓ {p.tokens.didHappen}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TokenBar({
  me,
  tokenMode,
  setTokenMode,
}: {
  me?: PublicGameState['players'][number];
  tokenMode: null | 'didnt' | 'did';
  setTokenMode: (m: null | 'didnt' | 'did') => void;
}) {
  const { t, lang } = useLang();
  if (!me) return null;
  return (
    <div className="flex items-center gap-1">
      <button
        className={`text-xs px-2 py-1 rounded border ${
          tokenMode === 'didnt'
            ? 'border-red-400 bg-red-900/30 text-red-200'
            : 'border-amber-900/40 text-amber-200/80 hover:border-amber-700'
        }`}
        disabled={me.tokens.didntHappen <= 0}
        onClick={() => setTokenMode(tokenMode === 'didnt' ? null : 'didnt')}
        title={t('didntHappenToken')}
      >
        ❌ {me.tokens.didntHappen}
      </button>
      <button
        className={`text-xs px-2 py-1 rounded border ${
          tokenMode === 'did'
            ? 'border-emerald-400 bg-emerald-900/30 text-emerald-200'
            : 'border-amber-900/40 text-amber-200/80 hover:border-amber-700'
        }`}
        disabled={me.tokens.didHappen <= 0}
        onClick={() => setTokenMode(tokenMode === 'did' ? null : 'did')}
        title={t('didHappenToken')}
      >
        ✓ {me.tokens.didHappen}
      </button>
      {tokenMode && (
        <span className="text-xs text-amber-200/80 ml-1 italic">
          {lang === 'tr' ? '→ Hedef seç' : '→ Pick target'}
        </span>
      )}
    </div>
  );
}
