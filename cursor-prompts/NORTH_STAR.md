# Omni — North star (pin this)

**Omni is like Grok or Antigravity in the terminal — but for iPhone.**

## One sentence
A pocket **operator terminal**: you issue intent, the agent plans, runs tools on your server, streams a live log, and asks approval when it would change the world.

## Runtime choice
**Primary brain = OpenClaw Gateway.** Expo Omni is the TestFlight shell + Control UI launcher. Legacy `server/` is optional.

## Feel
- Open app → dark terminal, not a marketing home screen
- Type like a command line / agent chat hybrid
- See tool activity inline; approve when the world would change
- SYS connects to *your* OpenClaw runtime (LAN or VPS)
- Personality: capable, concise, slightly dry — Grok-adjacent operator

## Architecture
```
iPhone Omni (Expo) / Control UI / Telegram
    │
    ▼
OpenClaw Gateway
    │
    ▼
workspace + tools + channels
```

## When choosing UX
Prefer: fewer screens, deeper timeline, better tools, clearer SYS.
Avoid: dashboard tiles, “AI companion” fluff, hiding tool activity.

## Shipping
TestFlight (`com.jrod042.omni`) is the real branded path. Web Control UI is a first-class operator surface.
