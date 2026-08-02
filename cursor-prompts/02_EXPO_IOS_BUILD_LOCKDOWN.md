# Prompt 02 — Expo.dev iOS build lockdown (no more flaky TestFlight)

Copy everything below the line into Cursor. Do this **before** large mobile feature work.

---

@00_CONTEXT_AND_RULES.md

Make the **EAS / Expo.dev iOS production → TestFlight** path boring and reliable for bundle **`com.jrod042.omni`**, project **`@jrod42/omni`**, GitHub base directory **`mobile`**.

## A. Config audit (fix, don’t invent)

1. Read fully: `mobile/app.config.js`, `mobile/eas.json`, `mobile/package.json`, `mobile/IOS.md`, `.github/workflows/ios-testflight.yml` (if any).
2. Produce a short **BUILD MATRIX** in `mobile/IOS.md`:
   - Bundle ID, owner, slug, projectId
   - Min iOS deployment target
   - EAS profiles (`preview` / `production`) and which to use for TestFlight
   - Required Apple artifacts: Distribution Certificate + **App Store** provisioning profile
   - Why App Store Connect API key alone is insufficient
   - Base directory must be `mobile` when building from GitHub
   - How to bump `ios.buildNumber` (string) each store binary
   - Known fixes already in repo (`privacyManifestAggregationEnabled: false`, `EXPO_USE_PRECOMPILED_MODULES=0`)

## B. Hardening that prevents real Expo failures

Implement only what is justified:

1. **`ios.buildNumber`** — Ensure it is a string. Add a tiny script `mobile/scripts/bump-ios-build.mjs` that increments it and prints the new value. Document: run before every store build.
2. **`eas.json`** — Keep `distribution: "store"` for TestFlight path. Ensure iOS resource class is valid. Do **not** enable simulator builds for production.
3. **Plugins** — Verify every `plugins` entry exists in `package.json` dependencies with compatible versions. Remove or fix dead plugins.
4. **Expo SDK consistency** — Align `expo` and related packages; if versions are inconsistent, fix with the minimal package.json change and note the Expo SDK major.
5. **GitHub Action (optional path)** — If workflow exists, ensure:
   - `working-directory: mobile` or equivalent
   - uses `EXPO_TOKEN`
   - build profile `production`
   - does not assume Mac runners for local pods incorrectly
   - documents required secrets in `IOS.md` only (never commit secrets)
6. **Preflight script** — Add `mobile/scripts/preflight-ios.sh` that fails fast if:
   - `app.config.js` missing bundleIdentifier
   - `eas.json` missing production profile
   - `package.json` missing `expo`
   - node version note
   Run: `npx expo config --type public` and assert bundle id `com.jrod042.omni`.
7. **package.json scripts** — e.g. `"preflight:ios"`, `"bump:ios"`, `"start"`, keep existing ship script if good.

## C. Explicit non-goals

- Do not redesign the app UI.
- Do not add push notifications or new native modules unless required for build health.
- Do not set `NSAllowsArbitraryLoads: true`.
- Do not enable `autoIncrement` while using dynamic `app.config.js` unless you migrate to a proven supported pattern and document it.

## D. Checklist to paste into IOS.md (“Before every Expo build”)

```
[ ] Apple App ID com.jrod042.omni exists
[ ] App Store Connect app exists
[ ] Expo credentials: Distribution Cert + App Store profile VALID
[ ] GitHub connected; base directory = mobile
[ ] Bumped ios.buildNumber
[ ] npm/ci install green in mobile/
[ ] npm run preflight:ios green
[ ] Expo → Build from GitHub → main → iOS → production
[ ] Submit → TestFlight → Ready to Test
[ ] On iPhone: TestFlight install Omni
[ ] Server running; SYS URL + TEST LINK
```

## Verification

- `cd mobile && npx expo config --type public` shows correct ios.bundleIdentifier and buildNumber
- `bash scripts/preflight-ios.sh` exits 0
- Summarize residual risks (credentials still manual in Expo UI)

