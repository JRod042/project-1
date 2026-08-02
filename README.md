# Omni

**Jarvis for your iPad/iPhone — powered by [OpenClaw](https://github.com/openclaw/openclaw).**

```
┌──────────────┐   Control UI / Telegram   ┌────────────────┐  tools  ┌───────────┐
│ Omni iOS app │ ─────────────────────────▶ │ OpenClaw       │ ──────▶ │ Workspace │
│ (TestFlight) │                            │ Gateway :18789 │         │ + channels│
└──────────────┘                            └────────────────┘         └───────────┘
```

| Item | Value |
|------|-------|
| App | **Omni** |
| Bundle ID | `com.jrod042.omni` |
| Expo | `@jrod42/omni` |
| Agent runtime | **OpenClaw** (primary) · legacy Omni `server/` optional |
| Min iOS | 16.4 |
| Install path | EAS → **TestFlight** (no Mac required) |

## Why OpenClaw?

We audited Cursor history + open-source options. For a personal operator that *acts*, **OpenClaw is the better repository** than growing a custom Hono agent. See **[docs/REPO_DECISION.md](docs/REPO_DECISION.md)**.

## 1) Run the agent (OpenClaw)

```bash
cd openclaw
cp .env.example .env   # add XAI_API_KEY (or OpenAI/Anthropic/Gemini)
./up.sh                # Docker → http://HOST:18789
```

Full notes: **[openclaw/README.md](openclaw/README.md)**

Fastest phone path without rebuilding the app: add **Telegram** to the gateway (instructions in that README).

## 2) iPad / TestFlight

Full steps: **[mobile/IOS.md](mobile/IOS.md)**

Short version:

1. Expo → Credentials → iOS → App Store for `com.jrod042.omni`
2. GitHub base directory = `mobile`
3. Builds → Build from GitHub → `main` → iOS → `production`
4. Submit → TestFlight → install on iPad
5. In app **SYS** → Runtime **OpenClaw** → Control UI URL + gateway token → **OPEN CONTROL UI**

## Legacy Omni server (optional)

The original SSE agent remains under `server/` for local experiments:

```bash
cd server
cp .env.example .env
npm install && npm start   # http://0.0.0.0:8787
```

In the app, set Runtime → **Legacy Omni** and point at `:8787`.

## Repo layout

| Path | Role |
|------|------|
| `openclaw/` | **Primary** OpenClaw Gateway (Docker) |
| `mobile/` | Expo app (EAS prebuilds iOS) |
| `server/` | Legacy Omni SSE agent |
| `docs/` | North star + repo decision |
| `cursor-prompts/` | Sequential Cursor follow-up prompts |

## North star & prompts

- Product intent: **[docs/NORTH_STAR.md](docs/NORTH_STAR.md)**
- Repo choice: **[docs/REPO_DECISION.md](docs/REPO_DECISION.md)**
- Security checklist: **[AUDIT.md](AUDIT.md)** (legacy server hardening)
- Cursor prompt pack: **[cursor-prompts/](cursor-prompts/)**

## License

MIT (see `mobile/LICENSE`). OpenClaw is MIT (OpenClaw Foundation).
