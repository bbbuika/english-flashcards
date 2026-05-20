'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { loadProfiles, saveProfiles, getCurrentProfile, awardXp, updateProfile, checkAndUpdateStreak } from '@/lib/profiles';
import { loadState, getEffectiveCards } from '@/lib/storage';
import { WordCard } from '@/data/words';

const TOTAL = 10;
const XP_CORRECT = 10;
const XP_WRONG = 2;

interface Question { card: WordCard; options: string[]; correctIdx: number; }

function buildQuestions(cards: WordCard[], n: number): Question[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((card) => {
    const others = cards.filter((c) => c.id !== card.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [card.turkish, ...others.map((c) => c.turkish)].sort(() => Math.random() - 0.5);
    return { card, options, correctIdx: options.indexOf(card.turkish) };
  });
}

export default function MultipleChoiceQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [xpEarned, setXpEarned] = useState(0);

  function init() {
    const flashState = loadState();
    const cards = getEffectiveCards(flashState);
    setQuestions(buildQuestions(cards, TOTAL));
    setQIdx(0);
    setSelected(null);
    setResults([]);
    setPhase('ready');
  }

  useEffect(() => { init(); }, []);

  const finish = useCallback((finalResults: boolean[]) => {
    const correct = finalResults.filter(Boolean).length;
    const earned = correct * XP_CORRECT + (TOTAL - correct) * XP_WRONG;
    setXpEarned(earned);
    setPhase('done');
    const ps = loadProfiles();
    const p = getCurrentProfile(ps);
    if (!p) return;
    let next = awardXp(ps, p.id, earned);
    next = checkAndUpdateStreak(next, p.id);
    next = updateProfile(next, p.id, {
      gamesPlayed: p.gamesPlayed + 1,
      quizCorrect: p.quizCorrect + correct,
      quizTotal: p.quizTotal + TOTAL,
    });
    saveProfiles(next);
  }, []);

  function pick(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === questions[qIdx].correctIdx;
    const newResults = [...results, isCorrect];
    setTimeout(() => {
      if (qIdx + 1 >= TOTAL) {
        setResults(newResults);
        finish(newResults);
      } else {
        setResults(newResults);
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 900);
  }

  if (phase === 'ready' || questions.length === 0) {
    return (
      <GameLayout title="🎯 Multiple Choice" backHref="/games">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-5xl">🎯</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Multiple Choice Quiz</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              See the English word, pick the correct Turkish meaning from 4 options.
              <br /><strong>{TOTAL} questions</strong> · <strong>{XP_CORRECT} XP</strong> per correct answer.
            </p>
          </div>
          <button onClick={() => setPhase('playing')}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
            Start Quiz!
          </button>
        </div>
      </GameLayout>
    );
  }

  if (phase === 'done') {
    const correct = results.filter(Boolean).length;
    return (
      <GameLayout title="🎯 Multiple Choice" backHref="/games">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-6xl">{correct >= 9 ? '🏆' : correct >= 7 ? '⭐' : correct >= 5 ? '👍' : '💪'}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{correct} / {TOTAL} correct</h2>
            <p className="text-sm text-gray-500 mt-1">{Math.round((correct / TOTAL) * 100)}% accuracy</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl px-8 py-4 border border-indigo-100">
            <p className="text-3xl font-bold text-indigo-700">+{xpEarned} XP</p>
          </div>
          {/* Result dots */}
          <div className="flex gap-1.5">
            {results.map((r, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${r ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { init(); setPhase('playing'); }}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">
              Try again
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

  const q = questions[qIdx];
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      <div className="h-1.5 bg-gray-200">
        <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(qIdx / TOTAL) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full gap-6">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Question {qIdx + 1} of {TOTAL}</span>
          <span>{results.filter(Boolean).length} correct</span>
        </div>

        {/* Word card */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-3">What does this mean in Turkish?</p>
          <p className="text-4xl font-black text-gray-900">{q.card.word}</p>
          <p className="text-sm text-gray-500 mt-3">{q.card.definition}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            let cls = 'w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-medium transition-all ';
            if (selected === null) {
              cls += 'bg-white border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-800';
            } else if (i === q.correctIdx) {
              cls += 'bg-emerald-50 border-emerald-400 text-emerald-800';
            } else if (i === selected) {
              cls += 'bg-rose-50 border-rose-400 text-rose-700';
            } else {
              cls += 'bg-white border-gray-100 text-gray-400';
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span> {opt}
                {selected !== null && i === q.correctIdx && <span className="float-right">✓</span>}
                {selected !== null && i === selected && i !== q.correctIdx && <span className="float-right">✗</span>}
              </button>
            );
          })}
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
        <Link href={backHref} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">← Back</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
