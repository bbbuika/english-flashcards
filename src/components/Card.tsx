'use client';

import Image from 'next/image';
import type { Card as CardType } from '@/lib/types';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { w: number; h: number; cls: string }> = {
  xs: { w: 48, h: 72, cls: 'w-[48px] h-[72px]' },
  sm: { w: 60, h: 90, cls: 'w-[60px] h-[90px]' },
  md: { w: 100, h: 150, cls: 'w-[100px] h-[150px]' },
  lg: { w: 150, h: 225, cls: 'w-[150px] h-[225px]' },
  xl: { w: 220, h: 330, cls: 'w-[220px] h-[330px]' },
};

export function CardImage({
  card,
  size = 'md',
  faceDown = false,
  backKind = 'main',
  selected = false,
  onClick,
  disabled = false,
  dimmed = false,
}: {
  card?: CardType | null;
  size?: Size;
  faceDown?: boolean;
  backKind?: 'main' | 'rune';
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  dimmed?: boolean;
}) {
  const s = SIZES[size];
  const backSrc = backKind === 'rune' ? '/cards/back-rune.jpg' : '/cards/back.jpg';
  const src = faceDown || !card ? backSrc : `/cards/${card.file}`;
  const alt = faceDown ? 'card back' : card?.title ?? 'card';
  const interactive = !!onClick && !disabled;
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={`relative ${s.cls} rounded-lg overflow-hidden border transition-all ${
        selected
          ? 'border-amber-300 shadow-[0_0_20px_rgba(212,165,116,0.5)] -translate-y-2'
          : 'border-amber-900/50'
      } ${interactive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : 'cursor-default'} ${
        (disabled && !faceDown) || dimmed ? 'opacity-50' : ''
      } shrink-0`}
      aria-label={alt}
      title={card ? `${card.title}${card.subtitle ? ' — ' + card.subtitle : ''}` : alt}
    >
      <Image src={src} alt={alt} width={s.w} height={s.h} className="object-cover w-full h-full" />
    </button>
  );
}

export function CardBack({
  size = 'md',
  kind = 'main',
}: {
  size?: Size;
  kind?: 'main' | 'rune';
}) {
  return <CardImage size={size} faceDown backKind={kind} />;
}
