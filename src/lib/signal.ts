import type { SignalMsg } from './types';

declare global {
  var __signals: Map<string, SignalMsg[]> | undefined;
}

const store = globalThis.__signals ?? new Map<string, SignalMsg[]>();
globalThis.__signals = store;

const TTL_MS = 30_000;

export function pushSignal(
  code: string,
  msg: Omit<SignalMsg, 'id' | 'ts'>,
): void {
  const key = code.toUpperCase();
  const list = store.get(key) ?? [];
  list.push({
    ...msg,
    id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    ts: Date.now(),
  });
  store.set(key, list.slice(-300));
}

export function pullSignals(
  code: string,
  toId: string,
  since: number,
): SignalMsg[] {
  const key = code.toUpperCase();
  const now = Date.now();
  const list = (store.get(key) ?? []).filter((s) => now - s.ts < TTL_MS);
  store.set(key, list);
  return list.filter((s) => s.to === toId && s.ts > since);
}
