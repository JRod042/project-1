# Omni — iPad / TestFlight instructions

Bundle ID: **`com.jrod042.omni`**  
Expo project: **`@jrod42/omni`**  
GitHub base directory: **`mobile`**

You do **not** need a Mac. Use Safari + TestFlight.

---

## Before you build (checklist)

1. **App ID** `com.jrod042.omni` in [Apple Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. **App** “Omni” in [App Store Connect](https://appstoreconnect.apple.com) with that bundle ID
3. **Expo credentials** (required — this is what broke earlier builds):
   - [expo.dev](https://expo.dev) → **@jrod42/omni** → **Credentials** → **iOS**
   - Select `com.jrod042.omni` → **App Store** distribution
   - **Generate** Expo-managed credentials
   - Sign in with your Apple Developer account when asked
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

### Option A — same Wi‑Fi as a computer/VPS
```bash
cd server
cp .env.example .env
# set at least one: XAI_API_KEY or OPENAI_API_KEY or GEMINI_API_KEY
npm install
npm run start
```
In the app → **SYS**:
- Agent server URL = `http://YOUR_COMPUTER_LAN_IP:8787`
- Tap **TEST LINK**
- Set provider/model/API key if not in `.env`

### Option B — server on the public internet
Deploy `server/` to any host, use HTTPS if possible, put that URL in **SYS**.

---

## Optional: GitHub Actions one-tap

Repo → **Settings** → **Secrets** → add `EXPO_TOKEN`  
(optional ASC API key secrets — see earlier docs)

Then **Actions** → **iOS TestFlight** → **Run workflow**.

---

## If a build fails again

Open the failed build → copy the **red error text** (not just `build:internal`) and share it.

Common fixes:
- Missing **Credentials → iOS → App Store**
- Base directory not set to `mobile`
- Building an old branch instead of latest `main`
