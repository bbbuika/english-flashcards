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

export type StoryStep =
  | 'time'
  | 'place'
  | 'creator'
  | 'event1'
  | 'event2'
  | 'hero'
  | 'ending';

export const STORY_SEQUENCE: StoryStep[] = [
  'time',
  'place',
  'creator',
  'event1',
  'event2',
  'hero',
  'ending',
];

export type Phase = 'lobby' | 'setup' | 'playing' | 'ended';

export type Player = {
  id: string;
  name: string;
  isScorekeeper: boolean;
  isHost: boolean;
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
  step: StoryStep;
  ts: number;
};

export type LogEntry = {
  ts: number;
  message: { tr: string; en: string };
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
  deck: string[];
  discardPile: string[];
  storySequence: PlayedCard[];
  currentTurnPlayerId: string | null;
  currentStep: StoryStep | null;
  log: LogEntry[];
  winnerId: string | null;
  createdAt: number;
};

export type PublicGameState = Omit<GameState, 'players' | 'deck'> & {
  deckCount: number;
  players: Array<Omit<Player, 'hand'> & { hand: string[] | null }>;
  you: { id: string; hand: string[] } | null;
};
