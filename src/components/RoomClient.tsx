'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLang } from './LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Lobby } from './Lobby';
import { GameBoard } from './GameBoard';
import { EndScreen } from './EndScreen';
import { Chat } from './Chat';
import { useDiscord } from './DiscordProvider';
import { useVoice } from '@/hooks/useVoice';
import { getOrCreatePlayerId, getStoredName, setStoredName } from '@/lib/playerId';
import type { PublicGameState } from '@/lib/types';

type JoinStatus = 'idle' | 'joining' | 'joined' | 'not_found' | 'error' | 'game_in_progress' | 'room_full';

export function RoomClient({ code }: { code: string }) {
  const { t, lang } = useLang();
  const discord = useDiscord();
  const [playerId, setPlayerId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [state, setState] = useState<PublicGameState | null>(null);
  const [joinStatus, setJoinStatus] = useState<JoinStatus>('idle');
  const [streamError, setStreamError] = useState<string | null>(null);

  const remoteIds = useMemo(
    () => state?.players.filter((p) => p.id !== playerId && !p.isBot).map((p) => p.id) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state?.players.map((p) => p.id).join(','), playerId],
  );
  const voice = useVoice(code, playerId, remoteIds);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pid = getOrCreatePlayerId();
    const storedName = getStoredName();
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlayerId(pid);
    setName(storedName);
    setNameInput(storedName);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // When Discord is ready and provides a username, pre-fill name
  useEffect(() => {
    if (!discord.ready) return;
    if (!discord.isInDiscord || !discord.user) return;
    const discordName = discord.user.global_name ?? discord.user.username;
    if (discordName && !getStoredName()) {
      setStoredName(discordName);
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(discordName);
      setNameInput(discordName);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [discord.ready, discord.isInDiscord, discord.user]);

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
        const body = (await res.json().catch(() => null)) as { state?: PublicGameState } | null;
        if (body?.state) setState(body.state);
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
    let cancelled = false;
    const fetchState = async () => {
      try {
        const res = await fetch(
          `/api/rooms/${code}/state?playerId=${encodeURIComponent(playerId)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) {
          if (!cancelled) setStreamError('error');
          return;
        }
        const data = (await res.json()) as PublicGameState;
        if (!cancelled) {
          setState(data);
          setStreamError(null);
        }
      } catch {
        if (!cancelled) setStreamError('reconnecting');
      }
    };
    void fetchState();
    const id = setInterval(fetchState, 1500);
    return () => {
      cancelled = true;
      clearInterval(id);
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
        // poll will catch up
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
          <h2 className="font-display text-xl text-amber-100 text-center">{t('yourName')}</h2>
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

      {/* Voice controls — bottom-left */}
      <VoiceBar voice={voice} lang={lang} />

      {/* Chat — bottom-right */}
      <Chat
        messages={state.messages ?? []}
        myId={playerId}
        lang={lang}
        onSend={(text) => sendAction({ type: 'send_chat', playerId, text })}
      />

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

type VoiceBarProps = {
  voice: ReturnType<typeof useVoice>;
  lang: 'tr' | 'en';
};

function VoiceBar({ voice, lang }: VoiceBarProps) {
  if (!voice.active) {
    return (
      <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-1">
        <button
          onClick={() => void voice.startVoice()}
          className="w-10 h-10 bg-stone-800/90 hover:bg-stone-700/90 border border-amber-800/40 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-colors"
          title={lang === 'tr' ? 'Sesli sohbete katıl' : 'Join voice chat'}
        >
          <span className="text-lg leading-none">🎤</span>
        </button>
        {voice.micError && (
          <p className="text-[10px] text-red-400 max-w-[100px]">
            {lang === 'tr' ? 'Mikrofon izni reddedildi' : 'Mic permission denied'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5">
      <button
        onClick={voice.toggleMute}
        className={`w-10 h-10 border rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-colors ${
          voice.muted
            ? 'bg-red-900/80 border-red-700/50 hover:bg-red-800/80'
            : 'bg-green-900/80 border-green-700/50 hover:bg-green-800/80'
        }`}
        title={voice.muted ? (lang === 'tr' ? 'Sesi aç' : 'Unmute') : (lang === 'tr' ? 'Sustur' : 'Mute')}
      >
        <span className="text-lg leading-none">{voice.muted ? '🔇' : '🎤'}</span>
      </button>
      <button
        onClick={voice.stopVoice}
        className="w-8 h-8 bg-stone-800/90 hover:bg-red-900/80 border border-amber-800/40 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-colors"
        title={lang === 'tr' ? 'Sesten ayrıl' : 'Leave voice'}
      >
        <span className="text-xs leading-none text-amber-400">✕</span>
      </button>
      {voice.connectedIds.length > 0 && (
        <span className="text-[10px] text-green-400/80">
          {voice.connectedIds.length} {lang === 'tr' ? 'bağlı' : 'connected'}
        </span>
      )}
    </div>
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
