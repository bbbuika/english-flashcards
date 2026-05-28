import { CARDS, getCard, isEndingRune } from './cards';
import { createRoom, generateRoomCode, getRoom, updateRoom } from './rooms';
import type { GameState, Niyet, SlotKey, Zorluk } from './types';

function emptyBoard(): Record<SlotKey, string[]> {
  return {
    mekan: [],
    zaman: [],
    kahraman: [],
    sovalye: [],
    olay: [],
    olgu: [],
  };
}

const STRATEGY_START_POINTS: Record<Zorluk, Record<number, number>> = {
  zor: { 2: 128, 3: 81, 4: 69 },
  kolay: { 2: 165, 3: 99, 4: 86 },
};

const RECONCILIATION_START_POINTS: Record<number, number> = {
  2: 12,
  3: 18,
  4: 24,
};

const DEFAULT_HAND_SIZE = 7;
const DEFAULT_TOKENS_PER_PLAYER = 3;

export function startingScore(niyet: Niyet, zorluk: Zorluk, playerCount: number): number {
  const clamped = Math.min(4, Math.max(2, playerCount));
  if (niyet === 'strateji') return STRATEGY_START_POINTS[zorluk][clamped] ?? 0;
  return RECONCILIATION_START_POINTS[clamped] ?? 0;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createNewRoom(hostName: string, hostId: string): GameState {
  const code = generateRoomCode();
  const now = Date.now();
  const state: GameState = {
    code,
    phase: 'lobby',
    niyet: 'uzlasma',
    zorluk: 'kolay',
    players: [
      {
        id: hostId,
        name: hostName.trim().slice(0, 24) || 'Host',
        isScorekeeper: false,
        isHost: true,
        score: 0,
        hand: [],
        handCount: 0,
        tokens: { didntHappen: 0, didHappen: 0 },
        joinedAt: now,
        connected: true,
      },
    ],
    hostId,
    scorekeeperId: null,
    themeRuneId: null,
    mainDeck: [],
    runeDeck: [],
    discardPile: [],
    board: emptyBoard(),
    storySequence: [],
    currentTurnPlayerId: hostId,
    log: [
      {
        ts: now,
        message: {
          tr: `${hostName} odayı kurdu.`,
          en: `${hostName} created the room.`,
        },
      },
    ],
    winnerId: null,
    createdAt: now,
  };
  createRoom(state);
  return state;
}

export function joinRoom(code: string, name: string, playerId: string): GameState | { error: string } {
  const room = getRoom(code);
  if (!room) return { error: 'not_found' };
  const state = room.state;
  const existing = state.players.find((p) => p.id === playerId);
  if (existing) {
    return (
      updateRoom(code, (s) => {
        const p = s.players.find((x) => x.id === playerId);
        if (p) p.connected = true;
      }) ?? state
    );
  }
  if (state.phase !== 'lobby') return { error: 'game_in_progress' };
  if (state.players.length >= 4) return { error: 'room_full' };
  return (
    updateRoom(code, (s) => {
      const now = Date.now();
      s.players.push({
        id: playerId,
        name: name.trim().slice(0, 24) || 'Player',
        isScorekeeper: false,
        isHost: false,
        score: 0,
        hand: [],
        handCount: 0,
        tokens: { didntHappen: 0, didHappen: 0 },
        joinedAt: now,
        connected: true,
      });
      s.log.push({
        ts: now,
        message: { tr: `${name} odaya katıldı.`, en: `${name} joined the room.` },
      });
    }) ?? state
  );
}

export function setNiyet(code: string, playerId: string, niyet: Niyet): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'lobby') return;
    if (s.hostId !== playerId) return;
    s.niyet = niyet;
  });
}

export function setZorluk(code: string, playerId: string, zorluk: Zorluk): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'lobby') return;
    if (s.hostId !== playerId) return;
    s.zorluk = zorluk;
  });
}

export function setScorekeeper(code: string, playerId: string, targetId: string): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'lobby') return;
    if (s.hostId !== playerId) return;
    s.scorekeeperId = targetId;
    for (const p of s.players) p.isScorekeeper = p.id === targetId;
  });
}

export function startGame(code: string, playerId: string): GameState | { error: string } | undefined {
  const room = getRoom(code);
  if (!room) return undefined;
  if (room.state.hostId !== playerId) return { error: 'not_host' };
  if (room.state.phase !== 'lobby') return { error: 'already_started' };
  if (room.state.players.length < 2) return { error: 'need_two_players' };

  return updateRoom(code, (s) => {
    const runeCards = CARDS.filter((c) => c.category === 'rune').map((c) => c.id);
    const nonRunes = CARDS.filter((c) => c.category !== 'rune').map((c) => c.id);

    // Draw theme rune from the rune pile
    const shuffledRunes = shuffle(runeCards);
    const themeRune = shuffledRunes.shift() ?? null;
    s.themeRuneId = themeRune;
    s.runeDeck = shuffledRunes;

    // Main deck = all non-runes, shuffled
    const mainDeck = shuffle(nonRunes);

    // Deal hands from the main deck
    const handSize = DEFAULT_HAND_SIZE;
    for (const p of s.players) {
      p.hand = [];
      for (let i = 0; i < handSize && mainDeck.length > 0; i++) {
        p.hand.push(mainDeck.shift()!);
      }
      p.handCount = p.hand.length;
      p.tokens.didntHappen = DEFAULT_TOKENS_PER_PLAYER;
      p.tokens.didHappen = DEFAULT_TOKENS_PER_PLAYER;
      p.score = startingScore(s.niyet, s.zorluk, s.players.length);
    }
    s.mainDeck = mainDeck;

    // First turn: random
    const first = s.players[Math.floor(Math.random() * s.players.length)];
    s.currentTurnPlayerId = first.id;
    s.board = emptyBoard();
    s.storySequence = [];
    s.phase = 'playing';
    s.log.push({
      ts: Date.now(),
      message: {
        tr: `Oyun başladı. Tema rünü çekildi. İlk sıra: ${first.name}.`,
        en: `Game started. Theme rune drawn. First turn: ${first.name}.`,
      },
    });
  });
}

export function drawCard(
  code: string,
  playerId: string,
  pile: 'main' | 'rune' = 'main',
): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'playing') return;
    const player = s.players.find((p) => p.id === playerId);
    if (!player) return;
    const deck = pile === 'rune' ? s.runeDeck : s.mainDeck;
    if (deck.length === 0) return;
    const card = deck.shift()!;
    player.hand.push(card);
    player.handCount = player.hand.length;
    s.log.push({
      ts: Date.now(),
      message: {
        tr: `${player.name} ${pile === 'rune' ? 'rün' : 'kart'} çekti.`,
        en: `${player.name} drew a ${pile === 'rune' ? 'rune' : 'card'}.`,
      },
    });
  });
}

export function playCard(
  code: string,
  playerId: string,
  cardId: string,
  slot: SlotKey,
): GameState | { error: string } | undefined {
  const room = getRoom(code);
  if (!room) return undefined;
  const s = room.state;
  if (s.phase !== 'playing') return { error: 'not_playing' };
  if (s.currentTurnPlayerId !== playerId) return { error: 'not_your_turn' };
  const player = s.players.find((p) => p.id === playerId);
  if (!player) return { error: 'no_player' };
  const idx = player.hand.indexOf(cardId);
  if (idx === -1) return { error: 'no_card' };
  const card = getCard(cardId);
  if (!card) return { error: 'unknown_card' };
  const validSlots: SlotKey[] = ['mekan', 'zaman', 'kahraman', 'sovalye', 'olay', 'olgu'];
  if (!validSlots.includes(slot)) return { error: 'bad_slot' };

  return updateRoom(code, (st) => {
    const p = st.players.find((x) => x.id === playerId);
    if (!p) return;
    const i = p.hand.indexOf(cardId);
    if (i === -1) return;
    p.hand.splice(i, 1);
    p.handCount = p.hand.length;
    st.board[slot].push(cardId);
    st.storySequence.push({
      cardId,
      playedBy: playerId,
      slot,
      ts: Date.now(),
    });

    if (st.niyet === 'strateji') {
      const value = card.number ?? 3;
      p.score = Math.max(0, p.score - value);
    } else {
      const value = card.number ?? 3;
      p.score += value;
    }

    if (isEndingRune(card)) {
      st.phase = 'ended';
      st.winnerId = computeWinner(st);
      st.log.push({
        ts: Date.now(),
        message: {
          tr: `${p.name} oyunu bitirdi: ${card.title}.`,
          en: `${p.name} ended the game: ${card.title}.`,
        },
      });
      return;
    }

    const turnIdx = st.players.findIndex((x) => x.id === playerId);
    const nextPlayer = st.players[(turnIdx + 1) % st.players.length];
    st.currentTurnPlayerId = nextPlayer.id;

    st.log.push({
      ts: Date.now(),
      message: {
        tr: `${p.name} ${card.title} → ${slot}.`,
        en: `${p.name} played ${card.title} → ${slot}.`,
      },
    });
  });
}

export function passTurn(code: string, playerId: string): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'playing') return;
    if (s.currentTurnPlayerId !== playerId) return;
    const turnIdx = s.players.findIndex((p) => p.id === playerId);
    const next = s.players[(turnIdx + 1) % s.players.length];
    s.currentTurnPlayerId = next.id;
    const player = s.players[turnIdx];
    s.log.push({
      ts: Date.now(),
      message: { tr: `${player.name} sırayı geçti.`, en: `${player.name} passed.` },
    });
  });
}

export function spendDidntHappen(
  code: string,
  playerId: string,
  targetId: string,
): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'playing') return;
    const player = s.players.find((p) => p.id === playerId);
    const target = s.players.find((p) => p.id === targetId);
    if (!player || !target) return;
    if (player.tokens.didntHappen <= 0) return;
    player.tokens.didntHappen -= 1;
    if (s.niyet === 'strateji') {
      target.score = Math.max(0, target.score - 3);
    } else {
      target.score -= 3;
    }
    s.log.push({
      ts: Date.now(),
      message: {
        tr: `${player.name}: "Olay öyle olmadı!" (${target.name} −3)`,
        en: `${player.name}: "It didn't happen that way!" (${target.name} −3)`,
      },
    });
  });
}

export function spendDidHappen(
  code: string,
  playerId: string,
  targetId: string,
): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'playing') return;
    const player = s.players.find((p) => p.id === playerId);
    const target = s.players.find((p) => p.id === targetId);
    if (!player || !target) return;
    if (player.tokens.didHappen <= 0) return;
    player.tokens.didHappen -= 1;
    target.score += 2;
    s.log.push({
      ts: Date.now(),
      message: {
        tr: `${player.name}: "Olay böyle oldu!" (${target.name} +2)`,
        en: `${player.name}: "It happened this way!" (${target.name} +2)`,
      },
    });
  });
}

export function endGame(code: string, playerId: string): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.phase !== 'playing') return;
    if (s.hostId !== playerId) return;
    s.phase = 'ended';
    s.winnerId = computeWinner(s);
    s.log.push({
      ts: Date.now(),
      message: { tr: 'Oyun bitti.', en: 'Game over.' },
    });
  });
}

function computeWinner(s: GameState): string | null {
  if (s.players.length === 0) return null;
  if (s.niyet === 'strateji') {
    const zeroed = s.players.filter((p) => p.score <= 0);
    if (zeroed.length > 0) {
      return zeroed.reduce((a, b) => (a.score <= b.score ? a : b)).id;
    }
    return s.players.reduce((a, b) => (a.score < b.score ? a : b)).id;
  }
  return s.players.reduce((a, b) => (a.score >= b.score ? a : b)).id;
}

export function newGameInSameRoom(code: string, playerId: string): GameState | undefined {
  return updateRoom(code, (s) => {
    if (s.hostId !== playerId) return;
    s.phase = 'lobby';
    s.themeRuneId = null;
    s.mainDeck = [];
    s.runeDeck = [];
    s.discardPile = [];
    s.board = emptyBoard();
    s.storySequence = [];
    s.currentTurnPlayerId = s.hostId;
    s.winnerId = null;
    for (const p of s.players) {
      p.hand = [];
      p.handCount = 0;
      p.score = 0;
      p.tokens = { didntHappen: 0, didHappen: 0 };
    }
    s.log.push({
      ts: Date.now(),
      message: { tr: 'Yeni oyun için lobiye dönüldü.', en: 'Returned to lobby for a new game.' },
    });
  });
}

export function markDisconnect(code: string, playerId: string): void {
  updateRoom(code, (s) => {
    const p = s.players.find((x) => x.id === playerId);
    if (p) p.connected = false;
  });
}
