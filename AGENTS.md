# Casa Rústico — Agent context (always-on)

**Product:** Customer shop for Casa Rústico coffee (rusticopr.com). Not a restaurant HQ.

This repo (`JRod042/project-1`, `mobile/`) is the **TestFlight app**. All shop, splash, onboard, and checkout work belongs here.

## Hard constraints (non-negotiable)

- **No Linux computer and no Mac as runtime.**
- iPhone / iPad is the only device Jorge operates.
- Builds and submits via Expo Application Services (EAS) + TestFlight only.
- Cart is on-device (AsyncStorage). Checkout is rusticopr.com Shopify in an in-app Safari sheet (`CheckoutScreen`).
- Never collect card numbers in-app.

## What the app is

| Casa Rústico is | Casa Rústico is NOT |
|-----------------|---------------------|
| Brand shop: bags, capsules, mug | Pocket HQ / floor / kitchen 86 |
| Colombia as the hero bag | Cafe reservations or covers |
| Warm highlands (kraft, linen, brass) | Cyber HUD / olive ops console |
| rusticopr.com Shopify checkout in-app | Home-server SSE / OpenClaw |
| Cream splash → onboard → shop | SYS / Book / Floor tabs |

## Architecture (only allowed shape)

```
iPhone / iPad (Expo → TestFlight)
        │
        ├── local cart (AsyncStorage)
        └── Check Out → CheckoutScreen (in-app Safari sheet)
                └── https://rusticopr.com/cart/{variantId}:{qty}
                    (Storefront cartCreate when token is present)
```

Safari is a fallback only if `CHECKOUT_IN_APP` is false. Do not hand off to the browser by default.

## Engineering rules

1. Never break Expo iOS production path (`app.config.js`, `eas.json`, plugins, string `buildNumber`).
2. Prefer small, reviewable changes.
3. Do not revive OpenClaw, legacy Omni server, SYS screens, floor maps, or book-a-table.
4. Keep welcome screens brand-original (Appllama geometry is reference only). First-run is cream splash + Colombia onboard.
5. After native-config changes: document the next TestFlight rebuild.
6. Check Out must present `CheckoutScreen`. Do not `Linking.openURL` the cart permalink unless the gate is off.

## Primary docs

- `docs/NORTH_STAR.md`
- `mobile/IOS.md`
