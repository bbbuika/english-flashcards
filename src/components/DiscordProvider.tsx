'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

type DiscordCtx = {
  isInDiscord: boolean;
  user: DiscordUser | null;
  channelId: string | null;
  guildId: string | null;
  ready: boolean;
};

const Ctx = createContext<DiscordCtx>({
  isInDiscord: false,
  user: null,
  channelId: null,
  guildId: null,
  ready: false,
});

export function useDiscord() {
  return useContext(Ctx);
}

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<DiscordCtx>({
    isInDiscord: false,
    user: null,
    channelId: null,
    guildId: null,
    ready: false,
  });

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    // Only init if configured and we appear to be in an iframe
    if (!clientId || window.self === window.top) {
      setCtx((c) => ({ ...c, ready: true }));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { DiscordSDK, RPCCloseCodes } = await import('@discord/embedded-app-sdk');
        void RPCCloseCodes; // imported for side-effects (type narrowing in SDK)
        const sdk = new DiscordSDK(clientId);
        await sdk.ready();
        if (cancelled) return;

        const { code } = await sdk.commands.authorize({
          client_id: clientId,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify'],
        });

        const tokenRes = await fetch('/api/discord/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const { access_token } = (await tokenRes.json()) as { access_token?: string };
        if (!access_token || cancelled) return;

        const auth = await sdk.commands.authenticate({ access_token });
        if (cancelled) return;

        setCtx({
          isInDiscord: true,
          user: auth.user
            ? {
                id: auth.user.id,
                username: auth.user.username,
                global_name: (auth.user as unknown as { global_name?: string }).global_name ?? null,
                avatar: auth.user.avatar ?? null,
              }
            : null,
          channelId: sdk.channelId,
          guildId: sdk.guildId,
          ready: true,
        });
      } catch {
        if (!cancelled) setCtx((c) => ({ ...c, isInDiscord: false, ready: true }));
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}
