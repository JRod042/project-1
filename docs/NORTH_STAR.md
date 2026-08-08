# Casa Rustico — North star (pin this)

**Casa Rustico is the pocket HQ for running the house** — reservations, floor, kitchen, staff, stock, guests, and money — in one calm business app.

## One sentence
An all-around **business operations app** for Casa Rustico: owners and staff see today’s service, act on reservations and tickets, manage menu/staff/inventory, and close the day — with an optional house assistant that answers from *your* data, not a generic chatbot.

## Product identity
| Item | Value |
|------|-------|
| Brand | **Casa Rustico** |
| Audience | Owner, managers, floor, kitchen, catering lead |
| Primary device | iPad (service desk / office) + iPhone (on the floor) |
| Feel | Warm hospitality ops — rustic Italian house, not cyber terminal |
| Ship path | Expo → EAS → TestFlight (reuse existing Apple/Expo plumbing) |

## Feel
- Open app → **Today** for this house (covers, reservations, open tickets, staff on), not a blank chat
- One job per screen; brand is hero-level on first paint
- Tools and numbers are first-class; AI is a helper, never the home screen
- Personality: warm, clear, no-nonsense — like a good maître d’

## Architecture (target)
```
Casa Rustico iOS (Expo)
    │
    ├─ Business API (auth, CRUD, realtime) ──▶ Postgres / workspace DB
    │
    └─ optional House Assistant (OpenClaw or thin LLM)
            └─ tools scoped to Casa Rustico data only
```

Legacy Omni terminal + raw OpenClaw launcher are **sunset** for this product. Reuse EAS, SecureStore patterns, and any agent tooling only where it serves the house.

## When choosing UX
Prefer: Today board, reservation list, ticket rail, menu/staff editors, daily close.
Avoid: operator HUD, scanline cyber chrome, dashboard tile soup, “AI companion” as the product.

## Shipping
TestFlight remains the install path. Bundle / ASC identity will be rebranded (see replan). Detailed modules and phases: **[CASA_RUSTICO_REPLAN.md](./CASA_RUSTICO_REPLAN.md)**.
