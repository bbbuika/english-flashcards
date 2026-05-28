'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from './LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Lobby } from './Lobby';
import { GameBoard } from './GameBoard';
import { EndScreen } from './EndScreen';
import { getOrCreatePlayerId, getStoredName, setStoredName } from '@/lib/playerId';
import type { PublicGameState } from '@/lib/types';

type JoinStatus = 'idle' | 'joining' | 'joined' | 'not_found' | 'error' | 'game_in_progress' | 'room_full';

export function RoomClient({ code }: { code: string }) {
  const { t, lang } = useLang();
  const [playerId] = useState<string>(() =>
    typeof window === 'undefined' ? '' : getOrCreatePlayerId(),
  );
  const [name, setName] = useState<string>(() =>
    typeof window === 'undefined' ? '' : getStoredName(),
  );
  const [nameInput, setNameInput] = useState<string>(() =>
    typeof window === 'undefined' ? '' : getStoredName(),
  );
  const [state, setState] = useState<PublicGameState | null>(null);
  const [joinStatus, setJoinStatus] = useState<JoinStatus>('idle');
  const [streamError, setStreamError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const join = useCallback(
    async (joinName: string, pid: string) => {
      setJoinStatus('joining');
      try {
        const res = await fetch(`/api/rooms/${code}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'join', name: joinName, playerId: pid }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          if (err.error === 'not_found') setJoinStatus('not_found');
          else if (err.error === 'game_in_progress') setJoinStatus('game_in_progress');
          else if (err.error === 'room_full') setJoinStatus('room_full');
          else setJoinStatus('error');
          return;
        }
        setJoinStatus('joined');
      } catch {
        setJoinStatus('error');
      }
    },
    [code],
  );

  useEffect(() => {
    if (!playerId) return;
    if (!name.trim()) return;
    if (joinStatus !== 'idle') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void join(name, playerId);
  }, [playerId, name, joinStatus, join]);

  useEffect(() => {
    if (joinStatus !== 'joined' || !playerId) return;
    const es = new EventSource(`/api/rooms/${code}/state?playerId=${encodeURIComponent(playerId)}`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as PublicGameState;
        setState(data);
        setStreamError(null);
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      setStreamError('reconnecting');
    };
    return () => {
      es.close();
    };
  }, [code, playerId, joinStatus]);

  const sendAction = useCallback(
    async (action: object) => {
      try {
        await fetch(`/api/rooms/${code}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action),
        });
      } catch {
        // SSE will catch up
      }
    },
    [code],
  );

  if (joinStatus === 'not_found') {
    return (
      <CenterMessage>
        <div className="text-center space-y-4">
          <h2 className="font-display text-2xl text-amber-100">{t('notFound')}</h2>
          <p className="font-mono text-amber-200/60">{code}</p>
          <Link href="/" className="btn-primary inline-block">
            {t('back')}
          </Link>
        </div>
      </CenterMessage>
    );
  }

  if (!name.trim()) {
    return (
      <CenterMessage>
        <div className="space-y-3 max-w-sm w-full">
          <h2 className="font-display text-xl text-amber-100 text-center">
            {t('yourName')}
          </h2>
          <p className="text-sm text-amber-200/60 text-center">
            {lang === 'tr' ? 'Odaya katılmak için' : 'to join the room'}{' '}
            <span className="font-mono text-amber-100">{code}</span>
          </p>
          <input
            className="input-warm w-full"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            maxLength={24}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nameInput.trim()) {
                setStoredName(nameInput.trim());
                setName(nameInput.trim());
              }
            }}
          />
          <button
            className="btn-primary w-full"
            disabled={!nameInput.trim()}
            onClick={() => {
              setStoredName(nameInput.trim());
              setName(nameInput.trim());
            }}
          >
            {t('join')}
          </button>
        </div>
      </CenterMessage>
    );
  }

  if (joinStatus === 'game_in_progress') {
    return (
      <CenterMessage>
        <div className="text-center space-y-3">
          <p className="font-display text-xl text-amber-100">
            {lang === 'tr'
              ? 'Oyun zaten başlamış. Bu odaya katılamazsın.'
              : 'Game already in progress. Cannot join this room.'}
          </p>
          <Link href="/" className="btn-primary inline-block">
            {t('back')}
          </Link>
        </div>
      </CenterMessage>
    );
  }

  if (joinStatus === 'room_full') {
    return (
      <CenterMessage>
        <div className="text-center space-y-3">
          <p className="font-display text-xl text-amber-100">
            {lang === 'tr' ? 'Oda dolu.' : 'Room is full.'}
          </p>
          <Link href="/" className="btn-primary inline-block">
            {t('back')}
          </Link>
        </div>
      </CenterMessage>
    );
  }

  if (joinStatus === 'error') {
    return (
      <CenterMessage>
        <div className="text-center space-y-3">
          <p className="font-display text-xl text-amber-100">{t('loading')}</p>
          <button className="btn-primary" onClick={() => setJoinStatus('idle')}>
            {lang === 'tr' ? 'Tekrar dene' : 'Try again'}
          </button>
        </div>
      </CenterMessage>
    );
  }

  if (!state) {
    return (
      <CenterMessage>
        <p className="text-amber-200/60 italic">{t('loading')}</p>
      </CenterMessage>
    );
  }

  return (
    <>
      <div className="fixed top-2 right-2 z-50">
        <LanguageToggle />
      </div>
      {streamError && (
        <div className="fixed top-2 left-2 z-50 text-xs text-amber-300 bg-amber-900/80 px-2 py-1 rounded">
          {lang === 'tr' ? 'Bağlanıyor...' : 'Reconnecting...'}
        </div>
      )}
      {state.phase === 'lobby' && (
        <Lobby state={state} myId={playerId} sendAction={sendAction} />
      )}
      {(state.phase === 'playing' || state.phase === 'setup') && (
        <GameBoard state={state} myId={playerId} sendAction={sendAction} />
      )}
      {state.phase === 'ended' && (
        <EndScreen state={state} myId={playerId} sendAction={sendAction} />
      )}
    </>
  );
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute top-2 right-2">
        <LanguageToggle />
      </div>
      {children}
    </main>
  );
}
