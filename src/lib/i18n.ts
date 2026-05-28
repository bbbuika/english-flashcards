export type Lang = 'tr' | 'en';

export const STRINGS = {
  appTitle: { tr: 'Gölgeli Sona Bir Adım', en: 'A Step Toward the Shadowed End' },
  appSubtitle: { tr: 'Kadim Türkler hikaye kart oyunu', en: 'Ancient Turks storytelling card game' },
  createRoom: { tr: 'Oda Kur', en: 'Create Room' },
  joinRoom: { tr: 'Odaya Katıl', en: 'Join Room' },
  roomCode: { tr: 'Oda Kodu', en: 'Room Code' },
  yourName: { tr: 'Adın', en: 'Your Name' },
  join: { tr: 'Katıl', en: 'Join' },
  create: { tr: 'Kur', en: 'Create' },
  copy: { tr: 'Kopyala', en: 'Copy' },
  copied: { tr: 'Kopyalandı', en: 'Copied' },
  share: { tr: 'Paylaş', en: 'Share' },
  lobby: { tr: 'Oda', en: 'Lobby' },
  players: { tr: 'Oyuncular', en: 'Players' },
  host: { tr: 'Kurucu', en: 'Host' },
  scorekeeper: { tr: 'Skor Tutucu', en: 'Scorekeeper' },
  niyet: { tr: 'Niyet', en: 'Intent' },
  strateji: { tr: 'Strateji', en: 'Strategy' },
  uzlasma: { tr: 'Uzlaşma', en: 'Reconciliation' },
  strategiDesc: {
    tr: 'Birbirinize karşı oynarsınız. Puanı ilk sıfırlayan kazanır.',
    en: 'You play against each other. First to zero the score wins.',
  },
  uzlasmaDesc: {
    tr: 'Birlikte iyi bir hikaye kurarsınız. En çok puan toplayan kazanır.',
    en: 'You collaborate on a story. Highest score wins.',
  },
  zorluk: { tr: 'Zorluk', en: 'Difficulty' },
  kolay: { tr: 'Kolay', en: 'Easy' },
  zor: { tr: 'Zor', en: 'Hard' },
  startGame: { tr: 'Oyunu Başlat', en: 'Start Game' },
  startNeedsTwo: { tr: 'En az 2 oyuncu gerekli', en: 'Need at least 2 players' },
  pickScorekeeper: { tr: 'Skor tutucuyu seç', en: 'Pick a scorekeeper' },
  themeRune: { tr: 'Tema Rünü', en: 'Theme Rune' },
  deck: { tr: 'Deste', en: 'Deck' },
  cardsRemaining: { tr: 'kart kaldı', en: 'cards left' },
  discardPile: { tr: 'Atılan', en: 'Discard' },
  yourHand: { tr: 'Elin', en: 'Your Hand' },
  yourScore: { tr: 'Puanın', en: 'Your Score' },
  yourTokens: { tr: 'Pulların', en: 'Your Tokens' },
  didntHappenToken: { tr: 'Olay Öyle Olmadı', en: '"It Didn\'t Happen That Way"' },
  didHappenToken: { tr: 'Olay Böyle Oldu', en: '"It Happened This Way"' },
  story: { tr: 'Hikaye', en: 'Story' },
  storyEmpty: {
    tr: 'Hikaye henüz başlamadı.',
    en: 'The story has not begun yet.',
  },
  currentTurn: { tr: 'Sıra', en: 'Turn' },
  yourTurn: { tr: 'Sıra sende', en: 'Your turn' },
  drawCard: { tr: 'Kart Çek', en: 'Draw Card' },
  playCard: { tr: 'Oyna', en: 'Play' },
  passTurn: { tr: 'Sırayı Geç', en: 'Pass Turn' },
  endGame: { tr: 'Oyunu Bitir', en: 'End Game' },
  step: { tr: 'Adım', en: 'Step' },
  steps: {
    time: { tr: 'Zaman', en: 'Time' },
    place: { tr: 'Mekan', en: 'Place' },
    creator: { tr: 'Yaratıcı', en: 'Creator' },
    event1: { tr: 'Olay 1', en: 'Event 1' },
    event2: { tr: 'Olay 2', en: 'Event 2' },
    hero: { tr: 'Kahraman', en: 'Hero' },
    ending: { tr: 'Bitiş', en: 'Ending' },
  } as Record<string, { tr: string; en: string }>,
  stepHints: {
    time: { tr: 'Bir ay (zaman) kartı koy.', en: 'Place a month (time) card.' },
    place: {
      tr: 'Bir iye veya element (mekan) kartı koy.',
      en: 'Place an iye or element (place) card.',
    },
    creator: {
      tr: 'Bir tanrı/ça (yaratıcı) kartı koy.',
      en: 'Place a god/goddess (creator) card.',
    },
    event1: { tr: 'Hikayeni başlatan bir olay anlat.', en: 'Narrate an event that kicks off the story.' },
    event2: {
      tr: 'İkinci bir olay ekle (opsiyonel).',
      en: 'Add a second event (optional).',
    },
    hero: {
      tr: 'Bir kahraman (çakra) kartı ile karakter gelişimini anlat.',
      en: 'Play a hero (chakra) card to describe character growth.',
    },
    ending: { tr: 'Bitiş rünü ile oyunu sonlandır.', en: 'End the game with the ending rune.' },
  } as Record<string, { tr: string; en: string }>,
  interrupt: { tr: 'Hikayeyi Böl', en: 'Interrupt' },
  interruptTitle: {
    tr: 'Olay Öyle Olmadı!',
    en: '"It Didn\'t Happen That Way!"',
  },
  endorse: { tr: 'Onayla', en: 'Endorse' },
  endorseTitle: { tr: 'Olay Böyle Oldu!', en: '"It Happened This Way!"' },
  winner: { tr: 'Kazanan', en: 'Winner' },
  finalScores: { tr: 'Final Skorları', en: 'Final Scores' },
  newGame: { tr: 'Yeni Oyun', en: 'New Game' },
  back: { tr: 'Geri', en: 'Back' },
  category: {
    dichotomic: { tr: 'Dikotomik Varlık', en: 'Dichotomic Being' },
    element: { tr: 'Element', en: 'Element' },
    iye: { tr: 'İye', en: 'Spirit' },
    rune: { tr: 'Rün', en: 'Rune' },
    god: { tr: 'Tanrı/ça', en: 'Deity' },
    hero: { tr: 'Kahraman', en: 'Hero' },
    month: { tr: 'Ay', en: 'Month' },
    erk: { tr: 'Erk', en: 'Totem' },
  } as Record<string, { tr: string; en: string }>,
  language: { tr: 'Dil', en: 'Language' },
  switchTo: { tr: 'EN', en: 'TR' },
  loading: { tr: 'Yükleniyor...', en: 'Loading...' },
  notFound: { tr: 'Oda bulunamadı', en: 'Room not found' },
  rejoinAs: { tr: 'olarak yeniden katıl', en: 'rejoin as' },
  leaveRoom: { tr: 'Odadan Ayrıl', en: 'Leave Room' },
  log: { tr: 'Olaylar', en: 'Log' },
  rules: { tr: 'Kurallar', en: 'Rules' },
  rulesBody: {
    tr: 'Sırayla kart oynayarak bir hikaye kurun. Zaman → Mekan → Yaratıcı → Olay → Olay → Kahraman → Bitiş.',
    en: 'Take turns playing cards to build a story. Time → Place → Creator → Event → Event → Hero → Ending.',
  },
};

type SimpleKeys = {
  [K in keyof typeof STRINGS]: (typeof STRINGS)[K] extends { tr: string; en: string } ? K : never;
}[keyof typeof STRINGS];

export function t(lang: Lang, key: SimpleKeys): string {
  const entry = STRINGS[key] as { tr: string; en: string };
  return entry[lang];
}

export type StepKey = keyof typeof STRINGS.steps;

