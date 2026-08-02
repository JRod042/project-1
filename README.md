# Omni

**Jarvis for your iPad/iPhone — an agent that actually runs tools.**

```
┌──────────────┐      SSE       ┌────────────────┐  tools  ┌───────────┐
│ Omni iOS app │ ─────────────▶ │ Omni agent     │ ──────▶ │ Workspace │
│ (TestFlight) │                │ server         │         │ + web     │
└──────────────┘                └────────────────┘         └───────────┘
```

| Item | Value |
|------|-------|
| App | **Omni** |
| Bundle ID | `com.jrod042.omni` |
| Expo | `@jrod42/omni` |
| Min iOS | 16.4 |
| Install path | EAS → **TestFlight** (no Mac required) |

## iPad / TestFlight

Full steps: **[mobile/IOS.md](mobile/IOS.md)**

Short version:

1. Expo → Credentials → iOS → App Store for `com.jrod042.omni`
2. GitHub base directory = `mobile`
3. Builds → Build from GitHub → `main` → iOS → `production`
4. Submit → TestFlight → install on iPad
5. Run `server/` somewhere and set **SYS** server URL in the app

## Agent server

```bash
cd server
cp .env.example .env   # add XAI_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY
npm install
npm start              # http://0.0.0.0:8787
```

Optional hardening (see **[AUDIT.md](AUDIT.md)**): set `OMNI_SERVER_TOKEN`, keep `OMNI_SHELL_MODE=strict`, run `npm test`.

Deploy / tunnel / Docker: **[server/DEPLOY.md](server/DEPLOY.md)**

## Repo layout

| Path | Role |
|------|------|
| `mobile/` | Expo app (EAS prebuilds iOS) |
| `server/` | Tool-using agent runtime (SSE) |
| `.github/workflows/ios-testflight.yml` | Optional one-tap TestFlight build |

## License

MIT (see `mobile/LICENSE`).
