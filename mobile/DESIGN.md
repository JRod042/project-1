# Casa Rústico — Design system (Swift / Liquid Glass informed)

Sources: Apple HIG Materials, WWDC25–26 Liquid Glass sessions, Expo `expo-glass-effect`.

## Golden rules (from Apple)

1. **Glass is a navigation layer** — tab bar, nav, sheets, sticky docks only.
2. **Content stays solid** — product photography, kraft cards, lists, text blocks stay opaque.
3. **Never stack glass on glass.**
4. **Tint sparingly** — espresso ink on primary actions (Add to bag, Check Out). Warm linen tint on glass only.
5. **Concentric radii** — cards `22`, chrome pills `26–32`, chips `999`.

## Liquid Glass on this app

| Surface | Material |
|---------|----------|
| Tab bar / top nav / search sheet / product dock | Native `GlassView` on iOS 26+ / iOS 27 (`expo-glass-effect`) |
| Older iOS + Android | `expo-blur` frost + specular rim |
| Reduce Transparency | Solid paper fallback via `AccessibilityInfo` |
| Product tiles, origin cards, promo kraft | Solid cream / paper / kraft — never glass |

Do not set `UIDesignRequiresCompatibility` — that opts the binary out of system Liquid Glass.

## Motion

- Springs on press (`friction` high, native driver)
- Fade/slide on screen enter
- Haptics on primary commits
- Avoid Reanimated until EAS green history is stable

## Catalog truth

Product data mirrors `Casa-Rustico/apps/casa-rustico-go/src/catalog.json` (Temecula / single-origin menu).
