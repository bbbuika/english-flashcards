export type CardCategory =
  | 'dichotomic'
  | 'element'
  | 'iye'
  | 'rune'
  | 'god'
  | 'hero'
  | 'month'
  | 'erk';

export type Card = {
  id: string;
  file: string;
  title: string;
  number: number | null;
  subtitle: string;
  category: CardCategory;
};

export type Niyet = 'strateji' | 'uzlasma';
export type Zorluk = 'kolay' | 'zor';

export type SlotKey = 'mekan' | 'zaman' | 'kahraman' | 'sovalye' | 'olay' | 'olgu';

export const SLOT_KEYS: SlotKey[] = ['mekan', 'zaman', 'kahraman', 'sovalye', 'olay', 'olgu'];

export type Phase = 'lobby' | 'setup' | 'playing' | 'ended';

export type Player = {
  id: string;
  name: string;
  isScorekeeper: boolean;
  isHost: boolean;
  isBot: boolean;
  score: number;
  hand: string[];
  handCount: number;
  tokens: {
    didntHappen: number;
    didHappen: number;
  };
  joinedAt: number;
  connected: boolean;
};

export type PlayedCard = {
  cardId: string;
  playedBy: string;
  slot: SlotKey;
  ts: number;
};

export type LogEntry = {
  ts: number;
  message: { tr: string; en: string };
};

export type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  ts: number;
};

export type GameState = {
  code: string;
  phase: Phase;
  niyet: Niyet;
  zorluk: Zorluk;
  players: Player[];
  hostId: string | null;
  scorekeeperId: string | null;
  themeRuneId: string | null;
  mainDeck: string[];
  runeDeck: string[];
  discardPile: string[];
  board: Record<SlotKey, string[]>;
  storySequence: PlayedCard[];
  currentTurnPlayerId: string | null;
  log: LogEntry[];
  winnerId: string | null;
  createdAt: number;
  messages: ChatMessage[];
};

export type SignalMsg = {
  id: string;
  from: string;
  to: string;
  kind: 'offer' | 'answer' | 'candidate';
  data: string;
  ts: number;
};

export type PublicGameState = Omit<GameState, 'players' | 'mainDeck' | 'runeDeck'> & {
  mainDeckCount: number;
  runeDeckCount: number;
  players: Array<Omit<Player, 'hand'> & { hand: string[] | null }>;
  you: { id: string; hand: string[] } | null;
};
