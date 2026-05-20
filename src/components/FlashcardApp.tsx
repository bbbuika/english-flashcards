'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WordCard } from '@/data/words';
import {
  AppState, getEffectiveCards,
  loadProfileState, saveProfileState,
  isAdminAuthed, setAdminAuthed,
} from '@/lib/storage';
import {
  Profile, ProfilesState,
  loadProfiles, saveProfiles, getCurrentProfile,
  awardXp, checkAndUpdateStreak, getLevel, getXpProgress,
} from '@/lib/profiles';
import Flashcard from './Flashcard';
import ProgressBar from './ProgressBar';
import AddCardModal from './AddCardModal';
import AdminLoginModal from './AdminLoginModal';
import SearchBar from './SearchBar';

const EMPTY_STATE: AppState = {
  knownIds: [], unknownIds: [], customCards: [],
  editedCards: {}, deletedIds: [], currentIndex: 0,
};

export default function FlashcardApp() {
  const router = useRouter();
  const [flashState, setFlashState] = useState<AppState>(EMPTY_STATE);
  const [profileState, setProfileState] = useState<ProfilesState | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ps = loadProfiles();
    if (!ps.currentProfileId || ps.profiles.length === 0) {
      router.replace('/profiles');
      return;
    }
    const fs = loadProfileState(ps.currentProfileId);
    setProfileState(ps);
    setFlashState(fs);
    setIsAdmin(isAdminAuthed());
    setHydrated(true);
  }, [router]);

  const profile = profileState ? getCurrentProfile(profileState) : null;
  const allCards = getEffectiveCards(flashState);
  const card = allCards[flashState.currentIndex] ?? allCards[0];

  const persistFlash = useCallback((updates: Partial<AppState>, base: AppState) => {
    const next = { ...base, ...updates };
    setFlashState(next);
    if (profileState?.currentProfileId) saveProfileState(profileState.currentProfileId, next);
    return next;
  }, [profileState]);

  const persistProfiles = useCallback((next: ProfilesState) => {
    setProfileState(next);
    saveProfiles(next);
  }, []);

  function flashXp(amount: number) {
    setXpFlash(amount);
    if (xpTimer.current) clearTimeout(xpTimer.current);
    xpTimer.current = setTimeout(() => setXpFlash(null), 1500);
  }

  function earnXp(amount: number) {
    if (!profileState || !profile) return;
    let next = awardXp(profileState, profile.id, amount);
    next = checkAndUpdateStreak(next, profile.id);
    persistProfiles(next);
    flashXp(amount);
  }

  function goToIndex(index: number) {
    persistFlash({ currentIndex: index }, flashState);
    setIsFlipped(false);
  }

  function navigate(dir: 'prev' | 'next') {
    goToIndex(dir === 'next'
      ? Math.min(flashState.currentIndex + 1, allCards.length - 1)
      : Math.max(flashState.currentIndex - 1, 0));
  }

  function markKnown() {
    const knownIds = [...new Set([...flashState.knownIds, card.id])];
    const unknownIds = flashState.unknownIds.filter((id) => id !== card.id);
    persistFlash({ knownIds, unknownIds }, flashState);
    earnXp(5);
    if (flashState.currentIndex < allCards.length - 1) goToIndex(flashState.currentIndex + 1);
  }

  function markUnknown() {
    const unknownIds = [...new Set([...flashState.unknownIds, card.id])];
    const knownIds = flashState.knownIds.filter((id) => id !== card.id);
    persistFlash({ knownIds, unknownIds }, flashState);
    earnXp(1);
    if (flashState.currentIndex < allCards.length - 1) goToIndex(flashState.currentIndex + 1);
  }

  function addCard(newCard: WordCard) {
    persistFlash({ customCards: [...flashState.customCards, newCard] }, flashState);
  }

  function resetProgress() {
    persistFlash({ knownIds: [], unknownIds: [], currentIndex: 0 }, flashState);
    setIsFlipped(false);
  }

  if (!hydrated || !profileState) return null;

  const level = profile ? getLevel(profile.xp) : null;
  const xpProgress = profile ? getXpProgress(profile.xp) : null;
  const statusForCurrent = flashState.knownIds.includes(card?.id)
    ? 'known' : flashState.unknownIds.includes(card?.id) ? 'unknown' : 'unseen';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="px-4 pt-4 pb-3 bg-white border-b border-gray-100 shadow-sm">
        {/* Top row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Profile chip */}
          <Link href="/profiles" className="flex items-center gap-2 min-w-0 flex-1 group">
            <span className="text-2xl">{profile?.emoji ?? '👤'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900 truncate">{profile?.name ?? 'Guest'}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                  {level?.emoji} {level?.name}
                </span>
              </div>
              {/* XP bar */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden w-20">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all"
                    style={{ width: `${xpProgress?.percent ?? 0}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 tabular-nums relative">
                  {profile?.xp ?? 0} XP
                  {xpFlash !== null && (
                    <span className="absolute -top-5 left-0 text-emerald-500 font-bold text-xs animate-bounce whitespace-nowrap">
                      +{xpFlash} XP
                    </span>
                  )}
                </span>
              </div>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/games"
              className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Games">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </Link>

            <button onClick={resetProgress} title="Reset progress"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {isAdmin && (
              <>
                <button onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
                <Link href="/admin"
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100">
                  Admin
                </Link>
              </>
            )}

            <button
              onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminModal(true)}
              className={`p-2 rounded-lg transition-colors ${isAdmin ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isAdmin
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
              </svg>
            </button>
          </div>
        </div>

        <SearchBar cards={allCards} onSelect={goToIndex} />
        {profile && profile.streak > 1 && (
          <p className="mt-1.5 text-[10px] text-orange-500 font-medium">🔥 {profile.streak} day streak! Keep it up.</p>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center px-4 py-5 gap-4 max-w-2xl mx-auto w-full">
        <div className="w-full">
          <ProgressBar
            current={flashState.currentIndex + 1}
            total={allCards.length}
            known={flashState.knownIds.length}
            unknown={flashState.unknownIds.length}
          />
        </div>

        {statusForCurrent !== 'unseen' && (
          <div className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${statusForCurrent === 'known' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
            {statusForCurrent === 'known' ? '✓ Marked as Known' : '✗ Marked as Unknown'}
          </div>
        )}

        <Flashcard key={card?.id} card={card} isFlipped={isFlipped} onFlip={() => setIsFlipped((f) => !f)} />

        <div className="flex items-center gap-3 w-full">
          <button onClick={() => navigate('prev')} disabled={flashState.currentIndex === 0}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            ← Previous
          </button>
          <button onClick={() => navigate('next')} disabled={flashState.currentIndex === allCards.length - 1}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Next →
          </button>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={markUnknown}
            className="flex-1 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
            ✗ Don&apos;t know
          </button>
          <button onClick={markKnown}
            className="flex-1 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
            ✓ I know this
          </button>
        </div>

        {flashState.currentIndex === allCards.length - 1 && (
          <div className="w-full rounded-2xl bg-indigo-50 border border-indigo-100 p-5 text-center">
            <p className="font-semibold text-indigo-800">🎉 You&apos;ve reached the end of the deck!</p>
            <p className="text-sm text-indigo-500 mt-1">
              {flashState.knownIds.length} known · {flashState.unknownIds.length} still learning
            </p>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={resetProgress}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Start Over
              </button>
              <Link href="/games"
                className="px-5 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors">
                Play Games →
              </Link>
            </div>
          </div>
        )}
      </main>

      {showAddModal && <AddCardModal onAdd={addCard} onClose={() => setShowAddModal(false)} />}
      {showAdminModal && (
        <AdminLoginModal
          onSuccess={() => { setAdminAuthed(); setIsAdmin(true); }}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}
