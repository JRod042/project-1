# Omni for iOS (Apple Developer account)

Bundle ID: **`com.jrod042.omni`**  
You already have an Apple Developer account — use that to sign, install on device, and ship TestFlight.

This cloud agent **cannot** sign in as you. Run the commands below on **your Mac** (or any machine where you can complete Apple + Expo browser login).

---

## 1. One-time Apple setup (10 minutes)

### App ID
1. [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Register App ID → App → Bundle ID: `com.jrod042.omni`
3. Enable **Associated Domains** only if you add them later (not required now)

### App Store Connect app
1. [App Store Connect → My Apps → +](https://appstoreconnect.apple.com)
2. New App → iOS → name **Omni** → bundle `com.jrod042.omni`
3. Copy the numeric **Apple ID** from App Information (not your email)
4. Optional for scripts:
   ```bash
   export ASC_APP_ID=that_number
   ```

### Devices (for development builds)
- Xcode → Window → Devices, or
- `npx eas device:create` and open the registration URL on your iPhone

---

## 2. Ship to TestFlight (recommended)

On your Mac, from the repo:

```bash
cd mobile
npm install
chmod +x scripts/ship-ios.sh
./scripts/ship-ios.sh production
```

What happens:

1. `eas login` (Expo account — free)
2. `eas init` (links project)
3. `eas build --platform ios --profile production`  
   → EAS prompts for **Apple ID / app-specific password or ASC API key**  
   → Creates distribution cert + App Store provisioning profile under your team
4. Optional `eas submit` → TestFlight

Then install **TestFlight** from the App Store and open Omni when processing finishes (~5–30 min).

### Manual equivalent

```bash
cd mobile
npx eas login
npx eas init
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production --latest
```

---

## 3. Dev client on a physical iPhone (faster iteration)

```bash
cd mobile
npx eas device:create          # register iPhone UDID
npx eas build --platform ios --profile development
# install the .ipa from the Expo build page (QR / link)
npx expo start --dev-client    # then open Omni on phone
```

---

## 4. Local Xcode (optional)

```bash
cd mobile
npm install
npx pod-install
open ios/Omni.xcodeproj
```

In Xcode:

1. Target **Omni** → Signing & Capabilities  
2. Team = your Apple Developer team  
3. Run on your plugged-in iPhone  

First launch: allow Local Network; confirm **SYS** server URL is your Mac LAN IP.

---

## 5. ASC API key (best for non-interactive submit)

If you don’t want password prompts every ship:

1. App Store Connect → Users and Access → Integrations → App Store Connect API  
2. Create key with **Admin** or **App Manager**  
3. Download `.p8` once  
4. Either let `eas submit` store it, or:

```bash
export EXPO_APPLE_API_KEY_PATH=~/AuthKey_XXXX.p8
export EXPO_APPLE_API_KEY_ID=XXXX
export EXPO_APPLE_API_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Networking

iPhones can’t use `localhost` on your Mac. Omni auto-detects the Metro/dev-client LAN host when possible; otherwise set **SYS → Agent server URL** to `http://YOUR_MAC_LAN_IP:8787`.

Run the agent:

```bash
cd server
cp .env.example .env   # add XAI_API_KEY etc
npm install && npm run dev
```

---

## Checklist

- [ ] App ID `com.jrod042.omni` registered
- [ ] App created in App Store Connect
- [ ] `eas login` + `eas init`
- [ ] `eas build --platform ios --profile production`
- [ ] TestFlight install on iPhone
- [ ] Agent server running + LAN URL in **SYS**
