'use client';

import { useState } from 'react';
import { WordCard } from '@/data/words';

interface AddCardModalProps {
  onAdd: (card: WordCard) => void;
  onClose: () => void;
}

export default function AddCardModal({ onAdd, onClose }: AddCardModalProps) {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [turkish, setTurkish] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim() || !definition.trim() || !turkish.trim()) {
      setError('Word, definition and Turkish translation are required.');
      return;
    }
    onAdd({
      id: `custom-${Date.now()}`,
      word: word.trim(),
      definition: definition.trim(),
      example: example.trim(),
      turkish: turkish.trim(),
      isCustom: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Add New Card</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="English Word *" value={word} onChange={setWord} placeholder="e.g. persevere" />
          <Field label="Definition *" value={definition} onChange={setDefinition} placeholder="e.g. To continue despite difficulties" />
          <Field label="Example Sentence" value={example} onChange={setExample} placeholder="e.g. She persevered through every obstacle." />
          <Field label="Turkish Translation *" value={turkish} onChange={setTurkish} placeholder="e.g. sebat etmek, ısrar etmek" />

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
