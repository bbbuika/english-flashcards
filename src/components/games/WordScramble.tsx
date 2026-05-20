'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { loadProfiles, saveProfiles, getCurrentProfile, awardXp, updateProfile, checkAndUpdateStreak } from '@/lib/profiles';
import { loadState, getEffectiveCards } from '@/lib/storage';
import { WordCard } from '@/data/words';

const TOTAL = 8;
const XP_CORRECT = 15;
const XP_HINT = 5;

function scramble(word: string): string {
  const arr = word.toLowerCase().split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure it's actually scrambled
  if (arr.join('') === word.toLowerCase() && word.length > 1) return scramble(word);
  return arr.join('');
}

export default function WordScramble() {
  const [deck, setDeck] = useState<WordCard[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function init() {
    const flashState = loadState();
    const cards = [...getEffectiveCards(flashState)]
      .filter((c) => c.word.length >= 4)
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL);
    setDeck(cards);
    setQIdx(0);
    setInput('');
    setStatus('idle');
    setScore(0);
    setHintsUsed(0);
    setShowHint(false);
    setPhase('ready');
  }

  useEffect(() => { init(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const card = deck[qIdx];
    if (!card) return;
    if (input.trim().toLowerCase() === card.word.toLowerCase()) {
      setStatus('correct');
      setScore((s) => s + 1);
      setTimeout(next, 800);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 600);
    }
  }

  function next() {
    if (qIdx + 1 >= TOTAL) {
      finish();
    } else {
      setQIdx((i) => i + 1);
      setInput('');
      setStatus('idle');
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function skip() {
    setStatus('wrong');
    setTimeout(() => { setStatus('idle'); next(); }, 400);
  }

  function useHint() {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  }

  function finish() {
    const earned = score * XP_CORRECT - hintsUsed * XP_HINT;
    const finalXp = Math.max(earned, score * 2); // minimum XP for participation
    setXpEarned(finalXp);
    setPhase('done');
    const ps = loadProfiles();
    const p = getCurrentProfile(ps);
    if (!p) return;
    let next = awardXp(ps, p.id, finalXp);
    next = checkAndUpdateStreak(next, p.id);
    next = updateProfile(next, p.id, { gamesPlayed: p.gamesPlayed + 1 });
    saveProfiles(next);
  }

  const card = deck[qIdx];
  const scrambled = card ? scramble(card.word) : '';
  const hint = card ? card.word[0] + '_'.repeat(card.word.length - 1) : '';

  if (phase === 'ready') {
    return (
      <GameLayout title="🔤 Word Scramble" backHref="/games">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
            <span className="text-5xl">🔤</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Word Scramble</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              See the Turkish clue and scrambled letters, then type the correct English word.
              <br /><strong>{TOTAL} words</strong> · <strong>{XP_CORRECT} XP</strong> per correct answer.
            </p>
          </div>
          <button onClick={() => setPhase('playing')}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-400 to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
            Scramble!
          </button>
        </div>
      </GameLayout>
    );
  }

  if (phase === 'done') {
    return (
      <GameLayout title="🔤 Word Scramble" backHref="/games">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-6xl">{score >= 7 ? '🏆' : score >= 5 ? '⭐' : '💪'}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{score} / {TOTAL} correct</h2>
            {hintsUsed > 0 && <p className="text-sm text-gray-400">{hintsUsed} hints used</p>}
          </div>
          <div className="bg-indigo-50 rounded-2xl px-8 py-4 border border-indigo-100">
            <p className="text-3xl font-bold text-indigo-700">+{xpEarned} XP</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { init(); setPhase('playing'); }}
              className="px-6 py-2.5 rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-600 transition-colors">
              Play again
            </button>
            <Link href="/games" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              Back
            </Link>
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-1.5 bg-gray-200">
        <div className="h-full bg-violet-400 transition-all" style={{ width: `${(qIdx / TOTAL) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full gap-5">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Word {qIdx + 1} of {TOTAL}</span>
          <span>{score} correct</span>
        </div>

        {/* Clue */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-indigo-100 p-6 text-center">
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-2">Turkish clue</p>
          <p className="text-2xl font-bold text-indigo-800">{card?.turkish}</p>
          <p className="text-sm text-indigo-400 mt-2">{card?.definition}</p>
        </div>

        {/* Scrambled word */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Scrambled letters</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {scrambled.split('').map((letter, i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-white border-2 border-indigo-200 flex items-center justify-center text-lg font-bold text-indigo-700 shadow-sm">
                {letter.toUpperCase()}
              </div>
            ))}
          </div>
          {showHint && (
            <p className="text-sm text-amber-600 font-mono mt-3 tracking-widest">{hint.toUpperCase()}</p>
          )}
        </div>

        {/* Input */}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus('idle'); }}
            placeholder="Type the English word…"
            className={`w-full border-2 rounded-2xl px-4 py-3 text-lg font-medium text-center tracking-wide focus:outline-none transition-colors ${
              status === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' :
              status === 'wrong' ? 'border-rose-400 bg-rose-50 text-rose-700' :
              'border-gray-200 bg-white focus:border-indigo-400'
            }`}
          />
          <div className="flex gap-2">
            {!showHint && (
              <button type="button" onClick={useHint}
                className="px-4 py-2.5 rounded-xl border border-amber-200 text-amber-600 text-sm font-medium hover:bg-amber-50 transition-colors">
                💡 Hint (-{XP_HINT} XP)
              </button>
            )}
            <button type="button" onClick={skip}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
              Skip
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors">
              Check ↵
            </button>
          </div>
        </form>
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
