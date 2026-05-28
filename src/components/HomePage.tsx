'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLang } from './LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { getOrCreatePlayerId, getStoredName, setStoredName } from '@/lib/playerId';

export function HomePage() {
  const { t } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = getStoredName();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(stored);
    }
  }, []);

  async function onCreate() {
    setError(null);
    if (!name.trim()) {
      setError(t('yourName'));
      return;
    }
    setBusy(true);
    setStoredName(name.trim());
    const playerId = getOrCreatePlayerId();
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), playerId }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        setError(data.error ?? 'error');
        setBusy(false);
        return;
      }
      router.push(`/rooms/${data.code}`);
    } catch {
      setError('network');
      setBusy(false);
    }
  }

  async function onJoin() {
    setError(null);
    if (!name.trim()) {
      setError(t('yourName'));
      return;
    }
    if (!code.trim()) {
      setError(t('roomCode'));
      return;
    }
    setBusy(true);
    setStoredName(name.trim());
    router.push(`/rooms/${code.trim().toUpperCase()}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative w-full aspect-[2/3] max-h-[55vh] mb-8 rounded-xl overflow-hidden border border-amber-900/40 shadow-2xl">
          <Image
            src="/cards/splash.jpg"
            alt={t('appTitle')}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-950/95" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-amber-100 drop-shadow-lg">
              {t('appTitle')}
            </h1>
            <p className="text-sm text-amber-200/70 mt-1 italic">{t('appSubtitle')}</p>
          </div>
        </div>

        {mode === 'idle' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <button className="btn-primary" onClick={() => setMode('create')}>
              {t('createRoom')}
            </button>
            <button className="btn-ghost" onClick={() => setMode('join')}>
              {t('joinRoom')}
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <label className="text-sm text-amber-200/80">{t('yourName')}</label>
            <input
              className="input-warm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={24}
              onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            />
            <button className="btn-primary" onClick={onCreate} disabled={busy}>
              {t('create')}
            </button>
            <button className="btn-ghost" onClick={() => setMode('idle')} disabled={busy}>
              {t('back')}
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <label className="text-sm text-amber-200/80">{t('yourName')}</label>
            <input
              className="input-warm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={24}
            />
            <label className="text-sm text-amber-200/80 mt-2">{t('roomCode')}</label>
            <input
              className="input-warm uppercase font-mono tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              maxLength={5}
              onKeyDown={(e) => e.key === 'Enter' && onJoin()}
            />
            <button className="btn-primary" onClick={onJoin} disabled={busy}>
              {t('join')}
            </button>
            <button className="btn-ghost" onClick={() => setMode('idle')} disabled={busy}>
              {t('back')}
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
      </div>
    </main>
  );
}
