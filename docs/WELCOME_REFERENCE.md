# Welcome screen — Appllama engine

We use pieces of
[Appllama/top-welcome-screens](https://github.com/Appllama/top-welcome-screens)
(Expo SDK 57 · GPL-3.0).

## What’s vendored

| Path | Source |
|------|--------|
| `mobile/src/welcome/shared/geometry.ts` | Appllama |
| `mobile/src/welcome/shared/reference-canvas.tsx` | Appllama |
| `mobile/src/welcome/shared/pressable.tsx` | Appllama |
| `mobile/src/welcome/GPL-3.0.txt` | Upstream license |
| `mobile/src/welcome/NOTICE.md` | Attribution |

## What’s ours

| Path | Notes |
|------|--------|
| `mobile/src/welcome/CasaRusticoWelcome.tsx` | Casa brand + RN `Animated` timeline |
| `mobile/src/components/WelcomeScreen.tsx` | Thin app wrapper |

## Studies used as structure (branding fully replaced)

- **onX Hunt** — splash hold → CTA page  
- **Yazio** — staggered motif entrances after splash  

## Why not Reanimated here

`react-native-reanimated` 4.5.1 / worklets failed EAS iOS Xcode with  
`'getModule' is inaccessible due to 'internal' protection level`.  
Motion uses React Native `Animated` instead so TestFlight can ship; Appllama canvas/geometry stay.
