# Omni audit (pointer)

Canonical live checklist: **[../AUDIT.md](../AUDIT.md)**

That document reflects the merged P0–P2 hardening (auth, shell policy, approvals, rate limits, tests, mobile cancel/sessions/SSE, streaming, deploy docs).

Historical scorecard / pre-fix findings from the Grok integration pass are preserved below for context.

---

# Omni audit — 2026-08-02 (historical)

## What this is
**Omni** is a Jarvis-class personal agent:
- `mobile/` Expo iOS app (terminal-style control surface)
- `server/` Hono agent runtime with tool use + SSE streaming

## Pre-fix critical findings (addressed on `main`)
1. Unauthenticated agent server → `OMNI_SERVER_TOKEN`
2. Multi-tool approval gap → `pendingToolQueue`
3. In-memory sessions only → disk under `workspace/.omni/sessions`
4. Unrestricted shell → blocklist + `OMNI_SHELL_MODE` + scrubbed env
5. No cancel on mobile → STOP / AbortController
6. No Dockerfile / tunnel guide → `server/DEPLOY.md`

Do **not** merge open PR **#2** (Revert Omni merge).

## North star
See [NORTH_STAR.md](NORTH_STAR.md) — pocket operator terminal, not a generic chatbot.
