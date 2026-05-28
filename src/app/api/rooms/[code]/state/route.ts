import { getRoomState, redactForPlayer, subscribe } from '@/lib/rooms';
import { markDisconnect } from '@/lib/game';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const url = new URL(req.url);
  const playerId = url.searchParams.get('playerId');
  const room = getRoomState(code);
  if (!room) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // closed
        }
      };

      const initial = getRoomState(code);
      if (initial) send(redactForPlayer(initial, playerId));

      cleanup = subscribe(code, (state) => {
        send(redactForPlayer(state, playerId));
      });

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // ignore
        }
      }, 20000);

      const onAbort = () => {
        try {
          if (cleanup) cleanup();
          if (heartbeat) clearInterval(heartbeat);
          if (playerId) markDisconnect(code, playerId);
          controller.close();
        } catch {
          // ignore
        }
      };
      req.signal.addEventListener('abort', onAbort);
    },
    cancel() {
      if (cleanup) cleanup();
      if (heartbeat) clearInterval(heartbeat);
      if (playerId) markDisconnect(code, playerId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
