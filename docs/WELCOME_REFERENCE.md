# Welcome screen — Appllama engine

We **use** the welcome motion engine from
[Appllama/top-welcome-screens](https://github.com/Appllama/top-welcome-screens)
(Expo SDK 57 · GPL-3.0).

## What’s vendored

| Path | Source |
|------|--------|
| `mobile/src/welcome/shared/*` | Appllama shared helpers (timeline, ReferenceCanvas, gates, pressable, geometry) |
| `mobile/src/welcome/GPL-3.0.txt` | Upstream license |
| `mobile/src/welcome/NOTICE.md` | Attribution |

## What’s ours

| Path | Notes |
|------|--------|
| `mobile/src/welcome/CasaRusticoWelcome.tsx` | Casa Rustico brand, copy, colors, CTAs |
| `mobile/src/components/WelcomeScreen.tsx` | Thin app wrapper |

## Studies used as structure (branding fully replaced)

- **onX Hunt** — splash hold (~1.067s) → CTA page  
- **Yazio** — staggered spring motif entrances after splash  

No third-party logos, mascots, assets, or trade dress are shipped.

## Dependencies

`react-native-reanimated`, `react-native-worklets`, `babel.config.js` reanimated plugin.
