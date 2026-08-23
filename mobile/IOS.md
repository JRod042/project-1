# Casa Rustico — iOS / TestFlight

**Display name:** Casa Rustico  
**Bundle ID:** `com.jrod042.omni`  
**Expo project:** `@jrod42/omni`  
**Apple Team:** `FY5H9V76QL`  
**GitHub base directory:** `mobile`  
**ASC App ID:** `6797235230`

You do **not** need a Mac or any home server. Current TestFlight builds ship with **local mock data** and work offline.

---

## What this build is

Casa Rustico pocket HQ (Today / Book / Floor / House / More).  
No OpenClaw, no LAN gateway, no SYS screen, no agent server required.

Mock data is intentional for Phase 0 so the app is usable on TestFlight with zero backend. Supabase cloud comes next.

---

## Before you build (checklist)

1. App ID `com.jrod042.omni` exists in Apple Identifiers
2. App exists in App Store Connect with that bundle ID
3. Expo credentials complete for the bundle:
   - Distribution Certificate
   - App Store Provisioning Profile
4. GitHub linked in Expo project settings with **base directory = `mobile`**

### Credentials (if missing / invalid)

1. Open [expo.dev/accounts/jrod42/projects/omni/credentials](https://expo.dev/accounts/jrod42/projects/omni/credentials)
2. iOS → App Store for `com.jrod042.omni`
3. Generate / validate **Distribution Certificate**
4. Generate / validate **App Store Provisioning Profile**
5. Both must show as set before building

---

## Build + TestFlight (Safari)

1. Expo → **@jrod42/omni** → **Builds** → **Build from GitHub**
2. Branch: **`main`** (latest)
3. Platform: **iOS** · Profile: **production**
4. Wait for a **green build**
5. Open that build → **Submit** to App Store Connect (**required** — green Expo build ≠ TestFlight)
6. App Store Connect → Activity (Processing, usually 5–60 min) → TestFlight → Ready to Test
7. On device: open **TestFlight** → install **Casa Rustico**

### If submit says the build number was already used

Bump `ios.buildNumber` in `mobile/app.config.js`, commit, rebuild, then submit again.  
`autoIncrement` is **not** enabled (unsupported with `app.config.js`). Current value on main: **12**.

### If the build is green but nothing appears in TestFlight

You almost always have not submitted yet (or submit failed / Apple rejected by email).

1. Open the finished production build on Expo
2. Tap **Submit**
3. Check App Store Connect → Activity for Processing
4. Check Apple ID email (and spam) for ITMS / “Your app build is invalid”
5. Answer export compliance if asked (`ITSAppUsesNonExemptEncryption: false` → usually “No”)

---

## After install

Open the app → Welcome → Enter house → Today board with mock covers, reservations, tickets, and staff.  
No server URL, no gateway token, no home computer required.

---

## Notes

- Bundle stays `com.jrod042.omni` for continuity with the existing ASC listing; display name is already Casa Rustico.
- Credentials must show Distribution Certificate + App Store Provisioning Profile for `com.jrod042.omni`.
- Prefer Expo browser **Build → Submit** until any GitHub Actions workflow is confirmed green.
