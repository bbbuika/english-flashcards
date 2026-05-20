'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Profile, ProfilesState, AVATAR_OPTIONS, LEVELS,
  loadProfiles, saveProfiles, createProfile, getLevel, getXpProgress,
} from '@/lib/profiles';

export default function ProfilesScreen() {
  const router = useRouter();
  const [state, setState] = useState<ProfilesState | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = loadProfiles();
    setState(s);
    if (s.profiles.length === 0) setCreating(true);
  }, []);

  function selectProfile(id: string) {
    if (!state) return;
    const next = { ...state, currentProfileId: id };
    saveProfiles(next);
    router.push('/');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a name.'); return; }
    if (!state) return;
    const profile = createProfile(name, emoji);
    const next: ProfilesState = {
      profiles: [...state.profiles, profile],
      currentProfileId: profile.id,
    };
    saveProfiles(next);
    router.push('/');
  }

  function deleteProfile(id: string) {
    if (!state) return;
    const next: ProfilesState = {
      profiles: state.profiles.filter((p) => p.id !== id),
      currentProfileId: state.currentProfileId === id ? null : state.currentProfileId,
    };
    saveProfiles(next);
    setState(next);
    if (next.profiles.length === 0) setCreating(true);
  }

  if (!state) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-gray-900">English Flashcards</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.profiles.length === 0 ? 'Create your profile to start' : 'Who\'s studying today?'}
          </p>
        </div>

        {/* Profile list */}
        {state.profiles.length > 0 && !creating && (
          <div className="flex flex-col gap-3 mb-4">
            {state.profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                onSelect={() => selectProfile(p.id)}
                onDelete={() => deleteProfile(p.id)}
              />
            ))}
            <button
              onClick={() => setCreating(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              + Add another profile
            </button>
          </div>
        )}

        {/* Create form */}
        {creating && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              {state.profiles.length === 0 ? 'Create your profile' : 'New profile'}
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Pick your avatar</label>
                <div className="grid grid-cols-11 gap-1.5">
                  {AVATAR_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`text-2xl rounded-xl p-1 transition-all ${emoji === e ? 'bg-indigo-100 scale-110 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Your name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your name…"
                  maxLength={20}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              </div>
              <div className="flex gap-2">
                {state.profiles.length > 0 && (
                  <button type="button" onClick={() => setCreating(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                  {emoji} Let&apos;s go!
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({ profile, onSelect, onDelete }: {
  profile: Profile;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const level = getLevel(profile.xp);
  const { percent } = getXpProgress(profile.xp);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onSelect}>
      {/* Avatar */}
      <div className="text-4xl w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
        {profile.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 truncate">{profile.name}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
            {level.emoji} {level.name}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{profile.xp} XP</span>
          {profile.streak > 0 && <span>🔥 {profile.streak} day streak</span>}
          {profile.gamesPlayed > 0 && <span>🎮 {profile.gamesPlayed} games</span>}
        </div>
        {/* XP bar */}
        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all"
            style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Arrow + delete */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
