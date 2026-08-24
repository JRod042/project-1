# Casa Rústico — Design system (Swift / Liquid Glass informed)

Sources: Apple HIG Materials, WWDC25 Liquid Glass sessions, Expo native-tabs guidance (2025–26).

## Golden rules (from Apple)

1. **Glass is a navigation layer** — tab bar, sticky footers, floating controls only.
2. **Content stays solid** — product photography, cards, lists, text blocks are opaque and legible.
3. **Never stack glass on glass.**
4. **Tint sparingly** — brass only on primary actions (Add to bag, Checkout, Place order).
5. **Concentric radii** — cards `22`, chips `999`, nested controls inside cards use `12–16`.

## Why Expo, not pure Swift yet

| Path | Status |
|------|--------|
| **project-1 / Omni → Casa Rustico** | Active TestFlight pipeline (EAS + GH Actions) |
| **Casa-Rustico monorepo** | Espresso Escape + Casa Rustico Go scaffolds; Go holds real catalog.json |
| **Native SwiftUI** | Highest Liquid Glass fidelity via `glassEffect`; requires Mac + Xcode 26+ |

Until a Mac/Xcode track exists, we ship Liquid Glass with `expo-blur` (`BlurView` extraLight) plus a specular gradient rim — chrome only. Content stays cream / paper / kraft.

## Motion

- Springs on press (`friction` high, native driver)
- Fade/slide on screen enter
- Haptics on primary commits
- Avoid Reanimated until EAS green history is stable

## Catalog truth

Product data mirrors `Casa-Rustico/apps/casa-rustico-go/src/catalog.json` (Temecula / single-origin menu).
