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
| Docs | **Cloud-only Casa Rustico** (source of truth) |
| `mobile/` | Still contains legacy Omni UI — being replaced |
| `openclaw/`, `server/` | Legacy — archive/delete in Phase 0 |

## Ship path

EAS → TestFlight (`mobile/IOS.md`). Configure cloud keys in EAS secrets — never a machine-local gateway.

## Next build slice

1. Rebranded tabs + Today  
2. Mock data (works with zero backend)  
3. Supabase schema + auth  
4. Remove gateway/SYS uplink UX  
