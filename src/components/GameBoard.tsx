'use client';

import { useState } from 'react';
import { useLang } from './LanguageContext';
import { CardImage, CardBack } from './Card';
import { TorePanel } from './TorePanel';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const isMobile = useIsMobile();
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
      {/* Header — 2 rows on mobile */}
      <header className="px-3 py-1.5 border-b border-amber-900/40 bg-stone-950/80 shrink-0">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono tracking-widest text-amber-300">{state.code}</span>
            <span className="text-amber-200/60">·</span>
            <span className="text-amber-200/70">{t(state.niyet)}</span>
            <span className="text-amber-200/60">·</span>
            <span className="text-amber-200/70">{t(state.zorluk)}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isMyTurn ? (
              <span className="text-emerald-300 font-semibold animate-pulse text-xs" title={t('narratorFull')}>{t('yourTurn')}</span>
            ) : currentPlayer ? (
              <span className="text-amber-200/60 text-xs truncate max-w-[100px] sm:max-w-none" title={t('narratorFull')}>
                <span className="text-amber-200/50">{t('narrator')}: </span>
                <span className="text-amber-100">{currentPlayer.name}</span>
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-rows-[auto_1fr_auto] min-h-0">
        <section className="px-2 py-2 border-b border-amber-900/30">
          <PlayersStrip
            state={state}
            myId={myId}
            tokenMode={tokenMode}
            onPickTarget={onUseToken}
            compact={isMobile}
          />
        </section>

        <section className="overflow-y-auto px-2 sm:px-3 py-3 scrollbar-thin">
          <div className="max-w-5xl mx-auto space-y-3">
            <Board
              state={state}
              isMyTurn={isMyTurn}
              selectedCard={selectedCard}
              onSlotClick={placeIn}
              themeRune={themeRune}
              compact={isMobile}
            />

            {isMyTurn && (
              <p className="text-center text-amber-200/70 text-xs italic">
                {selectedCard ? t('pickSlot') : t('pickCard')}
              </p>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-3 items-start justify-center pt-1">
              <PileView
                label={t('mainDeck')}
                count={state.mainDeckCount}
                kind="main"
                compact={isMobile}
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
                compact={isMobile}
                onDraw={
                  isMyTurn && state.runeDeckCount > 0
                    ? () => sendAction({ type: 'draw_card', playerId: myId, pile: 'rune' })
                    : undefined
                }
              />
            </div>

            <details className="mt-3">
              <summary className="text-xs text-amber-200/60 cursor-pointer hover:text-amber-200">
                📖 Töre
              </summary>
              <div className="mt-2">
                <TorePanel compact />
              </div>
            </details>

            <details className="mt-3">
              <summary className="text-xs text-amber-200/60 cursor-pointer hover:text-amber-200">
                {t('log')}
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-amber-200/70 max-h-32 overflow-y-auto scrollbar-thin font-mono">
                {state.log.slice(-30).reverse().map((entry, i) => (
                  <li key={i}>· {entry.message[lang]}</li>
                ))}
              </ul>
            </details>
          </div>
        </section>

        {/* Hand — pb-16 on mobile for voice/chat buttons */}
        <section className="border-t border-amber-900/40 bg-stone-950/60 px-2 sm:px-3 py-2 shrink-0 pb-16 sm:pb-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-display text-xs sm:text-sm text-amber-100">
                {t('yourHand')}{' '}
                <span className="text-amber-200/50">({state.you?.hand.length ?? 0})</span>
              </h3>
              <div className="flex items-center gap-1.5">
                {isMyTurn && (
                  <button
                    className="btn-ghost text-xs py-1 px-2"
                    onClick={() => sendAction({ type: 'pass_turn', playerId: myId })}
                  >
                    {t('passTurn')}
                  </button>
                )}
                <TokenBar me={me} tokenMode={tokenMode} setTokenMode={setTokenMode} isMobile={isMobile} />
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {state.you?.hand.map((cardId) => {
                const card = getCard(cardId);
                if (!card) return null;
                return (
                  <CardImage
                    key={cardId}
                    card={card}
                    size={isMobile ? 'sm' : 'lg'}
                    selected={selectedCard === cardId}
                    onClick={() => setSelectedCard(selectedCard === cardId ? null : cardId)}
                    disabled={!isMyTurn}
                  />
                );
              })}
              {(!state.you || state.you.hand.length === 0) && (
                <div className="text-amber-200/40 italic text-xs py-6 px-3">
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
  compact,
}: {
  state: PublicGameState;
  isMyTurn: boolean;
  selectedCard: string | null;
  onSlotClick: (slot: SlotKey) => void;
  themeRune: ReturnType<typeof getCard> | null;
  compact: boolean;
}) {
  const { t, strings, lang } = useLang();
  const slotCardSize = compact ? 'xs' : 'md';
  const placeholderCls = compact ? 'w-[48px] h-[72px]' : 'w-[100px] h-[150px]';

  return (
    <div className="card-frame p-2 sm:p-4 md:p-6 bg-gradient-to-br from-stone-900/80 to-stone-950/80">
      <div className="flex items-center gap-2 mb-3">
        {themeRune ? (
          <CardImage card={themeRune} size={compact ? 'xs' : 'sm'} />
        ) : (
          <CardBack size={compact ? 'xs' : 'sm'} kind="rune" />
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-3">
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
              className={`relative flex flex-col items-center gap-1 p-1.5 sm:p-3 rounded-lg border-2 transition ${
                canDrop
                  ? 'border-amber-300/60 hover:border-amber-200 hover:bg-amber-100/5 cursor-pointer'
                  : 'border-amber-900/40 cursor-default'
              }`}
            >
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-200/70">
                {slotLabel}
              </div>
              {topCard ? (
                <div className="relative">
                  <CardImage card={topCard} size={slotCardSize} />
                  {cards.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-amber-700 text-amber-50 text-[10px] font-mono rounded-full w-4 h-4 flex items-center justify-center border border-amber-900">
                      {cards.length}
                    </span>
                  )}
                </div>
              ) : (
                <div className={`${placeholderCls} rounded-lg border border-dashed border-amber-900/40 flex items-center justify-center text-amber-900/60 ${compact ? 'text-xl' : 'text-3xl'}`}>
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
  compact,
  onDraw,
}: {
  label: string;
  count: number;
  kind: 'main' | 'rune';
  compact: boolean;
  onDraw?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] sm:text-xs text-amber-200/60">{label}</div>
      <div className="relative">
        <CardBack size={compact ? 'xs' : 'md'} kind={kind} />
        <div className="absolute inset-x-0 bottom-0.5 text-center text-[9px] sm:text-[10px] text-amber-200 bg-stone-950/80 mx-0.5 py-0.5 rounded">
          {count}
        </div>
      </div>
      {onDraw && (
        <button className="btn-ghost text-[10px] sm:text-xs mt-0.5 py-0.5 px-1.5" onClick={onDraw}>
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
  compact,
}: {
  state: PublicGameState;
  myId: string;
  tokenMode: null | 'didnt' | 'did';
  onPickTarget: (id: string) => void;
  compact: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-thin">
      {state.players.map((p) => {
        const isMe = p.id === myId;
        const isCurrent = p.id === state.currentTurnPlayerId;
        const targetable = !!tokenMode && p.id !== myId;
        return (
          <button
            key={p.id}
            disabled={!targetable}
            onClick={() => targetable && onPickTarget(p.id)}
            className={`shrink-0 ${compact ? 'min-w-[80px]' : 'min-w-[110px]'} rounded-lg border ${compact ? 'p-1.5' : 'p-2'} text-left transition ${
              isCurrent
                ? 'border-amber-300 bg-amber-100/10'
                : 'border-amber-900/40 bg-stone-900/40'
            } ${targetable ? 'cursor-pointer hover:border-amber-200' : 'cursor-default'} ${
              !p.connected && 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.connected ? 'bg-emerald-400' : 'bg-stone-600'}`}
              />
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium truncate flex-1`}>{p.name}</span>
              {isCurrent && (
                <span
                  className="text-[9px] uppercase bg-amber-700/40 text-amber-200 px-1 rounded"
                  title="Kethüda"
                >
                  K
                </span>
              )}
              {p.isScorekeeper && (
                <span
                  className="text-[9px] uppercase bg-emerald-700/40 text-emerald-200 px-1 rounded"
                  title="Aygucı"
                >
                  A
                </span>
              )}
              {isMe && (
                <span className="text-[9px] uppercase text-amber-300">
                  {state.niyet === 'strateji' ? '↓' : '↑'}
                </span>
              )}
            </div>
            <div className={`font-mono ${compact ? 'text-base' : 'text-lg'} text-amber-100`}>
              {p.score}
              <span className="text-[10px] text-amber-200/50 ml-1">{t('yourScore')}</span>
            </div>
            {!compact && (
              <div className="flex items-center gap-2 text-[10px] text-amber-200/70 mt-1">
                <span>🂠 {p.handCount}</span>
                <span>❌ {p.tokens.didntHappen}</span>
                <span>✓ {p.tokens.didHappen}</span>
              </div>
            )}
            {compact && (
              <div className="text-[9px] text-amber-200/60">
                🂠{p.handCount} ❌{p.tokens.didntHappen}
              </div>
            )}
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
  isMobile,
}: {
  me?: PublicGameState['players'][number];
  tokenMode: null | 'didnt' | 'did';
  setTokenMode: (m: null | 'didnt' | 'did') => void;
  isMobile: boolean;
}) {
  const { t, lang } = useLang();
  if (!me) return null;
  return (
    <div className="flex items-center gap-1">
      <button
        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded border ${
          tokenMode === 'didnt'
            ? 'border-red-400 bg-red-900/30 text-red-200'
            : 'border-amber-900/40 text-amber-200/80 hover:border-amber-700'
        }`}
        disabled={me.tokens.didntHappen <= 0}
        onClick={() => setTokenMode(tokenMode === 'didnt' ? null : 'didnt')}
        title={t('didntHappenToken')}
      >
        ❌{isMobile ? '' : ' '}{me.tokens.didntHappen}
      </button>
      <button
        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded border ${
          tokenMode === 'did'
            ? 'border-emerald-400 bg-emerald-900/30 text-emerald-200'
            : 'border-amber-900/40 text-amber-200/80 hover:border-amber-700'
        }`}
        disabled={me.tokens.didHappen <= 0}
        onClick={() => setTokenMode(tokenMode === 'did' ? null : 'did')}
        title={t('didHappenToken')}
      >
        ✓{isMobile ? '' : ' '}{me.tokens.didHappen}
      </button>
      {tokenMode && !isMobile && (
        <span className="text-xs text-amber-200/80 ml-1 italic">
          {lang === 'tr' ? '→ Hedef seç' : '→ Pick target'}
        </span>
      )}
    </div>
  );
}
