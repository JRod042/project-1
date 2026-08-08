# Casa Rustico

**Pocket HQ for running the house** — on iPhone/iPad only.  
**No Linux computer. No Mac. No home server.**

| Doc | Purpose |
|-----|---------|
| **[docs/NORTH_STAR.md](docs/NORTH_STAR.md)** | Product + hard constraints |
| **[docs/CASA_RUSTICO_REPLAN.md](docs/CASA_RUSTICO_REPLAN.md)** | Full system replan |
| **[docs/REPO_DECISION.md](docs/REPO_DECISION.md)** | Cloud stack; why OpenClaw is out |

## System (only this)

```
iPhone / iPad  ──HTTPS──▶  Supabase cloud (auth + Postgres + realtime)
       │
       └── builds via Expo EAS → TestFlight
```

| Not part of the product | Why |
|-------------------------|-----|
| OpenClaw / Docker / `:18789` | Needs a host we no longer have |
| Omni `server/` / `:8787` | Same |
| LAN IP, Tailscale, “leave PC on” | Broken without the Linux box |

## Repo status

| Area | Status |
|------|--------|
| Docs | Cloud-only Casa Rustico |
| `mobile/` | Welcome + Today/Book/Floor/House/More with **mock data** |
| `archive/legacy-omni-mobile/` | Old Omni HUD (not compiled) |
| `openclaw/`, `server/` | Legacy host stacks — not required to run the app |

Welcome motion studied from [Appllama/top-welcome-screens](https://github.com/Appllama/top-welcome-screens) (**GPL — patterns only, no code copied**). See `docs/WELCOME_REFERENCE.md`.

## Ship path

EAS → TestFlight (`mobile/IOS.md`). Display name **Casa Rustico**; bundle still `com.jrod042.omni` until a new ASC listing is chosen.

## Next

1. Supabase schema + auth  
2. Wire Book/Menu to cloud  
3. Real house photography on Today hero  
