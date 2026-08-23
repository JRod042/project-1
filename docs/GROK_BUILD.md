# Grok Build configuration

This repo is wired for **Grok Build** (CLI + Cursor) and **Expo EAS**.

## Files

| Path | Role |
|------|------|
| `AGENTS.md` | Always-on product contract |
| `.grok/config.toml` | Grok Build project config |
| `cursor-prompts/` | Sequential Cursor agent prompts |
| `mobile/` | Expo iOS app — EAS base directory |

## Hard rules (do not fight)

- iPhone / iPad only. No Linux host, no Mac, no OpenClaw, no Omni `:8787`.
- GitHub Actions / Expo **base directory = `mobile`**.
- Warm hospitality UI (Fraunces, linen, brass, olive). Not a cyber terminal.
- Mock data until hosted Supabase is wired.

## Cursor

Open this repo in Cursor. Grok Build / Cursor agents should read `AGENTS.md` first, then `docs/NORTH_STAR.md`.

## Expo

1. [expo.dev](https://expo.dev) → project linked to `JRod042/project-1`
2. Base dir `mobile`
3. `eas build --platform ios --profile production`
4. **Submit** the IPA (a green build is not TestFlight until Submit)

## Web HQ

The Grok App Builder web HQ (shop + book + floor + house assistant) is the phone-usable surface until TestFlight lands. Do not port Omni chat into `mobile/`.
