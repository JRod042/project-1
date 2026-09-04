# Casa Rústico (project-1)

**Customer shop** for rusticopr.com — on iPhone/iPad only.  
**No Linux computer. No Mac. No home server.**

| Doc | Purpose |
|-----|---------|
| **[docs/NORTH_STAR.md](docs/NORTH_STAR.md)** | Product + hard constraints |
| **[mobile/IOS.md](mobile/IOS.md)** | TestFlight / EAS |

## What ships

Expo app in `mobile/`:

- Welcome (brand-original)
- Home · Coffee · Ritual · Story
- Bag with in-app Shopify checkout (`MORNING10`)
- Cart on-device only — no accounts

Checkout never collects cards in-app. Check Out presents Shopify Checkout Kit in-app (`ShopifySheet` WebView fallback). Never Safari or the Shop app.

## Not this product

OpenClaw, Omni terminal, floor maps, book-a-table, kitchen 86. Legacy folders stay in `archive/` and `openclaw/` / `server/` — they are not compiled.

## Ship path

EAS → TestFlight (`mobile/IOS.md`). Display name **Casa Rustico**; bundle **`com.jrod042.omni`**. GitHub base directory: **`mobile`**.
