'use client';

import { useState, useEffect } from 'react';
import { WordCard } from '@/data/words';

interface Props {
  card: WordCard;
  onSave: (updated: Partial<WordCard>) => void;
  onClose: () => void;
}

export default function AdminEditModal({ card, onSave, onClose }: Props) {
  const [word, setWord] = useState(card.word);
  const [definition, setDefinition] = useState(card.definition);
  const [example, setExample] = useState(card.example);
  const [turkish, setTurkish] = useState(card.turkish);
  const [imageUrl, setImageUrl] = useState(card.imageUrl ?? '');
  const [imgPreviewOk, setImgPreviewOk] = useState(false);

  useEffect(() => { setImgPreviewOk(false); }, [imageUrl]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim() || !definition.trim() || !turkish.trim()) return;
    onSave({
      word: word.trim(),
      definition: definition.trim(),
      example: example.trim(),
      turkish: turkish.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Card</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {card.isCustom ? 'Custom card' : 'Default card'} · id {card.id}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">
          <Field label="English Word *" value={word} onChange={setWord} placeholder="e.g. persevere" />
          <Field label="Definition *" value={definition} onChange={setDefinition} placeholder="The meaning of the word" multiline />
          <Field label="Example Sentence" value={example} onChange={setExample} placeholder="A sentence using the word" multiline />
          <Field label="Turkish Translation *" value={turkish} onChange={setTurkish} placeholder="e.g. sebat etmek" />

          {/* Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Custom Background Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
            <p className="text-[10px] text-gray-400">
              Leave blank to use auto-generated image from the word.
            </p>

            {/* Image preview */}
            {imageUrl && (
              <div className="relative mt-1 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgPreviewOk ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgPreviewOk(true)}
                  onError={() => setImgPreviewOk(false)}
                />
                {!imgPreviewOk && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-xs text-gray-400">Loading preview…</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  const cls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition resize-none";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea rows={2} className={cls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
