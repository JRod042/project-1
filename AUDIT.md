# Omni security audit (P0)

Hardening baseline for the Jarvis-class operator.

**Runtime note:** Primary brain is **OpenClaw** (`openclaw/`). Follow [OpenClaw security](https://docs.openclaw.ai/gateway/security) + keep `OPENCLAW_GATEWAY_TOKEN` private. Below applies to the **legacy** Omni `server/` + mobile SYS.

## Guarantees

| Control | Status |
|---------|--------|
| No secrets in git (`.env` gitignored) | yes |
| `OMNI_SERVER_TOKEN` on protected routes | yes |
| Approval for shell / writes unless auto-approve | yes |
| Multi-tool `pendingToolQueue` | yes |
| Path tools sandboxed to `WORKSPACE_ROOT` | yes |
| Shell blocklist + `OMNI_SHELL_MODE=strict\|full` | yes |
| Shell env scrubbed (API keys / tokens not inherited) | yes |
| Shell timeout capped (default 30s, max 60s) | yes |
| `/chat` body size limit | yes |
| `/chat` rate limit | yes |
| Audit log at `workspace/.omni/audit.log` | yes |
| Sessions persisted under `workspace/.omni/sessions/` | yes |

## Auth

When `OMNI_SERVER_TOKEN` is set, clients must send:

- `Authorization: Bearer <token>`, or
- `x-omni-token: <token>`

`/health` stays public so the app can detect `authRequired`.

## Approvals

Tools flagged `requiresApproval` (`write_file`, `append_file`, `run_shell`) pause the agent and emit `approval_required`. Additional tools from the same model turn are held in `pendingToolQueue` and promoted after each decision.

## Shell

- Always blocked: `rm -rf`, pipe-to-shell, shutdown/reboot, fork bombs, etc.
- Strict (default): also blocks `sudo`, package managers, docker/kubectl, kill, etc.
- Child processes get a minimal env (`PATH`, locale, tmp) — not the server’s API keys.

## Audit

Each tool run appends one JSON line to `WORKSPACE_ROOT/.omni/audit.log` with tool name, ok flag, duration, and truncated arg/output summaries.

## Agent (P2)

| Control | Status |
|---------|--------|
| Token streaming (`text_delta`) for xAI/OpenAI | yes |
| Improved `web_search` (DDG Instant Answer + HTML) | yes |
| `OMNI_SHELL_MODE=strict\|full` | yes (P0) |
| History summarization for long sessions | yes |

## Mobile (P1)

| Control | Status |
|---------|--------|
| Cancel in-flight chat (STOP / AbortController) | yes |
| Session drawer (list / resume / delete) | yes |
| Clear 401 + `authRequired` banner + server token in SYS | yes |
| Robust SSE parser (event/data, chunked, CRLF) | yes |

## Verify

```bash
cd server
npm install
npm run typecheck
npm test

cd ../mobile
npm run typecheck
```
