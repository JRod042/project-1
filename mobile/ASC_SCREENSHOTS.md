# ASC screenshots from Expo web

The TestFlight app is iOS-only. Linux cannot run the iOS Simulator. This
repo already had an Expo web entry (`npm run web` → `expo start --web`).
Shop home and product are ordinary React Native views, so they render on
`react-native-web` after two small enables:

1. Peers `react-dom` + `react-native-web` (Expo SDK 57).
2. `src/lib/checkoutKit.web.ts` — Checkout Kit has no web native module.
   Shop / product still render. Checkout is not captured here (and must
   not be a fake Safari/Shop handoff).

Web is a **capture aid**, not a shipping storefront. Do not submit these
as a substitute if Apple asks for device-accurate Liquid Glass chrome —
those still come from a TestFlight device.

No EAS cloud build. No ASC submit.

## Commands

```bash
cd mobile
npm install
npx expo start --web --port 8081
```

In another terminal:

```bash
cd mobile
npx playwright install chromium
npm run screenshots:asc
```

Or one-shot against an already-running Metro web server:

```bash
EXPO_WEB_URL=http://localhost:8081 node scripts/capture-asc-screenshots.mjs
```

Sizes (logical points × scale = Apple pixel sizes):

| Device | Viewport | Scale | PNG |
|--------|----------|-------|-----|
| iPhone 6.5" | 428 × 926 | 3 | 1284 × 2778 |
| iPad 13" | 1024 × 1366 | 2 | 2048 × 2732 |

Output (gitignored):

- `mobile/artifacts/asc-screenshots/`
- `/opt/cursor/artifacts/asc-screenshots/` when that folder exists

Files:

- `iphone-65-shop-home.png`
- `iphone-65-product-colombia.png`
- `ipad-13-shop-home.png`
- `ipad-13-product-colombia.png`

## Human screenshot checklist (device / TestFlight)

Capture these on a real iPhone and iPad if web PNGs are not accepted:

| Screen | Component | Path |
|--------|-----------|------|
| Kraft splash / welcome | `WelcomeScreen` | `mobile/src/components/WelcomeScreen.tsx` |
| Colombia onboard | `WelcomeScreen` / `CasaRusticoWelcome` | `mobile/src/components/WelcomeScreen.tsx`, `mobile/src/welcome/CasaRusticoWelcome.tsx` |
| Shop home | `HomeScreen` (Colombia hero + family grid) | `mobile/src/screens/HomeScreen.tsx` |
| Origins / family catalog | `FamilyCollection` in `HomeScreen` | `mobile/src/screens/HomeScreen.tsx` |
| Alternate coffee list (unused tab) | `ShopScreen` | `mobile/src/screens/ShopScreen.tsx` |
| Product (Colombia) | `ProductScreen` | `mobile/src/screens/ProductScreen.tsx` |
| Product cards / grid | `ProductCard`, `CatalogGrid` | `mobile/src/components/ProductCard.tsx` |
| Tab chrome | `TabShell` + `App` store bar | `mobile/src/components/TabShell.tsx`, `mobile/App.tsx` |
| Ritual | `RitualScreen` | `mobile/src/screens/RitualScreen.tsx` |
| You / story | `StoryScreen` | `mobile/src/screens/StoryScreen.tsx` |
| Bag | `CartScreen` | `mobile/src/screens/CartScreen.tsx` |
| Search | `SearchSheet` | `mobile/src/components/SearchSheet.tsx` |
| Catalog data | `products` / `colombia` | `mobile/src/lib/catalog.ts` |

Shop home in the current binary is **`HomeScreen`**, not `ShopScreen`.
`ShopScreen` is the older Coffee list and is not mounted from `App.tsx`.
