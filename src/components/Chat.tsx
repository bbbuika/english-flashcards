'use client';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/types';
import type { Lang } from '@/lib/i18n';

interface Props {
  messages: ChatMessage[];
  myId: string;
  lang: Lang;
  onSend: (text: string) => void;
}

export function Chat({ messages, myId, lang, onSend }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const seenRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      seenRef.current = messages.length;
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const newCount = messages.length - seenRef.current;
      if (newCount > 0) {
        setUnread((u) => u + newCount);
        seenRef.current = messages.length;
      }
    }
  }, [messages.length, open]);

  function handleSend() {
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput('');
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div
          className="w-72 sm:w-80 bg-stone-900/95 border border-amber-800/30 rounded-xl shadow-2xl backdrop-blur flex flex-col"
          style={{ height: '320px' }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-amber-800/20">
            <span className="text-xs font-mono text-amber-400">
              {lang === 'tr' ? 'Sohbet' : 'Chat'}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-amber-700 hover:text-amber-400 text-xs leading-none"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 flex flex-col">
            {messages.length === 0 && (
              <p className="text-amber-700/50 text-xs italic text-center mt-6">
                {lang === 'tr' ? 'Henüz mesaj yok.' : 'No messages yet.'}
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.playerId === myId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[10px] text-amber-600/70 ml-1 mb-0.5">
                      {msg.playerName}
                    </span>
                  )}
                  <div
                    className={`max-w-[200px] px-2.5 py-1 rounded-lg text-xs break-words leading-relaxed ${
                      isMe
                        ? 'bg-amber-800/60 text-amber-100'
                        : 'bg-stone-700/60 text-amber-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="px-2 py-2 border-t border-amber-800/20 flex gap-1.5">
            <input
              className="flex-1 bg-stone-800 border border-amber-800/30 rounded-lg px-2 py-1 text-xs text-amber-100 placeholder-amber-700/40 focus:outline-none focus:border-amber-600/50 min-w-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={lang === 'tr' ? 'Mesaj yaz...' : 'Type a message...'}
              maxLength={300}
            />
            <button
              className="shrink-0 px-2 py-1 bg-amber-800/70 hover:bg-amber-700/70 rounded-lg text-xs text-amber-100"
              onClick={handleSend}
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 bg-stone-800/90 hover:bg-stone-700/90 border border-amber-800/40 rounded-full flex items-center justify-center shadow-lg backdrop-blur transition-colors"
        title={lang === 'tr' ? 'Sohbet' : 'Chat'}
      >
        <span className="text-lg leading-none">💬</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-amber-500 rounded-full text-[9px] font-bold text-stone-900 flex items-center justify-center px-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}
