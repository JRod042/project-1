# Welcome screen reference

Technical inspiration only:

**[Appllama/top-welcome-screens](https://github.com/Appllama/top-welcome-screens)** — Expo SDK 57 welcome studies (GPL-3.0).

## License rule

Their **code is GPL-3.0**. We do **not** vendor or copy those components into this repo.  
We study motion *patterns* and ship an **original** Casa Rustico welcome.

Per their NOTICE: replace all third-party branding; make composition and motion uniquely ours.

## Patterns we adapted (not copied)

| Study | Pattern used |
|-------|----------------|
| onX Hunt / Strava | Short brand-color splash hold → hard cut / dissolve to CTA page |
| Yazio | Staggered entrance of house motifs after splash (ours: plate / leaf / clock as simple shapes) |
| SCRL | Dark field + staggered opacity for copy and CTA |

## Our implementation

- `mobile/src/components/WelcomeScreen.tsx` — original RN `Animated` timeline (no Reanimated dependency)
- Brand: Casa Rustico · olive / brass / linen — not any referenced app’s trade dress
- Actions: Enter the house → Today (cloud mock; auth later)
