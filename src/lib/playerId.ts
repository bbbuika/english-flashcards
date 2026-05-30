export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'playerId';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id =
    'p_' +
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36));
  localStorage.setItem(key, id);
  return id;
}

export function getStoredName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('playerName') ?? '';
}

export function setStoredName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('playerName', name);
}
