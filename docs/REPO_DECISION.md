# Repository decision — cloud-only Casa Rustico

Supersedes Omni, OpenClaw, and any self-hosted Linux runtime.

## Constraint that drives everything

**No Linux computer. No Mac.**  
Product must run on **iPhone/iPad + cloud services + EAS**.

## What we’re building

**Casa Rustico** — hospitality business HQ (Today, Book, Floor, House, More).  
See **[NORTH_STAR.md](./NORTH_STAR.md)** and **[CASA_RUSTICO_REPLAN.md](./CASA_RUSTICO_REPLAN.md)**.

## Stack decision

| Layer | Choice | Why |
|-------|--------|-----|
| Client | Expo app on TestFlight | Already shipping without a Mac |
| Build | EAS Build + Submit | Cloud CI; no Xcode machine |
| Data / auth / realtime | **Supabase cloud** (default) | Hosted Postgres; no home server; free tier to start |
| Secrets | Expo env / Supabase dashboard / EAS secrets | Never git; never a `.env` on a PC Jorge lost |
| Assistant (P2+) | Supabase Edge Function → xAI/OpenAI API | Cloud-only; **not** OpenClaw |
| Payments (P2+) | Stripe / Square cloud APIs | No local POS bridge required for v1 |

## Rejected (because they need a Linux host)

| Old path | Status |
|----------|--------|
| `openclaw/` Docker gateway | **Delete from product path** — cannot run without a host |
| `server/` Omni SSE agent | **Delete from product path** — same |
| SYS “server URL / gateway token” | **Remove** from app UX |
| Tailscale / LAN IP docs | **Remove** as primary setup |

Keep those folders in git history only until Phase 0 deletes or moves them to `archive/legacy-omni/` — they must not appear in README setup.

## What we keep from Omni era

| Keep | Why |
|------|-----|
| `mobile/` Expo + EAS wiring | Only ship path without Mac/Linux |
| Apple team / ASC / Expo project | Rebrand or new listing TBD |
| No secrets in git | Still law |
| Typecheck discipline | Still law |

## Success test for any proposal

If a feature requires Jorge to “run something on a computer at home or a VPS he SSHs into daily,” **reject it** and redesign for hosted cloud.
