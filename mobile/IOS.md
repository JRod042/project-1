# Omni — iPad / TestFlight instructions

Bundle ID: **`com.jrod042.omni`**  
Expo project: **`@jrod42/omni`**  
GitHub base directory: **`mobile`**  
Default model: **grok-4.5**

You do **not** need a Mac. Use Safari + TestFlight.

---

## Fix for: “Credentials are not set up / Distribution Certificate is not validated”

An **App Store Connect API key** alone is **not enough** to build.  
GitHub builds need these on Expo’s servers:

1. **Apple Distribution Certificate**
2. **App Store Provisioning Profile** for `com.jrod042.omni`

### Do this in Safari (required)

1. Open [expo.dev/accounts/jrod42/projects/omni/credentials](https://expo.dev/accounts/jrod42/projects/omni/credentials)
2. Tap **iOS**
3. Under app / bundle **`com.jrod042.omni`**, open **App Store** (not Ad Hoc / not Development)
4. **Distribution Certificate**
   - If missing / invalid → **Add** / **Generate** a new one
   - Sign in with your **Apple Developer** account when prompted
   - Wait until it shows as valid / active
5. **Provisioning Profile**
   - **Add** / **Generate** an **App Store** profile for `com.jrod042.omni`
   - It must use the distribution certificate above
6. Confirm both show as set (not “not configured”)
7. Rebuild: **Builds → Build from GitHub → `main` → iOS → production**

If generate fails on iPad Safari, try **desktop Safari / Chrome**, or another browser — Apple login popups sometimes break in mobile Safari.

---

## Before you build (checklist)

1. **App ID** `com.jrod042.omni` in [Apple Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. **App** “Omni” in [App Store Connect](https://appstoreconnect.apple.com) with that bundle ID
3. **Expo credentials** complete (Distribution Certificate + App Store profile) — see above
4. **GitHub link**
   - Project settings → **GitHub** → repo `JRod042/project-1`
   - **Base directory** = `mobile`

Do **not** merge the old revert PR (#2) if it is still open.

---

## Build + TestFlight (Safari)

1. Expo → **@jrod42/omni** → **Builds** → **Build from GitHub**
2. Branch: **`main`** (latest)
3. Platform: **iOS** · Profile: **production**
4. Wait for a green build (~10–20 min)
5. Open the finished build → **Submit** to App Store / TestFlight (if not auto-submitted)
6. App Store Connect → **TestFlight** → wait until status is **Ready to Test**
7. On iPad: install **TestFlight** → install **Omni**

---

## After Omni is on your iPad

Omni is the **control surface**. It needs the **agent server** running somewhere.

### Same Wi‑Fi as a computer/VPS
```bash
cd server
cp .env.example .env
# set XAI_API_KEY (Grok 4.5) or another provider key
npm install
npm run start
```
In the app → **SYS**:
- Agent server URL = `http://YOUR_COMPUTER_LAN_IP:8787`
- Tap **TEST LINK**
- Provider `xai`, model `grok-4.5` (default)

### Public server
Deploy `server/` and put that URL in **SYS**.

---

## Optional: GitHub Actions

Repo → **Settings** → **Secrets** → add `EXPO_TOKEN`  
(optional ASC API key secrets for submit)

Then **Actions** → **iOS TestFlight** → **Run workflow**.

---

## Notes

- `autoIncrement` is **not** used (unsupported with `app.config.js`). Bump `ios.buildNumber` in `mobile/app.config.js` when you need a new TestFlight build number.
- Credentials must show **Distribution Certificate + App Store Provisioning Profile** for `com.jrod042.omni`.

## If a build fails again

Paste the **full red error block** (credentials / Xcode / pod lines), not only `build:internal`.
