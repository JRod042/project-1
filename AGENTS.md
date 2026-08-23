# Casa Rústico — Agent context (always-on)

**Product:** Customer shop for Casa Rústico coffee (rusticopr.com). Not a restaurant HQ.

## Hard constraints (non-negotiable)

- **No Linux computer and no Mac as runtime.**
- iPhone / iPad is the only device Jorge operates.
- Builds and submits via Expo Application Services (EAS) + TestFlight only.
- Cart is on-device (AsyncStorage). Checkout is rusticopr.com Shopify permalinks.
- Never collect card numbers in-app.

## What the app is

| Casa Rústico is | Casa Rústico is NOT |
|-----------------|---------------------|
| Brand shop: bags, capsules, mug | Pocket HQ / floor / kitchen 86 |
| Colombia as the hero bag | Cafe reservations or covers |
| Warm highlands (kraft, linen, brass) | Cyber HUD / olive ops console |
| rusticopr.com Shopify checkout | Home-server SSE / OpenClaw |

## Architecture (only allowed shape)

```
iPhone / iPad (Expo → TestFlight)
        │
        ├── local cart (AsyncStorage)
        └── checkout → https://rusticopr.com/cart/{variantId}:{qty}
```

## Engineering rules

1. Never break Expo iOS production path (`app.config.js`, `eas.json`, plugins, string `buildNumber`).
2. Prefer small, reviewable changes.
3. Do not revive OpenClaw, legacy Omni server, SYS screens, floor maps, or book-a-table.
4. Keep welcome screens brand-original (Appllama is reference only).
5. After native-config changes: document the next TestFlight rebuild.

## Primary docs

- `docs/NORTH_STAR.md`
- `mobile/IOS.md`
