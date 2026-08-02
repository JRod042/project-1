# Omni for iOS

Omni is packaged as a **native iOS app** (React Native + Expo).  
This Linux cloud environment cannot compile/sign iPhone binaries — that happens on a **Mac with Xcode** or via **EAS Build** (Expo’s Mac builders).

Bundle ID: `com.jrod042.omni`

## Option A — Mac + Xcode (local)

Needs: macOS, Xcode 16+, CocoaPods, Apple ID (free for device debug; paid Apple Developer for TestFlight/App Store).

```bash
cd mobile
npm install
npx expo prebuild --platform ios --clean   # regenerates ios/ if needed
npx pod-install
npx expo run:ios                           # simulator
# or open the Xcode project:
open ios/Omni.xcworkspace
```

In Xcode:

1. Select the **Omni** target → **Signing & Capabilities**
2. Choose your Team
3. Plug in your iPhone → Run

First launch: open **SYS** and set the agent server to your Mac’s LAN IP (`http://192.168.x.x:8787`).

## Option B — EAS Build (no local Xcode compile)

Needs: Expo account, Apple Developer Program for device/TestFlight builds.

```bash
cd mobile
npm install
npx eas-cli login
npx eas init          # writes projectId into app config
npx eas device:create # register your iPhone (development/preview)
npx eas build --platform ios --profile development
```

Install the build from the Expo dashboard link, then:

```bash
npx expo start --dev-client
```

### Profiles (`eas.json`)

| Profile | What you get |
|---------|----------------|
| `development-simulator` | Dev client for iOS Simulator |
| `development` | Dev client on a physical iPhone |
| `preview` | Internal installable IPA (TestFlight-like / ad hoc) |
| `production` | App Store / TestFlight release build |

Submit to TestFlight:

```bash
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

## Networking note (critical)

iPhones cannot reach `localhost` on your computer. Use your Mac’s LAN IP.  
Omni’s Info.plist enables **local networking** + ATS local exceptions so cleartext HTTP to your agent server works on LAN.

## Regenerating native code

`ios/` is generated from `app.config.js` via prebuild. After changing native plugins/permissions:

```bash
npx expo prebuild --platform ios --clean
```
