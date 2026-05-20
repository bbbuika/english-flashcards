'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { WordCard } from '@/data/words';
import {
  AppState, loadState, saveState, getEffectiveCards,
  isAdminAuthed, setAdminAuthed, clearAdminAuth,
  exportJSON, exportCSV, parseImportFile,
} from '@/lib/storage';
import { ADMIN_PASSWORD } from '@/components/AdminLoginModal';
import AdminEditModal from './AdminEditModal';

const PAGE_SIZE = 25;

type FilterType = 'all' | 'default' | 'custom';
type FilterStatus = 'all' | 'known' | 'unknown' | 'unseen';

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [state, setState] = useState<AppState | null>(null);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);
  const [editCard, setEditCard] = useState<WordCard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (authed) setState(loadState());
  }, [authed]);

  // Close export dropdown on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExportMenu(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminAuthed();
      setAuthed(true);
    } else {
      setAuthError('Incorrect password.');
      setPassword('');
    }
  }

  function logout() {
    clearAdminAuth();
    setAuthed(false);
    setState(null);
  }

  function persist(updates: Partial<AppState>) {
    if (!state) return;
    const next = { ...state, ...updates };
    setState(next);
    saveState(next);
  }

  // ── Data ─────────────────────────────────────────────────

  const allCards = state ? getEffectiveCards(state) : [];
  const knownSet = new Set(state?.knownIds ?? []);
  const unknownSet = new Set(state?.unknownIds ?? []);

  function cardStatus(id: string): FilterStatus {
    if (knownSet.has(id)) return 'known';
    if (unknownSet.has(id)) return 'unknown';
    return 'unseen';
  }

  const filtered = allCards.filter((c) => {
    const q = query.toLowerCase();
    const matchQ = !q ||
      c.word.toLowerCase().includes(q) ||
      c.turkish.toLowerCase().includes(q) ||
      c.definition.toLowerCase().includes(q);
    const matchType = filterType === 'all' || (filterType === 'custom' ? c.isCustom : !c.isCustom);
    const matchStatus = filterStatus === 'all' || cardStatus(c.id) === filterStatus;
    return matchQ && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() { setPage(1); }

  // ── Edit / Delete ─────────────────────────────────────────

  function handleSave(id: string, updated: Partial<WordCard>) {
    if (!state) return;
    const custom = state.customCards.find((c) => c.id === id);
    if (custom) {
      persist({
        customCards: state.customCards.map((c) => c.id === id ? { ...c, ...updated } : c),
      });
    } else {
      persist({ editedCards: { ...state.editedCards, [id]: { ...(state.editedCards[id] ?? {}), ...updated } } });
    }
  }

  function handleDelete(id: string) {
    if (!state) return;
    const isCustom = state.customCards.some((c) => c.id === id);
    if (isCustom) {
      persist({ customCards: state.customCards.filter((c) => c.id !== id) });
    } else {
      persist({ deletedIds: [...state.deletedIds, id] });
    }
    setDeleteConfirm(null);
  }

  function handleRestore(id: string) {
    if (!state) return;
    persist({ deletedIds: state.deletedIds.filter((d) => d !== id) });
  }

  // ── Import / Export ───────────────────────────────────────

  function handleExportJSON() { exportJSON(allCards); setShowExportMenu(false); }
  function handleExportCSV() { exportCSV(allCards); setShowExportMenu(false); }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !state) return;
    e.target.value = '';
    setImportError('');
    setImportSuccess('');
    const text = await file.text();
    const cards = parseImportFile(text, file.name);
    if (!cards || cards.length === 0) {
      setImportError('Could not parse file. Use a JSON array or CSV exported from this app.');
      return;
    }
    persist({ customCards: [...state.customCards, ...cards] });
    setImportSuccess(`Imported ${cards.length} card${cards.length !== 1 ? 's' : ''} successfully.`);
  }

  // ── Auth gate ─────────────────────────────────────────────

  if (!authChecked) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-7 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Sign in to manage your flashcard deck</p>
          </div>
          <form onSubmit={login} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
              placeholder="Admin password"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {authError && <p className="text-xs text-rose-500">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Sign in
            </button>
            <Link href="/" className="text-xs text-center text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to Deck
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin UI ──────────────────────────────────────────────

  const deletedCount = state?.deletedIds.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Admin Panel</h1>
              <p className="text-[11px] text-gray-400">English Flashcards</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              ← Back to Deck
            </Link>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Cards', value: allCards.length, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Known', value: state?.knownIds.length ?? 0, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Unknown', value: state?.unknownIds.length ?? 0, color: 'bg-rose-50 text-rose-600' },
            { label: 'Deleted', value: deletedCount, color: 'bg-gray-100 text-gray-500' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl px-4 py-3`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              placeholder="Search words…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as FilterType); resetPage(); }}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
          >
            <option value="all">All types</option>
            <option value="default">Default</option>
            <option value="custom">Custom</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as FilterStatus); resetPage(); }}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
          >
            <option value="all">All statuses</option>
            <option value="known">Known</option>
            <option value="unknown">Unknown</option>
            <option value="unseen">Unseen</option>
          </select>

          <div className="flex-1" />

          {/* Import */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
          <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={handleImport} />

          {/* Export */}
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-20 min-w-32">
                <button onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                  Export JSON
                </button>
                <button onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition-colors border-t border-gray-50">
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Import feedback */}
        {importError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {importError}
          </div>
        )}
        {importSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
            {importSuccess}
            <button onClick={() => setImportSuccess('')} className="text-emerald-500 hover:text-emerald-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Card Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Word</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Turkish</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Definition</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Img</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                      No cards match your filters.
                    </td>
                  </tr>
                ) : paginated.map((card, i) => {
                  const idx = (page - 1) * PAGE_SIZE + i + 1;
                  const status = cardStatus(card.id);
                  return (
                    <tr key={card.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
                      <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">{idx}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{card.word}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-32 truncate">
                        {card.turkish}
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell max-w-48 truncate text-xs">
                        {card.definition}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {card.imageUrl ? (
                          <span title={card.imageUrl} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gray-200">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          card.isCustom ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {card.isCustom ? 'Custom' : 'Default'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditCard(card)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(card.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {filtered.length} cards · page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <PageBtn disabled={page === 1} onClick={() => setPage(page - 1)}>←</PageBtn>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  return (
                    <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
                  );
                })}
                <PageBtn disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</PageBtn>
              </div>
            </div>
          )}
        </div>

        {/* ── Deleted cards restore section ── */}
        {deletedCount > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Deleted default cards
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{deletedCount}</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {state?.deletedIds.map((id) => {
                const { defaultCards } = require('@/data/words');
                const original = defaultCards.find((c: WordCard) => c.id === id);
                if (!original) return null;
                return (
                  <div key={id} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-medium text-gray-700">{original.word}</span>
                      <span className="ml-2 text-xs text-gray-400">{original.turkish}</span>
                    </div>
                    <button
                      onClick={() => handleRestore(id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors shrink-0"
                    >
                      Restore
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit modal ── */}
      {editCard && (
        <AdminEditModal
          card={editCard}
          onSave={(updated) => handleSave(editCard.id, updated)}
          onClose={() => setEditCard(null)}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete card?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {allCards.find(c => c.id === deleteConfirm)?.isCustom
                    ? 'This custom card will be permanently removed.'
                    : 'This default card will be hidden. You can restore it from the deleted cards section.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: FilterStatus }) {
  if (status === 'known') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Known</span>
  );
  if (status === 'unknown') return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-600">Unknown</span>
  );
  return <span className="text-gray-300 text-xs">—</span>;
}

function PageBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' :
        disabled ? 'text-gray-300 cursor-not-allowed' :
        'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
