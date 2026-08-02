# Omni

**Jarvis for your iPhone — but it actually does the work.**

Omni is a personal AI iOS app (native project under `mobile/ios`) plus an agent server that can plan, research, code, run shell, manage files, and keep memory.

```
┌──────────────┐      SSE       ┌────────────────┐  tools  ┌───────────┐
│ Omni iOS app │ ─────────────▶ │ Omni agent     │ ──────▶ │ Workspace │
│ (Xcode/EAS)  │                │ server         │         │ + web     │
└──────────────┘                └────────────────┘         └───────────┘
```

## iOS app (what you asked for)

| Item | Value |
|------|-------|
| Display name | **Omni** |
| Bundle ID | `com.jrod042.omni` |
| Native project | `mobile/ios/Omni.xcodeproj` |
| Min iOS | 16.4 |
| Build paths | Mac + Xcode **or** EAS Build → TestFlight |

Full install / build steps: **[mobile/IOS.md](mobile/IOS.md)**

### Fastest path on a Mac

```bash
cd mobile
npm install
npx pod-install
npx expo run:ios --device
```

Or open `mobile/ios/Omni.xcodeproj` in Xcode, pick your Team under Signing, and Run on your iPhone.

### Fastest path without local Xcode compile

```bash
cd mobile
npx eas-cli login
npx eas init
npx eas build --platform ios --profile development
```

## Agent server

```bash
cd server
cp .env.example .env   # add XAI_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY
npm install
npm run dev            # http://0.0.0.0:8787
```

On the phone, open **SYS** if needed and confirm the server URL is your Mac’s LAN IP (`http://192.168.x.x:8787`). The app tries to auto-detect this from the Metro/dev-client host.

## Repo layout

| Path | Role |
|------|------|
| `mobile/` | Expo React Native → **native iOS app** |
| `mobile/ios/` | Generated Xcode project |
| `mobile/eas.json` | EAS iOS build profiles |
| `server/` | Tool-using agent runtime |

## Roadmap (Jarvis-class)

- Voice in / voice out
- Device skills (calendar, messages, reminders)
- Parallel missions / subagents
- Home/cloud computer bridge
- Proactive briefings

## License

MIT (see `mobile/LICENSE` for Expo template license text).
