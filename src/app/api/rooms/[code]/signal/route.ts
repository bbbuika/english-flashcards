import { NextResponse } from 'next/server';
import { pullSignals, pushSignal } from '@/lib/signal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const url = new URL(req.url);
  const playerId = url.searchParams.get('playerId') ?? '';
  const since = parseInt(url.searchParams.get('since') ?? '0', 10);
  return NextResponse.json(pullSignals(code, playerId, since));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.from || !body?.to || !body?.kind || !body?.data) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  pushSignal(code, body);
  return NextResponse.json({ ok: true });
}
