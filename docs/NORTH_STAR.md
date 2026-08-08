# Casa Rustico — North star (pin this)

**Casa Rustico is the pocket HQ for running the house** — reservations, floor, kitchen, staff, stock, guests, and money — in one calm business app.

## Hard constraint (non‑negotiable)

**There is no Linux computer and no Mac.**

| Device | Role |
|--------|------|
| iPhone / iPad | **Only** runtime Jorge operates |
| Expo cloud (EAS) | Builds + TestFlight submit |
| Hosted cloud backend | All data, auth, realtime (no home server) |

Anything that required a LAN IP, Tailscale, Docker, OpenClaw Gateway, Omni `:8787`, or “leave a PC on” is **out of the product**.

## One sentence
An all-around **cloud business operations app** for Casa Rustico: owners and staff work from iPad/iPhone against a hosted database — no self-hosted agent box.

## Product identity
| Item | Value |
|------|-------|
| Brand | **Casa Rustico** |
| Audience | Owner, managers, floor, kitchen, catering lead |
| Primary device | iPad (desk) + iPhone (floor) |
| Feel | Warm hospitality ops — rustic Italian house, not cyber terminal |
| Ship path | Expo → EAS → TestFlight only |
| Backend | **Hosted** Postgres + Auth + Realtime (Supabase cloud default) |

## Feel
- Open app → **Today** (covers, arrivals, tickets, staff on) — never a chat/gateway console
- Sign in with cloud account / staff PIN — never paste a gateway URL
- Works on cellular / restaurant Wi‑Fi with zero home infrastructure
- AI (if any) is a cloud edge helper over *Casa Rustico data* — never a self-hosted OpenClaw box

## Architecture (only allowed shape)
```
iPhone / iPad (Expo → TestFlight)
        │  HTTPS
        ▼
Hosted backend (Supabase cloud)
  · Auth + roles
  · Postgres business data
  · Realtime (tickets / 86 / book)
        │
        ▼ optional later
Cloud Edge Function + LLM API
  (house assistant — no Linux host)
```

## Explicitly forbidden
- OpenClaw Gateway / Docker / `:18789`
- Legacy Omni Hono server / `:8787`
- “Set LAN IP in SYS”, Tailscale, localhost, leave-PC-on
- Self-hosted VPS that Jorge must SSH/admin from a Linux box as day‑one dependency

## When choosing UX
Prefer: Today, Book, Floor, House, daily close.  
Avoid: operator HUD, SYS gateway screens, uplink bars to home servers, “AI companion” as home.

## Shipping
TestFlight only. Details: **[CASA_RUSTICO_REPLAN.md](./CASA_RUSTICO_REPLAN.md)**.
