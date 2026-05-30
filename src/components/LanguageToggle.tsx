'use client';

import { useLang } from './LanguageContext';

export function LanguageToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="rounded-full border border-amber-200/60 px-3 py-1 text-xs font-mono text-amber-100 hover:bg-amber-100/10 transition"
      aria-label="Toggle language"
      title={lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
    >
      {lang === 'tr' ? 'EN' : 'TR'}
    </button>
  );
}
