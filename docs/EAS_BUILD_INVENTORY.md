# EAS / Expo build inventory

**Date:** 2026-09-04  
**Method:** Git + GitHub Actions logs. `eas build:list` was **not** run — this environment has no Expo login (`eas` not installed, `EXPO_TOKEN` / `EXPO_ACCESS_TOKEN` unset). Expo dashboard pages require login.

**Hard rule:** do **not** cancel, expire, or withdraw App Store Connect submissions. This pass documents only. No Expo artifacts were deleted.

Expo can delete **its own** build artifacts (`eas build:delete` or expo.dev → Build → Options → Delete build). That removes the IPA/AAB from Expo servers only. It does **not** expire TestFlight, cancel review, or change ASC. There is no Expo “archive” command. `eas build:cancel` is for in-progress EAS jobs only — do not use it against the live store path.

---

## 1) Casa Rustico shop — `@jrod42/omni`

| Field | Value |
|---|---|
| Git | `JRod042/project-1` `main` |
| Expo | `@jrod42/omni` (`b7896713-f57d-4303-850d-b4985ade82ab`) |
| Bundle / package | `com.jrod042.omni` |
| Marketing version | `1.0.0` |
| Current source | `ios.buildNumber` **49** · `android.versionCode` **49** (`mobile/app.config.js`) |
| Git of the store binary | `3e7cee9` (merge of Liquid Glass / build 49). `HEAD` `730846c` only changes store-submit docs/workflow; **did not bump** 49. |
| ASC App ID | `6797235230` |
| ASC (operator) | **Waiting for Review** on **iOS build 49** |
| Actions ship path | [Casa Rústico store](https://github.com/JRod042/project-1/actions/workflows/ios-testflight.yml) · profile `production` |

### Keep

| Rec | Platform | Build | Expo status (from Actions) | Expo build | Git | ASC / store |
|---|---|---|---|---|---|---|
| **KEEP** | iOS | **49** | finished + auto-submitted | [e48957cd](https://expo.dev/accounts/jrod42/projects/omni/builds/e48957cd-d852-49ef-8fa2-c3d5ec8bdd65) | `3e7cee9` · [Actions 33921615499](https://github.com/JRod042/project-1/actions/runs/33921615499) | **Waiting for Review**. EAS submit [d27df391](https://expo.dev/accounts/jrod42/projects/omni/submissions/d27df391-58bd-4947-995d-6b81106a78b8) (“Submitted your app to Apple App Store Connect”). |
| **KEEP** | Android | **49** | finished | [47213a8f](https://expo.dev/accounts/jrod42/projects/omni/builds/47213a8f-106a-4eca-b7af-da44cab3fb1f) | same `3e7cee9` | Current Play production AAB (same number as iOS). Do not delete until a newer Play binary ships. |

Do **not** `eas build:delete` either 49 ID. Do **not** expire TestFlight 49. Do **not** cancel the ASC review.

### Stale (older than 49)

Git bumped 47 and 48, but **no** Casa Rústico store Actions run used those SHAs. Next store run after 46 was 49. If Expo UI later shows 47/48, treat them as stale Expo artifacts only.

| Rec | Platform | Build | Git (config bump) | Actions | Expo iOS | Expo Android | Notes |
|---|---|---|---|---|---|---|---|
| Stale / git-only | iOS + Android | 48 | `c842339` You login / origin stories | none | unknown (login required) | unknown | Never queued on Actions. Optional Expo delete **if** a finished artifact exists. Leave ASC alone. |
| Stale / git-only | iOS + Android | 47 | `a3881db` one-dock Check Out | none | unknown | unknown | Same as 48. |
| Stale | iOS | 46 | `adf67d4` shop UI polish | [33916850421](https://github.com/JRod042/project-1/actions/runs/33916850421) | [ae4fb56c](https://expo.dev/accounts/jrod42/projects/omni/builds/ae4fb56c-b6b9-4f7a-bcba-c356fab01f96) | — | Auto-submitted to ASC (superseded). Optional Expo artifact delete. **Do not** expire/cancel on ASC. |
| Stale | Android | 46 | same | same | — | [29b21c10](https://expo.dev/accounts/jrod42/projects/omni/builds/29b21c10-55e5-4501-942d-ed0084ba51eb) | Same. |
| Stale | iOS | 45 | `a841fa8` still kraft splash | [33914574582](https://github.com/JRod042/project-1/actions/runs/33914574582) | [78132dd6](https://expo.dev/accounts/jrod42/projects/omni/builds/78132dd6-5b66-40f3-a23e-7c3b7b7661f0) | — | Auto-submitted; superseded. |
| Stale | Android | 45 | same | same | — | [92b8bb96](https://expo.dev/accounts/jrod42/projects/omni/builds/92b8bb96-9a0e-409f-9743-fbbacbdf2278) | |
| Stale | iOS | 44 | `d22f7bb` two-bean splash | [33912828614](https://github.com/JRod042/project-1/actions/runs/33912828614) | [a48d166a](https://expo.dev/accounts/jrod42/projects/omni/builds/a48d166a-7c99-4fdd-abd3-326eed4f0a7e) | — | |
| Stale | Android | 44 | same | same | — | [208267d5](https://expo.dev/accounts/jrod42/projects/omni/builds/208267d5-d66c-4dc7-b4b0-2cb4b0b14052) | |
| Stale | iOS | 43 | `0f6844a` Check Out + splash | [33912469145](https://github.com/JRod042/project-1/actions/runs/33912469145) | [06184ad9](https://expo.dev/accounts/jrod42/projects/omni/builds/06184ad9-7fbe-44c7-896d-5a2be67a0f4c) | — | |
| Stale | Android | 43 | same | same | — | [1f33d731](https://expo.dev/accounts/jrod42/projects/omni/builds/1f33d731-c52a-40f6-a5f6-a7af7b861fb7) | |
| Stale | iOS | 42 | `d9b5f10` Checkout Kit | [33911574913](https://github.com/JRod042/project-1/actions/runs/33911574913) | [7d1d3c38](https://expo.dev/accounts/jrod42/projects/omni/builds/7d1d3c38-da56-4a98-881f-ad9935cabd53) | — | |
| Stale | Android | 42 | same | same | — | [d8fc8d05](https://expo.dev/accounts/jrod42/projects/omni/builds/d8fc8d05-c1f1-4d89-a94f-88af9503a42f) | |
| No EAS | — | 41 | `da139c5` | [33910977470](https://github.com/JRod042/project-1/actions/runs/33910977470) **cancelled** | none in logs | none | Nothing to delete. |
| Stale | iOS | 40 | `9ca9da2` in-app Shopify | [33910423115](https://github.com/JRod042/project-1/actions/runs/33910423115) | [4c45eafd](https://expo.dev/accounts/jrod42/projects/omni/builds/4c45eafd-c4ff-4b8a-9988-8dbbc2dddbde) | — | |
| Stale | Android | 40 | same | same | — | [a6880b93](https://expo.dev/accounts/jrod42/projects/omni/builds/a6880b93-5f1c-45d4-b4eb-ab524a2fae0a) | |
| Stale | iOS | 39 | `b4664f5` Drive icon | [33909774146](https://github.com/JRod042/project-1/actions/runs/33909774146) | [fed01d0d](https://expo.dev/accounts/jrod42/projects/omni/builds/fed01d0d-91dc-4e1f-b341-a1b1427835d6) | — | |
| Stale | Android | 39 | same | same | — | [c8580cda](https://expo.dev/accounts/jrod42/projects/omni/builds/c8580cda-0f19-4125-b66e-bde2eaa2557a) | |
| Stale | iOS | 36 | `ae88e77` 1.0.0 kraft icon | [33909214524](https://github.com/JRod042/project-1/actions/runs/33909214524) | [e9004608](https://expo.dev/accounts/jrod42/projects/omni/builds/e9004608-8211-494c-ba96-91cc4a7f360f) | — | 37–38 were git bumps; no dedicated Actions run found in this window. |
| Stale | Android | 36 | same | same | — | [40b7a50a](https://expo.dev/accounts/jrod42/projects/omni/builds/40b7a50a-b81e-4421-bcdb-53be5a10c1e8) | |

Older store numbers on `main` (35 → 1) are historical TestFlight retries. Treat every build **below 49** as stale. Do not expire them on ASC.

### Optional Expo-only cleanup (after login)

```bash
cd mobile
npx eas-cli whoami
npx eas-cli build:list --platform all --limit 50 --non-interactive --json
# Only if Jorge wants Expo disk back — never 49:
# npx eas-cli build:delete <STALE_EXPO_BUILD_UUID> --non-interactive
```

Confirm the UUID is **not** `e48957cd-…` (iOS 49) or `47213a8f-…` (Android 49). Never run `eas submit:cancel` / ASC expire / review withdrawal.

---

## 2) Espresso Escape — `@jrod42/espresso-escape`

Source lives in **`JRod042/Casa-Rustico`**, not this repo. Expo project `@jrod42/espresso-escape` (`016d7c24-a7df-4e0d-8e59-00a9d8db352c`). Bundle / package `com.jrod042.espressoescape`.

| Source | Version | iOS build | Android versionCode | Status |
|---|---|---|---|---|
| `Casa-Rustico` `main` | 1.0.0 | 3 | 3 | Current merged git. Dist Cert still blocks non-interactive EAS ([IOS.md](https://github.com/JRod042/Casa-Rustico/blob/main/apps/espresso-escape/IOS.md)). |
| Git history | 1.0.0 | 1 → 2 → 3 | 1 → 2 → 3 | Scaffold / welcome / TestFlight dispatch bumps (`78b9041` … `57b08cc`). |
| ASC (operator / PR notes) | **1.0.2** | **7** | — | **Rejected** (2.1.0 incomplete, 3.1.1 IAP). Binary exists on ASC. Do not delete the listing. |
| [PR #8](https://github.com/JRod042/Casa-Rustico/pull/8) | 1.0.3 | 8 | 8 | Open, superseded by #10. Do not build this. |
| [PR #9](https://github.com/JRod042/Casa-Rustico/pull/9) | 1.0.3 | 8 | 8 | Open polish; same numbers as #8. |
| **[PR #10](https://github.com/JRod042/Casa-Rustico/pull/10)** | **1.0.4** | **9** | **9** | **Target next store binary.** Do not `eas build` from that PR until Dist Cert is valid. |

Casa-Rustico Actions “iOS TestFlight” runs (Aug 2026) all **failed** on credentials. This repo’s `casa-rustico-eas.yml` matrix for `espresso-escape` has one failed dispatch (2026-08-23). No successful production EAS ID was recovered without Expo login.

### Keep vs archive (Escape)

| Rec | What | Why |
|---|---|---|
| **KEEP (target)** | 1.0.4 / **9** after a green EAS production build from PR #10 (or merge) | Next ASC resubmit. Skip 1.0.3 / 8. |
| **KEEP (listing)** | Existing ASC app `com.jrod042.espressoescape` | Do not delete or cancel any ASC submission. |
| Stale / superseded | Git 1–3, ASC rejected **7**, open PR **8** | Do not resubmit. Optional Expo artifact delete after login if those builds exist. |
| Do not build yet | PR #10 | PR text: Dist Cert + App Store profile must be valid first. |

Live Expo list: https://expo.dev/accounts/jrod42/projects/espresso-escape/builds (login required).

---

## 3) What this agent did **not** do

- Did not cancel or expire anything on App Store Connect.
- Did not run `eas build:delete` or `eas build:cancel` (no Expo session; prefer document).
- Did not queue a new EAS build or submit.

To refresh the Expo columns later, from a machine with Expo login:

```bash
cd mobile && npx eas-cli build:list -p all --limit 50 --json
# and from Casa-Rustico:
# cd apps/espresso-escape && npx eas-cli build:list -p all --limit 50 --json
```
