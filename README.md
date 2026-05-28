# Gölgeli Sona Bir Adım

A multiplayer storytelling card game based on Kadim Türkler (Ancient Turkish)
mythology. Players gather in a room (shared code, separate devices), draw cards
from a 65-card deck, and take turns building a story through a fixed sequence:
**Time → Place → Creator → Event → Event → Hero → Ending**.

Built with Next.js 16 / React 19. Realtime sync is in-process Server-Sent
Events with an in-memory room store — no external services required.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, create a room, share the 5-character code with up
to 3 other players on their own devices (same network or behind a tunnel).

## Game flow

- **Lobby** — host picks *Niyet* (Intent: *Strateji* / *Uzlaşma*) and *Zorluk*
  (Difficulty: *Kolay* / *Zor*), optionally designates a Skor Tutucu. Up to 4
  players.
- **Playing** — 7-card hands, 3 of each token (*Olay Öyle Olmadı* / *Olay Böyle
  Oldu*), a face-up theme rune. Step hints suggest which card category fits the
  current beat; you can still play anything.
- **Ending** — playing a rune card (or running through the full 7-step
  sequence) ends the game. Winner is determined by *Niyet*:
  *Strateji* — lowest score wins; *Uzlaşma* — highest wins.

## Project layout

```
src/
  app/
    layout.tsx, page.tsx, globals.css, icon.tsx, manifest.ts
    rooms/[code]/page.tsx      # room route
    api/rooms/
      create/route.ts          # POST → returns room code
      [code]/state/route.ts    # GET (SSE) → redacted game state
      [code]/action/route.ts   # POST → mutate game state
  components/                  # LanguageContext, HomePage, RoomClient,
                               # Lobby, GameBoard, Card, EndScreen
  data/cards.json              # 65-card metadata (title, number, category, subtitle)
  lib/
    types.ts                   # shared types
    cards.ts                   # card lookups + step matching
    rooms.ts                   # in-memory room store + SSE pub/sub
    game.ts                    # rules engine
    i18n.ts                    # bilingual strings (TR / EN)
    playerId.ts                # localStorage helpers
public/
  cards/                       # 6.jpg–70.jpg (deck) + back.jpg + splash.jpg
```

## Notes

- Rooms live in process memory and time out after 6 hours of inactivity. State
  does not survive a server restart and does not scale across multiple
  instances.
- Hands are redacted per-player by the SSE stream — the server never sends a
  player another player's hand IDs, only the count.
- The full rulebook (turn-order dice, numbered-card score deductions, rune
  ±10 modifiers, "OYUN ADI" mismatch callout, hand-discard penalty on
  interrupt) is not yet enforced end-to-end. The current build covers lobby,
  hand dealing, the 7-step sequence, token spends with score adjustments, and
  winner determination per *Niyet*.
