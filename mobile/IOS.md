# Omni — iPad / TestFlight instructions

Bundle ID: **`com.jrod042.omni`**  
Expo project: **`@jrod42/omni`**  
Apple Team: **`FY5H9V76QL`**  
GitHub base directory: **`mobile`**  
Default model: **grok-4.5**

You do **not** need a Mac. Use Safari + TestFlight.

---

## Fix for: `Set ascAppId in the submit profile` / Submission failed

Auto-submit **cannot** run without the numeric App Store Connect **Apple ID**.

### Get the ID (30 seconds)
1. Open [App Store Connect → My Apps → Omni](https://appstoreconnect.apple.com/apps)
2. **App Information** (under General)
3. Copy **Apple ID** — digits only, e.g. `6751234567`  
   (also in the URL: `appstoreconnect.apple.com/apps/<THIS_NUMBER>/…`)

### Put it in the repo
In `mobile/eas.json` under `submit.production.ios`:

```json
"ascAppId": "6797235230"
```

This is already set on **`main`**. Rebuild with **auto-submit** enabled.

If you ever create a new ASC app, update `ascAppId` to the new Apple ID.

---

## Why a green Expo build is not in TestFlight

**EAS Build ≠ TestFlight.**

```
Expo Build (green)  →  IPA lives on Expo only
        ↓  you must Submit
App Store Connect upload
        ↓  Apple processes 5–60 min
TestFlight “Ready to Test”
```

If the Expo build page is green but App Store Connect / TestFlight is empty, you almost always **have not submitted yet** (or submit failed / Apple rejected by email).

### Fix now (Safari)

1. Open [expo.dev/accounts/jrod42/projects/omni/builds](https://expo.dev/accounts/jrod42/projects/omni/builds)
2. Tap the **finished** iOS **production** build
3. Tap **Submit** → App Store Connect / TestFlight  
   (or run from a machine with Expo login: `cd mobile && npx eas-cli submit --platform ios --latest --profile production`)
4. Wait for submit to finish successfully on Expo
5. In [App Store Connect](https://appstoreconnect.apple.com) → your **Omni** app:
   - Check **Activity** / **TestFlight → iOS builds** for **Processing** (not only the TestFlight install list)
   - Processing often takes **5–60 minutes**
6. Check the Apple ID email (and spam) for **“Your app build is invalid”** / `ITMS-…` — silent rejects never show in the UI
7. If you see **Missing Compliance**, answer export compliance (Omni sets `ITSAppUsesNonExemptEncryption: false` — usually “No”)
8. Add yourself as an **Internal tester**, then open the **TestFlight** app on iPad

### If submit says the build number was already used

Bump `ios.buildNumber` in `mobile/app.config.js`, rebuild, then submit again.  
`autoIncrement` is **not** enabled (unsupported with `app.config.js`).

### If Expo only built (no Submit button / submit fails)

Confirm:

1. App **Omni** exists in App Store Connect with bundle **`com.jrod042.omni`**
2. Paid Apps / Apple Developer agreements are active
3. Expo iOS credentials: **Distribution Certificate + App Store profile** for `com.jrod042.omni`
4. You’re looking at the **same Apple team** (`FY5H9V76QL`) that signed the build

GitHub Actions “iOS TestFlight” only lands in ASC when the workflow uses **`--auto-submit`** and secrets are set — recent Action runs on this repo have been **failing**, so prefer Expo **Build → Submit** in the browser until CI is green.

---

## Fix for: “Credentials are not set up / Distribution Certificate is not validated”

An **App Store Connect API key** alone is **not enough** to build.  
GitHub / EAS builds need these on Expo’s servers:

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
8. When green → **Submit** (see above)

If generate fails on iPad Safari, try **desktop Safari / Chrome** — Apple login popups sometimes break in mobile Safari.

---

## Before you build (checklist)

1. **App ID** `com.jrod042.omni` in [Apple Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. **App** “Omni” in [App Store Connect](https://appstoreconnect.apple.com) with that bundle ID
3. **Expo credentials** complete (Distribution Certificate + App Store profile)
4. **GitHub link**
   - Project settings → **GitHub** → repo `JRod042/project-1`
   - **Base directory** = `mobile`

---

## Build + TestFlight (Safari) — full path

1. Expo → **@jrod42/omni** → **Builds** → **Build from GitHub**
2. Branch: **`main`** (latest)
3. Platform: **iOS** · Profile: **production**
4. Wait for a **green build**
5. Open that build → **Submit** to App Store Connect (**required**)
6. ASC → **Activity** (Processing) → later **TestFlight** → **Ready to Test**
7. iPad: install **TestFlight** → install **Omni**

---

## After Omni is on your iPad

Omni is the **control surface**. It needs the **agent server** running somewhere.

### Same Wi‑Fi as a computer/VPS
```bash
cd server
### Primary: OpenClaw gateway

```bash
cd ../openclaw
cp .env.example .env   # XAI_API_KEY + OPENCLAW_GATEWAY_TOKEN
./up.sh                # http://HOST:18789
```

In the app → **SYS**:
- Runtime = **OpenClaw**
- Control UI URL = `http://YOUR_HOST_LAN_IP:18789` (or Tailscale URL — **not** localhost)
- Gateway token = `gateway.auth.token` from `~/.openclaw/openclaw.json`, or `OPENCLAW_GATEWAY_TOKEN` in `openclaw/.env`
- Tap **OPEN CONTROL UI** — Safari opens `http://…:18789/#token=…`
- Tap **TEST LINK** to verify reachability

Full notes: **[openclaw/README.md](../openclaw/README.md)**

Also valid if the gateway was installed with `npm i -g openclaw` + `openclaw onboard` (xAI OAuth needs no `XAI_API_KEY`).

### Legacy Omni SSE (optional)

```bash
cd ../server
cp .env.example .env
# set XAI_API_KEY (Grok 4.5) or another provider key
# optional: OMNI_SERVER_TOKEN=
npm install
npm run start
```
In the app → **SYS**:
- Runtime = **Legacy Omni**
- Agent server URL = `http://YOUR_COMPUTER_LAN_IP:8787`
- Server token = same as `OMNI_SERVER_TOKEN` if set
- Tap **TEST LINK**
- Provider `xai`, model `grok-4.5` (default)

### Public / tunnel
- OpenClaw: Tailscale Serve (recommended) — see [OpenClaw web docs](https://docs.openclaw.ai/web)
- Legacy server: **[server/DEPLOY.md](../server/DEPLOY.md)** (Docker, Cloudflare, ngrok).

---

## Optional: GitHub Actions

Repo → **Settings** → **Secrets** → add `EXPO_TOKEN`  
(optional ASC API key secrets for submit: `APPLE_API_KEY_P8`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER_ID`)

Then **Actions** → **iOS TestFlight** → **Run workflow** with **submit = true**.

---

## Notes

- `autoIncrement` is **not** used (unsupported with `app.config.js`). Bump `ios.buildNumber` in `mobile/app.config.js` when Apple already accepted that number.
- Credentials must show **Distribution Certificate + App Store Provisioning Profile** for `com.jrod042.omni`.

## If a build fails again

Paste the **full red error block** (credentials / Xcode / pod lines), not only `build:internal`.
