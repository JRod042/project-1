# Casa Rustico — Agent context (always-on)

**Product:** Casa Rustico — pocket HQ for running the house (reservations, floor, kitchen, staff, stock, guests, money).

## Hard constraints (non-negotiable)

- **No Linux computer and no Mac as runtime.**
- iPhone / iPad is the only device Jorge operates.
- Builds and submits via Expo Application Services (EAS) + TestFlight only.
- Backend must be hosted cloud (Supabase default). No self-hosted agent box, no OpenClaw Gateway, no LAN/Tailscale dependency, no “leave a PC on”.
- Current Phase 0 ships with local mock data so TestFlight works with zero backend.

## What the app is

| Casa Rustico is | Casa Rustico is NOT |
|-----------------|---------------------|
| Cloud business operations app for the house | Omni / Grok-style terminal agent |
| Today / Book / Floor / House / More | SYS gateway console or uplink bar |
| Warm hospitality ops (rustic Italian house) | Cyber terminal / agent HUD |
| Works offline with mocks → then Supabase | Requires a home server or Docker |

## Architecture (only allowed shape)

```
iPhone / iPad (Expo → TestFlight)
        │  HTTPS
        ▼
Hosted backend (Supabase cloud)
  · Auth + roles
  · Postgres business data
  · Realtime (tickets / 86 / book)
```

Optional later: Edge Function + LLM over Casa data. Never a process on a PC.

## Engineering rules

1. Never break Expo iOS production path (`app.config.js`, `eas.json`, plugins, string `buildNumber`).
2. Prefer small, reviewable changes.
3. Do not revive OpenClaw, legacy Omni server, SYS screens, or LAN connection UX.
4. Mock data is intentional until Supabase is wired.
5. After native-config changes: document the next TestFlight rebuild.

## Primary docs

- `docs/NORTH_STAR.md`
- `docs/CASA_RUSTICO_REPLAN.md`
- `mobile/IOS.md`
