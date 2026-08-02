# Prompt 08 — Integrate Grok-uploaded artifacts into project-1

Use this **after you upload** files from Grok Build into `JRod042/project-1`.
Paste everything below the line into Cursor Agent.

---

## Who you are

You are integrating **reference artifacts from Grok** into the real Omni monorepo.

North star: **Omni is Grok/Antigravity-class agent-in-a-terminal, on iPhone** — streaming tool timeline + server backend. When merging web demo UIs, extract agent/tool ideas into `server/` + terminal lines on `mobile/`; do not turn the iPhone app into a multi-tab dashboard unless it still feels like a terminal operator.

Canonical product layout (authoritative):

```
project-1/
  mobile/          # Expo iOS — com.jrod042.omni  → TestFlight
  server/          # Hono agent SSE :8787
  .github/         # optional EAS workflow
  README.md
  package.json     # optional workspace root
```

Grok may have uploaded any of:

| Upload path (examples) | Treat as |
|------------------------|----------|
| `omni-fixes/server/**` | **Preferred server patches** — merge into `server/` |
| `omni-fixes/mobile/**` | **Preferred mobile patches** — merge into `mobile/` |
| `omni-audit-hardening.patch` | Apply with `git apply` or equivalent if clean |
| `AUDIT.md` / `omni-fixes/AUDIT.md` | Keep as `docs/AUDIT.md` |
| `CURSOR_MASTER_PROMPT.md` / `cursor-prompts/**` | Keep under `cursor-prompts/` for future sessions |
| `artifacts/cursor-prompts/**` | Move to repo-root `cursor-prompts/` |
| `src/**` TanStack/web Omni (`AgentPanel`, zustand store, etc.) | **Optional** → `web/` only if useful; do **NOT** replace `mobile/` |
| `startup.sh`, `vite.config.ts`, Grok app-builder scaffold | **Do not** pollute Expo; ignore or isolate under `web/` |
| `screenshots/**` | Optional docs assets; not required for build |

## Hard rules

1. **Expo iOS path must stay green.** Do not break `mobile/app.config.js`, `eas.json`, bundle `com.jrod042.omni`, `privacyManifestAggregationEnabled: false`, `EXPO_USE_PRECOMPILED_MODULES=0`.
2. **Prefer three-way merge intelligence:** read CURRENT `server/src/*` and `mobile/src/*`, then fold in improvements from `omni-fixes/**`. Never blindly overwrite if the live file is newer/different — merge features.
3. **No secrets** in commits. Merge `.env.example` keys only.
4. If both a full file replacement and a `.patch` exist, prefer **reading omni-fixes files** and merging; use patch only if it applies cleanly to current HEAD.
5. Delete or relocate scaffold junk that would confuse Expo GitHub builds (anything that makes Expo think root is the app). GitHub base directory must remain **`mobile`**.
6. After integration, ensure `server` typechecks and mobile still has valid Expo config.

## Work plan (do in order)

### Step 0 — Inventory

List what was uploaded. Classify each path: `merge-server` | `merge-mobile` | `docs` | `web-optional` | `ignore`.

### Step 1 — Server merge

From `omni-fixes/server/` (if present), integrate into `server/`:

- `src/agent.ts` — multi-tool `pendingToolQueue`, approval resume, cancel
- `src/tools.ts` — sandbox, timeouts, comms stubs if present
- `src/llm.ts` — provider tool protocol fixes
- `src/index.ts` — auth token middleware, health
- `src/sessions.ts` — disk persistence (add if missing)
- `src/types.ts` — shared types
- `.env.example` — `OMNI_SERVER_TOKEN`, keys, comms vars

If upload only has ideas from web Omni (`place_call`, `send_text`, etc. in a zustand demo), **port tool contracts into `server/src/tools.ts`** as simulate-mode tools — do not depend on React/zustand on the server.

### Step 2 — Mobile merge

From `omni-fixes/mobile/`:

- `src/lib/api.ts` — SSE robustness + Authorization header
- `src/lib/storage.ts` — SecureStore token/url
- `src/components/SettingsSheet.tsx` — SYS TEST LINK + token field
- `src/types.ts` — event types

Preserve working UI in `App.tsx` unless fixes require small wiring.

### Step 3 — Docs + prompts

- Move audit → `docs/AUDIT.md`
- Ensure `cursor-prompts/` exists at repo root with sequential prompts (00–08, MEGA)
- Update root `README.md` with: architecture, SYS token, link to `mobile/IOS.md`, link to `cursor-prompts/README.md`
- Do **not** claim web demo is the iPhone app

### Step 4 — Optional web

Only if user wants browser UI:

- Create `web/` and place TanStack/demo Omni there **or** slim static client that talks to `server` SSE
- Add note: Expo GitHub base dir stays `mobile`; web is separate
- If web would require a second package.json at repo root that confuses tooling, use `web/package.json` and document

If user did **not** ask for web in this integrate pass: leave web files under `_grok_upload/web-stash/` or delete with note in summary — **default = stash, don’t delete without saying so**.

### Step 5 — Expo safety pass

- Run mental + CLI: `cd mobile && npx expo config --type public` (if network/local allow)
- Confirm `ios.bundleIdentifier === com.jrod042.omni`
- Confirm `IOS.md` still accurate; add iPhone (not only iPad) wording if missing
- Add/keep `mobile/scripts/preflight-ios.sh` if not present (from prompt 02 intent)

### Step 6 — Cleanup

- `.gitignore`: `.env`, `.omni/`, `node_modules`, upload junk
- Remove duplicate master prompts if redundant (keep `cursor-prompts/` as SSOT)
- Summarize remaining gaps vs full Jarvis (real Twilio etc.)

## Verification checklist

- [ ] `server` builds/typechecks
- [ ] Mobile Expo config valid
- [ ] Token flows: server env ↔ mobile SYS
- [ ] No Grok app-builder files hijacking repo root as a Vite app for EAS
- [ ] `cursor-prompts/` ready for next sequential work
- [ ] Clear “what I should click on expo.dev next”

## Final reply format

1. Inventory table (uploaded → action taken)
2. Merges performed (files)
3. Deferred / stashed
4. Commands run
5. Exact next human steps (Expo credentials / build / SYS)

Start Step 0 now. Ask zero blocking questions if the upload tree is visible in the workspace.

