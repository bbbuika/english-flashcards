import { WordCard, defaultCards } from '@/data/words';

export const STORAGE_KEY = 'flashcard-state';
export const ADMIN_SESSION_KEY = 'flashcard-admin';

export function profileStateKey(profileId: string): string {
  return `flashcard-state-${profileId}`;
}

export function loadProfileState(profileId: string): AppState {
  try {
    const raw = localStorage.getItem(profileStateKey(profileId));
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    // Migrate legacy single-user state into first profile
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) return { ...EMPTY, ...JSON.parse(legacy) };
  } catch {}
  return { ...EMPTY };
}

export function saveProfileState(profileId: string, state: AppState): void {
  localStorage.setItem(profileStateKey(profileId), JSON.stringify(state));
}

export interface AppState {
  knownIds: string[];
  unknownIds: string[];
  customCards: WordCard[];
  editedCards: Record<string, Partial<WordCard>>;
  deletedIds: string[];
  currentIndex: number;
}

const EMPTY: AppState = {
  knownIds: [],
  unknownIds: [],
  customCards: [],
  editedCards: {},
  deletedIds: [],
  currentIndex: 0,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {}
  return { ...EMPTY };
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getEffectiveCards(state: AppState): WordCard[] {
  const defaults = defaultCards
    .filter((c) => !state.deletedIds.includes(c.id))
    .map((c) => ({ ...c, ...(state.editedCards[c.id] ?? {}) }));
  return [...defaults, ...state.customCards];
}

export function isAdminAuthed(): boolean {
  try { return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'; } catch { return false; }
}
export function setAdminAuthed(): void {
  try { sessionStorage.setItem(ADMIN_SESSION_KEY, '1'); } catch {}
}
export function clearAdminAuth(): void {
  try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch {}
}

// ── Export helpers ──────────────────────────────────────────

export function exportJSON(cards: WordCard[]): void {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
  download(blob, 'flashcards.json');
}

export function exportCSV(cards: WordCard[]): void {
  const header = 'id,word,definition,example,turkish,imageUrl,isCustom';
  const rows = cards.map((c) =>
    [c.id, c.word, c.definition, c.example, c.turkish, c.imageUrl ?? '', c.isCustom ? 'true' : 'false']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  download(blob, 'flashcards.csv');
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import helpers ──────────────────────────────────────────

export function parseImportFile(text: string, filename: string): WordCard[] | null {
  try {
    if (filename.endsWith('.json')) {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return null;
      return data.map(normalizeImported);
    }
    if (filename.endsWith('.csv')) {
      const lines = text.trim().split('\n');
      const headers = parseCSVRow(lines[0]);
      return lines.slice(1).map((line) => {
        const values = parseCSVRow(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h.trim()] = values[i] ?? ''; });
        return normalizeImported(obj);
      });
    }
    return null;
  } catch { return null; }
}

function normalizeImported(obj: Record<string, string>): WordCard {
  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    word: obj.word ?? '',
    definition: obj.definition ?? '',
    example: obj.example ?? '',
    turkish: obj.turkish ?? '',
    imageUrl: obj.imageUrl || undefined,
    isCustom: true,
  };
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
