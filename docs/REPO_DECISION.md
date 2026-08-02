# Repository decision — what should Omni be built on?

Checked via Cursor cloud agents + GitHub (2026-08-02).

## What we’re building

From prior Omni sessions: **Grok/Antigravity-class operator on iPhone/iPad** — tools, approvals, live timeline — shippable via **EAS → TestFlight with no Mac**.

## Candidates

| Repo | Fit | Blocker for Jorge’s constraints |
|------|-----|----------------------------------|
| `JRod042/project-1` (Omni custom) | Expo + Hono SSE already on TestFlight | Reimplements gateway/tools/channels poorly vs mature stacks |
| [openclaw/openclaw](https://github.com/openclaw/openclaw) (~385k★) | Jarvis-class self-hosted assistant; Linux VPS; Control UI; Telegram; Grok | Native iOS app needs Xcode — **bypass via Control UI + Telegram + Expo launcher** |
| [zfifteen/handrail](https://github.com/zfifteen/handrail) | iPhone supervisor for Grok Build | **Requires Mac** |
| [Pedroshakoor/grok-build-ios](https://github.com/Pedroshakoor/grok-build-ios) | Official-ish Grok pager UI | **Requires Mac + Xcode** |
| [daniel-farina/grok-remote](https://github.com/daniel-farina/grok-remote) | ACP web UI / PWA | Host still runs Grok CLI on a workstation |

## Decision

**Primary runtime = OpenClaw Gateway** (official Docker/npm), documented under `openclaw/`.

**Keep** Expo `mobile/` as the TestFlight brand shell + Control UI launcher.  
**Keep** `server/` as **legacy** Omni SSE for offline/dev continuity — not the north-star brain.

## Implementation in this PR

- `openclaw/docker-compose.yml` + `up.sh` using `openclaw/openclaw:latest`
- Docs + north-star update
- Mobile SYS: Runtime OpenClaw | Legacy Omni
