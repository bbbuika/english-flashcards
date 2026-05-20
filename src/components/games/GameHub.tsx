'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadProfiles, getCurrentProfile, getLevel } from '@/lib/profiles';

const GAMES = [
  {
    href: '/games/speed',
    emoji: '⚡',
    title: 'Speed Round',
    description: 'Flip through as many cards as you can in 60 seconds.',
    color: 'from-amber-400 to-orange-500',
    statKey: 'bestSpeedRound' as const,
    statLabel: 'Best',
    statSuffix: ' cards',
  },
  {
    href: '/games/quiz',
    emoji: '🎯',
    title: 'Multiple Choice',
    description: 'Pick the correct Turkish meaning. 10 questions per round.',
    color: 'from-emerald-400 to-teal-500',
    statKey: 'quizCorrect' as const,
    statLabel: 'Correct',
    statSuffix: '',
  },
  {
    href: '/games/versus',
    emoji: '⚔️',
    title: 'Head-to-Head',
    description: 'Two players compete on the same device. Who knows more?',
    color: 'from-rose-400 to-pink-600',
    statKey: 'versusWins' as const,
    statLabel: 'Wins',
    statSuffix: '',
  },
  {
    href: '/games/scramble',
    emoji: '🔤',
    title: 'Word Scramble',
    description: 'Unscramble the English word from the Turkish clue.',
    color: 'from-violet-400 to-indigo-500',
    statKey: 'gamesPlayed' as const,
    statLabel: 'Played',
    statSuffix: '',
  },
];

export default function GameHub() {
  const [profile, setProfile] = useState<ReturnType<typeof getCurrentProfile>>(null);

  useEffect(() => {
    const s = loadProfiles();
    setProfile(getCurrentProfile(s));
  }, []);

  const level = profile ? getLevel(profile.xp) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Games</h1>
            {profile && (
              <p className="text-xs text-gray-400">
                {profile.emoji} {profile.name} · {level?.emoji} {level?.name} · {profile.xp} XP
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/leaderboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors">
              🏆 Leaderboard
            </Link>
            <Link href="/"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
              ← Study
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <p className="text-sm text-gray-500">Choose a game to earn XP and practice your English.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((game) => {
            const stat = profile ? profile[game.statKey] : null;
            return (
              <Link key={game.href} href={game.href}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className={`h-24 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">{game.title}</h2>
                    {stat !== null && stat > 0 && (
                      <span className="text-xs text-gray-400 font-medium">
                        {game.statLabel}: {stat}{game.statSuffix}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{game.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
