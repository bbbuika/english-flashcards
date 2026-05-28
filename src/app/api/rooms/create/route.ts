import { NextResponse } from 'next/server';
import { createNewRoom } from '@/lib/game';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; playerId?: string };
  const name = (body.name ?? '').trim();
  const playerId = (body.playerId ?? '').trim();
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });
  if (!playerId) return NextResponse.json({ error: 'player_id_required' }, { status: 400 });
  const state = createNewRoom(name, playerId);
  return NextResponse.json({ code: state.code });
}
