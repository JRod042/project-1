# Grok integration branch

Opened after GitHub connector **write access** was confirmed.

## Contents

- `server/src/*` — token auth, disk sessions, multi-tool approval queue, safer tools, LLM tool protocol
- `mobile/` SYS/SSE/token hardening
- `cursor-prompts/` — sequential Cursor prompts for pocket-terminal Omni
- `docs/AUDIT.md`, `docs/NORTH_STAR.md`

## North star

**Omni = Grok / Antigravity-class agent terminal on iPhone** (not a generic chatbot).

## After merge

1. Expo credentials for `com.jrod042.omni`
2. Bump `ios.buildNumber` if needed
3. EAS: base dir `mobile` · iOS · production → TestFlight
4. SYS → server URL + `OMNI_SERVER_TOKEN` → TEST LINK

Safe to delete probe branch `grok/connector-write-probe`.
