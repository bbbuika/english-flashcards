'use client';

import { useState } from 'react';
import { useLang } from './LanguageContext';
import { CardImage, CardBack } from './Card';
import type { PublicGameState, SlotKey } from '@/lib/types';
import { SLOT_KEYS } from '@/lib/types';
import { getCard } from '@/lib/cards';

type Props = {
  state: PublicGameState;
  myId: string;
  sendAction: (action: object) => Promise<void>;
};

export function GameBoard({ state, myId, sendAction }: Props) {
  const { t, lang } = useLang();
  const me = state.players.find((p) => p.id === myId);
  const isMyTurn = state.currentTurnPlayerId === myId;
  const themeRune = state.themeRuneId ? getCard(state.themeRuneId) : null;
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [tokenMode, setTokenMode] = useState<null | 'didnt' | 'did'>(null);

  const placeIn = (slot: SlotKey) => {
    if (!selectedCard) return;
    sendAction({ type: 'play_card', playerId: myId, cardId: selectedCard, slot });
    setSelectedCard(null);
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
        <div className="flex items-center gap-2 text-xs">
          {currentPlayer && (
            <span className="text-amber-200/60">
              {t('currentTurn')}:{' '}
              <span className="text-amber-100">{currentPlayer.name}</span>
            </span>
          )}
          {isMyTurn && (
            <span className="text-emerald-300 font-semibold animate-pulse">{t('yourTurn')}</span>
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

        <section className="overflow-y-auto px-3 py-4 scrollbar-thin">
          <div className="max-w-5xl mx-auto space-y-4">
            <Board
              state={state}
              isMyTurn={isMyTurn}
              selectedCard={selectedCard}
              onSlotClick={placeIn}
              themeRune={themeRune}
            />

            {isMyTurn && (
              <p className="text-center text-amber-200/70 text-sm italic">
                {selectedCard ? t('pickSlot') : t('pickCard')}
              </p>
            )}

            <div className="flex flex-wrap gap-3 items-start justify-center pt-2">
              <PileView
                label={t('mainDeck')}
                count={state.mainDeckCount}
                kind="main"
                onDraw={
                  isMyTurn && state.mainDeckCount > 0
                    ? () => sendAction({ type: 'draw_card', playerId: myId, pile: 'main' })
                    : undefined
                }
              />
              <PileView
                label={t('runeDeck')}
                count={state.runeDeckCount}
                kind="rune"
                onDraw={
                  isMyTurn && state.runeDeckCount > 0
                    ? () => sendAction({ type: 'draw_card', playerId: myId, pile: 'rune' })
                    : undefined
                }
              />
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
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => sendAction({ type: 'pass_turn', playerId: myId })}
                  >
                    {t('passTurn')}
                  </button>
                )}
                <TokenBar me={me} tokenMode={tokenMode} setTokenMode={setTokenMode} />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {state.you?.hand.map((cardId) => {
                const card = getCard(cardId);
                if (!card) return null;
                return (
                  <CardImage
                    key={cardId}
                    card={card}
                    size="lg"
                    selected={selectedCard === cardId}
                    onClick={() => setSelectedCard(selectedCard === cardId ? null : cardId)}
                    disabled={!isMyTurn}
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

function Board({
  state,
  isMyTurn,
  selectedCard,
  onSlotClick,
  themeRune,
}: {
  state: PublicGameState;
  isMyTurn: boolean;
  selectedCard: string | null;
  onSlotClick: (slot: SlotKey) => void;
  themeRune: ReturnType<typeof getCard> | null;
}) {
  const { t, strings, lang } = useLang();
  return (
    <div className="card-frame p-4 md:p-6 bg-gradient-to-br from-stone-900/80 to-stone-950/80">
      <div className="flex items-center gap-3 mb-4">
        {themeRune ? (
          <CardImage card={themeRune} size="sm" />
        ) : (
          <CardBack size="sm" kind="rune" />
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-amber-200/50">
            {t('themeRune')}
          </div>
          <div className="font-display text-amber-100 text-sm">
            {themeRune?.title ?? '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SLOT_KEYS.map((slot) => {
          const cards = state.board[slot] ?? [];
          const topId = cards[cards.length - 1];
          const topCard = topId ? getCard(topId) : null;
          const canDrop = isMyTurn && !!selectedCard;
          const slotLabel = strings.slots[slot as keyof typeof strings.slots]?.[lang] ?? slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={!canDrop}
              onClick={() => onSlotClick(slot)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                canDrop
                  ? 'border-amber-300/60 hover:border-amber-200 hover:bg-amber-100/5 cursor-pointer'
                  : 'border-amber-900/40 cursor-default'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-amber-200/70">
                {slotLabel}
              </div>
              {topCard ? (
                <div className="relative">
                  <CardImage card={topCard} size="md" />
                  {cards.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-amber-700 text-amber-50 text-[10px] font-mono rounded-full w-5 h-5 flex items-center justify-center border border-amber-900">
                      {cards.length}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-[100px] h-[150px] rounded-lg border border-dashed border-amber-900/40 flex items-center justify-center text-amber-900/60 text-3xl">
                  ◇
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PileView({
  label,
  count,
  kind,
  onDraw,
}: {
  label: string;
  count: number;
  kind: 'main' | 'rune';
  onDraw?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-amber-200/60">{label}</div>
      <div className="relative">
        <CardBack size="md" kind={kind} />
        <div className="absolute inset-x-0 bottom-1 text-center text-[10px] text-amber-200 bg-stone-950/80 mx-1 py-0.5 rounded">
          {count}
        </div>
      </div>
      {onDraw && (
        <button className="btn-ghost text-xs mt-1" onClick={onDraw}>
          {kind === 'rune' ? '↑ Rün' : '↑ Çek'}
        </button>
      )}
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
