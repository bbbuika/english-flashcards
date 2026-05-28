'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { STRINGS } from '@/lib/i18n';

type SimpleKeys = {
  [K in keyof typeof STRINGS]: (typeof STRINGS)[K] extends { tr: string; en: string } ? K : never;
}[keyof typeof STRINGS];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: <K extends SimpleKeys>(key: K) => string;
  strings: typeof STRINGS;
};

const LanguageCtx = createContext<Ctx | null>(null);

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'tr';
  const stored = localStorage.getItem('lang');
  return stored === 'en' || stored === 'tr' ? stored : 'tr';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') localStorage.setItem('lang', l);
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'tr' ? 'en' : 'tr');
  }, [lang, setLang]);

  const t = useCallback(
    <K extends SimpleKeys>(key: K): string => {
      const entry = STRINGS[key] as { tr: string; en: string };
      return entry[lang];
    },
    [lang],
  );

  return (
    <LanguageCtx.Provider value={{ lang, setLang, toggle, t, strings: STRINGS }}>
      {children}
    </LanguageCtx.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageCtx);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
