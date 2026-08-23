# Prompt 09 — Grok Build configuration (latest)

Paste into Cursor Agent.

---

You are working in `JRod042/project-1`.

## Mission
Keep Casa Rústico cloud-only and shippable via Expo EAS. Honor `.grok/config.toml` and `AGENTS.md`.

## Do
1. Read `AGENTS.md`, `docs/NORTH_STAR.md`, `docs/GROK_BUILD.md`.
2. Do not revive OpenClaw / Omni server / SYS / LAN.
3. Prefer small PRs.
4. If Expo config changes, bump `ios.buildNumber` as a string and document TestFlight Submit.

## Do not
- Add Docker, Tailscale, or a home-server dependency.
- Replace `mobile/` with a Vite/TanStack web app.
- Merge revert PRs that restore Omni HUD.

Start by confirming Expo config (`com.jrod042.omni` or current Casa bundle) is intact.
