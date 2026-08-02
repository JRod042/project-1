# Omni audit — 2026-08-02

## What this is
**Omni** is a Jarvis-class personal agent:
- `mobile/` Expo iOS app (terminal-style control surface)
- `server/` Hono agent runtime with tool use + SSE streaming

It is a solid **v0.1 operator agent**, not a full “everything” Jarvis (no voice, calendar, computer-use, multi-device sync, or proactive background jobs yet).

## Scorecard

| Area | Grade | Notes |
|------|-------|-------|
| Product vision fit | B | Clear agent loop + mobile UI; “everything app” surface is still thin |
| Agent tool loop | A- | Multi-round tools, approval gate, mission_plan, memory |
| Security | C → B | Token auth + shell blocklist + session persistence landed in hardening PR |
| Mobile UX | B+ | Distinct terminal aesthetic, SYS sheet, approval bar |
| iOS shipping | B | EAS + TestFlight path documented; credentials are operational burden |
| Persistence | B | Sessions + memory now on disk under workspace |
| Provider support | B+ | xAI / OpenAI / Gemini; Gemini function-calling fixed |
| Tests | F | No unit/e2e tests |
| Deploy story | C | Local/LAN only; no Dockerfile / tunnel guide |

## Deficiencies found (pre-fix)

### Critical
1. **Unauthenticated agent server** — anyone on the network could run `run_shell` / write files if the port was reachable.
2. **Multi-tool approval bug** — pausing mid-tool-list left other `tool_calls` without results → next LLM turn could break.
3. **In-memory sessions only** — restart wiped mission context.
4. **Gemini tool protocol incomplete** — tool results sent as plain text; model functionCall turns not reconstructed.

### High
5. Unrestricted shell (host privileges; only cwd=workspace).
6. Health endpoint leaked absolute `workspaceRoot`.
7. No request validation beyond zod chat body (no size caps).
8. Open PR **#2** “Revert Omni merge” is dangerous if merged.
9. Auto-approve + API keys on device increase blast radius.
10. No cancel/abort for in-flight chat on mobile.

### Medium / product gaps for “Jarvis everything”
11. No voice STT/TTS or wake word.
12. No push / proactive schedules.
13. No integrations (calendar, mail, SMS, HomeKit, shortcuts).
14. No session list / resume UI on mobile (API exists).
15. No streaming tokens (full completion chunks only).
16. DuckDuckGo HTML search is brittle.
17. No Docker / Fly / Railway deploy template.
18. No automated tests or CI for server typecheck.
19. Root license only under `mobile/LICENSE`.
20. Public repo + shell agent = easy footgun if token unset.

## Fixes shipped in `audit/security-and-agent-hardening`
- `OMNI_SERVER_TOKEN` auth (`x-omni-token` / Bearer)
- Mobile SYS field for server token (SecureStore)
- Session persistence under `workspace/.omni/sessions`
- Multi-tool approval queue (`pendingToolQueue`)
- Shell blocklist for catastrophic patterns
- Gemini functionCall / functionResponse wiring
- Health response no longer leaks full path; reports `authRequired`
- README security section + `.env.example` updates

## Recommended next milestones
1. **M1 Security** — require token by default in non-dev; optional network allowlist; Docker with non-root user.
2. **M2 Control surface** — session drawer, cancel stream, richer tool cards, offline banner.
3. **M3 Voice** — Whisper STT + TTS for hands-free iPad.
4. **M4 Integrations** — Shortcuts webhook tool, calendar read, email draft.
5. **M5 Proactive** — cron worker + push notifications.
6. **M6 Hardening** — real sandbox for shell (bubblewrap/firejail/Docker exec), audit log, rate limits.

## Cursor
Use `CURSOR_MASTER_PROMPT.md` as the agent system brief for remaining work.
