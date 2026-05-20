export interface Profile {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  bestSpeedRound: number;
  gamesPlayed: number;
  quizCorrect: number;
  quizTotal: number;
  versusWins: number;
  createdAt: string;
}

export interface ProfilesState {
  profiles: Profile[];
  currentProfileId: string | null;
}

export const PROFILES_KEY = 'flashcard-profiles';

export const LEVELS = [
  { level: 1, name: 'Beginner',  emoji: '🌱', minXp: 0 },
  { level: 2, name: 'Learner',   emoji: '📖', minXp: 100 },
  { level: 3, name: 'Student',   emoji: '📚', minXp: 300 },
  { level: 4, name: 'Scholar',   emoji: '🎓', minXp: 700 },
  { level: 5, name: 'Expert',    emoji: '⭐', minXp: 1500 },
  { level: 6, name: 'Master',    emoji: '🏆', minXp: 3000 },
  { level: 7, name: 'Legend',    emoji: '👑', minXp: 6000 },
] as const;

export const AVATAR_OPTIONS = [
  '🐶','🐱','🦊','🐻','🐼','🦁','🐯','🦄',
  '🐸','🐙','🦅','🦉','🐬','🌟','🔥','⚡',
  '🎯','🏆','🌈','🎨','🚀','💎',
];

export function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXpProgress(xp: number) {
  const current = getLevel(xp);
  const nextIdx = LEVELS.findIndex((l) => l.level === current.level) + 1;
  const next = LEVELS[nextIdx] ?? null;
  if (!next) return { percent: 100, current, next: null, xpNeeded: 0 };
  const percent = Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100);
  return { percent, current, next, xpNeeded: next.minXp - xp };
}

export function loadProfiles(): ProfilesState {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { profiles: [], currentProfileId: null };
}

export function saveProfiles(state: ProfilesState): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(state));
}

export function createProfile(name: string, emoji: string): Profile {
  return {
    id: `p-${Date.now()}`,
    name: name.trim(),
    emoji,
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    bestSpeedRound: 0,
    gamesPlayed: 0,
    quizCorrect: 0,
    quizTotal: 0,
    versusWins: 0,
    createdAt: new Date().toISOString(),
  };
}

export function getCurrentProfile(state: ProfilesState): Profile | null {
  if (!state.currentProfileId) return null;
  return state.profiles.find((p) => p.id === state.currentProfileId) ?? null;
}

export function updateProfile(state: ProfilesState, id: string, patch: Partial<Profile>): ProfilesState {
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
}

export function awardXp(state: ProfilesState, id: string, amount: number): ProfilesState {
  return updateProfile(state, id, {
    xp: (state.profiles.find((p) => p.id === id)?.xp ?? 0) + amount,
  });
}

export function checkAndUpdateStreak(state: ProfilesState, id: string): ProfilesState {
  const today = todayStr();
  const p = state.profiles.find((pr) => pr.id === id);
  if (!p || p.lastStudyDate === today) return state;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  const newStreak = p.lastStudyDate === yStr ? p.streak + 1 : 1;
  return updateProfile(state, id, { streak: newStreak, lastStudyDate: today });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
