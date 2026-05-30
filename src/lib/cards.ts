import type { Card, CardCategory } from './types';
import cardsData from '@/data/cards.json';

export const CARDS: Card[] = (cardsData as Card[]).map((c) => ({
  ...c,
  id: c.file.replace(/\.jpg$/i, ''),
}));

export const CARDS_BY_ID = new Map<string, Card>(CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card | undefined {
  return CARDS_BY_ID.get(id);
}

export function cardsByCategory(category: CardCategory): Card[] {
  return CARDS.filter((c) => c.category === category);
}

export function isEndingRune(card: Card): boolean {
  if (card.category !== 'rune') return false;
  const t = card.title.toLowerCase();
  return (
    t.includes('bitirme') ||
    t.includes('bitiş') ||
    t.includes('bitis') ||
    t.includes('ölüm') ||
    t.includes('olum')
  );
}

export function cardMatchesStep(card: Card, step: string): boolean {
  switch (step) {
    case 'time':
      return card.category === 'month';
    case 'place':
      return card.category === 'iye' || card.category === 'element';
    case 'creator':
      return card.category === 'god' || card.category === 'dichotomic';
    case 'event1':
    case 'event2':
      return true;
    case 'hero':
      return card.category === 'hero' || card.category === 'erk';
    case 'ending':
      return card.category === 'rune';
    default:
      return false;
  }
}
