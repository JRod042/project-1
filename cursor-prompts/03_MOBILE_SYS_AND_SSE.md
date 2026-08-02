# Prompt 03 — iPhone control surface: SYS, SSE, reliability

---

@00_CONTEXT_AND_RULES.md

Harden the **Expo mobile app** as the operator UI so iPhone users never get stuck after TestFlight install.

## Requirements

1. **SYS sheet**
   - Server base URL (normalize: trim, strip trailing slash)
   - Optional auth token (SecureStore)
   - Provider + model defaults (`xai` / `grok-4.5`)
   - **TEST LINK** button → hits `/health` (and reports latency / error clearly)
   - Show last successful connection time

2. **SSE chat client** (`mobile/src/lib/api.ts`)
   - Correct Accept headers for SSE
   - Handle partial chunks / multi-event buffers
   - On disconnect mid-stream: surface status line, allow retry
   - Send Bearer token if configured
   - Timeouts and user-cancel (AbortController)

3. **Approval bar**
   - Clear tool name + args summary
   - Approve / Deny
   - Works when server sends multi-tool queue resume events

4. **Terminal UX**
   - Distinct line kinds: user, assistant, tool, status, error
   - Auto-scroll without fighting user scroll-up
   - Safe area / keyboard avoiding on **iPhone** notches and home indicator

5. **First-run**
   - Empty state: “Set SYS server URL, start agent server, TEST LINK”
   - Deep link scheme `omni://` left intact if present

6. **iOS permissions copy**
   - Keep local network usage string accurate
   - Don’t request mic/camera/contacts yet unless implementing real call/SMS later

## Verification

- Typecheck mobile if configured
- Reason about iPhone SE + Pro Max layouts
- No secrets logged to Metro

