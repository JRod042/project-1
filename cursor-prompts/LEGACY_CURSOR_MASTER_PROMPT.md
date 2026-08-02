# Master prompt — Omni (Jarvis-class agent) · for Grok in Cursor

Copy everything below the line into Cursor (Grok) as the task brief.

---

You are Grok working inside the **Omni** monorepo (`JRod042/project-1`).

## Mission
Turn Omni into a reliable, shippable **Jarvis-class personal operator**:
- iOS control surface (`mobile/` Expo app, bundle `com.jrod042.omni`)
- Tool-using agent server (`server/` Hono + SSE on port 8787)

Prioritize **correctness, security, and TestFlight shippability** over speculative features.

## Architecture (do not fight it)
```
iOS Omni app  --SSE /chat-->  omni-server  --tools-->  WORKSPACE_ROOT + web
```
- Providers: xAI (default `grok-4.5`), OpenAI, Gemini via `server/src/llm.ts`
- Tools: `server/src/tools.ts` (files, shell, web_fetch/search, remember/recall, mission_plan)
- Agent loop: `server/src/agent.ts` (multi-round tools, approval queue)
- Mobile timeline UI: `mobile/App.tsx` + components

## Non-negotiables
1. Never commit secrets (`.env`, keys, `.p8`, provisioning profiles).
2. Keep `OMNI_SERVER_TOKEN` support; do not remove auth.
3. Approval required for shell + file writes unless user enables auto-approve.
4. Path tools must stay inside `WORKSPACE_ROOT` (`resolveSafe`).
5. Typecheck must pass: `npm run typecheck` from repo root (server + mobile).
6. Do not reintroduce `expo-dev-client` for production store builds.
7. Do not re-enable EAS `autoIncrement` with `app.config.js` (unsupported).
8. Close/ignore open PR **#2** “Revert Omni merge” — never merge it.
9. iOS min 16.4, bundle id `com.jrod042.omni`, owner `jrod42`.

## Current known state (post audit hardening)
Already done:
- Server token auth, session disk persistence, multi-tool approval queue
- Shell blocklist, Gemini function calling fix, security README notes
- Privacy manifest aggregation disabled (pod crash fix)
- TestFlight docs in `mobile/IOS.md`

## Work queue (execute in order; stop when blocked on Apple/Expo credentials)

### P0 — verify + harden
1. Run server typecheck; fix any regressions.
2. Add `server` unit tests for: `resolveSafe`, shell blocklist, approval queue behavior (mock LLM).
3. Add request body size limit + simple rate limit on `/chat`.
4. Add structured audit log file `workspace/.omni/audit.log` for tool executions.
5. Optional but valuable: run shell inside a subprocess with `timeout` and stripped env (no host secrets except PATH).

### P1 — mobile reliability
1. AbortController / cancel button while `busy`.
2. Session drawer: list `/sessions`, resume, delete.
3. Banner when server unreachable / authRequired without token.
4. SSE parser: handle multi-event buffers robustly; surface HTTP 401 clearly.
5. Bump `ios.buildNumber` when shipping a new TestFlight binary.

### P2 — agent quality
1. Token streaming if provider supports it (SSE text deltas).
2. Better web_search (official API or multi-engine fallback).
3. `run_shell` allowlist mode env `OMNI_SHELL_MODE=strict|full`.
4. Cap session message history (summarize older turns) to control cost.

### P3 — Jarvis expansion (only after P0–P1)
1. Voice input (expo-av / speech recognition) + TTS readback.
2. Shortcuts / webhook inbound tool for iOS automations.
3. Proactive scheduler worker (separate process) + APNs later.
4. Dockerfile + `docker compose` for server; Cloudflare Tunnel docs.

## How to implement changes
- Prefer small PRs with clear titles.
- Match existing style: TypeScript strict, ESM `.js` imports in server, Expo RN styles in mobile.
- Update README / IOS.md when user-facing setup changes.
- After edits: `cd server && npm run typecheck` and `cd mobile && npx tsc --noEmit` if feasible.

## Definition of done for a “full fix” pass
- [ ] Server refuses unauthenticated `/chat` when token configured
- [ ] Multi-tool approval never leaves dangling tool_call results
- [ ] Sessions survive server restart
- [ ] Mobile can set token + cancel in-flight runs + resume sessions
- [ ] Basic tests for tools safety
- [ ] No merge of revert PR #2
- [ ] Documented local run + TestFlight path still accurate

## First command
Read `AUDIT.md`, `README.md`, `server/src/agent.ts`, `server/src/tools.ts`, `mobile/App.tsx`, then implement **P0** items with tests.

Start now. Do not ask for confirmation on safe refactors inside the above scope.
