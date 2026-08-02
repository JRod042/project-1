# Omni on iPad only (no Mac)

You can get Omni onto your **iPad via TestFlight** without a Mac.  
Builds run in the cloud (EAS). You only use Safari + TestFlight.

Bundle ID: **`com.jrod042.omni`** (iPhone + iPad)

---

## Path A — easiest on iPad (Expo website)

### 1. Apple (Safari)
1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → New App  
2. Platforms: iOS · Name: **Omni** · Bundle ID: `com.jrod042.omni`  
3. (If bundle ID missing) create it under [Certificates, IDs & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list)

### 2. Expo credentials (**required before GitHub builds**)
GitHub builds are non-interactive. If iOS credentials are missing, you’ll see `build:internal` / credentials errors.

1. [expo.dev](https://expo.dev) → **@jrod42/omni** → **Credentials** → **iOS**
2. Bundle identifier `com.jrod042.omni` → **App Store** distribution
3. **Generate** / use Expo-managed credentials
4. Sign in with your Apple Developer account when prompted and allow access

### 3. Link + build
1. **Project settings** → **GitHub** → connect `JRod042/project-1`
2. Set **Base directory** to `mobile`
3. **Builds** → **Build from GitHub** → branch with the latest fix → iOS → `production`
4. When the build finishes → **Submit** to TestFlight

### 3. Install on iPad
1. Install **TestFlight** from the App Store  
2. Accept the Omni invite (email or App Store Connect internal testing)  
3. Open Omni on your iPad  

---

## Path B — one-tap from GitHub Actions (also iPad Safari)

### Secrets (GitHub → Settings → Secrets and variables → Actions)

| Secret | Where to get it |
|--------|------------------|
| `EXPO_TOKEN` | [expo.dev](https://expo.dev) → Account → Access tokens → Create |
| `APPLE_API_KEY_P8` | App Store Connect → Users and Access → Integrations → App Store Connect API → create key → paste **full .p8 text** |
| `APPLE_API_KEY_ID` | Key ID shown when you create the key |
| `APPLE_API_ISSUER_ID` | Issuer ID at the top of the API keys page |

Also complete **Expo → Credentials → iOS** once in Safari (Path A step 2.3) so EAS can sign builds non-interactively.

### Run the workflow
1. iPad Safari → this repo → **Actions** → **iOS TestFlight**  
2. **Run workflow** → profile `production` → submit `true`  
3. Wait for the green check, then install from **TestFlight**

---

## After install

Omni still needs the **agent server** running somewhere (home PC, VPS, cloud).  
On first launch, open **SYS** and set the server URL (not `localhost` — use a public HTTPS URL or your LAN IP if the iPad is on the same Wi‑Fi as the server).

```bash
# on any always-on machine / VPS
cd server
cp .env.example .env   # add XAI_API_KEY etc
npm install && npm run dev
```

---

## What you cannot do on iPad alone

- Run Xcode  
- Compile the IPA locally  

Cloud build (Expo/EAS or this GitHub Action) replaces that.
