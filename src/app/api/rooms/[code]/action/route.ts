import { NextResponse } from 'next/server';
import {
  drawCard,
  endGame,
  joinRoom,
  newGameInSameRoom,
  passTurn,
  playCard,
  setNiyet,
  setScorekeeper,
  setZorluk,
  startGame,
  spendDidHappen,
  spendDidntHappen,
} from '@/lib/game';
import { getRoomState, redactForPlayer } from '@/lib/rooms';
import type { Niyet, Zorluk } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Action =
  | { type: 'join'; name: string; playerId: string }
  | { type: 'set_niyet'; playerId: string; niyet: Niyet }
  | { type: 'set_zorluk'; playerId: string; zorluk: Zorluk }
  | { type: 'set_scorekeeper'; playerId: string; targetId: string }
  | { type: 'start_game'; playerId: string }
  | { type: 'draw_card'; playerId: string; pile?: 'main' | 'rune' }
  | { type: 'play_card'; playerId: string; cardId: string }
  | { type: 'pass_turn'; playerId: string }
  | { type: 'didnt_happen'; playerId: string; targetId: string }
  | { type: 'did_happen'; playerId: string; targetId: string }
  | { type: 'end_game'; playerId: string }
  | { type: 'new_game'; playerId: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const action = (await req.json().catch(() => null)) as Action | null;
  if (!action || !action.type) {
    return NextResponse.json({ error: 'bad_action' }, { status: 400 });
  }

  let result: unknown;
  switch (action.type) {
    case 'join':
      result = joinRoom(code, action.name, action.playerId);
      break;
    case 'set_niyet':
      result = setNiyet(code, action.playerId, action.niyet);
      break;
    case 'set_zorluk':
      result = setZorluk(code, action.playerId, action.zorluk);
      break;
    case 'set_scorekeeper':
      result = setScorekeeper(code, action.playerId, action.targetId);
      break;
    case 'start_game':
      result = startGame(code, action.playerId);
      break;
    case 'draw_card':
      result = drawCard(code, action.playerId, action.pile ?? 'main');
      break;
    case 'play_card':
      result = playCard(code, action.playerId, action.cardId);
      break;
    case 'pass_turn':
      result = passTurn(code, action.playerId);
      break;
    case 'didnt_happen':
      result = spendDidntHappen(code, action.playerId, action.targetId);
      break;
    case 'did_happen':
      result = spendDidHappen(code, action.playerId, action.targetId);
      break;
    case 'end_game':
      result = endGame(code, action.playerId);
      break;
    case 'new_game':
      result = newGameInSameRoom(code, action.playerId);
      break;
    default:
      return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  }

  if (result && typeof result === 'object' && 'error' in result) {
    return NextResponse.json(result, { status: 400 });
  }

  const state = getRoomState(code);
  if (!state) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const playerId = 'playerId' in action ? action.playerId : null;
  return NextResponse.json({ state: redactForPlayer(state, playerId) });
}
