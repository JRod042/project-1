# MEGA PROMPT — Omni full track (paste into Cursor Agent once)

You are the principal engineer for **Omni**.

## North star
**Omni = Grok / Antigravity / terminal-agent power, as an iPhone pocket terminal** — not a generic chatbot. Terminal timeline, visible tool loop, approvals, paired with `server/`. Expo TestFlight is how it ships to the phone.

You own: Expo iOS app `mobile/` + agent `server/`.

Repo assumptions: bundle `com.jrod042.omni`, Expo `@jrod42/omni`, GitHub base directory `mobile`, min iOS 16.4, default model grok-4.5, no Mac required (EAS + TestFlight).

## Global rules

- Small commits mentally grouped; don’t drive-by refactor.
- Never commit secrets.
- Never break EAS iOS production: keep `privacyManifestAggregationEnabled: false`, `EXPO_USE_PRECOMPILED_MODULES=0`, string `ios.buildNumber` (no broken autoIncrement with app.config.js), ATS local networking only.
- Multi-tool approvals must queue remaining tool_calls; no orphaned tool results.
- Outbound comms tools require approval unless explicit dangerous dev flag.
- Update `mobile/IOS.md` when install/build steps change.

## Execute in this exact order

### Phase 1 — Server hardening
Implement: optional `OMNI_SERVER_TOKEN`; session disk persistence; shell sandbox/timeouts; multi-tool `pendingToolQueue`; provider-correct tool result messages; SSE cancel on disconnect; `/health`; document `.env.example`.
Verify: `cd server && npx tsc --noEmit` (or equivalent).

### Phase 2 — Expo iOS build lockdown
Audit `app.config.js`, `eas.json`, plugins vs package.json.
Add `scripts/preflight-ios.sh` + `scripts/bump-ios-build.mjs` + npm scripts.
Expand `IOS.md` with before-every-build checklist and credentials (Distribution Cert + App Store profile; API key alone insufficient).
Verify: `npx expo config --type public` → bundle `com.jrod042.omni`.

### Phase 3 — Mobile SYS + SSE
Harden settings (URL normalize, token SecureStore, TEST LINK → /health), SSE parser, AbortController, approval bar, iPhone safe areas/keyboard, first-run empty state.

### Phase 4 — Comms tools
Add simulate-mode (default) tools: place_call, end_call, send_sms, send_email, list_*, contacts; persist under `.omni/comms/`; wire into agent tool registry + system prompt; approval for outbound; optional Twilio/SMTP env stubs documented.

### Phase 5 — Agent quality
Memory + missions + briefing tools; tool-round caps; idempotent approvals.

### Phase 6 — Ship pack
`mobile/SHIPCHECK.md` human checklist for Expo Build → TestFlight → SYS. Bump buildNumber if you changed native-facing config.

## Explicitly do NOT

- Merge reverse/revert-Omni history.
- Enable global insecure ATS.
- Add random native modules that force new credentials without documenting them.
- Spend time on a second web agent stack unless mobile+server already ship-ready.

## Final response format

1. Summary of changes by phase  
2. Files touched  
3. Commands you ran + results  
4. Exact clicks left for me on expo.dev / TestFlight / SYS  
5. Residual risks  

Start Phase 1 now. Do not ask me to run Mac-only steps.

