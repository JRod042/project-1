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

### 2. Expo (Safari)
1. Create/login at [expo.dev](https://expo.dev)  
2. **Create project** → link this GitHub repo (`JRod042/project-1`)  
3. Open the project → **Credentials** → iOS → set up **App Store** distribution  
   - Sign in with your Apple Developer account in the browser when prompted  
4. **Builds** → **Start a build** → iOS → profile `production`  
5. When the build finishes → **Submit to App Store** / TestFlight  

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
