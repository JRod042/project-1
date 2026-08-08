# Repository decision — Casa Rustico pivot

Supersedes the Omni / OpenClaw “personal operator” decision for this product line.

## What we’re building now

**Casa Rustico** — an all-around hospitality business app (Today, reservations, floor/tickets, menu, staff, inventory, events, close).  
See **[NORTH_STAR.md](./NORTH_STAR.md)** and **[CASA_RUSTICO_REPLAN.md](./CASA_RUSTICO_REPLAN.md)**.

## What we keep from Omni

| Keep | Why |
|------|-----|
| Expo `mobile/` + EAS → TestFlight | Already shipping to Jorge’s devices without a Mac |
| Apple / Expo account wiring | `eas.json`, ASC app id, team id — rebrand or new listing TBD |
| SecureStore / settings hygiene | No secrets in git |
| Typecheck + small pure tests | Discipline |

## What we stop optimizing for

| Stop | Why |
|------|-----|
| OpenClaw as primary product surface | Wrong job-to-be-done for a restaurant HQ |
| Custom Omni SSE agent growth | Freeze `server/` agent loop |
| Cyber operator HUD | Brand is hospitality, not terminal |

## New stack lean

| Layer | Choice |
|-------|--------|
| Client | Expo + React Navigation (tabs) |
| Data | Supabase (Postgres + Auth + Realtime) — default; swappable |
| Assistant | Optional later; data-scoped tools only |
| POS / pay | Integration lane in P2, not MVP |

## Omni / OpenClaw artifacts

Remain in-tree temporarily for reference / optional assistant experiments. They are **not** the Casa Rustico north star. Primary docs and README should describe Casa Rustico only after Phase 0 lands.
