# Prompt 01 — Security + agent hardening (server first)

Copy everything below the line into Cursor (Agent mode) on repo `JRod042/project-1`.

---

@00_CONTEXT_AND_RULES.md (or open that file first)

You are continuing the Omni audit. Implement **server-side hardening** before any feature work.

## Goals

1. **Auth gate** — Optional but recommended `OMNI_SERVER_TOKEN` (or `SERVER_TOKEN`): all mutating routes (`/chat`, tool approve/deny, admin) require `Authorization: Bearer …` or equivalent header the mobile app already can store in SYS.
2. **Multi-tool approval** — If the model emits multiple `tool_calls` and one needs approval, **queue the rest** on the session (`pendingToolQueue`). On approve, run the approved tool then continue the queue / agent loop. Never leave orphaned OpenAI-style tool_calls without tool results.
3. **Session persistence** — Persist sessions under `.omni/sessions/` (JSON) so restarts don’t wipe context; load on start; prune old sessions safely.
4. **Shell tool safety** — Block obvious dangerous patterns (e.g. `rm -rf /`, fork bombs, writing outside workspace if sandbox root is set). Prefer `cwd` = workspace root. Capture stdout/stderr with size limits and timeouts.
5. **Gemini / multi-provider tool protocol** — Ensure tool results are sent in the shape each provider expects (Gemini functionResponse vs OpenAI tool role messages). No “tool result as plain user text” regressions.
6. **SSE robustness** — Client-disconnect cancels work; errors stream as structured events; no unhandled promise rejections killing the process.
7. **Health** — `/health` returns ok + version; no secrets leaked.

## Files to prioritize

- `server/src/agent.ts`
- `server/src/tools.ts`
- `server/src/llm.ts`
- `server/src/index.ts`
- `server/.env.example` (document `OMNI_SERVER_TOKEN`, keys, port)
- `mobile/src/lib/api.ts` + `SettingsSheet` if token header needed

## Verification

- `cd server && npx tsc --noEmit` (or project script)
- Manual mental walkthrough: user asks for two tools, first needs approval → only one approval UI → continue.
- Update `README.md` short “Security” section.

## Out of scope

- UI redesign, new tools (calls/SMS/email integrations) — later prompts.
- Expo credentials (document only if you touch mobile settings for token).

Deliver a concise PR-style summary when done.

