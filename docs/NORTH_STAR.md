# Omni — North star (pin this)

**Omni is like Grok or Antigravity in the terminal — but for iPhone.**

## One sentence
A pocket **operator terminal**: you issue intent, the agent plans, runs tools on your server, streams a live log, and asks approval when it would change the world.

## Runtime choice
**Primary brain = [OpenClaw](https://github.com/openclaw/openclaw)** (self-hosted Gateway).  
Omni’s Expo app is the TestFlight face + Control UI launcher; Telegram/Discord/etc. are first-class phone channels.  
Legacy `server/` SSE is a fallback, not the destination.

## Feel
- Open app → dark terminal / operator shell, not a marketing home screen
- See tools, approvals, and results — not a chatbot that hides agency
- SYS connects to *your* OpenClaw gateway (LAN, VPS, Tailscale)
- Personality: capable, concise, slightly dry — Grok-adjacent operator

## Architecture
```
iPhone Omni (Expo) / Safari Control UI / Telegram
    │
    ▼
OpenClaw Gateway (:18789)
    │
    ▼
workspace + tools + skills + channels
```

## When choosing UX
Prefer: fewer screens, deeper timeline, better tools, clearer SYS.
Avoid: dashboard tiles, “AI companion” fluff, hiding tool activity.

## Shipping
TestFlight (`com.jrod042.omni`) is the branded product path.  
OpenClaw Control UI + messaging channels are valid daily drivers immediately.
