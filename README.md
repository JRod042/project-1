# Casa Rustico

**Pocket HQ for running the house** — reservations, floor, kitchen, staff, stock, guests, and close.

> Product replan in progress. Omni (personal operator / OpenClaw) is the prior app in this repo; it is being replaced. Pin these docs:

| Doc | Purpose |
|-----|---------|
| **[docs/NORTH_STAR.md](docs/NORTH_STAR.md)** | What Casa Rustico is |
| **[docs/CASA_RUSTICO_REPLAN.md](docs/CASA_RUSTICO_REPLAN.md)** | Modules, phases, stack, open decisions |
| **[docs/REPO_DECISION.md](docs/REPO_DECISION.md)** | Keep vs scrap from Omni |

## Target shape

```
iPad / iPhone (Expo → TestFlight)
    │
    ├─ Today · Book · Floor · House · More
    │
    └─ Business API (Postgres)  ± optional house assistant
```

## Current code state

| Area | Status |
|------|--------|
| `mobile/` | Still ships **Omni** HUD / OpenClaw launcher on TestFlight |
| `openclaw/` + `server/` | Legacy operator stack — freeze; optional assistant later |
| Docs | **Casa Rustico north star** (this replan) |

Ship path for iOS remains EAS → TestFlight (`mobile/IOS.md`) until the rebranded shell lands.

## Next implementation slice (after decisions)

1. Confirm open decisions in the replan (§7)  
2. Rebrand Expo shell + tab navigation + Today hero  
3. Mock data TestFlight → then Supabase schema + Book/Menu  

Do not skin the Omni chat terminal as a restaurant app.
