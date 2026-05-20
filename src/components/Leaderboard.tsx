'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, loadProfiles, getLevel, getXpProgress } from '@/lib/profiles';

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const ps = loadProfiles();
    setProfiles([...ps.profiles].sort((a, b) => b.xp - a.xp));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">🏆 Leaderboard</h1>
        <div className="flex gap-2">
          <Link href="/games" className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">Games</Link>
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">← Study</Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {profiles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🌱</div>
            <p className="font-medium">No profiles yet.</p>
            <Link href="/profiles" className="text-indigo-500 text-sm underline mt-2 inline-block">Create one →</Link>
          </div>
        ) : profiles.map((profile, rank) => (
          <ProfileRow key={profile.id} profile={profile} rank={rank + 1} />
        ))}
      </main>
    </div>
  );
}

function ProfileRow({ profile, rank }: { profile: Profile; rank: number }) {
  const level = getLevel(profile.xp);
  const { percent } = getXpProgress(profile.xp);
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${rank === 1 ? 'border-amber-200 shadow-md' : 'border-gray-100 shadow-sm'}`}>
      <div className="w-8 text-center font-bold text-gray-400 text-sm shrink-0">
        {medal ?? `#${rank}`}
      </div>
      <div className="text-4xl w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
        {profile.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 truncate">{profile.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold shrink-0">
            {level.emoji} {level.name}
          </span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="font-semibold text-indigo-600">{profile.xp} XP</span>
          {profile.streak > 0 && <span>🔥 {profile.streak}d streak</span>}
          <span>🎮 {profile.gamesPlayed} games</span>
          {profile.versusWins > 0 && <span>⚔️ {profile.versusWins} wins</span>}
        </div>
      </div>
    </div>
  );
}
