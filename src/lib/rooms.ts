import type { GameState, PublicGameState } from './types';

type Subscriber = (state: GameState) => void;

type Room = {
  state: GameState;
  subscribers: Set<Subscriber>;
  lastActivity: number;
};

declare global {
  var __rooms: Map<string, Room> | undefined;
}

const rooms = globalThis.__rooms ?? new Map<string, Room>();
globalThis.__rooms = rooms;

const ROOM_TTL_MS = 1000 * 60 * 60 * 6;

function cleanupStale() {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS && room.subscribers.size === 0) {
      rooms.delete(code);
    }
  }
}

export function createRoom(state: GameState): void {
  cleanupStale();
  rooms.set(state.code, { state, subscribers: new Set(), lastActivity: Date.now() });
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomState(code: string): GameState | undefined {
  return rooms.get(code.toUpperCase())?.state;
}

export function updateRoom(
  code: string,
  mutator: (s: GameState) => void,
): GameState | undefined {
  const room = rooms.get(code.toUpperCase());
  if (!room) return undefined;
  mutator(room.state);
  room.lastActivity = Date.now();
  for (const sub of room.subscribers) {
    try {
      sub(room.state);
    } catch {
      // ignore
    }
  }
  return room.state;
}

export function subscribe(code: string, cb: Subscriber): () => void {
  const room = rooms.get(code.toUpperCase());
  if (!room) return () => {};
  room.subscribers.add(cb);
  room.lastActivity = Date.now();
  return () => {
    room.subscribers.delete(cb);
  };
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code: string;
  do {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

export function redactForPlayer(state: GameState, playerId: string | null): PublicGameState {
  const you = state.players.find((p) => p.id === playerId);
  const { mainDeck: _main, runeDeck: _rune, players: _players, ...rest } = state;
  void _main;
  void _rune;
  void _players;
  return {
    ...rest,
    mainDeckCount: state.mainDeck.length,
    runeDeckCount: state.runeDeck.length,
    players: state.players.map((p) => ({
      ...p,
      hand: p.id === playerId ? p.hand : null,
    })),
    you: you ? { id: you.id, hand: you.hand } : null,
  };
}
