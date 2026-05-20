'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, ProfilesState, loadProfiles, saveProfiles, awardXp, updateProfile, checkAndUpdateStreak, getLevel } from '@/lib/profiles';
import { loadState, getEffectiveCards } from '@/lib/storage';
import { WordCard } from '@/data/words';

const DURATION = 45;
const XP_WIN = 75;
const XP_LOSE = 20;
const XP_DRAW = 40;

type VersusPhase = 'setup' | 'p1ready' | 'p1playing' | 'p2ready' | 'p2playing' | 'done';

export default function VersusGame() {
  const [profiles, setProfiles] = useState<ProfilesState | null>(null);
  const [p1Id, setP1Id] = useState('');
  const [p2Id, setP2Id] = useState('');
  const [cards, setCards] = useState<WordCard[]>([]);
  const [phase, setPhase] = useState<VersusPhase>('setup');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const ps = loadProfiles();
    setProfiles(ps);
    const flashState = loadState();
    setCards([...getEffectiveCards(flashState)].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (phase !== 'p1playing' && phase !== 'p2playing') return;
    if (timeLeft <= 0) {
      if (phase === 'p1playing') {
        setP1Score(currentScore);
        setPhase('p2ready');
      } else {
        setP2Score(currentScore);
        finishGame(p1Score, currentScore);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  });

  function startP1Round() {
    setCurrentScore(0);
    setIdx(0);
    setFlipped(false);
    setTimeLeft(DURATION);
    setPhase('p1playing');
  }

  function startP2Round() {
    setCurrentScore(0);
    setIdx(Math.floor(cards.length / 2)); // different set of cards
    setFlipped(false);
    setTimeLeft(DURATION);
    setPhase('p2playing');
  }

  function advance(known: boolean) {
    if (known) setCurrentScore((s) => s + 1);
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  function finishGame(s1: number, s2: number) {
    setPhase('done');
    if (!profiles) return;
    const p1 = profiles.profiles.find((p) => p.id === p1Id)!;
    const p2 = profiles.profiles.find((p) => p.id === p2Id)!;
    let next = profiles;
    if (s1 > s2) {
      next = awardXp(next, p1Id, XP_WIN);
      next = awardXp(next, p2Id, XP_LOSE);
      next = updateProfile(next, p1Id, { versusWins: p1.versusWins + 1 });
    } else if (s2 > s1) {
      next = awardXp(next, p2Id, XP_WIN);
      next = awardXp(next, p1Id, XP_LOSE);
      next = updateProfile(next, p2Id, { versusWins: p2.versusWins + 1 });
    } else {
      next = awardXp(next, p1Id, XP_DRAW);
      next = awardXp(next, p2Id, XP_DRAW);
    }
    next = checkAndUpdateStreak(next, p1Id);
    next = checkAndUpdateStreak(next, p2Id);
    next = updateProfile(next, p1Id, { gamesPlayed: p1.gamesPlayed + 1 });
    next = updateProfile(next, p2Id, { gamesPlayed: p2.gamesPlayed + 1 });
    saveProfiles(next);
    setProfiles(next);
  }

  const card = cards[idx % Math.max(cards.length, 1)];
  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor = timeLeft > 15 ? '#10b981' : timeLeft > 8 ? '#f59e0b' : '#ef4444';
  const isP1Playing = phase === 'p1playing';
  const activeId = isP1Playing ? p1Id : p2Id;
  const activeProfile = profiles?.profiles.find((p) => p.id === activeId);

  // Setup
  if (phase === 'setup') {
    const ps = profiles?.profiles ?? [];
    return (
      <GameLayout title="⚔️ Head-to-Head" backHref="/games">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-500 text-center">Select two players. Each gets {DURATION} seconds.</p>
          {ps.length < 2 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              You need at least 2 profiles to play this mode.
              <br />
              <Link href="/profiles" className="text-indigo-500 underline mt-2 inline-block">Create profiles →</Link>
            </div>
          ) : (
            <>
              <ProfilePicker label="Player 1 🔵" profiles={ps} selected={p1Id} excluded={p2Id} onSelect={setP1Id} />
              <ProfilePicker label="Player 2 🔴" profiles={ps} selected={p2Id} excluded={p1Id} onSelect={setP2Id} />
              <button
                disabled={!p1Id || !p2Id || p1Id === p2Id}
                onClick={() => setPhase('p1ready')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-600 text-white font-bold disabled:opacity-40 hover:opacity-90 transition-opacity">
                Start Battle!
              </button>
            </>
          )}
        </div>
      </GameLayout>
    );
  }

  // Ready screens
  if (phase === 'p1ready' || phase === 'p2ready') {
    const pid = phase === 'p1ready' ? p1Id : p2Id;
    const p = profiles?.profiles.find((pr) => pr.id === pid);
    const opponent = phase === 'p2ready' ? p1Score : null;
    return (
      <GameLayout title="⚔️ Head-to-Head" backHref="/games">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-6xl">{p?.emoji}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{p?.name}&apos;s turn!</h2>
            {opponent !== null && (
              <p className="text-sm text-gray-500 mt-1">You need more than <strong>{opponent}</strong> to win.</p>
            )}
            <p className="text-sm text-gray-400 mt-2">Hand the device to {p?.name}.</p>
          </div>
          <button onClick={phase === 'p1ready' ? startP1Round : startP2Round}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
            I&apos;m ready!
          </button>
        </div>
      </GameLayout>
    );
  }

  // Done
  if (phase === 'done') {
    const p1 = profiles?.profiles.find((p) => p.id === p1Id);
    const p2 = profiles?.profiles.find((p) => p.id === p2Id);
    const p2FinalScore = p2Score;
    const winner = p1Score > p2FinalScore ? p1 : p2FinalScore > p1Score ? p2 : null;
    return (
      <GameLayout title="⚔️ Head-to-Head" backHref="/games">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-5xl">{winner ? '🏆' : '🤝'}</div>
          <h2 className="text-xl font-bold text-gray-900">
            {winner ? `${winner.name} wins!` : 'It\'s a draw!'}
          </h2>
          <div className="flex gap-4 w-full">
            <ScoreCard profile={p1} score={p1Score} isWinner={p1Score > p2FinalScore} xp={p1Score > p2FinalScore ? XP_WIN : p1Score === p2FinalScore ? XP_DRAW : XP_LOSE} />
            <ScoreCard profile={p2} score={p2FinalScore} isWinner={p2FinalScore > p1Score} xp={p2FinalScore > p1Score ? XP_WIN : p1Score === p2FinalScore ? XP_DRAW : XP_LOSE} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPhase('setup'); setP1Score(0); setP2Score(0); }}
              className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors">
              Rematch
            </button>
            <Link href="/games" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              Back
            </Link>
          </div>
        </div>
      </GameLayout>
    );
  }

  // Playing
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-1.5 bg-gray-200">
        <div className="h-full transition-all duration-1000" style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full">
        <div className="w-full flex items-center justify-between">
          <div className="text-2xl font-bold tabular-nums" style={{ color: timerColor }}>{timeLeft}s</div>
          <div className="text-center">
            <div className="text-xs text-gray-400">{activeProfile?.emoji} {activeProfile?.name}</div>
            <div className="text-3xl font-black text-gray-900">{currentScore}</div>
          </div>
          <div className="text-sm text-gray-400">{idx} seen</div>
        </div>
        {card && (
          <div className="w-full cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped((f) => !f)}>
            <div style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s', transform: flipped ? 'rotateY(180deg)' : 'none', position: 'relative', height: 240 }}>
              <div className="absolute inset-0 bg-white rounded-2xl shadow border border-gray-100 flex flex-col justify-center items-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-3xl font-bold text-gray-900">{card.word}</p>
                <p className="text-sm text-gray-500 mt-2">{card.definition}</p>
                <p className="text-xs text-indigo-400 mt-3">tap to reveal</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow flex flex-col justify-center items-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-2xl font-bold text-white">{card.turkish}</p>
              </div>
            </div>
          </div>
        )}
        <div className="w-full flex gap-3">
          <button onClick={() => advance(false)} className="flex-1 py-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-bold text-lg active:scale-95 transition-all">✗ Skip</button>
          <button onClick={() => advance(true)} className="flex-1 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold text-lg active:scale-95 transition-all">✓ Know it</button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ profile, score, isWinner, xp }: { profile?: Profile; score: number; isWinner: boolean; xp: number }) {
  return (
    <div className={`flex-1 rounded-2xl p-4 border-2 ${isWinner ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white'}`}>
      <div className="text-3xl">{profile?.emoji}</div>
      <div className="font-bold text-gray-900 text-sm mt-1">{profile?.name}</div>
      <div className="text-2xl font-black text-gray-900 mt-1">{score}</div>
      <div className="text-xs text-indigo-500 font-semibold">+{xp} XP</div>
      {isWinner && <div className="text-amber-500 text-xs font-bold mt-1">👑 Winner!</div>}
    </div>
  );
}

function ProfilePicker({ label, profiles, selected, excluded, onSelect }: {
  label: string; profiles: Profile[]; selected: string; excluded: string; onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {profiles.filter((p) => p.id !== excluded).map((p) => {
          const level = getLevel(p.xp);
          return (
            <button key={p.id} onClick={() => onSelect(p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left transition-all ${selected === p.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <span className="text-2xl">{p.emoji}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                <div className="text-[10px] text-gray-400">{level.emoji} {level.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GameLayout({ title, backHref, children }: { title: string; backHref: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
        <Link href={backHref} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">← Back</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8"><div className="w-full max-w-md">{children}</div></main>
    </div>
  );
}
