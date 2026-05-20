'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { loadProfiles, saveProfiles, getCurrentProfile, awardXp, updateProfile, checkAndUpdateStreak } from '@/lib/profiles';
import { loadState, getEffectiveCards } from '@/lib/storage';
import { WordCard } from '@/data/words';

const DURATION = 60;
const XP_PER_CARD = 3;

type Phase = 'ready' | 'playing' | 'done';

export default function SpeedRound() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [cards, setCards] = useState<WordCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    const flashState = loadState();
    const shuffled = [...getEffectiveCards(flashState)].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    const ps = loadProfiles();
    const p = getCurrentProfile(ps);
    if (p) setProfileName(p.name);
  }, []);

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  });

  const endGame = useCallback(() => {
    setPhase('done');
    const ps = loadProfiles();
    const p = getCurrentProfile(ps);
    if (!p) return;
    const earned = score * XP_PER_CARD;
    setXpEarned(earned);
    let next = awardXp(ps, p.id, earned);
    next = checkAndUpdateStreak(next, p.id);
    next = updateProfile(next, p.id, {
      gamesPlayed: p.gamesPlayed + 1,
      bestSpeedRound: Math.max(p.bestSpeedRound, score),
    });
    saveProfiles(next);
  }, [score]);

  function start() {
    setPhase('playing');
    setScore(0);
    setIdx(0);
    setFlipped(false);
    setTimeLeft(DURATION);
  }

  function advance(known: boolean) {
    if (known) setScore((s) => s + 1);
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  const card = cards[idx % Math.max(cards.length, 1)];
  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor = timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444';

  if (phase === 'ready') {
    return (
      <GameLayout title="⚡ Speed Round" backHref="/games">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-5xl">⚡</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Speed Round</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              Flip through as many flashcards as possible in <strong>60 seconds</strong>.
              Each card you know earns <strong>{XP_PER_CARD} XP</strong>.
            </p>
          </div>
          <button onClick={start}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
            Start!
          </button>
        </div>
      </GameLayout>
    );
  }

  if (phase === 'done') {
    return (
      <GameLayout title="⚡ Speed Round" backHref="/games">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-6xl">{score >= 20 ? '🏆' : score >= 10 ? '⭐' : '💪'}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{score} cards!</h2>
            <p className="text-sm text-gray-500 mt-1">in 60 seconds{profileName ? ` · ${profileName}` : ''}</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl px-8 py-4 border border-indigo-100">
            <p className="text-3xl font-bold text-indigo-700">+{xpEarned} XP</p>
            <p className="text-xs text-indigo-400 mt-1">earned this round</p>
          </div>
          <div className="flex gap-3">
            <button onClick={start}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors">
              Play again
            </button>
            <Link href="/games"
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              Back
            </Link>
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Timer bar */}
      <div className="h-1.5 bg-gray-200">
        <div className="h-full transition-all duration-1000"
          style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full">
        {/* Stats */}
        <div className="w-full flex items-center justify-between">
          <div className="text-2xl font-bold tabular-nums" style={{ color: timerColor }}>{timeLeft}s</div>
          <div className="text-center">
            <div className="text-3xl font-black text-gray-900">{score}</div>
            <div className="text-xs text-gray-400">known</div>
          </div>
          <div className="text-sm text-gray-400">{idx} seen</div>
        </div>

        {/* Card */}
        {card && (
          <div className="w-full cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped((f) => !f)}>
            <div style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.4s',
              transform: flipped ? 'rotateY(180deg)' : 'none',
              position: 'relative',
              height: 260,
            }}>
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center items-center p-6 text-center"
                style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-3xl font-bold text-gray-900">{card.word}</p>
                <p className="text-sm text-gray-500 mt-3">{card.definition}</p>
                <p className="text-xs text-indigo-400 mt-4">tap to reveal</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 text-center"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-2xl font-bold text-white">{card.turkish}</p>
                <p className="text-indigo-200 text-sm mt-2">{card.word}</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex gap-3">
          <button onClick={() => advance(false)}
            className="flex-1 py-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-bold text-lg hover:bg-rose-100 active:scale-95 transition-all">
            ✗ Skip
          </button>
          <button onClick={() => advance(true)}
            className="flex-1 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold text-lg hover:bg-emerald-100 active:scale-95 transition-all">
            ✓ Know it
          </button>
        </div>
      </div>
    </div>
  );
}

function GameLayout({ title, backHref, children }: { title: string; backHref: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
        <Link href={backHref} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
          ← Back
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
